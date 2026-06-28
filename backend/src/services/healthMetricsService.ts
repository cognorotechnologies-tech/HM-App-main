import pool from '../db';

export class HealthMetricsService {
    static async getAll(filters: { patient_id?: string; metric_type?: string } = {}) {
        let query = `
            SELECT hm.id, hm.patient_id, hm.type as metric_type, hm.value, hm.unit, hm.measured_at as recorded_at, hm.notes, hm.created_by, hm.created_at,
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name
            FROM health_metrics hm
            LEFT JOIN profiles p ON hm.patient_id = p.id
        `;

        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters.patient_id) {
            conditions.push(`hm.patient_id = $${idx++}`);
            values.push(filters.patient_id);
        }

        if (filters.metric_type) {
            conditions.push(`hm.type = $${idx++}`);
            values.push(filters.metric_type);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY hm.measured_at DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getById(id: string) {
        const query = `
            SELECT hm.id, hm.patient_id, hm.type as metric_type, hm.value, hm.unit, hm.measured_at as recorded_at, hm.notes, hm.created_by, hm.created_at,
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name
            FROM health_metrics hm
            LEFT JOIN profiles p ON hm.patient_id = p.id
            WHERE hm.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async getByPatient(patientId: string) {
        return this.getAll({ patient_id: patientId });
    }

    static async create(data: {
        patient_id: string;
        metric_type: string;
        value: any;
        unit: string;
        recorded_at?: string;
        notes?: string;
        recorded_by?: string;
    }) {
        // Ensure value is JSONB compatible. 
        // node-postgres handles objects automatically. 
        // For simple strings that aren't valid JSON (like "120/80"), we might need to wrap them or just let the user send valid JSON.
        // But for "120/80" to be saved as a string in JSONB, it must be passed as '"120/80"'.
        // However, safest is to assume `value` is either number or object. 
        // If it's "120/80", we should probably store it as { value: "120/80" } or just generic object.
        // OR we can just `JSON.stringify` everything that isn't null/undefined?
        // Actually, let's keep it simple: Frontend sends a string "120/80". 
        // If we pass "120/80" to pg param for JSONB, it fails.
        // If we pass JSON.stringify("120/80"), it works.
        // If we pass a number 70, JSON.stringify(70) -> "70". Works.
        // If we pass object, JSON.stringify(obj) -> string. Works.

        const valueToSave = typeof data.value === 'string' ? JSON.stringify(data.value) : data.value;

        const result = await pool.query(
            `INSERT INTO health_metrics (patient_id, type, value, unit, measured_at, notes, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, patient_id, type as metric_type, value, unit, measured_at as recorded_at, notes, created_by`,
            [
                data.patient_id,
                data.metric_type,
                valueToSave,
                data.unit,
                data.recorded_at || new Date().toISOString(),
                data.notes || null,
                data.recorded_by || null
            ]
        );
        return result.rows[0];
    }

    static async update(id: string, data: Partial<{
        value: number;
        unit: string;
        notes: string;
        recorded_at: string;
    }>) {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.value !== undefined) { fields.push(`value = $${idx++}`); values.push(data.value); }
        if (data.unit !== undefined) { fields.push(`unit = $${idx++}`); values.push(data.unit); }
        if (data.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(data.notes); }
        if (data.recorded_at !== undefined) { fields.push(`measured_at = $${idx++}`); values.push(data.recorded_at); }

        if (fields.length === 0) return null;

        // Note: health_metrics table doesn't have updated_at column in schema provided, 
        // but typically it might exist. The schema (line 739) does NOT have updated_at. 
        // Wait, schema line 739: id (PK). Line 737: created_at.
        // It does NOT have updated_at.
        // I will remove updated_at update.

        values.push(id);

        const query = `UPDATE health_metrics SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, patient_id, type as metric_type, value, unit, measured_at as recorded_at, notes, created_by`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async delete(id: string) {
        const result = await pool.query('DELETE FROM health_metrics WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async getLatestByType(patientId: string, metricType: string) {
        const query = `
            SELECT id, patient_id, type as metric_type, value, unit, measured_at as recorded_at, notes, created_by, created_at
            FROM health_metrics
            WHERE patient_id = $1 AND type = $2
            ORDER BY measured_at DESC
            LIMIT 1
        `;
        const result = await pool.query(query, [patientId, metricType]);
        return result.rows[0];
    }

    static async getHistory(patientId: string, metricType: string, limit: number = 10) {
        const query = `
            SELECT id, patient_id, type as metric_type, value, unit, measured_at as recorded_at, notes, created_by, created_at
            FROM health_metrics
            WHERE patient_id = $1 AND type = $2
            ORDER BY measured_at DESC
            LIMIT $3
        `;
        const result = await pool.query(query, [patientId, metricType, limit]);
        return result.rows;
    }
}
