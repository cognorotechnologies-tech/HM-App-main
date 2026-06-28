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
        console.log('Applying lab results migration...');
        const migrationPath = path.join(__dirname, 'scripts', 'migrations', '20260122_create_lab_results.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        await client.query('BEGIN');
        await client.query(migrationSql);
        await client.query('COMMIT');

        console.log('✅ Lab results migration applied successfully.');

        // Verify table creation
        const res = await client.query("SELECT to_regclass('public.lab_results')");
        if (res.rows[0].to_regclass) {
            console.log('✅ Table lab_results verified existence.');
        } else {
            console.error('❌ Table lab_results NOT found after migration!');
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

applyMigration();
