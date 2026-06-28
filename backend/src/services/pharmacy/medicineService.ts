import pool from '../../db';

export interface Medicine {
    medicine_id?: string;
    medicine_name: string;
    generic_name?: string;
    brand_name?: string;
    manufacturer_id?: string;
    category_id?: string;
    unit_of_measurement?: string;
    hsn_code?: string;
    schedule_type?: string;
    minimum_stock_level?: number;
    maximum_stock_level?: number;
    reorder_quantity?: number;
    rack_location?: string;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export const MedicineService = {
    async create(medicine: Medicine) {
        const {
            medicine_name, generic_name, brand_name, manufacturer_id, category_id,
            unit_of_measurement, hsn_code, schedule_type, minimum_stock_level,
            maximum_stock_level, reorder_quantity, rack_location, is_active
        } = medicine;

        const result = await pool.query(
            `INSERT INTO pharmacy_medicines (
                medicine_name, generic_name, brand_name, manufacturer_id, category_id,
                unit_of_measurement, hsn_code, schedule_type, minimum_stock_level,
                maximum_stock_level, reorder_quantity, rack_location, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
            [
                medicine_name, generic_name, brand_name, manufacturer_id, category_id,
                unit_of_measurement, hsn_code, schedule_type, minimum_stock_level,
                maximum_stock_level, reorder_quantity, rack_location, is_active ?? true
            ]
        );
        return result.rows[0];
    },

    async update(id: string, updates: Partial<Medicine>) {
        const fields = Object.keys(updates);
        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = Object.values(updates);

        const result = await pool.query(
            `UPDATE pharmacy_medicines SET ${setClause}, updated_at = NOW() WHERE medicine_id = $1 RETURNING *`,
            [id, ...values]
        );
        return result.rows[0];
    },

    async getById(id: string) {
        const result = await pool.query('SELECT * FROM pharmacy_medicines WHERE medicine_id = $1', [id]);
        return result.rows[0] || null;
    },

    async list(filters: { search?: string; category_id?: string; limit?: number; offset?: number }) {
        let query = `
            SELECT m.*, c.category_name, man.manufacturer_name,
                   (SELECT SUM(quantity_available) FROM pharmacy_inventory WHERE medicine_id = m.medicine_id) as total_stock
            FROM pharmacy_medicines m
            LEFT JOIN pharmacy_drug_categories c ON m.category_id = c.category_id
            LEFT JOIN pharmacy_manufacturers man ON m.manufacturer_id = man.manufacturer_id
            WHERE m.is_active = true
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.search) {
            query += ` AND (m.medicine_name ILIKE $${paramIndex} OR m.generic_name ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        if (filters.category_id) {
            query += ` AND m.category_id = $${paramIndex}`;
            params.push(filters.category_id);
            paramIndex++;
        }

        query += ` ORDER BY m.medicine_name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(filters.limit || 50);
        params.push(filters.offset || 0);

        const result = await pool.query(query, params);
        return result.rows;
    },

    async delete(id: string) {
        // Soft delete
        const result = await pool.query(
            'UPDATE pharmacy_medicines SET is_active = false, updated_at = NOW() WHERE medicine_id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
};
