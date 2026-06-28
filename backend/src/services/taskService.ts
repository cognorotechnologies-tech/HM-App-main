
import pool from '../db';

export class TaskService {
    static async getTasks(filters: { status?: string; priority?: string; role?: string; patient_id?: string } = {}) {
        let query = `
            SELECT t.*, p.first_name as patient_first_name, p.last_name as patient_last_name
            FROM staff_tasks t
            LEFT JOIN profiles p ON t.patient_id = p.id
        `; // Note: patient_id usually refers to patients table, but patients table doesn't have names, profiles does.
        // However, t.patient_id references patients table?
        // In schema: patient_id uuid.
        // patients table id is same as profiles id (shared PK) usually, or FK to user_id.
        // In my seed, patient.id == profile.id.
        // So joining profiles on t.patient_id = p.id works.

        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters.status) {
            conditions.push(`t.status = $${idx++}`);
            values.push(filters.status);
        }
        if (filters.priority) {
            conditions.push(`t.priority = $${idx++}`);
            values.push(filters.priority);
        }
        if (filters.role) {
            conditions.push(`t.assigned_role = $${idx++}`);
            values.push(filters.role);
        }
        if (filters.patient_id) {
            conditions.push(`t.patient_id = $${idx++}`);
            values.push(filters.patient_id);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY t.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows.map((row: any) => ({
            ...row,
            patient: row.patient_id ? {
                first_name: row.patient_first_name,
                last_name: row.patient_last_name
            } : undefined
        }));
    }

    static async getTaskById(id: string) {
        const query = `
            SELECT t.*, p.first_name as patient_first_name, p.last_name as patient_last_name
            FROM staff_tasks t
            LEFT JOIN profiles p ON t.patient_id = p.id
            WHERE t.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            ...row,
            patient: row.patient_id ? {
                first_name: row.patient_first_name,
                last_name: row.patient_last_name
            } : undefined
        };
    }

    static async createTask(data: any) {
        const query = `
            INSERT INTO staff_tasks (
                patient_id, workflow_instance_id, title, description,
                priority, assigned_role, status, due_date,
                is_recurring, recurrence_pattern, recurrence_interval,
                recurrence_end_date, recurrence_days
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        const values = [
            data.patient_id || null, // Ensure allow null if optional
            data.workflow_instance_id,
            data.title,
            data.description,
            data.priority || 'medium',
            data.assigned_role,
            data.status || 'pending',
            data.due_date,
            data.is_recurring || false,
            data.recurrence_pattern,
            data.recurrence_interval,
            data.recurrence_end_date,
            data.recurrence_days ? JSON.stringify(data.recurrence_days) : '[]'
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async updateTask(id: string, updates: any) {
        const allowedKeys = [
            'title', 'description', 'priority', 'assigned_role',
            'status', 'due_date', 'completed_at',
            'is_recurring', 'recurrence_pattern', 'recurrence_interval',
            'recurrence_end_date', 'recurrence_days'
        ];

        const keys = Object.keys(updates).filter(k => allowedKeys.includes(k));

        if (keys.length === 0) return null;

        const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
        const values = [id, ...keys.map((k) => {
            if (k === 'recurrence_days' && typeof updates[k] === 'object') {
                return JSON.stringify(updates[k]);
            }
            return updates[k];
        })];

        const query = `UPDATE staff_tasks SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async deleteTask(id: string) {
        await pool.query('DELETE FROM staff_tasks WHERE id = $1', [id]);
        return true;
    }

    static async getStats() {
        const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE priority = 'high' OR priority = 'critical') as high_priority
            FROM staff_tasks
        `;
        const result = await pool.query(query);
        const row = result.rows[0];
        return {
            total: parseInt(row.total),
            pending: parseInt(row.pending),
            completed: parseInt(row.completed),
            highPriority: parseInt(row.high_priority)
        };
    }
}
