
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
}

// Parse connection string to get credentials for 'postgres' default DB
// Assuming format: postgresql://user:pass@host:port/dbname
// Using a basic regex or URL parser
const url = new URL(dbUrl);
const dbName = url.pathname.split('/')[1];

const adminConfig = {
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: 'postgres', // Connect to default DB to create new one
};

async function setup() {
    console.log('🚀 Starting Database Setup...');

    // 1. Create Database if not exists
    const adminClient = new Client(adminConfig);
    try {
        await adminClient.connect();
        const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (res.rowCount === 0) {
            console.log(`Creating database '${dbName}'...`);
            await adminClient.query(`CREATE DATABASE "${dbName}"`);
            console.log('✅ Database created.');
        } else {
            console.log(`ℹ️  Database '${dbName}' already exists.`);
        }
    } catch (err) {
        console.error('❌ Error creating database:', err);
        process.exit(1);
    } finally {
        await adminClient.end();
    }

    // 2. Run Schema
    const appClient = new Client({ connectionString: dbUrl });
    try {
        console.log('Connecting to app database...');
        await appClient.connect();

        const schemaPath = path.join(__dirname, '../schema.sql');
        console.log(`Reading schema from ${schemaPath}...`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');
        await appClient.query(schemaSql);
        console.log('✅ Schema applied successfully.');

    } catch (err: any) {
        console.error('❌ Error applying schema:', err.message);
        // Don't exit, might be just "relation exists" errors if re-running
    } finally {
        await appClient.end();
    }

    // 3. Seed Data
    try {
        console.log('🌱 Seeding initial data...');
        // Execute the existing seed script
        execSync('npx ts-node seed-users.ts', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..') // Run from backend root
        });
        console.log('✅ Seeding complete.');
    } catch (err) {
        console.error('❌ Error seeding data:', err);
    }

    console.log('\n🎉 Setup Complete! You can now run "npm run dev".');
}

setup();
