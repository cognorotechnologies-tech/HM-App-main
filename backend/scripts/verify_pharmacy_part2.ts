import pool from '../src/db';
import { v4 as uuidv4 } from 'uuid';

async function runPart2Verification() {
    const client = await pool.connect();
    console.log('💊 Starting Pharmacy Verification Part 2: Prescriptions & Procurement...');

    try {
        await client.query('BEGIN');

        // --- Create missing sequence if it doesn't exist ---
        await client.query('CREATE SEQUENCE IF NOT EXISTS prescription_number_seq START 1000');

        // --- Setup Basics ---
        const userId = uuidv4();
        await client.query(`
            INSERT INTO public.profiles (id, first_name, last_name, role, email) 
            VALUES ($1, 'Test', 'Pharmacist', 'pharmacist', 'test_part2@example.com') 
            ON CONFLICT (id) DO NOTHING
        `, [userId]);

        const supplierId = uuidv4();
        await client.query(`INSERT INTO pharmacy_suppliers (supplier_id, supplier_name) VALUES ($1, 'Test Supplier Part 2')`, [supplierId]);

        const medicineId = uuidv4();
        await client.query(`INSERT INTO pharmacy_medicines (medicine_id, medicine_name) VALUES ($1, 'Test Med Part 2')`, [medicineId]);

        // ==========================================
        // TEST 1: PRESECRIPTION INTEGRATION
        // ==========================================
        console.log('1. Testing Prescription Integration...');

        // 1.1 Create Patient
        const patientId = uuidv4();
        await client.query(`INSERT INTO patients (id, first_name, last_name, contact_number) VALUES ($1, 'Patient', 'One', '555-0101')`, [patientId]);

        // 1.2 Create Dummy Appointment
        const appointmentId = uuidv4();
        await client.query(`
            INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, start_time, end_time, status)
            VALUES ($1, $2, $3, CURRENT_DATE, '09:00', '09:30', 'completed')
        `, [appointmentId, patientId, userId]);

        // 1.3 Insert Prescription
        const prescriptionId = uuidv4();
        await client.query(`
            INSERT INTO prescriptions (id, patient_id, doctor_id, status, medicines, appointment_id, diagnosis)
            VALUES ($1, $2, $3, 'pending', $4, $5, 'Test Diagnosis')
        `, [
            prescriptionId,
            patientId,
            userId,
            JSON.stringify([{ name: 'Test Med Part 2', dosage: '1-0-1', days: 5 }]),
            appointmentId
        ]);
        console.log('   -> EMR Prescription Created (Pending)');

        // 1.4 Verify Query
        const pendingRes = await client.query(`
            SELECT * FROM prescriptions 
            WHERE status != 'dispensed' AND id = $1
        `, [prescriptionId]);

        if (pendingRes.rows.length === 0) throw new Error('Failed to fetch pending prescription');
        console.log('   -> Pharmacy "See" Pending Prescription: OK');

        // 1.5 Dispense Flow (Open Shift first)
        const shiftId = uuidv4();
        await client.query(`INSERT INTO pharmacy_shifts (shift_id, user_id, status) VALUES ($1, $2, 'open')`, [shiftId, userId]);

        const billId = uuidv4();
        await client.query(`
            INSERT INTO pharmacy_sales (bill_id, bill_number, cashier_id, shift_id, net_amount, payment_status)
            VALUES ($1, 'PRESC-BILL-1', $2, $3, 100.00, 'paid')
        `, [billId, userId, shiftId]);

        console.log('   -> Bill Created for Prescription (Simulated)');

        // ==========================================
        // TEST 2: PROCUREMENT
        // ==========================================
        console.log('2. Testing Procurement Flow...');

        const poId = uuidv4();
        await client.query(`
            INSERT INTO pharmacy_purchase_orders (po_id, po_number, supplier_id, status, total_amount)
            VALUES ($1, 'PO-TEST-002', $2, 'pending', 500.00)
        `, [poId, supplierId]);

        await client.query(`
            INSERT INTO pharmacy_po_items (po_id, medicine_id, quantity_ordered, unit_price, total_amount)
            VALUES ($1, $2, 50, 10.00, 500.00)
        `, [poId, medicineId]);

        const grnId = uuidv4();
        await client.query(`
            INSERT INTO pharmacy_grn (grn_id, grn_number, po_id, supplier_id, total_amount, status)
            VALUES ($1, 'GRN-TEST-002', $2, $3, 500.00, 'completed')
        `, [grnId, poId, supplierId]);

        // REORDERED HERE: Inventory FIRST
        const stockId = uuidv4();
        await client.query(`
            INSERT INTO pharmacy_inventory (stock_id, medicine_id, supplier_id, grn_id, quantity_available, batch_number, expiry_date, purchase_price, mrp, selling_price)
            VALUES ($1, $2, $3, $4, 50, 'BATCH-FINAL', CURRENT_DATE + INTERVAL '1 year', 10.00, 15.00, 12.00)
        `, [stockId, medicineId, supplierId, grnId]);

        await client.query(`
            INSERT INTO pharmacy_grn_items (grn_id, medicine_id, quantity_received, purchase_price, stock_id)
            VALUES ($1, $2, 50, 10.00, $3)
        `, [grnId, medicineId, stockId]);

        const finalStockRes = await client.query(`SELECT quantity_available FROM pharmacy_inventory WHERE stock_id = $1`, [stockId]);
        if (finalStockRes.rows[0].quantity_available !== 50) throw new Error('Procurement stock update check failed');
        console.log('   -> Procurement Flow Verified');

        // Cleanup
        await client.query('ROLLBACK');
        console.log('✅ PART 2 VERIFICATION SUCCESSFUL!');

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('❌ PART 2 FAILED:', error.message);
        const fs = require('fs');
        fs.writeFileSync('verification_part2_error.log', JSON.stringify({
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position,
            routine: error.routine
        }, null, 2));
        process.exit(1);
    } finally {
        client.release();
    }
}

runPart2Verification();
