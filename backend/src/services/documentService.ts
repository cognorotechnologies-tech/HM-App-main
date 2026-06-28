import pool from '../db';
import fs from 'fs';
import path from 'path';

const uploadDir = path.resolve(__dirname, '../../uploads');

export class DocumentService {
    static async create(data: {
        patient_id: string;
        name: string;
        type: string;
        url: string; // Store relative path or full URL
        size?: number;
        uploaded_by?: string;
    }) {
        const result = await pool.query(
            `INSERT INTO medical_documents (patient_id, file_name, document_type, file_url, file_size, uploaded_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [data.patient_id, data.name, data.type, data.url, data.size || 0, data.uploaded_by]
        );
        return result.rows[0];
    }

    static async getByPatient(patientId: string) {
        const result = await pool.query(
            `SELECT 
                id, patient_id, file_name as name, document_type as type, 
                file_url as url, file_size as size, uploaded_by, created_at, updated_at
             FROM medical_documents 
             WHERE patient_id = $1 
             ORDER BY created_at DESC`,
            [patientId]
        );
        return result.rows;
    }

    static async getById(id: string) {
        const result = await pool.query(
            `SELECT 
                id, patient_id, file_name as name, document_type as type, 
                file_url as url, file_size as size, uploaded_by, created_at, updated_at
             FROM medical_documents 
             WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async delete(id: string) {
        const doc = await this.getById(id);
        if (doc) {
            // Delete file from filesystem
            const filename = path.basename(doc.url);
            const filePath = path.join(uploadDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        const result = await pool.query(
            `DELETE FROM medical_documents WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }
}
