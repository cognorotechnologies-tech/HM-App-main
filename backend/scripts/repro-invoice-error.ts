
import { BillingService } from '../src/services/billingService';
import pool from '../src/db';

async function testInvoice() {
    try {
        console.log("Starting Invoice Test...");
        const invoice = await BillingService.createInvoice({
            patient_id: '6a5eca09-9ff5-4018-94e6-c8d61b045476', // User's patient ID
            // appointment_id: null, // Optional
            invoice_number: `INV-${Date.now()}`,
            due_date: new Date().toISOString(),
            total_amount: 500,
            subtotal: 500,
            notes: 'Test Invoice',
            terms: 'Payment due on receipt',
            items: [{
                item_code: 'CONSULTATION',
                service_type: 'consultation',
                description: 'Test Consultation Fee',
                quantity: 1,
                unit_price: 500,
                total_price: 500,
                tax_rate: 0,
                tax_amount: 0,
                discount_percent: 0,
                discount_amount: 0
            }]
        });
        console.log("✅ Invoice Created:", invoice);
    } catch (err) {
        console.error("❌ Invoice Creation Failed:", err);
    } finally {
        await pool.end();
    }
}

testInvoice();
