import pool from '../db';

export class AdminService {
    static async getDashboardStats() {
        const client = await pool.connect();
        try {
            const usersQuery = `
                SELECT role, COUNT(*) as count 
                FROM profiles 
                GROUP BY role
            `;

            const appointmentsQuery = `SELECT COUNT(*) as count FROM appointments`;
            const departmentsQuery = `SELECT COUNT(*) as count FROM departments`;

            const [usersRes, aptRes, deptRes] = await Promise.all([
                client.query(usersQuery),
                client.query(appointmentsQuery),
                client.query(departmentsQuery)
            ]);

            const counts: Record<string, number> = {
                patient: 0,
                doctor: 0,
                admin: 0,
                receptionist: 0
            };

            usersRes.rows.forEach((row: any) => {
                counts[row.role] = parseInt(row.count);
            });

            return {
                patients: counts.patient || 0,
                doctors: counts.doctor || 0,
                appointments: parseInt(aptRes.rows[0].count),
                departments: parseInt(deptRes.rows[0].count)
            };
        } finally {
            client.release();
        }
    }

    static async createUser(data: any) {
        // Generic user creation (for Doctor onboarding flow)
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const existing = await client.query('SELECT id FROM user_credentials WHERE email = $1', [data.email]);
            if (existing.rows.length > 0) {
                throw new Error('Email already registered');
            }

            const userIdRes = await client.query('SELECT gen_random_uuid() as uuid');
            const userId = userIdRes.rows[0].uuid;

            const passwordHash = await import('bcrypt').then(b => b.hash(data.password, 10));

            // Insert Profile
            await client.query(
                `INSERT INTO profiles (id, email, first_name, last_name, role, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [userId, data.email, data.first_name, data.last_name, data.role || 'user']
            );

            // Insert Credentials
            await client.query(
                `INSERT INTO user_credentials (user_id, email, password_hash)
                 VALUES ($1, $2, $3)`,
                [userId, data.email, passwordHash]
            );

            await client.query('COMMIT');
            return { id: userId, email: data.email, first_name: data.first_name, last_name: data.last_name, role: data.role };

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async getAllPatients(filters: { query?: string } = {}) {
        let query = `
            SELECT p.*, pr.email, pr.phone, pr.first_name, pr.last_name
            FROM patients p
            JOIN profiles pr ON p.id = pr.id
        `;

        const values: any[] = [];
        if (filters.query) {
            query += ` WHERE (pr.first_name ILIKE $1 OR pr.last_name ILIKE $1 OR pr.email ILIKE $1 OR pr.phone ILIKE $1)`;
            values.push(`%${filters.query}%`);
        }

        query += ` ORDER BY p.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows.map((row: any) => ({
            ...row,
            profiles: {
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                phone: row.phone
            }
        }));
    }

    static async getAllDoctors(filters: { department_id?: string; query?: string } = {}) {
        let query = `
            SELECT d.*, pr.email, pr.phone, pr.first_name, pr.last_name, dep.name as department_name, pr.avatar_url
            FROM doctors d
            JOIN profiles pr ON d.id = pr.id
            LEFT JOIN departments dep ON d.department_id = dep.id
        `;

        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters.department_id) {
            conditions.push(`d.department_id = $${idx++}`);
            values.push(filters.department_id);
        }

        // Implementation for doctor search if needed
        if (filters.query) {
            conditions.push(`(pr.first_name ILIKE $${idx} OR pr.last_name ILIKE $${idx} OR pr.email ILIKE $${idx})`);
            values.push(`%${filters.query}%`);
            idx++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY pr.last_name ASC`;

        const result = await pool.query(query, values);
        return result.rows.map((row: any) => ({
            ...row,
            profiles: {
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                phone: row.phone,
                avatar_url: row.avatar_url
            },
            departments: {
                name: row.department_name
            }
        }));
    }

    static async getDoctorById(id: string) {
        const query = `
            SELECT d.*, pr.email, pr.phone, pr.first_name, pr.last_name, dep.name as department_name, pr.avatar_url
            FROM doctors d
            JOIN profiles pr ON d.id = pr.id
            LEFT JOIN departments dep ON d.department_id = dep.id
            WHERE d.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            ...row,
            profiles: {
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                phone: row.phone,
                avatar_url: row.avatar_url
            },
            departments: {
                name: row.department_name
            }
        };
    }

    static async getAllUsers(filters: { role?: string } = {}) {
        let query = `
            SELECT * FROM profiles
        `;
        const values: any[] = [];

        if (filters.role && filters.role !== 'all') {
            query += ` WHERE role = $1`;
            values.push(filters.role);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async searchUsers(query: string) {
        const sql = `
            SELECT id, first_name, last_name, email, role, avatar_url 
            FROM profiles 
            WHERE 
                first_name ILIKE $1 OR 
                last_name ILIKE $1 OR 
                email ILIKE $1
            LIMIT 10
        `;
        console.log('Searching users with query:', query);
        const result = await pool.query(sql, [`%${query}%`]);
        return result.rows;
    }

    static async getPendingDoctors() {
        // Users with role 'doctor' but no entry in doctors table
        const query = `
            SELECT p.*
            FROM profiles p
            LEFT JOIN doctors d ON p.id = d.id
            WHERE p.role = 'doctor' AND d.id IS NULL
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // --- PATIENTS CRUD ---

    static async createPatient(data: any) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Create User (Profile + Credentials)
            // Check if user exists by email
            const existing = await client.query('SELECT id FROM user_credentials WHERE email = $1', [data.email]);
            if (existing.rows.length > 0) {
                throw new Error('Email already registered');
            }

            // Generate ID
            const userIdRes = await client.query('SELECT gen_random_uuid() as uuid');
            const userId = userIdRes.rows[0].uuid;

            const passwordHash = await import('bcrypt').then(b => b.hash(data.password, 10));

            // Insert Profile
            await client.query(
                `INSERT INTO profiles (id, email, first_name, last_name, role, phone, created_at)
                 VALUES ($1, $2, $3, $4, 'patient', $5, NOW())`,
                [userId, data.email, data.first_name, data.last_name, data.phone]
            );

            // Insert Credentials
            await client.query(
                `INSERT INTO user_credentials (user_id, email, password_hash)
                 VALUES ($1, $2, $3)`,
                [userId, data.email, passwordHash]
            );

            // 2. Insert Patient Record
            const query = `
                INSERT INTO patients (
                    id, gender, date_of_birth, blood_group, 
                    address_street, address_city, address_state, address_pincode,
                    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
                    allergies, chronic_conditions, current_medications, previous_surgeries, family_history,
                    alternative_phone
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING *
            `;

            const values = [
                userId, data.gender, data.date_of_birth, data.blood_group,
                data.address_street, data.address_city, data.address_state, data.address_pincode,
                data.emergency_contact_name, data.emergency_contact_phone, data.emergency_contact_relation,
                data.allergies, data.chronic_conditions, data.current_medications, data.previous_surgeries, data.family_history,
                data.alternative_phone
            ];

            const result = await client.query(query, values);
            await client.query('COMMIT');
            return { ...result.rows[0], user_id: userId };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async updatePatient(id: string, data: any) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Update Profile fields if present
            if (data.first_name || data.last_name || data.phone || data.email) {
                const profileUpdates: string[] = [];
                const profileValues: any[] = [];
                let i = 1;

                if (data.first_name) { profileUpdates.push(`first_name = $${i++}`); profileValues.push(data.first_name); }
                if (data.last_name) { profileUpdates.push(`last_name = $${i++}`); profileValues.push(data.last_name); }
                if (data.phone) { profileUpdates.push(`phone = $${i++}`); profileValues.push(data.phone); }

                if (profileUpdates.length > 0) {
                    profileValues.push(id);
                    await client.query(
                        `UPDATE profiles SET ${profileUpdates.join(', ')} WHERE id = $${i}`,
                        profileValues
                    );
                }
            }

            // 2. Update Patient fields
            // Filter out profile fields to get only patient fields
            const { first_name, last_name, phone, email, ...patientData } = data;

            if (Object.keys(patientData).length > 0) {
                const keys = Object.keys(patientData);
                const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
                const values = Object.values(patientData);
                values.push(id);

                await client.query(
                    `UPDATE patients SET ${setClause} WHERE id = $${values.length}`,
                    values
                );
            }

            await client.query('COMMIT');
            return { id, ...data };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async deletePatient(id: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM patients WHERE id = $1', [id]);
            await client.query('DELETE FROM user_credentials WHERE user_id = $1', [id]);
            await client.query('DELETE FROM profiles WHERE id = $1', [id]);

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    // --- DOCTORS CRUD ---

    static async createDoctor(data: any) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            console.log("Create Doctor Data:", data);

            // Update profile fields if provided
            const profileFields: any = {};
            if (data.first_name) profileFields.first_name = data.first_name;
            if (data.last_name) profileFields.last_name = data.last_name;
            if (data.email) profileFields.email = data.email;
            if (data.phone) profileFields.phone = data.phone;
            if (data.avatar_url) profileFields.avatar_url = data.avatar_url;

            // Always ensure role is doctor
            profileFields.role = 'doctor';

            const profileKeys = Object.keys(profileFields);
            if (profileKeys.length > 0) {
                const setClause = profileKeys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
                const values = [data.id, ...Object.values(profileFields)];
                await client.query(`UPDATE profiles SET ${setClause} WHERE id = $1`, values);
            }

            const query = `
                INSERT INTO doctors (id, department_id, specialization, qualifications, years_of_experience, license_number, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'offline')
                RETURNING *
            `;
            const values = [
                data.id, data.department_id, data.specialization,
                data.qualifications, data.years_of_experience, data.license_number
            ];
            const result = await client.query(query, values);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async updateDoctor(id: string, data: any) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Separate profile fields and doctor fields
            const profileFields: any = {};
            const doctorFields: any = {};

            const profileKeysList = ['first_name', 'last_name', 'email', 'phone', 'avatar_url'];

            Object.keys(data).forEach(key => {
                if (profileKeysList.includes(key)) {
                    profileFields[key] = data[key];
                } else if (key !== 'id' && key !== 'profiles' && key !== 'departments') { // Exclude nested objects or id if present
                    doctorFields[key] = data[key];
                }
            });

            // 2. Update Profile if needed
            if (Object.keys(profileFields).length > 0) {
                const keys = Object.keys(profileFields);
                const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
                const values = [id, ...Object.values(profileFields)];
                await client.query(`UPDATE profiles SET ${setClause} WHERE id = $1`, values);
            }

            // 3. Update Doctor if needed
            let doctorResult = null;
            if (Object.keys(doctorFields).length > 0) {
                const keys = Object.keys(doctorFields);
                const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
                const values = [id, ...Object.values(doctorFields)];
                const res = await client.query(
                    `UPDATE doctors SET ${setClause} WHERE id = $1 RETURNING *`,
                    values
                );
                doctorResult = res.rows[0];
            }

            // 4. Return combined result (optional, or just doctor record)
            // For consistency with getAllDoctors, ideally we'd return joint data, but for update just the doctor or success is fine.
            // Let's refetch to be safe or just return what we have.

            await client.query('COMMIT');
            return doctorResult || { id, ...data };

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async deleteDoctor(id: string) {
        const result = await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
        await pool.query("UPDATE profiles SET role = 'user' WHERE id = $1", [id]);
        return true;
    }
    static async getDoctorDashboardStats(doctorId: string) {
        const client = await pool.connect();
        try {
            const todayStr = new Date().toISOString().split('T')[0];

            // 1. Today's Appointments
            const todayAptQuery = `
                SELECT COUNT(*) as count 
                FROM appointments 
                WHERE doctor_id = $1 AND DATE(appointment_date) = $2
            `;

            // 2. Completed Today
            const completedTodayQuery = `
                SELECT COUNT(*) as count 
                FROM appointments 
                WHERE doctor_id = $1 AND DATE(appointment_date) = $2 AND status = 'completed'
            `;

            // 3. Total Unique Patients
            const totalPatientsQuery = `
                SELECT COUNT(DISTINCT patient_id) as count 
                FROM appointments 
                WHERE doctor_id = $1
            `;

            const [todayRes, completedRes, patientsRes] = await Promise.all([
                client.query(todayAptQuery, [doctorId, todayStr]),
                client.query(completedTodayQuery, [doctorId, todayStr]),
                client.query(totalPatientsQuery, [doctorId])
            ]);

            return {
                todayAppointments: parseInt(todayRes.rows[0].count),
                completedToday: parseInt(completedRes.rows[0].count),
                totalPatients: parseInt(patientsRes.rows[0].count)
            };
        } finally {
            client.release();
        }
    }
}
