import pool from '../../db';
import { v4 as uuidv4 } from 'uuid';

export interface PurchaseOrderItem {
    medicine_id: string;
    quantity_ordered: number;
    unit_price: number;
    tax_percentage?: number;
    discount_percentage?: number;
}

export interface PurchaseOrder {
    supplier_id: string;
    expected_delivery_date?: string;
    items: PurchaseOrderItem[];
    notes?: string;
    created_by: string;
}

export const PurchaseOrderService = {
    async create(data: PurchaseOrder) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Generate PO Number (PO-YYYYMMDD-XXXX)
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const countRes = await client.query('SELECT COUNT(*) FROM pharmacy_purchase_orders WHERE po_date = CURRENT_DATE');
            const count = parseInt(countRes.rows[0].count) + 1;
            const poNumber = `PO-${dateStr}-${count.toString().padStart(4, '0')}`;

            // Calculate totals
            let totalAmount = 0;
            let totalTax = 0;

            const processedItems = data.items.map(item => {
                const subtotal = item.quantity_ordered * item.unit_price;
                const discount = subtotal * ((item.discount_percentage || 0) / 100);
                const tax = (subtotal - discount) * ((item.tax_percentage || 0) / 100);
                const total = subtotal - discount + tax;

                totalAmount += subtotal - discount;
                totalTax += tax;

                return { ...item, total_amount: total };
            });

            const netAmount = totalAmount + totalTax;

            // Insert PO
            const poRes = await client.query(
                `INSERT INTO pharmacy_purchase_orders 
                (po_number, supplier_id, expected_delivery_date, total_amount, tax_amount, net_amount, notes, created_by, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
                RETURNING *`,
                [poNumber, data.supplier_id, data.expected_delivery_date, totalAmount, totalTax, netAmount, data.notes, data.created_by]
            );
            const poId = poRes.rows[0].po_id;

            // Insert Items
            for (const item of processedItems) {
                await client.query(
                    `INSERT INTO pharmacy_po_items 
                    (po_id, medicine_id, quantity_ordered, unit_price, tax_percentage, discount_percentage, total_amount)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        poId, item.medicine_id, item.quantity_ordered, item.unit_price,
                        item.tax_percentage || 0, item.discount_percentage || 0, item.total_amount
                    ]
                );
            }

            await client.query('COMMIT');
            return poRes.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async list(filters: { status?: string; search?: string; limit?: number; offset?: number }) {
        let query = `
            SELECT po.*, s.supplier_name, p.first_name as created_by_name
            FROM pharmacy_purchase_orders po
            LEFT JOIN pharmacy_suppliers s ON po.supplier_id = s.supplier_id
            LEFT JOIN profiles p ON po.created_by = p.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.status) {
            query += ` AND po.status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        if (filters.search) {
            query += ` AND (po.po_number ILIKE $${paramIndex} OR s.supplier_name ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        query += ` ORDER BY po.po_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(filters.limit || 50);
        params.push(filters.offset || 0);

        const result = await pool.query(query, params);
        return result.rows;
    },

    async getById(id: string) {
        const poQuery = `
            SELECT po.*, s.supplier_name, s.email as supplier_email, s.address as supplier_address,
                   p.first_name as created_by_name
            FROM pharmacy_purchase_orders po
            LEFT JOIN pharmacy_suppliers s ON po.supplier_id = s.supplier_id
            LEFT JOIN profiles p ON po.created_by = p.id
            WHERE po.po_id = $1
        `;
        const itemsQuery = `
            SELECT poi.*, m.medicine_name, m.brand_name
            FROM pharmacy_po_items poi
            LEFT JOIN pharmacy_medicines m ON poi.medicine_id = m.medicine_id
            WHERE poi.po_id = $1
        `;

        const poResult = await pool.query(poQuery, [id]);
        if (poResult.rows.length === 0) return null;

        const itemsResult = await pool.query(itemsQuery, [id]);
        return { ...poResult.rows[0], items: itemsResult.rows };
    },

    async updateStatus(id: string, status: string, approvedBy?: string) {
        let query = `UPDATE pharmacy_purchase_orders SET status = $1, updated_at = NOW()`;
        const params: any[] = [status];

        if (status === 'approved' && approvedBy) {
            query += `, approved_by = $2`;
            params.push(approvedBy);
            params.push(id);
            query += ` WHERE po_id = $3 RETURNING *`;
        } else {
            params.push(id);
            query += ` WHERE po_id = $2 RETURNING *`;
        }

        const result = await pool.query(query, params);
        return result.rows[0];
    }
};
