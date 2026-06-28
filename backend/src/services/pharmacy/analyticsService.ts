import pool from '../../db';

export const AnalyticsService = {
    async getDailySales(date: string) {
        // Returns total sales, cash vs card split for a valid date
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_bills,
                SUM(net_amount) as total_revenue,
                SUM(CASE WHEN payment_mode = 'Cash' THEN net_amount ELSE 0 END) as cash_sales,
                SUM(CASE WHEN payment_mode = 'Card' THEN net_amount ELSE 0 END) as card_sales,
                SUM(CASE WHEN payment_mode = 'UPI' THEN net_amount ELSE 0 END) as upi_sales
             FROM pharmacy_sales 
             WHERE DATE(bill_date) = $1`,
            [date]
        );
        return result.rows[0];
    },

    async getTopMedicines(limit: number = 5) {
        const result = await pool.query(
            `SELECT 
                m.medicine_name,
                SUM(si.quantity) as total_quantity_sold,
                SUM(si.total_amount) as total_revenue
             FROM pharmacy_sale_items si
             JOIN pharmacy_medicines m ON si.medicine_id = m.medicine_id
             GROUP BY m.medicine_name
             ORDER BY total_revenue DESC
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    },

    async getStockValuation() {
        const result = await pool.query(
            `SELECT 
                SUM(quantity_available * purchase_price) as total_purchase_value,
                SUM(quantity_available * mrp) as total_sales_value,
                COUNT(*) as total_batches
             FROM pharmacy_inventory
             WHERE quantity_available > 0`
        );
        return result.rows[0];
    }
};
