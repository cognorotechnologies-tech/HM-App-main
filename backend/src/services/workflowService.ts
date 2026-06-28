
import pool from '../db';

export class WorkflowService {
    // --- TEMPLATES ---
    static async getTemplates(filters: { category?: string } = {}) {
        let query = `
            SELECT w.*, p.first_name, p.last_name 
            FROM workflow_templates w
            LEFT JOIN profiles p ON w.created_by = p.id
            WHERE w.is_active = true
        `;
        const values: any[] = [];
        if (filters.category) {
            query += ` AND w.category = $1`;
            values.push(filters.category);
        }
        query += ` ORDER BY w.created_at DESC`;

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
        // Get template
        const templateRes = await pool.query('SELECT * FROM workflow_templates WHERE id = $1', [id]);
        if (templateRes.rows.length === 0) return null;

        // Get steps
        const stepsRes = await pool.query('SELECT * FROM workflow_steps WHERE workflow_id = $1 ORDER BY step_order ASC', [id]);

        return {
            ...templateRes.rows[0],
            steps: stepsRes.rows
        };
    }

    static async createTemplate(data: any) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert Template
            const insertQuery = `
                INSERT INTO workflow_templates (
                    name, description, category, trigger_type, trigger_event, 
                    trigger_config, estimated_duration_days, is_active, created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            const values = [
                data.name, data.description, data.category, data.trigger_type,
                data.trigger_event, data.trigger_config || {}, data.estimated_duration_days,
                true, data.created_by
            ];
            const templateRes = await client.query(insertQuery, values);
            const template = templateRes.rows[0];

            // Insert Steps if provided
            if (data.steps && data.steps.length > 0) {
                for (let i = 0; i < data.steps.length; i++) {
                    const step = data.steps[i];
                    await client.query(`
                        INSERT INTO workflow_steps (
                            workflow_id, step_order, step_name, step_type,
                            delay_days, condition_rules, action_config
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        template.id, i + 1, step.step_name, step.step_type,
                        step.delay_days || 0, step.condition_rules || {}, step.action_config || {}
                    ]);
                }
            }

            await client.query('COMMIT');
            return await this.getTemplateById(template.id); // Return full object with steps
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async updateTemplate(id: string, updates: any) {
        // Simple update for template metadata
        const keys = Object.keys(updates).filter(k =>
            ['name', 'description', 'category', 'is_active', 'trigger_config'].includes(k)
        );
        if (keys.length === 0) return null;

        const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
        const values = [id, ...keys.map(k => updates[k])];

        const result = await pool.query(`UPDATE workflow_templates SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, values);
        return result.rows[0];
    }

    static async deleteTemplate(id: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Delete steps first
            await client.query('DELETE FROM workflow_steps WHERE workflow_id = $1', [id]);
            // Delete instances (optional, or error if instances exist?) schema usually has Cascade but let's be safe
            // For now, assuming we delete template deletes related instances if cascade ON, 
            // but let's just delete the template.

            const result = await client.query('DELETE FROM workflow_templates WHERE id = $1 RETURNING id', [id]);
            await client.query('COMMIT');
            return (result.rowCount || 0) > 0;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    // --- STEPS ---
    static async addStep(workflowId: string, stepData: any) {
        // Logic to add step, usually needs re-ordering or appending
        // Basic append logic:
        const maxOrderRes = await pool.query('SELECT MAX(step_order) as max_order FROM workflow_steps WHERE workflow_id = $1', [workflowId]);
        const nextOrder = (maxOrderRes.rows[0].max_order || 0) + 1;

        const query = `
            INSERT INTO workflow_steps (
                workflow_id, step_order, step_name, step_type,
                delay_days, condition_rules, action_config
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            workflowId, nextOrder, stepData.step_name, stepData.step_type,
            stepData.delay_days || 0, stepData.condition_rules || {}, stepData.action_config || {}
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // --- INSTANCES ---

    static async getInstances(filters: { patient_id?: string; status?: string } = {}) {
        let query = `
            SELECT i.*, w.name as workflow_name, p.first_name, p.last_name
            FROM workflow_instances i
            JOIN workflow_templates w ON i.workflow_id = w.id
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

    static async createInstance(data: { workflow_id: string; patient_id: string }) {
        // Start a workflow for a patient
        const query = `
            INSERT INTO workflow_instances (workflow_id, patient_id, status, started_at)
            VALUES ($1, $2, 'active', NOW())
            RETURNING *
        `;
        const result = await pool.query(query, [data.workflow_id, data.patient_id]);
        return result.rows[0];
    }

    static async getInstanceById(id: string) {
        const query = `
            SELECT i.*, w.name as workflow_name, p.first_name, p.last_name
            FROM workflow_instances i
            JOIN workflow_templates w ON i.workflow_id = w.id
            JOIN profiles p ON i.patient_id = p.id
            WHERE i.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return null;
        return result.rows[0];
    }
}
