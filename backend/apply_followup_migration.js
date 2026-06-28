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
        console.log('Applying follow_ups migration...');
        const migrationPath = path.join(__dirname, 'scripts', 'migrations', '20260122_create_follow_ups.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        await client.query('BEGIN');
        await client.query(migrationSql);
        await client.query('COMMIT');

        console.log('✅ Follow-ups migration applied successfully.');

        // Verify table creation
        const res = await client.query("SELECT to_regclass('public.follow_ups')");
        if (res.rows[0].to_regclass) {
            console.log('✅ Table follow_ups verified existence.');
        } else {
            console.error('❌ Table follow_ups NOT found after migration!');
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
