import pool from '../../db';

export interface BillItem {
    medicine_id: string;
    batch_number: string; // Ideally we pick batch automatically (FEFO), but for now let's accept it
    quantity: number;
    unit_price: number;
    discount_percentage?: number;
    tax_percentage?: number;
}

export interface BillData {
    patient_id?: string;
    customer_name?: string;
    customer_phone?: string;
    bill_type: string;
    items: BillItem[];
    payment_mode: string;
    payment_status: string;
    subtotal: number;
    discount_amount?: number;
    tax_amount?: number;
    net_amount: number;
}

export const BillingService = {
    async createBill(data: BillData, cashierId: string) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 0. Ensure Active Shift
            const shiftRes = await client.query(
                "SELECT shift_id FROM pharmacy_shifts WHERE user_id = $1 AND status = 'open'",
                [cashierId]
            );

            if (shiftRes.rows.length === 0) {
                throw new Error('No open shift found. Please open a shift before billing.');
            }
            const shiftId = shiftRes.rows[0].shift_id;

            // 1. Generate Bill Number
            const dateStr = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7); // YYMM
            // Simple sequence logic or random for now
            const countRes = await client.query('SELECT COUNT(*) FROM pharmacy_sales');
            const nextNum = parseInt(countRes.rows[0].count) + 1;
            const billNumber = `INV-${dateStr}-${nextNum.toString().padStart(4, '0')}`;

            // 2. Insert Bill
            const billRes = await client.query(
                `INSERT INTO pharmacy_sales (
                    bill_number, patient_id, customer_name, customer_phone, bill_type,
                    subtotal, discount_amount, tax_amount, net_amount, payment_mode,
                    payment_status, cashier_id, shift_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *`,
                [
                    billNumber, data.patient_id || null, data.customer_name, data.customer_phone,
                    data.bill_type, data.subtotal, data.discount_amount || 0, data.tax_amount || 0,
                    data.net_amount, data.payment_mode, data.payment_status, cashierId, shiftId
                ]
            );
            const billId = billRes.rows[0].bill_id;

            // 3. Process Items & Update Stock
            for (const item of data.items) {
                // Find stock id for batch
                const stockRes = await client.query(
                    `SELECT stock_id, quantity_available FROM pharmacy_inventory 
                     WHERE medicine_id = $1 AND batch_number = $2`,
                    [item.medicine_id, item.batch_number]
                );

                if (stockRes.rows.length === 0) {
                    throw new Error(`Stock not found for medicine ${item.medicine_id} batch ${item.batch_number}`);
                }
                const stockId = stockRes.rows[0].stock_id;
                const available = stockRes.rows[0].quantity_available;

                if (available < item.quantity) {
                    throw new Error(`Insufficient stock for medicine ${item.medicine_id}. Available: ${available}`);
                }

                // Deduct stock
                await client.query(
                    `UPDATE pharmacy_inventory SET quantity_available = quantity_available - $1 
                     WHERE stock_id = $2`,
                    [item.quantity, stockId]
                );

                // Add Bill Item
                const total = (item.quantity * item.unit_price) * (1 - (item.discount_percentage || 0) / 100); // simplified

                await client.query(
                    `INSERT INTO pharmacy_sale_items (
                        bill_id, medicine_id, stock_id, batch_number, quantity,
                        unit_price, discount_percentage, tax_percentage, total_amount
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        billId, item.medicine_id, stockId, item.batch_number, item.quantity,
                        item.unit_price, item.discount_percentage || 0, item.tax_percentage || 0, total
                    ]
                );
            }

            await client.query('COMMIT');
            return billRes.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async getBill(id: string) {
        // Try searching by bill_id (UUID) first if it looks like a UUID, otherwise by bill_number
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let billRes;
        if (isUuid) {
            billRes = await pool.query('SELECT * FROM pharmacy_sales WHERE bill_id = $1', [id]);
        } else {
            billRes = await pool.query('SELECT * FROM pharmacy_sales WHERE bill_number = $1', [id]);
        }

        if (billRes.rows.length === 0) {
            // If not found by UUID, try by bill_number just in case it was a valid-looking UUID that is actually a bill number
            if (isUuid) {
                billRes = await pool.query('SELECT * FROM pharmacy_sales WHERE bill_number = $1', [id]);
            }
            if (billRes.rows.length === 0) return null;
        }

        const billId = billRes.rows[0].bill_id;

        const itemsRes = await pool.query(
            `SELECT si.*, m.medicine_name 
             FROM pharmacy_sale_items si
             JOIN pharmacy_medicines m ON si.medicine_id = m.medicine_id
             WHERE si.bill_id = $1`,
            [billId]
        );

        return { ...billRes.rows[0], items: itemsRes.rows };
    },

    async listBills(filters: { bill_number?: string, start_date?: string, end_date?: string, limit?: number, offset?: number } = {}) {
        let query = `
            SELECT s.*, (prof_p.first_name || ' ' || prof_p.last_name) as patient_name, (prof_u.first_name || ' ' || prof_u.last_name) as cashier_name
            FROM pharmacy_sales s
            LEFT JOIN profiles prof_p ON s.patient_id = prof_p.id
            LEFT JOIN profiles prof_u ON s.cashier_id = prof_u.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let pIdx = 1;

        if (filters.bill_number) {
            query += ` AND s.bill_number ILIKE $${pIdx++}`;
            params.push(`%${filters.bill_number}%`);
        }

        if (filters.start_date) {
            query += ` AND s.created_at >= $${pIdx++}`;
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ` AND s.created_at <= $${pIdx++}`;
            params.push(filters.end_date);
        }

        query += ` ORDER BY s.created_at DESC LIMIT $${pIdx++}`;
        params.push(filters.limit || 50);

        if (filters.offset) {
            query += ` OFFSET $${pIdx++}`;
            params.push(filters.offset);
        }

        const result = await pool.query(query, params);
        return result.rows;
    },

    async processReturn(
        originalBillId: string,
        returnItems: { medicine_id: string; batch_number: string; quantity: number; unit_price: number }[],
        reason: string,
        refundMode: string,
        userId: string
    ) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Calculate Return Amount
            const returnAmount = returnItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

            // 2. Generate Return Number
            const dateStr = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);
            const countRes = await client.query('SELECT COUNT(*) FROM pharmacy_returns');
            const nextNum = parseInt(countRes.rows[0].count) + 1;
            const returnNumber = `RET-${dateStr}-${nextNum.toString().padStart(4, '0')}`;

            // 3. Insert Return Record
            const returnRes = await client.query(
                `INSERT INTO pharmacy_returns (
                    return_number, original_bill_id, return_amount, refund_mode, reason, processed_by
                ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [returnNumber, originalBillId, returnAmount, refundMode, reason, userId]
            );
            const returnId = returnRes.rows[0].return_id;

            // 4. Process Each Returned Item
            for (const item of returnItems) {
                // Find stock ID for this batch
                const stockRes = await client.query(
                    `SELECT stock_id FROM pharmacy_inventory 
                     WHERE medicine_id = $1 AND batch_number = $2`,
                    [item.medicine_id, item.batch_number]
                );

                if (stockRes.rows.length === 0) {
                    throw new Error(`Stock record not found for returning batch ${item.batch_number}`);
                }
                const stockId = stockRes.rows[0].stock_id;

                // Restock Inventory
                await client.query(
                    `UPDATE pharmacy_inventory SET quantity_available = quantity_available + $1
                     WHERE stock_id = $2`,
                    [item.quantity, stockId]
                );

                // Log Adjustment
                await client.query(
                    `INSERT INTO pharmacy_stock_adjustments (
                        stock_id, adjustment_type, quantity_adjusted, reason, adjusted_by
                    ) VALUES ($1, 'Customer Return', $2, $3, $4)`,
                    [stockId, item.quantity, `Return Ref: ${returnNumber}`, userId]
                );
            }

            // 5. Mark Bill as Refunded/Partial (Optional Logic)
            // For now, we just track the return separately.

            await client.query('COMMIT');
            return returnRes.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};
