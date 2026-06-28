
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkTable() {
    try {
        const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'prescription_templates';
    `);

        if (res.rows.length > 0) {
            console.log('Table prescription_templates EXISTS.');
            // Describe it
            const cols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'prescription_templates';
        `);
            console.log('Columns:', cols.rows);
        } else {
            console.log('Table prescription_templates DOES NOT EXIST.');
        }

    } catch (err) {
        console.error('Error checking table:', err);
    } finally {
        pool.end();
    }
}

checkTable();
