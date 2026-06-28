
import pool from '../src/db';

async function listColumns() {
    try {
        console.log("--- billing_invoices Columns ---");
        const res1 = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'billing_invoices'
        `);
        console.table(res1.rows);

        console.log("\n--- billing_items Columns ---");
        const res2 = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'billing_items'
        `);
        console.table(res2.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

listColumns();
