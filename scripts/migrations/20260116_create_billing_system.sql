-- Phase 2A: Billing System Database Schema
-- Migration: 20260116_create_billing_system.sql

-- ============================================
-- 1. BILLING INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Invoice Details
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Financial
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Status
    payment_status VARCHAR NOT NULL CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled', 'refunded')) DEFAULT 'pending',
    
    -- Additional Info
    notes TEXT,
    terms TEXT,
    
    -- Audit
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_invoices_patient ON billing_invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON billing_invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_date ON billing_invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_number ON billing_invoices(invoice_number);

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INT;
    year_month VARCHAR;
BEGIN
    year_month := TO_CHAR(NEW.issue_date, 'YYMM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INT)), 0) + 1
    INTO next_number
    FROM billing_invoices
    WHERE invoice_number LIKE 'INV-' || year_month || '%';
    
    NEW.invoice_number := 'INV-' || year_month || '-' || LPAD(next_number::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_number ON billing_invoices;
CREATE TRIGGER set_invoice_number
    BEFORE INSERT ON billing_invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION generate_invoice_number();

-- ============================================
-- 2. BILLING ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
    
    -- Item Details
    service_type VARCHAR NOT NULL CHECK (service_type IN ('consultation', 'lab', 'pharmacy', 'procedure', 'other')),
    description TEXT NOT NULL,
    item_code VARCHAR, -- For linking to service catalog
    
    -- Pricing
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_items_invoice ON billing_items(invoice_id);

-- Auto-calculate item totals
CREATE OR REPLACE FUNCTION calculate_billing_item_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_price := (NEW.quantity * NEW.unit_price);
    NEW.discount_amount := NEW.total_price * (NEW.discount_percent / 100);
    NEW.total_price := NEW.total_price - NEW.discount_amount;
    NEW.tax_amount := NEW.total_price * (NEW.tax_rate / 100);
    NEW.total_price := NEW.total_price + NEW.tax_amount;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_item_total ON billing_items;
CREATE TRIGGER calculate_item_total
    BEFORE INSERT OR UPDATE ON billing_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_billing_item_total();

-- Update invoice total when items change
CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE billing_invoices
    SET 
        subtotal = (
            SELECT COALESCE(SUM(quantity * unit_price - discount_amount), 0)
            FROM billing_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        tax_amount = (
            SELECT COALESCE(SUM(tax_amount), 0)
            FROM billing_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        total_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM billing_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_on_item_change ON billing_items;
CREATE TRIGGER update_invoice_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON billing_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_total();

-- ============================================
-- 3. PAYMENT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_id VARCHAR UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    
    -- Payment Method
    payment_method VARCHAR NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'online', 'cheque', 'bank_transfer')),
    payment_gateway VARCHAR CHECK (payment_gateway IN ('stripe', 'razorpay', 'manual', NULL)),
    
    -- Gateway Response
    gateway_transaction_id VARCHAR,
    gateway_response JSONB,
    
    -- Status
    status VARCHAR NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
    
    -- Timestamps
    processed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    -- Additional Info
    notes TEXT,
    processed_by UUID REFERENCES profiles(id),
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_id ON payment_transactions(gateway_transaction_id);

-- Update invoice paid amount and status when payment succeeds
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    invoice_total DECIMAL(10,2);
    total_paid DECIMAL(10,2);
BEGIN
    IF NEW.status = 'success' AND (OLD.status IS NULL OR OLD.status != 'success') THEN
        -- Get invoice total
        SELECT total_amount INTO invoice_total
        FROM billing_invoices
        WHERE id = NEW.invoice_id;
        
        -- Calculate total paid
        SELECT COALESCE(SUM(amount), 0) INTO total_paid
        FROM payment_transactions
        WHERE invoice_id = NEW.invoice_id AND status = 'success';
        
        -- Update invoice
        UPDATE billing_invoices
        SET 
            paid_amount = total_paid,
            payment_status = CASE
                WHEN total_paid >= invoice_total THEN 'paid'
                WHEN total_paid > 0 THEN 'partial'
                ELSE 'pending'
            END,
            updated_at = NOW()
        WHERE id = NEW.invoice_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_on_payment ON payment_transactions;
CREATE TRIGGER update_invoice_on_payment
    AFTER INSERT OR UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payment_status();

-- ============================================
-- 4. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Invoices: Patients can view their own, staff can view/manage all
DROP POLICY IF EXISTS "Patients can view own invoices" ON billing_invoices;
CREATE POLICY "Patients can view own invoices"
    ON billing_invoices FOR SELECT
    USING (
        patient_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'doctor', 'receptionist')
        )
    );

DROP POLICY IF EXISTS "Staff can insert invoices" ON billing_invoices;
CREATE POLICY "Staff can insert invoices"
    ON billing_invoices FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'receptionist')
        )
    );

DROP POLICY IF EXISTS "Staff can update invoices" ON billing_invoices;
CREATE POLICY "Staff can update invoices"
    ON billing_invoices FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'receptionist')
        )
    );

-- Billing Items: Same as invoices
DROP POLICY IF EXISTS "Users can view billing items" ON billing_items;
CREATE POLICY "Users can view billing items"
    ON billing_items FOR SELECT
    USING (
        invoice_id IN (
            SELECT id FROM billing_invoices
            WHERE patient_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid()
                AND role IN ('admin', 'doctor', 'receptionist')
            )
        )
    );

DROP POLICY IF EXISTS "Staff can manage billing items" ON billing_items;
CREATE POLICY "Staff can manage billing items"
    ON billing_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'receptionist')
        )
    );

-- Payment Transactions: Similar access pattern
DROP POLICY IF EXISTS "Users can view payment transactions" ON payment_transactions;
CREATE POLICY "Users can view payment transactions"
    ON payment_transactions FOR SELECT
    USING (
        invoice_id IN (
            SELECT id FROM billing_invoices
            WHERE patient_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid()
                AND role IN ('admin', 'receptionist')
            )
        )
    );

DROP POLICY IF EXISTS "Users can create payment transactions" ON payment_transactions;
CREATE POLICY "Users can create payment transactions"
    ON payment_transactions FOR INSERT
    WITH CHECK (
        invoice_id IN (
            SELECT id FROM billing_invoices
            WHERE patient_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'receptionist')
        )
    );

DROP POLICY IF EXISTS "Staff can manage payments" ON payment_transactions;
CREATE POLICY "Staff can manage payments"
    ON payment_transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'receptionist')
        )
    );

-- ============================================
-- 5. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON billing_invoices;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON billing_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE billing_invoices IS 'Stores billing invoices for consultations and services';
COMMENT ON TABLE billing_items IS 'Line items for invoices';
COMMENT ON TABLE payment_transactions IS 'Payment transaction records';
