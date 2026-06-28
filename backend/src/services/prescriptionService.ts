import pool from '../db';

export class PrescriptionService {
    static async getAll() {
        const query = `
            SELECT p.*, 
                   pat.first_name as patient_first_name, pat.last_name as patient_last_name,
                   doc.first_name as doctor_first_name, doc.last_name as doctor_last_name
            FROM prescriptions p
            LEFT JOIN profiles pat ON p.patient_id = pat.id
            LEFT JOIN profiles doc ON p.doctor_id = doc.id
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    static async getById(id: string) {
        const query = `
            SELECT p.*, 
                   pat.first_name as patient_first_name, pat.last_name as patient_last_name,
                   doc.first_name as doctor_first_name, doc.last_name as doctor_last_name
            FROM prescriptions p
            LEFT JOIN profiles pat ON p.patient_id = pat.id
            LEFT JOIN profiles doc ON p.doctor_id = doc.id
            WHERE p.id = $1::uuid
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async getByPatient(patientId: string) {
        const query = `
            SELECT p.*, 
                   pat.first_name as patient_first_name, pat.last_name as patient_last_name,
                   doc.first_name as doctor_first_name, doc.last_name as doctor_last_name
            FROM prescriptions p
            LEFT JOIN profiles pat ON p.patient_id = pat.id
            LEFT JOIN profiles doc ON p.doctor_id = doc.id
            WHERE p.patient_id = $1::uuid
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(query, [patientId]);
        return result.rows;
    }

    static async getByAppointment(appointmentId: string) {
        const query = `
            SELECT p.*, 
                   pat.first_name as patient_first_name, pat.last_name as patient_last_name,
                   doc.first_name as doctor_first_name, doc.last_name as doctor_last_name
            FROM prescriptions p
            LEFT JOIN profiles pat ON p.patient_id = pat.id
            LEFT JOIN profiles doc ON p.doctor_id = doc.id
            WHERE p.consultation_id = $1::uuid
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(query, [appointmentId]);
        return result.rows;
    }

    static async create(data: {
        patient_id: string;
        doctor_id: string;
        consultation_id?: string;
        prescription_number: string;
        diagnosis?: string;
        medicines?: any;
        instructions?: string;
        investigations?: any;
        follow_up_date?: string;
    }) {
        const result = await pool.query(
            `INSERT INTO prescriptions 
            (patient_id, doctor_id, consultation_id, prescription_number, diagnosis, medicines, instructions, investigations, follow_up_date)
            VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                data.patient_id,
                data.doctor_id,
                data.consultation_id || null,
                data.prescription_number,
                data.diagnosis || null,
                data.medicines ? JSON.stringify(data.medicines) : null,
                data.instructions || null,
                data.investigations ? JSON.stringify(data.investigations) : null,
                data.follow_up_date || null
            ]
        );
        return result.rows[0];
    }

    static async update(id: string, data: Partial<{
        diagnosis: string;
        medicines: any;
        instructions: string;
        investigations: any;
        follow_up_date: string;
    }>) {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.diagnosis !== undefined) { fields.push(`diagnosis = $${idx++}`); values.push(data.diagnosis); }
        if (data.medicines !== undefined) { fields.push(`medicines = $${idx++}`); values.push(JSON.stringify(data.medicines)); }
        if (data.instructions !== undefined) { fields.push(`instructions = $${idx++}`); values.push(data.instructions); }
        if (data.investigations !== undefined) { fields.push(`investigations = $${idx++}`); values.push(JSON.stringify(data.investigations)); }
        if (data.follow_up_date !== undefined) { fields.push(`follow_up_date = $${idx++}`); values.push(data.follow_up_date); }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE prescriptions SET ${fields.join(', ')} WHERE id = $${idx}::uuid RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async delete(id: string) {
        const result = await pool.query('DELETE FROM prescriptions WHERE id = $1::uuid RETURNING *', [id]);
        return result.rows[0];
    }
}
