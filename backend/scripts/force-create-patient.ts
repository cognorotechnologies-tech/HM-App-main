
import pool from '../src/db';

const TARGET_ID = '6a5eca09-9ff5-4018-94e6-c8d61b045476';

async function fixPatient() {
    console.log(`Checking patient ${TARGET_ID}...`);

    try {
        // 1. Check if profile exists (meaning user exists)
        const profileRes = await pool.query("SELECT * FROM profiles WHERE id = $1", [TARGET_ID]);
        if (profileRes.rows.length === 0) {
            console.error('❌ User profile not found! The ID might be wrong.');
            process.exit(1);
        }
        console.log('✅ User profile found:', profileRes.rows[0].email);

        // 2. Check if patient record exists
        const patientRes = await pool.query("SELECT * FROM patients WHERE id = $1", [TARGET_ID]);
        if (patientRes.rows.length > 0) {
            console.log('✅ Patient record already exists via query.');
        } else {
            console.log('⚠️  Patient record missing. Creating now...');

            await pool.query(`
                INSERT INTO patients (
                    id, 
                    gender, 
                    date_of_birth, 
                    blood_group, 
                    address_street, 
                    address_city, 
                    address_state, 
                    address_pincode, 
                    emergency_contact_name, 
                    emergency_contact_phone, 
                    emergency_contact_relation,
                    allergies,
                    chronic_conditions,
                    current_medications,
                    previous_surgeries,
                    family_history
                )
                VALUES (
                    $1, 
                    'Male', 
                    '1990-01-01', 
                    'O+', 
                    '123 Test St', 
                    'Test City', 
                    'Test State', 
                    '123456', 
                    'Emergency', 
                    '9999999999', 
                    'Friend',
                    $2, $3, $4, $5, $6
                )
            `, [TARGET_ID, [], [], [], [], []]);

            console.log('✅ Successfully created patient record.');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

fixPatient();
