import fs from 'fs';
import path from 'path';
import pool from '../src/db';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migratePharmacy() {
    console.log('Starting Pharmacy Schema Migration...');
    const client = await pool.connect();

    try {
        const schemaPath = path.join(__dirname, '../pharmacy_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Reading schema file...');

        await client.query('BEGIN');

        // Execute the entire SQL file
        await client.query(schemaSql);

        await client.query('COMMIT');

        console.log('Migration completed successfully! Pharmacy tables created.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migratePharmacy();
