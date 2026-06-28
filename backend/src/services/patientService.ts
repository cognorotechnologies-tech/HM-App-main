import pool from '../db';
import { AdminService } from './adminService';

export class PatientService {
    static async getPatientById(id: string) {
        const query = `
            SELECT p.*, pr.email, pr.phone, pr.first_name, pr.last_name, pr.avatar_url
            FROM patients p
            JOIN profiles pr ON p.id = pr.id
            WHERE p.id = $1
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
            }
        };
    }

    static async createPatient(data: any) {
        return AdminService.createPatient(data);
    }

    static async updatePatient(id: string, data: any) {
        return AdminService.updatePatient(id, data);
    }

    static async getAllPatients(filters: { query?: string } = {}) {
        return AdminService.getAllPatients(filters);
    }
}
