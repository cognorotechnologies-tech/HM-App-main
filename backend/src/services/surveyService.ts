
import pool from '../db';

export class SurveyService {
    // --- TEMPLATES ---

    static async getTemplates(filters: { category?: string } = {}) {
        let query = `
            SELECT s.*, p.first_name, p.last_name 
            FROM survey_templates s
            LEFT JOIN profiles p ON s.created_by = p.id
            WHERE s.is_active = true
        `;
        const values: any[] = [];

        if (filters.category) {
            query += ` AND s.category = $1`;
            values.push(filters.category);
        }

        query += ` ORDER BY s.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows.map((row: any) => ({
            ...row,
            creator: row.created_by ? {
                first_name: row.first_name,
                last_name: row.last_name
            } : undefined
        }));
    }

    static async getTemplateById(id: string) {
        const result = await pool.query('SELECT * FROM survey_templates WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    static async createTemplate(data: any) {
        const query = `
            INSERT INTO survey_templates (
                name, description, category, questions, scoring_rules, 
                alert_rules, estimated_time_minutes, is_active, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            data.name, data.description, data.category, JSON.stringify(data.questions),
            data.scoring_rules || {}, data.alert_rules || {}, data.estimated_time_minutes,
            true, data.created_by
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async updateTemplate(id: string, updates: any) {
        const keys = Object.keys(updates).filter(k =>
            ['name', 'description', 'category', 'questions', 'is_active', 'scoring_rules', 'alert_rules'].includes(k)
        );
        if (keys.length === 0) return null;

        const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
        const values = [id, ...keys.map(k => k === 'questions' ? JSON.stringify(updates[k]) : updates[k])];

        const result = await pool.query(`UPDATE survey_templates SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, values);
        return result.rows[0];
    }

    static async deleteTemplate(id: string) {
        // Soft delete usually, or real delete if no instances
        await pool.query('DELETE FROM survey_templates WHERE id = $1', [id]);
        return true;
    }


    // --- INSTANCES (Assignments) ---

    static async getInstances(filters: { patient_id?: string; status?: string } = {}) {
        let query = `
            SELECT i.*, t.name as survey_name, p.first_name, p.last_name
            FROM survey_instances i
            JOIN survey_templates t ON i.survey_template_id = t.id
            JOIN profiles p ON i.patient_id = p.id
        `;
        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters.patient_id) {
            conditions.push(`i.patient_id = $${idx++}`);
            values.push(filters.patient_id);
        }
        if (filters.status) {
            conditions.push(`i.status = $${idx++}`);
            values.push(filters.status);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY i.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async createInstance(data: any) {
        const query = `
            INSERT INTO survey_instances (survey_template_id, patient_id, status, sent_at)
            VALUES ($1, $2, 'sent', NOW())
            RETURNING *
        `;
        const result = await pool.query(query, [data.survey_template_id, data.patient_id]);
        return result.rows[0];
    }

    static async getInstanceById(id: string) {
        const query = `
            SELECT i.*, t.name as survey_name, t.questions
            FROM survey_instances i
            JOIN survey_templates t ON i.survey_template_id = t.id
            WHERE i.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    // --- RESPONSES ---

    static async submitResponse(instanceId: string, responses: any[]) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const resp of responses) {
                await client.query(`
                    INSERT INTO survey_responses (
                        survey_instance_id, question_id, question_text, 
                        question_type, answer_value
                    )
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    instanceId, resp.question_id, resp.question_text,
                    resp.question_type, JSON.stringify(resp.answer_value)
                ]);
            }

            // Update instance status
            await client.query(`
                UPDATE survey_instances 
                SET status = 'completed', completed_at = NOW(), progress_percentage = 100 
                WHERE id = $1
            `, [instanceId]);

            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async getStats() {
        const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'sent') as pending
            FROM survey_instances
       `;
        const result = await pool.query(query);
        const row = result.rows[0];
        return {
            total: parseInt(row.total),
            completed: parseInt(row.completed),
            pending: parseInt(row.pending)
        };
    }
    static async getAlertsCount(status: string) {
        // Stub: In real app, query survey_alerts table
        // For now return 0 to fix 404
        return 0;
    }
}
