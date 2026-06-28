import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export class ReceptionistService {
    static async registerPatient(data: {
        firstName: string;
        lastName: string;
        email?: string;
        phone: string;
        dateOfBirth: string;
        gender: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            pincode?: string;
        };
        emergencyContact: {
            name: string;
            phone: string;
            relation: string;
        };
        medicalInfo?: {
            bloodGroup?: string;
            allergies?: string[];
            chronicConditions?: string[];
            currentMedications?: string;
            previousSurgeries?: string;
            familyHistory?: string;
        };
        visit: {
            departmentId: string;
            doctorId: string;
            visitType: string;
            chiefComplaint: string;
            vitals?: any;
            createdBy: string;
        };
    }) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Generate IDs
            const patientId = uuidv4();
            const email = data.email || `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@walkin.local`;

            // 2. Create Profile
            await client.query(
                `INSERT INTO profiles (id, email, first_name, last_name, phone, role)
                 VALUES ($1, $2, $3, $4, $5, 'patient')`,
                [patientId, email, data.firstName, data.lastName, data.phone]
            );

            // 3. Create Patient Record
            await client.query(
                `INSERT INTO patients (
                    id, date_of_birth, gender, blood_group, allergies, chronic_conditions,
                    current_medications, previous_surgeries, family_history,
                    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
                    address_street, address_city, address_state, address_pincode
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                [
                    patientId, data.dateOfBirth, data.gender, data.medicalInfo?.bloodGroup,
                    data.medicalInfo?.allergies || [], data.medicalInfo?.chronicConditions || [],
                    data.medicalInfo?.currentMedications, data.medicalInfo?.previousSurgeries,
                    data.medicalInfo?.familyHistory,
                    data.emergencyContact.name, data.emergencyContact.phone, data.emergencyContact.relation,
                    data.address?.street, data.address?.city, data.address?.state, data.address?.pincode
                ]
            );

            // 4. Generate Token
            const today = new Date().toISOString().split('T')[0];
            const resultDept = await client.query('SELECT name FROM departments WHERE id = $1', [data.visit.departmentId]);
            const deptName = resultDept.rows[0]?.name || 'GENERAL';
            const deptCode = deptName.substring(0, 6).toUpperCase();

            const resultCount = await client.query(
                `SELECT COUNT(*) FROM patient_visits 
                 WHERE created_at::date = $1 AND token_number LIKE $2`,
                [today, `${deptCode}%`]
            );
            const sequence = parseInt(resultCount.rows[0].count) + 1;
            const tokenNumber = `${deptCode}-${String(sequence).padStart(3, '0')}`;

            // 5. Create Visit
            const visitResult = await client.query(
                `INSERT INTO patient_visits (
                    patient_id, token_number, visit_type, department_id, doctor_id,
                    chief_complaint, vitals, status, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'waiting', $8)
                RETURNING *`,
                [
                    patientId, tokenNumber, data.visit.visitType, data.visit.departmentId,
                    data.visit.doctorId, data.visit.chiefComplaint, data.visit.vitals,
                    data.visit.createdBy
                ]
            );

            await client.query('COMMIT');

            return {
                patientId,
                tokenNumber,
                visit: visitResult.rows[0]
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async createVisit(data: {
        patientId: string;
        departmentId: string;
        doctorId: string;
        visitType: string;
        chiefComplaint: string;
        vitals?: any;
        createdBy: string;
    }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const today = new Date().toISOString().split('T')[0];
            const resultDept = await client.query('SELECT name FROM departments WHERE id = $1', [data.departmentId]);
            const deptName = resultDept.rows[0]?.name || 'GENERAL';
            const deptCode = deptName.substring(0, 6).toUpperCase();

            const resultCount = await client.query(
                `SELECT COUNT(*) FROM patient_visits 
                 WHERE created_at::date = $1 AND token_number LIKE $2`,
                [today, `${deptCode}%`]
            );
            const sequence = parseInt(resultCount.rows[0].count) + 1;
            const tokenNumber = `${deptCode}-${String(sequence).padStart(3, '0')}`;

            const visitResult = await client.query(
                `INSERT INTO patient_visits (
                    patient_id, token_number, visit_type, department_id, doctor_id,
                    chief_complaint, vitals, status, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'waiting', $8)
                RETURNING *`,
                [
                    data.patientId, tokenNumber, data.visitType, data.departmentId,
                    data.doctorId, data.chiefComplaint, data.vitals,
                    data.createdBy
                ]
            );

            await client.query('COMMIT');

            return {
                tokenNumber,
                visit: visitResult.rows[0]
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getQueue(departmentId?: string, doctorId?: string) {
        let query = `
            SELECT 
                pv.*,
                p.date_of_birth, p.gender,
                pr.first_name as patient_first_name, pr.last_name as patient_last_name,
                d.specialization as doctor_specialization,
                dr_pr.first_name as doctor_first_name, dr_pr.last_name as doctor_last_name
            FROM patient_visits pv
            JOIN patients p ON pv.patient_id = p.id
            JOIN profiles pr ON p.id = pr.id
            LEFT JOIN doctors d ON pv.doctor_id = d.id
            LEFT JOIN profiles dr_pr ON d.id = dr_pr.id
            WHERE pv.status IN ('waiting', 'in_progress')
        `;

        const params: any[] = [];
        let paramIdx = 1;

        if (departmentId) {
            query += ` AND pv.department_id = $${paramIdx++}`;
            params.push(departmentId);
        }

        if (doctorId) {
            query += ` AND pv.doctor_id = $${paramIdx++}`;
            params.push(doctorId);
        }

        query += ` ORDER BY pv.created_at ASC`;

        const result = await pool.query(query, params);
        return result.rows.map((row: any) => ({
            id: row.id,
            token_number: row.token_number,
            status: row.status,
            visit_type: row.visit_type,
            created_at: row.created_at,
            patient: {
                id: row.patient_id,
                first_name: row.patient_first_name,
                last_name: row.patient_last_name,
                gender: row.gender,
                date_of_birth: row.date_of_birth
            },
            doctor: {
                id: row.doctor_id,
                specialization: row.doctor_specialization,
                profile: {
                    first_name: row.doctor_first_name,
                    last_name: row.doctor_last_name
                }
            }
        }));
    }

    static async updateVisitStatus(visitId: string, status: string) {
        const result = await pool.query(
            `UPDATE patient_visits SET status = $1 WHERE id = $2 RETURNING *`,
            [status, visitId]
        );
        return result.rows[0];
    }

    static async getDashboardStats() {
        const client = await pool.connect();
        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Total Patients
            const resultPatients = await client.query('SELECT COUNT(*) FROM patients');

            // 2. Walkins (New patients registered today)
            const resultWalkins = await client.query(
                'SELECT COUNT(*) FROM patients WHERE created_at::date = $1',
                [today]
            );

            // 3. Today's Appointments
            const resultAppointments = await client.query(
                `SELECT COUNT(*) FROM appointments WHERE appointment_date = $1`,
                [today]
            );

            // 4. Pending Consultations (Visits with status 'waiting')
            const resultPending = await client.query(
                `SELECT COUNT(*) FROM patient_visits WHERE status = 'waiting' AND created_at::date = $1`,
                [today]
            );

            return {
                totalPatients: parseInt(resultPatients.rows[0].count),
                walkins: parseInt(resultWalkins.rows[0].count),
                appointments: parseInt(resultAppointments.rows[0].count),
                pendingConsultations: parseInt(resultPending.rows[0].count)
            };

        } finally {
            client.release();
        }
    }
}
