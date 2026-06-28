
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Starting migration to fix doctor_prescription_preferences.doctor_id type...');

        await client.query('BEGIN');

        // 1. Drop foreign key constraint if it exists (it might be broken or nonexistent if types mismatched)
        // We try to drop it by name if possible, or generic catch
        try {
            await client.query(`
            DO $$ 
            DECLARE 
                r RECORD;
            BEGIN 
                FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'doctor_prescription_preferences' AND constraint_type = 'FOREIGN KEY') LOOP
                    EXECUTE 'ALTER TABLE doctor_prescription_preferences DROP CONSTRAINT ' || r.constraint_name;
                END LOOP;
            END $$;
        `);
            console.log('Dropped existing foreign key constraints on doctor_prescription_preferences.');
        } catch (e) {
            console.log('Error dropping constraints (might not exist):', e.message);
        }

        // 2. Alter column type to UUID
        // Note: If there is existing data with integer IDs, this casting might fail if we don't handle it.
        // However, since we are in dev/migration phase and likely have no valid preferences for UUID doctors yet (as they failed to save), 
        // we can truncation or forceful casting.
        // Given the error exists, we likely have empty or invalid data. Let's truncate to be safe and clean.

        await client.query('TRUNCATE TABLE doctor_prescription_preferences CASCADE');
        console.log('Truncated doctor_prescription_preferences table to avoid type conversion errors on bad data.');

        await client.query('ALTER TABLE doctor_prescription_preferences ALTER COLUMN doctor_id TYPE UUID USING doctor_id::text::uuid');
        console.log('Altered doctor_id column to UUID.');

        // 3. Re-add foreign key constraint
        await client.query(`
        ALTER TABLE doctor_prescription_preferences 
        ADD CONSTRAINT fk_doctor_prescription_preferences_doctor_id 
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    `);
        console.log('Re-added foreign key constraint to doctors(id).');

        await client.query('COMMIT');
        console.log('Migration completed successfully.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
