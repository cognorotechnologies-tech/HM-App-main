
import pool from '../src/db';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration: add_task_recurrence');

        await client.query('BEGIN');

        // Add recurrence columns if they don't exist
        await client.query(`
            ALTER TABLE staff_tasks
            ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'custom'
            ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1,
            ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS recurrence_days JSONB DEFAULT '[]'::jsonb;
        `);

        // Check if columns were added
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'staff_tasks' 
            AND column_name IN ('is_recurring', 'recurrence_pattern');
        `);

        console.log('Columns verified:', res.rows.map(r => r.column_name));

        await client.query('COMMIT');
        console.log('Migration completed successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
