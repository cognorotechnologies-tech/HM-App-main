import pool from '../src/db';

async function migrateShifts() {
    const client = await pool.connect();
    try {
        console.log('Starting Shift Migration...');
        await client.query('BEGIN');

        // 1. Create pharmacy_shifts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS pharmacy_shifts (
                shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                shift_date DATE DEFAULT CURRENT_DATE,
                user_id UUID REFERENCES profiles(id),
                start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                end_time TIMESTAMP WITH TIME ZONE,
                opening_cash DECIMAL(15, 2) DEFAULT 0,
                closing_cash DECIMAL(15, 2),
                total_sales DECIMAL(15, 2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'open',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('Checked/Created pharmacy_shifts table.');

        // 2. Add shift_id to pharmacy_sales if not exists
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='pharmacy_sales' AND column_name='shift_id';
        `);

        if (checkColumn.rows.length === 0) {
            console.log('Adding shift_id column to pharmacy_sales...');
            await client.query(`
                ALTER TABLE pharmacy_sales 
                ADD COLUMN shift_id UUID REFERENCES pharmacy_shifts(shift_id);
            `);
        } else {
            console.log('shift_id column already exists in pharmacy_sales.');
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        client.release();
        process.exit();
    }
}

migrateShifts();
