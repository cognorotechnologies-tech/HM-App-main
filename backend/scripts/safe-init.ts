
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined');
    process.exit(1);
}

async function safeInit() {
    console.log('🛡️  Starting Safe Database Initialization...');

    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        // 1. Check if database is already initialized (check for 'profiles' table)
        console.log('Checking if database is already initialized...');
        const checkRes = await client.query("SELECT to_regclass('public.profiles') as exists");

        if (checkRes.rows[0].exists) {
            console.log('✅ Database already contains tables. Skipping initialization to PREVENT DATA LOSS.');
            return;
        }

        console.log('⚠️  Database appears empty. Proceeding with schema creation...');

        // 2. Apply Schema
        const schemaPath = path.join(__dirname, '../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schemaSql);
        console.log('✅ Schema applied successfully.');

        // 3. Seed Users
        console.log('🌱 Seeding initial data...');
        execSync('npx ts-node seed-users.ts', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        console.log('✅ Seeding complete.');

    } catch (err) {
        console.error('❌ Error during initialization:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

safeInit();
