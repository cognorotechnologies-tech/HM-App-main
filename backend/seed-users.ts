import { AuthService } from './src/services/authService';
import pool from './src/db';

async function seedUsers() {
    const users = [
        {
            email: 'admin@hm-app.com',
            password: 'password123',
            firstName: 'System',
            lastName: 'Admin',
            role: 'admin'
        },
        {
            email: 'doctor@hm-app.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            role: 'doctor'
        },
        {
            email: 'patient@hm-app.com',
            password: 'password123',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'patient'
        },
        {
            email: 'receptionist@hm-app.com',
            password: 'password123',
            firstName: 'Sarah',
            lastName: 'Jones',
            role: 'receptionist'
        }
    ];

    console.log('Seeding users...');

    // Ensure a default department exists
    let defaultDeptId = null;
    try {
        const deptRes = await pool.query("INSERT INTO departments (name, description) VALUES ('General Medicine', 'Default Department') ON CONFLICT DO NOTHING RETURNING id");
        if (deptRes.rows.length > 0) {
            defaultDeptId = deptRes.rows[0].id;
        } else {
            const existingDept = await pool.query("SELECT id FROM departments WHERE name = 'General Medicine'");
            defaultDeptId = existingDept.rows[0]?.id;
        }
        console.log('✅ Default Department ensured');
    } catch (e) {
        console.error('Failed to ensure default department', e);
    }

    for (const u of users) {
        try {
            await AuthService.registerUser(u.email, u.password, u.firstName, u.lastName, u.role);
            console.log(`✅ Created ${u.role}: ${u.email}`);
        } catch (error: any) {
            if (error.message === 'Email already registered') {
                console.log(`⚠️  Skipped ${u.role}: ${u.email} (Already exists)`);
            } else {
                console.error(`❌ Failed to create ${u.role}:`, error);
            }
        }

        // Ensure role-specific table entries exist
        try {
            const userRes = await pool.query("SELECT id FROM user_credentials WHERE email = $1", [u.email]);
            const userId = userRes.rows[0]?.id;

            if (userId) {
                if (u.role === 'patient') {
                    // Check if patient record exists
                    const patParams = [
                        userId, 'Male', '1990-01-01', 'O+',
                        '123 Main St', 'Metropolis', 'NY', '10001',
                        'Emergency Contact', '555-9999', 'Sibling',
                        [], [], [], [], [], '555-0000'
                    ];

                    await pool.query(`
                        INSERT INTO patients (id, gender, date_of_birth, blood_group, address_street, address_city, address_state, address_pincode, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, allergies, chronic_conditions, current_medications, previous_surgeries, family_history, alternative_phone)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                        ON CONFLICT (id) DO NOTHING
                    `, patParams);
                    console.log(`   Detailed record ensured for patient: ${u.email}`);
                } else if (u.role === 'doctor' && defaultDeptId) {
                    // Check if doctor record exists
                    const docParams = [
                        userId, defaultDeptId, 'General Medicine', 'MBBS, MD', 10, 'DOC-001', 'offline'
                    ];

                    await pool.query(`
                        INSERT INTO doctors (id, department_id, specialization, qualifications, years_of_experience, license_number, status)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT (id) DO NOTHING
                    `, docParams);
                    console.log(`   Detailed record ensured for doctor: ${u.email}`);
                }
            }

        } catch (e) {
            console.error(`Failed to seed details for ${u.email}`, e);
        }
    }

    await pool.end();
    console.log('Done.');
}

seedUsers();
