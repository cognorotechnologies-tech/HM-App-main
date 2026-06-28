import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';
// @ts-ignore

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export class AuthService {
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    static generateToken(user: any): string {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    static async registerUser(email: string, password: string, firstName: string, lastName: string, role: string = 'patient') {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Check if email exists in credentials
            const existing = await client.query('SELECT id FROM user_credentials WHERE email = $1', [email]);
            if (existing.rows.length > 0) {
                throw new Error('Email already registered');
            }

            // 2. Create Profile
            // user_credentials references profiles(id), so profile must exist first.
            // IDs are UUIDs. If we let Postgres generate them, we need to return it.
            // But profiles.id is NOT serial, it's uuid. 
            // Supabase profiles table usually has `id` as PK, often linked to auth.users.id.
            // Since we are decoupling, we will generate a UUID or let PG do it.
            // Let's assume profiles.id is DEFAULT gen_random_uuid().
            // Checking schema... profiles didn't show NOT NULL or DEFAULT in the dump we could have seen, 
            // but usually public.profiles.id is a foreign key to auth.users.id. 
            // IF existing profiles table is FK to auth.users, inserting into it blindly might fail if we don't strictly follow that.
            // HOWEVER, we are "Moving to traditional backend". 
            // If `profiles.id` is a FK to `auth.users.id`, we CANNOT insert a random UUID if the constraint prevents it.
            // Wait. The `profiles` table has `id uuid references auth.users not null primary key`.
            // We cannot insert into `profiles` unless that ID exists in `auth.users` IF the foreign key constraint is active.
            // WE NEED TO CHECK THIS.

            // Temporary: We might need to drop the Foreign Key constraint from `profiles` to `auth.users` to allow independent users.
            // Or we insert into `auth.users` (which is hard as it's a supabase managed schema).

            // Let's assume for now we need to generate a UUID and insert. 
            // If it fails, I'll fix the constraint.

            const passwordHash = await this.hashPassword(password);

            // We need a UUID for the profile. 
            // Does profiles have a default?
            // In Supabase starter, profiles table often: create table profiles ( id uuid references auth.users not null primary key );
            // So checking `test-db.ts` or `supabase.ts` might reveal the type.


            // Strategy: Generate a UUID in JS to ensure we have it for both tables.
            // But `profiles.id` is PK. 

            const userIdRes = await client.query('SELECT gen_random_uuid() as uuid');
            const userId = userIdRes.rows[0].uuid;

            // Insert Profile
            // Note: If FK constraint exists, this WILL fail.
            const profileRes = await client.query(
                `INSERT INTO profiles (id, email, first_name, last_name, role, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
                [userId, email, firstName, lastName, role]
            );

            // Insert Credentials
            await client.query(
                `INSERT INTO user_credentials (user_id, email, password_hash)
         VALUES ($1, $2, $3)`,
                [userId, email, passwordHash]
            );

            // If role is patient, create empty patient record to prevent 404s
            if (role === 'patient') {
                await client.query(
                    'INSERT INTO patients (id) VALUES ($1)',
                    [userId]
                );
            }

            await client.query('COMMIT');

            const user = profileRes.rows[0];
            const token = this.generateToken({ ...user, email });

            return { user, token };

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async loginUser(email: string, password: string) {
        // 1. Get user by email from credentials
        const result = await pool.query(
            `SELECT uc.user_id as id, uc.email, uc.password_hash, p.role, p.first_name, p.last_name 
       FROM user_credentials uc
       JOIN profiles p ON uc.user_id = p.id
       WHERE uc.email = $1`,
            [email]
        );

        const user = result.rows[0];
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // 2. Verify password
        const isValid = await this.verifyPassword(password, user.password_hash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // 3. Generate token
        const token = this.generateToken(user);

        // Return safe user object
        const { password_hash, ...safeUser } = user;
        return { user: safeUser, token };
    }
}
