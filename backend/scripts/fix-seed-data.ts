
import pool from '../src/db';

async function fixPatientData() {
    try {
        console.log('Checking for inconsistent patient data...');
        const res = await pool.query("SELECT id, first_name, last_name, email FROM profiles WHERE role = 'patient'");

        for (const user of res.rows) {
            const patientRes = await pool.query('SELECT id FROM patients WHERE id = $1', [user.id]);
            if (patientRes.rows.length === 0) {
                console.log(`Fixing missing patient record for ${user.email} (${user.id})`);
                await pool.query(`
                    INSERT INTO patients (
                        id, gender, date_of_birth, blood_group, 
                        address_street, address_city, address_state, address_pincode,
                        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
                        allergies, chronic_conditions, current_medications, previous_surgeries, family_history,
                        alternative_phone, created_at, updated_at
                    ) VALUES (
                        $1, 'other', '2000-01-01', 'O+', 
                        '123 Main St', 'City', 'State', '12345',
                        'Emergency Contact', '555-0000', 'Relation',
                        ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
                        '555-0001', NOW(), NOW()
                    )
                `, [user.id]);
                console.log('Fixed.');
            } else {
                console.log(`Patient record exists for ${user.email}`);
            }
        }

        console.log('Checking for inconsistent doctor data...');
        const docRes = await pool.query("SELECT id, first_name, last_name, email FROM profiles WHERE role = 'doctor'");

        for (const user of docRes.rows) {
            const doctorRes = await pool.query('SELECT id FROM doctors WHERE id = $1', [user.id]);
            if (doctorRes.rows.length === 0) {
                console.log(`Fixing missing doctor record for ${user.email} (${user.id})`);
                await pool.query(`
                    INSERT INTO doctors (
                        id, department_id, specialization, qualifications, 
                        years_of_experience, license_number, consultation_fee, 
                        bio, status,
                        created_at
                    ) VALUES (
                        $1, NULL, 'General', ARRAY['MBBS'], 
                        5, 'LIC12345', 500, 
                        'Experienced doctor.', 'active',
                        NOW()
                    )
                `, [user.id]);
                console.log('Fixed.');
            } else {
                console.log(`Doctor record exists for ${user.email}`);
            }
        }
    } catch (e) {
        console.error('Error fixing data:', e);
    } finally {
        await pool.end();
    }
}

fixPatientData();
