import pool from '../db';

export class BillingService {
    static async getAllInvoices(filters: { patient_id?: string; status?: string } = {}) {
        let query = `
            SELECT bi.*, 
                   p.first_name as patient_first_name, 
                   p.last_name as patient_last_name
            FROM billing_invoices bi
            LEFT JOIN profiles p ON bi.patient_id = p.id
        `;

        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters.patient_id) {
            conditions.push(`bi.patient_id = $${idx++}`);
            values.push(filters.patient_id);
        }

        if (filters.status) {
            conditions.push(`bi.payment_status = $${idx++}`);
            values.push(filters.status);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY bi.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getInvoiceById(id: string) {
        const query = `
            SELECT bi.*,
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name,
                   p.phone as patient_phone,
                   p.email as patient_email
            FROM billing_invoices bi
            LEFT JOIN profiles p ON bi.patient_id = p.id
            WHERE bi.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return null;

        const invoice = result.rows[0];

        // Get associated billing items
        const itemsResult = await pool.query(
            'SELECT * FROM billing_items WHERE invoice_id = $1 ORDER BY created_at',
            [id]
        );
        invoice.items = itemsResult.rows;

        return invoice;
    }

    static async createInvoice(data: {
        patient_id: string;
        appointment_id?: string;
        invoice_number: string;
        issue_date?: string;
        due_date?: string;
        subtotal?: number;
        tax_amount?: number;
        discount_amount?: number;
        total_amount: number;
        paid_amount?: number;
        payment_status?: string;
        notes?: string;
        terms?: string;
        created_by?: string;
        items?: Array<{
            service_type: string;
            description: string;
            item_code?: string;
            quantity?: number;
            unit_price: number;
            total_price: number;
            tax_rate?: number;
            tax_amount?: number;
            discount_percent?: number;
            discount_amount?: number;
        }>;
    }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create invoice
            const invoiceResult = await client.query(
                `INSERT INTO billing_invoices 
                (patient_id, appointment_id, invoice_number, issue_date, due_date, 
                 subtotal, tax_amount, discount_amount, total_amount, paid_amount, 
                 payment_status, notes, terms, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *`,
                [
                    data.patient_id,
                    data.appointment_id || null,
                    data.invoice_number,
                    data.issue_date || new Date().toISOString(),
                    data.due_date || null,
                    data.subtotal || 0,
                    data.tax_amount || 0,
                    data.discount_amount || 0,
                    data.total_amount,
                    data.paid_amount || 0,
                    data.payment_status || 'pending',
                    data.notes || null,
                    data.terms || null,
                    data.created_by || null
                ]
            );

            const invoice = invoiceResult.rows[0];

            // Create billing items if provided
            if (data.items && data.items.length > 0) {
                for (const item of data.items) {
                    await client.query(
                        `INSERT INTO billing_items 
                        (invoice_id, service_type, description, item_code, quantity, 
                         unit_price, total_price, tax_rate, tax_amount, discount_percent, discount_amount)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                        [
                            invoice.id,
                            item.service_type,
                            item.description,
                            item.item_code || null,
                            item.quantity || 1,
                            item.unit_price,
                            item.total_price,
                            item.tax_rate || 0,
                            item.tax_amount || 0,
                            item.discount_percent || 0,
                            item.discount_amount || 0
                        ]
                    );
                }
            }

            await client.query('COMMIT');
            return invoice;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async updateInvoice(id: string, data: Partial<{
        payment_status: string;
        paid_amount: number;
        notes: string;
        terms: string;
    }>) {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.payment_status !== undefined) { fields.push(`payment_status = $${idx++}`); values.push(data.payment_status); }
        if (data.paid_amount !== undefined) { fields.push(`paid_amount = $${idx++}`); values.push(data.paid_amount); }
        if (data.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(data.notes); }
        if (data.terms !== undefined) { fields.push(`terms = $${idx++}`); values.push(data.terms); }

        if (fields.length === 0) return null;

        fields.push(`updated_at = NOW()`);
        values.push(id);

        const query = `UPDATE billing_invoices SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async deleteInvoice(id: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Delete items first
            await client.query('DELETE FROM billing_items WHERE invoice_id = $1', [id]);

            // Delete invoice
            const result = await client.query('DELETE FROM billing_invoices WHERE id = $1 RETURNING *', [id]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}
