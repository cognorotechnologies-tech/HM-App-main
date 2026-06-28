
import pool from '../db';

export class PrescriptionTemplateService {
    /**
     * Get all active templates for a doctor (including system templates)
     */
    static async getAll(doctorId: string) {
        // Fetch system templates (doctor_id is null) AND doctor's private templates
        const query = `
            SELECT * FROM prescription_templates 
            WHERE is_active = true 
            AND (doctor_id IS NULL OR doctor_id = $1::uuid)
            ORDER BY use_count DESC, template_name ASC
        `;
        const result = await pool.query(query, [doctorId]);
        return result.rows;
    }

    /**
     * Get a specific template by ID
     */
    static async getById(id: string) {
        const query = `
            SELECT * FROM prescription_templates 
            WHERE id = $1::uuid
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Create a new template for a doctor
     */
    static async create(data: {
        doctor_id: string;
        template_name: string;
        description?: string;
        diagnosis?: string;
        medicines: any[];
        tests?: string[];
        instructions?: string;
        follow_up_days?: number;
    }) {
        const query = `
            INSERT INTO prescription_templates (
                doctor_id, 
                template_name, 
                description, 
                diagnosis, 
                medicines, 
                tests, 
                instructions, 
                follow_up_days
            )
            VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const result = await pool.query(query, [
            data.doctor_id,
            data.template_name,
            data.description || null,
            data.diagnosis || null,
            JSON.stringify(data.medicines),
            data.tests || [],
            data.instructions || null,
            data.follow_up_days || null
        ]);
        return result.rows[0];
    }

    /**
     * Update a template
     */
    static async update(id: string, doctorId: string, data: Partial<{
        template_name: string;
        description: string;
        diagnosis: string;
        medicines: any[];
        tests: string[];
        instructions: string;
        follow_up_days: number;
    }>) {
        // Ensure the template belongs to the doctor
        const checkQuery = `SELECT doctor_id FROM prescription_templates WHERE id = $1::uuid`;
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) return null; // Not found
        if (checkResult.rows[0].doctor_id !== doctorId) {
            throw new Error('Unauthorized: Cannot update system template or another doctor\'s template');
        }

        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.template_name !== undefined) { fields.push(`template_name = $${idx++}`); values.push(data.template_name); }
        if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
        if (data.diagnosis !== undefined) { fields.push(`diagnosis = $${idx++}`); values.push(data.diagnosis); }
        if (data.medicines !== undefined) { fields.push(`medicines = $${idx++}`); values.push(JSON.stringify(data.medicines)); }
        if (data.tests !== undefined) { fields.push(`tests = $${idx++}`); values.push(data.tests); }
        if (data.instructions !== undefined) { fields.push(`instructions = $${idx++}`); values.push(data.instructions); }
        if (data.follow_up_days !== undefined) { fields.push(`follow_up_days = $${idx++}`); values.push(data.follow_up_days); }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE prescription_templates SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx}::uuid RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Delete (soft delete) a template
     */
    static async delete(id: string, doctorId: string) {
        const query = `
            UPDATE prescription_templates 
            SET is_active = false 
            WHERE id = $1::uuid AND doctor_id = $2::uuid 
            RETURNING *
        `;
        const result = await pool.query(query, [id, doctorId]);
        return result.rows[0];
    }

    /**
     * Increment use count
     */
    static async incrementUseCount(id: string) {
        const query = `
            UPDATE prescription_templates 
            SET use_count = use_count + 1 
            WHERE id = $1::uuid
        `;
        await pool.query(query, [id]);
    }

    /**
     * Get most used templates
     */
    static async getMostUsed(doctorId: string, limit: number = 5) {
        const query = `
            SELECT * FROM prescription_templates 
            WHERE is_active = true 
            AND (doctor_id IS NULL OR doctor_id = $1::uuid)
            ORDER BY use_count DESC
            LIMIT $2
        `;
        const result = await pool.query(query, [doctorId, limit]);
        return result.rows;
    }
}
