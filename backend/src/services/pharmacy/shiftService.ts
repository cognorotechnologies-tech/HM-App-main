import pool from '../../db';

export interface ShiftData {
    shift_id?: string;
    user_id: string;
    opening_cash: number;
    closing_cash?: number;
    status: 'open' | 'closed';
}

export const ShiftService = {
    async openShift(userId: string, openingCash: number) {
        // Check if user already has an open shift
        const existing = await pool.query(
            "SELECT * FROM pharmacy_shifts WHERE user_id = $1 AND status = 'open'",
            [userId]
        );

        if (existing.rows.length > 0) {
            throw new Error('You already have an open shift.');
        }

        const result = await pool.query(
            `INSERT INTO pharmacy_shifts (user_id, opening_cash, start_time, status)
             VALUES ($1, $2, NOW(), 'open')
             RETURNING *`,
            [userId, openingCash]
        );
        return result.rows[0];
    },

    async closeShift(userId: string, closingCash: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const shiftRes = await client.query(
                "SELECT * FROM pharmacy_shifts WHERE user_id = $1 AND status = 'open'",
                [userId]
            );

            if (shiftRes.rows.length === 0) {
                throw new Error('No open shift found to close.');
            }

            const shiftId = shiftRes.rows[0].shift_id;

            // Calculate total sales for this shift
            const salesRes = await client.query(
                "SELECT COALESCE(SUM(net_amount), 0) as total FROM pharmacy_sales WHERE shift_id = $1",
                [shiftId]
            );
            const totalSales = parseFloat(salesRes.rows[0].total);

            const result = await client.query(
                `UPDATE pharmacy_shifts 
                 SET closing_cash = $1, end_time = NOW(), status = 'closed', total_sales = $2
                 WHERE shift_id = $3
                 RETURNING *`,
                [closingCash, totalSales, shiftId]
            );

            await client.query('COMMIT');
            return result.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async getCurrentShift(userId: string) {
        const result = await pool.query(
            "SELECT * FROM pharmacy_shifts WHERE user_id = $1 AND status = 'open'",
            [userId]
        );
        return result.rows[0] || null;
    },

    async listShifts(limit: number = 50, offset: number = 0) {
        const result = await pool.query(
            `SELECT s.*, (p.first_name || ' ' || p.last_name) as user_name
             FROM pharmacy_shifts s
             LEFT JOIN profiles p ON s.user_id = p.id
             ORDER BY s.start_time DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }
};
