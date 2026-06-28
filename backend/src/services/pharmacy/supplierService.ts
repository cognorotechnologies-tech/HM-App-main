import pool from '../../db';

export interface Supplier {
    supplier_id: string;
    supplier_name: string;
    contact_person?: string;
    phone_number?: string;
    email?: string;
    address?: string;
    gstin?: string;
    drug_license_number?: string;
    payment_terms?: string;
    credit_days?: number;
    is_active: boolean;
}

export const SupplierService = {
    async create(data: Partial<Supplier>) {
        const query = `
            INSERT INTO pharmacy_suppliers (
                supplier_name, contact_person, phone_number, email, address,
                gstin, drug_license_number, payment_terms, credit_days, is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [
            data.supplier_name,
            data.contact_person,
            data.phone_number,
            data.email,
            data.address,
            data.gstin,
            data.drug_license_number,
            data.payment_terms,
            data.credit_days || 0,
            data.is_active !== undefined ? data.is_active : true
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async update(id: string, data: Partial<Supplier>) {
        const query = `
            UPDATE pharmacy_suppliers
            SET supplier_name = COALESCE($1, supplier_name),
                contact_person = COALESCE($2, contact_person),
                phone_number = COALESCE($3, phone_number),
                email = COALESCE($4, email),
                address = COALESCE($5, address),
                gstin = COALESCE($6, gstin),
                drug_license_number = COALESCE($7, drug_license_number),
                payment_terms = COALESCE($8, payment_terms),
                credit_days = COALESCE($9, credit_days),
                is_active = COALESCE($10, is_active),
                updated_at = NOW()
            WHERE supplier_id = $11
            RETURNING *
        `;
        const values = [
            data.supplier_name,
            data.contact_person,
            data.phone_number,
            data.email,
            data.address,
            data.gstin,
            data.drug_license_number,
            data.payment_terms,
            data.credit_days,
            data.is_active,
            id
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async list(filters: { search?: string; limit?: number; offset?: number }) {
        let query = `SELECT * FROM pharmacy_suppliers WHERE is_active = true`;
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.search) {
            query += ` AND (supplier_name ILIKE $${paramIndex} OR contact_person ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        query += ` ORDER BY supplier_name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(filters.limit || 50);
        params.push(filters.offset || 0);

        const result = await pool.query(query, params);
        return result.rows;
    },

    async getById(id: string) {
        const result = await pool.query('SELECT * FROM pharmacy_suppliers WHERE supplier_id = $1', [id]);
        return result.rows[0];
    },

    async delete(id: string) {
        // Soft delete
        const result = await pool.query('UPDATE pharmacy_suppliers SET is_active = false WHERE supplier_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};
