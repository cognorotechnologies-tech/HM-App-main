
import pool from '../db';

export class TrackingService {

    static async trackAction(data: {
        patient_id?: string;
        workflow_instance_id?: string;
        action_type: string;
        action_data?: any;
        user_agent?: string;
        ip_address?: string;
    }) {
        const query = `
            INSERT INTO user_actions (
                patient_id, workflow_instance_id, action_type, 
                action_data, user_agent, ip_address
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            data.patient_id,
            data.workflow_instance_id,
            data.action_type,
            data.action_data || {},
            data.user_agent,
            data.ip_address
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getActions(filters: {
        patient_id?: string;
        action_type?: string;
        startDate?: string;
        endDate?: string;
    } = {}) {
        let query = `
            SELECT ua.*, p.first_name, p.last_name 
            FROM user_actions ua
            LEFT JOIN profiles p ON ua.patient_id = p.id
        `;
        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters.patient_id) {
            conditions.push(`ua.patient_id = $${idx++}`);
            values.push(filters.patient_id);
        }
        if (filters.action_type) {
            conditions.push(`ua.action_type = $${idx++}`);
            values.push(filters.action_type);
        }
        if (filters.startDate) {
            conditions.push(`ua.created_at >= $${idx++}`);
            values.push(filters.startDate);
        }
        if (filters.endDate) {
            conditions.push(`ua.created_at <= $${idx++}`);
            values.push(filters.endDate);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY ua.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getStats() {
        const query = `
            SELECT 
                action_type, 
                COUNT(*) as count 
            FROM user_actions 
            GROUP BY action_type
        `;
        const result = await pool.query(query);
        return result.rows;
    }
}
