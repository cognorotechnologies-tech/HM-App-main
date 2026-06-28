import pool from '../db';

export class PaymentService {
    static async getAllTransactions(filters: { invoice_id?: string; status?: string } = {}) {
        let query = `
            SELECT pt.*,
                   bi.invoice_number,
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name
            FROM payment_transactions pt
            LEFT JOIN billing_invoices bi ON pt.invoice_id = bi.id
            LEFT JOIN profiles p ON bi.patient_id = p.id
        `;

        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters.invoice_id) {
            conditions.push(`pt.invoice_id = $${idx++}`);
            values.push(filters.invoice_id);
        }

        if (filters.status) {
            conditions.push(`pt.status = $${idx++}`);
            values.push(filters.status);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY pt.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getTransactionById(id: string) {
        const query = `
            SELECT pt.*,
                   bi.invoice_number,
                   bi.total_amount as invoice_total,
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name
            FROM payment_transactions pt
            LEFT JOIN billing_invoices bi ON pt.invoice_id = bi.id
            LEFT JOIN profiles p ON bi.patient_id = p.id
            WHERE pt.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async createTransaction(data: {
        invoice_id: string;
        transaction_id: string;
        amount: number;
        payment_method: string;
        payment_gateway?: string;
        gateway_transaction_id?: string;
        gateway_response?: any;
        status?: string;
        processed_at?: string;
        notes?: string;
        processed_by?: string;
    }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO payment_transactions 
                (invoice_id, transaction_id, amount, payment_method, payment_gateway, 
                 gateway_transaction_id, gateway_response, status, processed_at, notes, processed_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *`,
                [
                    data.invoice_id,
                    data.transaction_id,
                    data.amount,
                    data.payment_method,
                    data.payment_gateway || null,
                    data.gateway_transaction_id || null,
                    data.gateway_response ? JSON.stringify(data.gateway_response) : null,
                    data.status || 'pending',
                    data.processed_at || null,
                    data.notes || null,
                    data.processed_by || null
                ]
            );

            const transaction = result.rows[0];

            // Update invoice paid_amount if transaction is successful
            if (data.status === 'success' || data.status === 'completed') {
                await client.query(
                    `UPDATE billing_invoices 
                    SET paid_amount = paid_amount + $1,
                        payment_status = CASE 
                            WHEN paid_amount + $1 >= total_amount THEN 'paid'
                            WHEN paid_amount + $1 > 0 THEN 'partial'
                            ELSE payment_status
                        END
                    WHERE id = $2`,
                    [data.amount, data.invoice_id]
                );
            }

            await client.query('COMMIT');
            return transaction;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async updateTransactionStatus(id: string, status: string, gatewayResponse?: any) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get transaction details
            const txResult = await client.query('SELECT * FROM payment_transactions WHERE id = $1', [id]);
            if (txResult.rows.length === 0) throw new Error('Transaction not found');

            const transaction = txResult.rows[0];

            // Update transaction
            const updateResult = await client.query(
                `UPDATE payment_transactions 
                SET status = $1, 
                    gateway_response = $2,
                    processed_at = CASE WHEN $1 IN ('success', 'completed') THEN NOW() ELSE processed_at END
                WHERE id = $3
                RETURNING *`,
                [status, gatewayResponse ? JSON.stringify(gatewayResponse) : transaction.gateway_response, id]
            );

            // Update invoice if status changed to success
            if ((status === 'success' || status === 'completed') && transaction.status !== 'success' && transaction.status !== 'completed') {
                await client.query(
                    `UPDATE billing_invoices 
                    SET paid_amount = paid_amount + $1,
                        payment_status = CASE 
                            WHEN paid_amount + $1 >= total_amount THEN 'paid'
                            WHEN paid_amount + $1 > 0 THEN 'partial'
                            ELSE payment_status
                        END
                    WHERE id = $2`,
                    [transaction.amount, transaction.invoice_id]
                );
            }

            await client.query('COMMIT');
            return updateResult.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async refundTransaction(id: string, refundedBy?: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get transaction
            const txResult = await client.query('SELECT * FROM payment_transactions WHERE id = $1', [id]);
            if (txResult.rows.length === 0) throw new Error('Transaction not found');

            const transaction = txResult.rows[0];

            // Update transaction
            const updateResult = await client.query(
                `UPDATE payment_transactions 
                SET status = 'refunded', refunded_at = NOW()
                WHERE id = $1
                RETURNING *`,
                [id]
            );

            // Update invoice
            await client.query(
                `UPDATE billing_invoices 
                SET paid_amount = GREATEST(0, paid_amount - $1),
                    payment_status = CASE 
                        WHEN paid_amount - $1 <= 0 THEN 'pending'
                        WHEN paid_amount - $1 < total_amount THEN 'partial'
                        ELSE payment_status
                    END
                WHERE id = $2`,
                [transaction.amount, transaction.invoice_id]
            );

            await client.query('COMMIT');
            return updateResult.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}
