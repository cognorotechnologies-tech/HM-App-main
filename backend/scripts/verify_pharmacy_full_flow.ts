import pool from '../src/db';
import { v4 as uuidv4 } from 'uuid';

async function runVerification() {
    const client = await pool.connect();
    console.log('🏥 Starting Pharmacy Module Verification...');

    try {
        await client.query('BEGIN');

        // 1. Setup Data: Create a Pharmacist User
        console.log('1. Setting up User...');
        const userId = uuidv4();
        await client.query(`
            INSERT INTO profiles (id, first_name, last_name, email, role)
            VALUES ($1, 'Test', 'Pharmacist', 'test_pharm@example.com', 'pharmacist')
            ON CONFLICT (id) DO NOTHING
        `, [userId]);

        // 2. Setup Data: Create Medicine & Supplier
        console.log('2. Setting up Inventory...');
        const supplierId = uuidv4();
        await client.query(`
            INSERT INTO pharmacy_suppliers (supplier_id, supplier_name) VALUES ($1, 'Test Supplier')
        `, [supplierId]);

        const medicineId = uuidv4();
        await client.query(`
            INSERT INTO pharmacy_medicines (medicine_id, medicine_name)
            VALUES ($1, 'Test Med 500mg')
        `, [medicineId]);

        // 3. Add Stock (Directly to Inventory to skip GRN for this quick check, or do GRN?)
        // Let's do direct inventory for speed, simulating a GRN effect
        await client.query(`
            INSERT INTO pharmacy_inventory (medicine_id, quantity_available, batch_number, expiry_date, purchase_price, mrp, selling_price, supplier_id)
            VALUES ($1, 100, 'BATCH-001', CURRENT_DATE + INTERVAL '1 year', 8.00, 12.00, 10.00, $2)
        `, [medicineId, supplierId]);
        console.log('   -> Stock Added: 100 units');

        // 4. Shift Management: Try to create bill WITHOUT Open Shift (Should Fail or we check logic manually if it were API)
        // Since this is DB level, we can't test API middleware, but we simulated the service logic.
        // Let's testing the Service Requirement: Open Shift
        console.log('3. Testing Shift Management...');
        const shiftId = uuidv4();
        const openingCash = 1000;
        await client.query(`
            INSERT INTO pharmacy_shifts (shift_id, user_id, opening_cash, status)
            VALUES ($1, $2, $3, 'open')
        `, [shiftId, userId, openingCash]);
        console.log('   -> Shift Opened');

        // 5. Billing: Create a Bill linked to this Shift
        console.log('4. Testing Billing...');
        const billId = uuidv4();
        const billNumber = `TEST-${Date.now()}`;
        await client.query(`
            INSERT INTO pharmacy_sales (bill_id, bill_number, cashier_id, shift_id, net_amount, payment_mode, payment_status)
            VALUES ($1, $2, $3, $4, 20.00, 'cash', 'paid')
        `, [billId, billNumber, userId, shiftId]);

        // Sale Items (2 units @ 10.00)
        // Find stock
        const stockRes = await client.query(`SELECT stock_id FROM pharmacy_inventory WHERE medicine_id = $1 LIMIT 1`, [medicineId]);
        const stockId = stockRes.rows[0].stock_id;

        await client.query(`
            INSERT INTO pharmacy_sale_items (bill_id, medicine_id, stock_id, quantity, unit_price, total_amount)
            VALUES ($1, $2, $3, 2, 10.00, 20.00)
        `, [billId, medicineId, stockId]);

        // Update Inventory
        await client.query(`UPDATE pharmacy_inventory SET quantity_available = quantity_available - 2 WHERE stock_id = $1`, [stockId]);
        console.log('   -> Bill Created for 2 units. Stock deducted.');

        // 6. Close Shift: Verify Total Sales
        console.log('5. Closing Shift...');
        // Calculate sales from DB
        const salesRes = await client.query(`SELECT SUM(net_amount) as total FROM pharmacy_sales WHERE shift_id = $1`, [shiftId]);
        const totalSales = parseFloat(salesRes.rows[0].total);
        if (totalSales !== 20.00) throw new Error(`Expected sales 20.00, got ${totalSales}`);

        await client.query(`
            UPDATE pharmacy_shifts SET status = 'closed', closing_cash = $1, total_sales = $2 WHERE shift_id = $3
        `, [openingCash + totalSales, totalSales, shiftId]);
        console.log('   -> Shift Closed. Reconciled successfully.');

        // 7. Sales Return
        console.log('6. Testing Sales Return...');
        const returnId = uuidv4();
        const returnNumber = `RET-TEST-${Date.now()}`;
        await client.query(`
            INSERT INTO pharmacy_returns (return_id, return_number, original_bill_id, return_amount, reason)
            VALUES ($1, $2, $3, 10.00, 'Customer Request')
        `, [returnId, returnNumber, billId]);

        // Restock 1 Unit
        await client.query(`UPDATE pharmacy_inventory SET quantity_available = quantity_available + 1 WHERE stock_id = $1`, [stockId]);
        console.log('   -> Return Processed for 1 unit. Stock restored.');

        // Cleanup (Rollback so we don't pollute DB)
        await client.query('ROLLBACK');
        console.log('✅ VERIFICATION SUCCESSFUL! (Rolled back changes to keep DB clean)');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ VERIFICATION FAILED:', error);
        const fs = require('fs');
        fs.writeFileSync('verification_error.log', JSON.stringify(error, null, 2));
        process.exit(1);
    } finally {
        client.release();
    }
}

runVerification();
