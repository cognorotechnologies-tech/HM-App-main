
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
    try {
        console.log('Checking doctors table schema...');
        const doctorsRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'doctors' AND column_name = 'id';
    `);
        console.log('doctors.id type:', doctorsRes.rows[0]);

        console.log('Checking doctor_prescription_preferences table schema...');
        const prefsRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'doctor_prescription_preferences' AND column_name = 'doctor_id';
    `);
        console.log('doctor_prescription_preferences.doctor_id type:', prefsRes.rows[0]);

    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        pool.end();
    }
}

checkSchema();
