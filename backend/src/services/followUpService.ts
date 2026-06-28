import pool from '../db';

export interface FollowUp {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_id?: string;
    follow_up_date: string;
    reason: string;
    status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
    is_notified: boolean;
    created_at: string;
    updated_at: string;
}

export class FollowUpService {
    async create(data: Partial<FollowUp>) {
        const { patient_id, doctor_id, appointment_id, follow_up_date, reason } = data;
        const query = `
            INSERT INTO follow_ups (patient_id, doctor_id, appointment_id, follow_up_date, reason, status)
            VALUES ($1, $2, $3, $4, $5, 'scheduled')
            RETURNING *
        `;
        const values = [patient_id, doctor_id, appointment_id, follow_up_date, reason];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async getUpcoming(doctorId: string) {
        const query = `
            SELECT f.*, p.first_name, p.last_name, p.gender, p.date_of_birth
            FROM follow_ups f
            JOIN profiles p ON f.patient_id = p.id
            WHERE f.doctor_id = $1 
            AND f.status = 'scheduled'
            AND f.follow_up_date >= CURRENT_DATE
            ORDER BY f.follow_up_date ASC
            LIMIT 20
        `;
        const { rows } = await pool.query(query, [doctorId]);
        return rows;
    }

    async getByPatient(patientId: string) {
        const query = `
            SELECT * FROM follow_ups 
            WHERE patient_id = $1 
            ORDER BY follow_up_date DESC
        `;
        const { rows } = await pool.query(query, [patientId]);
        return rows;
    }

    async markStatus(id: string, status: string) {
        const query = `
            UPDATE follow_ups 
            SET status = $2, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id, status]);
        return rows[0];
    }
}

export const followUpService = new FollowUpService();
