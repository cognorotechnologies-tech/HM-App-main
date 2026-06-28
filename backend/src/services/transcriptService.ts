import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface TranscriptInsert {
    appointment_id: string;
    doctor_id: string;
    patient_id: string;
    transcript_text: string;
    metadata?: any;
}

class TranscriptService {
    async save(data: TranscriptInsert) {
        const query = `
            INSERT INTO consultation_transcripts 
            (id, appointment_id, doctor_id, patient_id, transcript_text, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            uuidv4(),
            data.appointment_id,
            data.doctor_id,
            data.patient_id,
            data.transcript_text,
            data.metadata || {}
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async getByAppointment(appointmentId: string) {
        const query = `
            SELECT * FROM consultation_transcripts 
            WHERE appointment_id = $1
        `;
        const { rows } = await pool.query(query, [appointmentId]);
        return rows[0];
    }
}

export const transcriptService = new TranscriptService();
