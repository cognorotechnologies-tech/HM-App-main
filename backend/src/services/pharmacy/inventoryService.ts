import pool from '../../db';

export interface Stock {
    stock_id?: string;
    medicine_id: string;
    batch_number: string;
    expiry_date: Date;
    purchase_price: number;
    mrp: number;
    selling_price: number;
    quantity_available: number;
    rack_location?: string;
    supplier_id?: string;
}

export const InventoryService = {
    async addStock(stock: Stock) {
        const {
            medicine_id, batch_number, expiry_date, purchase_price, mrp, selling_price,
            quantity_available, rack_location, supplier_id
        } = stock;

        const result = await pool.query(
            `INSERT INTO pharmacy_inventory (
                medicine_id, batch_number, expiry_date, purchase_price, mrp, selling_price,
                quantity_available, rack_location, supplier_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                medicine_id, batch_number, expiry_date, purchase_price, mrp, selling_price,
                quantity_available, rack_location, supplier_id
            ]
        );
        return result.rows[0];
    },

    async getStockList(medicineId?: string) {
        let query = `
            SELECT i.*, m.medicine_name, m.generic_name
            FROM pharmacy_inventory i
            JOIN pharmacy_medicines m ON i.medicine_id = m.medicine_id
            WHERE i.quantity_available > 0
        `;
        const params: any[] = [];

        if (medicineId) {
            query += ` AND i.medicine_id = $1`;
            params.push(medicineId);
        }

        query += ` ORDER BY i.expiry_date ASC`; // FEFO

        const result = await pool.query(query, params);
        return result.rows;
    },

    async getExpiringStock(days: number = 30) {
        const result = await pool.query(
            `SELECT i.*, m.medicine_name 
             FROM pharmacy_inventory i 
             JOIN pharmacy_medicines m ON i.medicine_id = m.medicine_id
             WHERE i.expiry_date <= CURRENT_DATE + interval '${days} days'
             AND i.quantity_available > 0
             ORDER BY i.expiry_date ASC`
        );
        return result.rows;
    },

    async getLowStock() {
        // Based on medicine master reorder level
        const result = await pool.query(
            `SELECT m.medicine_name, m.minimum_stock_level, SUM(i.quantity_available) as current_stock
             FROM pharmacy_medicines m
             LEFT JOIN pharmacy_inventory i ON m.medicine_id = i.medicine_id
             GROUP BY m.medicine_id, m.medicine_name, m.minimum_stock_level
             HAVING SUM(COALESCE(i.quantity_available, 0)) <= m.minimum_stock_level`
        );
        return result.rows;
    }
};
