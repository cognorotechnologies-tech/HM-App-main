import pool from '../../db';

export interface GRNItem {
    medicine_id: string;
    batch_number: string;
    expiry_date: string;
    quantity_received: number;
    free_quantity?: number;
    purchase_price: number;
    mrp: number;
    selling_price: number;
    tax_percentage?: number;
}

export interface GRNData {
    po_id: string;
    supplier_id: string;
    invoice_number: string;
    invoice_date: string;
    received_date: string;
    items: GRNItem[];
    received_by: string;
}

export const GRNService = {
    async create(data: GRNData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Generate GRN Number
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const countRes = await client.query('SELECT COUNT(*) FROM pharmacy_grn WHERE received_date = CURRENT_DATE');
            const count = parseInt(countRes.rows[0].count) + 1;
            const grnNumber = `GRN-${dateStr}-${count.toString().padStart(4, '0')}`;

            // Calculate Total
            const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity_received * item.purchase_price), 0);

            // 2. Create GRN Record
            const grnRes = await client.query(
                `INSERT INTO pharmacy_grn 
                (grn_number, po_id, supplier_id, invoice_number, invoice_date, received_date, total_amount, received_by, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')
                RETURNING *`,
                [grnNumber, data.po_id, data.supplier_id, data.invoice_number, data.invoice_date, data.received_date, totalAmount, data.received_by]
            );
            const grnId = grnRes.rows[0].grn_id;

            // 3. Process Items & Create Stock
            for (const item of data.items) {
                // A. Create Inventory (Stock) Entry
                const stockRes = await client.query(
                    `INSERT INTO pharmacy_inventory 
                    (medicine_id, batch_number, expiry_date, purchase_price, mrp, selling_price, 
                     quantity_available, quantity_reserved, supplier_id, grn_id, received_date, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9, $10, 'active')
                    RETURNING stock_id`,
                    [
                        item.medicine_id, item.batch_number, item.expiry_date, item.purchase_price,
                        item.mrp, item.selling_price, item.quantity_received + (item.free_quantity || 0),
                        data.supplier_id, grnId, data.received_date
                    ]
                );
                const stockId = stockRes.rows[0].stock_id;

                // B. Create GRN Item Entry
                await client.query(
                    `INSERT INTO pharmacy_grn_items 
                    (grn_id, medicine_id, batch_number, expiry_date, quantity_received, free_quantity, 
                     purchase_price, mrp, selling_price, tax_percentage, stock_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [
                        grnId, item.medicine_id, item.batch_number, item.expiry_date,
                        item.quantity_received, item.free_quantity || 0,
                        item.purchase_price, item.mrp, item.selling_price,
                        item.tax_percentage || 0, stockId
                    ]
                );
            }

            // 4. Update PO Status to Completed (Assuming full delivery for now)
            await client.query('UPDATE pharmacy_purchase_orders SET status = $1 WHERE po_id = $2', ['completed', data.po_id]);

            await client.query('COMMIT');
            return grnRes.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};
