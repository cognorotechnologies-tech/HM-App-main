
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function applyMigration() {
    const client = await pool.connect();
    try {
        const migrationPath = path.join(__dirname, 'scripts', 'migrations', '20260122_create_prescription_templates.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Applying migration:', migrationPath);
        await client.query('BEGIN');
        await client.query(migrationSql);
        await client.query('COMMIT');
        console.log('Migration applied successfully.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

applyMigration();
