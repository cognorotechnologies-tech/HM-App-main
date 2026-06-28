import pool from '../db';

export class AppointmentService {
    static async getAll(filters: {
        patient_id?: string;
        doctor_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    } = {}) {
        let query = `
            SELECT a.*,
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name,
                   pd.first_name as doctor_first_name,
                   pd.last_name as doctor_last_name,
                   d.specialization as doctor_specialization,
                   dept.name as department_name
            FROM appointments a
            LEFT JOIN patients pat ON a.patient_id = pat.id
            LEFT JOIN profiles p ON pat.id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN profiles pd ON d.id = pd.id
            LEFT JOIN departments dept ON a.department_id = dept.id
        `;

        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters.patient_id) {
            conditions.push(`a.patient_id = $${idx++}`);
            values.push(filters.patient_id);
        }
        if (filters.doctor_id) {
            conditions.push(`a.doctor_id = $${idx++}`);
            values.push(filters.doctor_id);
        }
        if (filters.status) {
            conditions.push(`a.status = $${idx++}`);
            values.push(filters.status);
        }
        if (filters.date_from) {
            conditions.push(`a.appointment_date >= $${idx++}`);
            values.push(filters.date_from);
        }
        if (filters.date_to) {
            conditions.push(`a.appointment_date <= $${idx++}`);
            values.push(filters.date_to);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY a.appointment_date DESC, a.start_time DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getById(id: string) {
        const query = `
            SELECT a.*,
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name,
                   p.email as patient_email,
                   p.phone as patient_phone,
                   pat.gender as patient_gender,
                   pat.date_of_birth as patient_dob,
                   pat.blood_group as patient_blood_group,
                   pat.allergies as patient_allergies,
                   pat.chronic_conditions as patient_chronic_conditions,
                   pat.medical_history as patient_medical_history,
                   pd.first_name as doctor_first_name,
                   pd.last_name as doctor_last_name,
                   d.specialization as doctor_specialization,
                   dept.name as department_name
            FROM appointments a
            LEFT JOIN patients pat ON a.patient_id = pat.id
            LEFT JOIN profiles p ON pat.id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN profiles pd ON d.id = pd.id
            LEFT JOIN departments dept ON a.department_id = dept.id
            WHERE a.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async getByPatient(patientId: string) {
        return this.getAll({ patient_id: patientId });
    }

    static async getByDoctor(doctorId: string) {
        return this.getAll({ doctor_id: doctorId });
    }

    static async checkAvailability(doctorId: string, appointmentDate: string, startTime: string, endTime: string, excludeAppointmentId?: string) {
        let query = `
            SELECT COUNT(*) as count
            FROM appointments
            WHERE doctor_id = $1
            AND appointment_date = $2
            AND status NOT IN ('cancelled', 'completed')
            AND (
                (start_time < $4 AND end_time > $3)
            )
        `;

        const values: any[] = [doctorId, appointmentDate, startTime, endTime];

        if (excludeAppointmentId) {
            query += ` AND id != $5`;
            values.push(excludeAppointmentId);
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].count) === 0; // true if available
    }

    static async create(data: {
        patient_id: string;
        doctor_id: string;
        department_id?: string;
        appointment_date: string;
        start_time: string;
        end_time: string;
        appointment_type: string;
        status?: string;
        reason?: string;
        notes?: string;
    }) {
        // Check availability first
        const isAvailable = await this.checkAvailability(
            data.doctor_id,
            data.appointment_date,
            data.start_time,
            data.end_time
        );

        if (!isAvailable) {
            throw new Error('Doctor is not available at the selected time');
        }

        const result = await pool.query(
            `INSERT INTO appointments (
                patient_id, doctor_id, department_id, appointment_date,
                start_time, end_time, status, reason, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                data.patient_id,
                data.doctor_id,
                data.department_id || null,
                data.appointment_date,
                data.start_time,
                data.end_time,
                data.status || 'pending',
                data.reason || null,
                data.notes || null
            ]
        );
        return result.rows[0];
    }

    static async updateStatus(id: string, status: string) {
        const result = await pool.query(
            `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, id]
        );
        return result.rows[0];
    }

    static async update(id: string, data: Partial<{
        appointment_date: string;
        start_time: string;
        end_time: string;
        status: string;
        reason: string;
        notes: string;
    }>) {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.appointment_date !== undefined) { fields.push(`appointment_date = $${idx++}`); values.push(data.appointment_date); }
        if (data.start_time !== undefined) { fields.push(`start_time = $${idx++}`); values.push(data.start_time); }
        if (data.end_time !== undefined) { fields.push(`end_time = $${idx++}`); values.push(data.end_time); }
        if (data.status !== undefined) { fields.push(`status = $${idx++}`); values.push(data.status); }
        if (data.reason !== undefined) { fields.push(`reason = $${idx++}`); values.push(data.reason); }
        if (data.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(data.notes); }

        if (fields.length === 0) return null;

        fields.push(`updated_at = NOW()`);
        values.push(id);

        const query = `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async delete(id: string) {
        const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}
