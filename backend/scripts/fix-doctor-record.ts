import pool from '../src/db';

const DOCTOR_USER_ID = 'e5643ece-0661-44a2-9ce2-cf6b99c8faab';
const DEPT_ID = '4680f92c-569b-46b9-8f64-a151181ca9b2'; // General Medicine

async function fixDoctorRecord() {
    try {
        console.log('🔧 Fixing Missing Doctor Record...');

        // Check if already exists (just in case)
        const check = await pool.query('SELECT id FROM doctors WHERE id = $1', [DOCTOR_USER_ID]);
        if (check.rows.length > 0) {
            console.log('✅ Doctor record already exists.');
            return;
        }

        const query = `
            INSERT INTO doctors (
                id, department_id, specialization, qualifications, 
                years_of_experience, license_number, status, bio
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            DOCTOR_USER_ID,
            DEPT_ID,
            'General Physician',
            'MBBS, MD',
            5,
            'MED-12345',
            'online',
            'Dedicated general physician with 5 years of experience.'
        ];

        const result = await pool.query(query, values);
        console.log('✅ Created Doctor Record:', result.rows[0]);

    } catch (error: any) {
        console.error('❌ Error fixing doctor record:', error);
    } finally {
        await pool.end();
    }
}

fixDoctorRecord();
