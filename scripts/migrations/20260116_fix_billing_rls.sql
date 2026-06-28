-- Migration: Fix RLS policies for billing tables
-- Created: 2026-01-16
-- Description: Allow patients to create their own invoices and billing items during appointment booking

-- 1. Update billing_invoices policies
DROP POLICY IF EXISTS "Staff can insert invoices" ON billing_invoices;

CREATE POLICY "Users can create invoices"
    ON billing_invoices FOR INSERT
    WITH CHECK (
        -- Patients can create their own invoices
        patient_id = auth.uid()
        OR
        -- Staff can create invoices for anyone
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'receptionist')
        )
    );

-- 2. Update billing_items policies
-- Note: "Staff can manage billing items" handles staff access, we need to add patient insert access

CREATE POLICY "Patients can insert own billing items"
    ON billing_items FOR INSERT
    WITH CHECK (
        -- Can insert item if the invoice belongs to them
        invoice_id IN (
            SELECT id FROM billing_invoices 
            WHERE patient_id = auth.uid()
        )
    );

-- 3. Verify payment_transactions policies (just in case)
-- Existing policy might be restrictive, let's ensure patients can create transactions

DROP POLICY IF EXISTS "Users can create payment transactions" ON payment_transactions;

CREATE POLICY "Users can create payment transactions"
    ON payment_transactions FOR INSERT
    WITH CHECK (
        -- Can create transaction if the invoice belongs to them
        invoice_id IN (
            SELECT id FROM billing_invoices 
            WHERE patient_id = auth.uid()
        )
        OR
        -- Staff can create transactions
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'receptionist')
        )
    );
