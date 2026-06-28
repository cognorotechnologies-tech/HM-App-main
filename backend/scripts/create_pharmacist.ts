import pool from '../src/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function createPharmacist() {
    const client = await pool.connect();
    try {
        const email = 'pharmacist@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        await client.query('BEGIN');

        // 1. Check if user exists in credentials
        const credCheck = await client.query('SELECT user_id FROM user_credentials WHERE email = $1', [email]);

        if (credCheck.rows.length > 0) {
            console.log('User exists. Updating role in profiles...');
            const existingId = credCheck.rows[0].user_id;
            await client.query("UPDATE profiles SET role = 'pharmacist' WHERE id = $1", [existingId]);
            // Optional: Update password if needed, but let's assume if it exists, we just fix the role.
            // But to be safe for the user, let's update password too.
            await client.query("UPDATE user_credentials SET password_hash = $1 WHERE user_id = $2", [hashedPassword, existingId]);
        } else {
            console.log('Creating new pharmacist user...');

            // 2. Insert into profiles
            await client.query(
                `INSERT INTO profiles (id, email, first_name, last_name, role, created_at)
                 VALUES ($1, $2, 'John', 'Pharmacist', 'pharmacist', NOW())`,
                [userId, email]
            );

            // 3. Insert into user_credentials
            await client.query(
                `INSERT INTO user_credentials (user_id, email, password_hash)
                 VALUES ($1, $2, $3)`,
                [userId, email, hashedPassword]
            );
        }

        await client.query('COMMIT');

        console.log(`
        ✅ Pharmacist User Synced:
        Email: ${email}
        Password: ${password}
        Role: pharmacist
        `);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating pharmacist:', error);
    } finally {
        client.release();
        pool.end();
    }
}

createPharmacist();
