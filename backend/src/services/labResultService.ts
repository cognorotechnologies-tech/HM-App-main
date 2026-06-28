import pool from '../db';

interface LabResult {
    id: string;
    patient_id: string;
    doctor_id: string;
    test_date: Date;
    test_type: string;
    summary: string;
    file_url: string;
    raw_data: any;
    status: 'pending' | 'available' | 'reviewed';
    created_at: Date;
    updated_at: Date;
}

export class LabResultService {
    async create(data: Partial<LabResult>) {
        const { patient_id, doctor_id, test_date, test_type, summary, file_url, raw_data, status } = data;

        const query = `
      INSERT INTO lab_results (patient_id, doctor_id, test_date, test_type, summary, file_url, raw_data, status)
      VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

        const values = [patient_id, doctor_id, test_date || new Date(), test_type, summary, file_url, raw_data, status || 'pending'];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async getByPatient(patientId: string) {
        const query = `
      SELECT * FROM lab_results 
      WHERE patient_id = $1::uuid 
      ORDER BY test_date DESC
    `;
        const { rows } = await pool.query(query, [patientId]);
        return rows;
    }

    async getById(id: string) {
        const query = `SELECT * FROM lab_results WHERE id = $1::uuid`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

export const labResultService = new LabResultService();
