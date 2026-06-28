-- Pharmacy Management System Schema

-- 14. Drug Categories
CREATE TABLE IF NOT EXISTS pharmacy_drug_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES pharmacy_drug_categories(category_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Manufacturers
CREATE TABLE IF NOT EXISTS pharmacy_manufacturers (
    manufacturer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    contact_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Medicine Master
CREATE TABLE IF NOT EXISTS pharmacy_medicines (
    medicine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    brand_name VARCHAR(200),
    manufacturer_id UUID REFERENCES pharmacy_manufacturers(manufacturer_id),
    category_id UUID REFERENCES pharmacy_drug_categories(category_id),
    unit_of_measurement VARCHAR(50), -- tablet, ml, mg, strip
    hsn_code VARCHAR(50),
    schedule_type VARCHAR(50), -- H, H1, X, OTC
    minimum_stock_level INTEGER DEFAULT 10,
    maximum_stock_level INTEGER DEFAULT 1000,
    reorder_quantity INTEGER DEFAULT 50,
    rack_location VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medicine_name ON pharmacy_medicines(medicine_name);
CREATE INDEX IF NOT EXISTS idx_generic_name ON pharmacy_medicines(generic_name);

-- 3. Suppliers
CREATE TABLE IF NOT EXISTS pharmacy_suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone_number VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    gstin VARCHAR(50),
    drug_license_number VARCHAR(50),
    payment_terms VARCHAR(100),
    credit_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Purchase Orders
CREATE TABLE IF NOT EXISTS pharmacy_purchase_orders (
    po_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID REFERENCES pharmacy_suppliers(supplier_id),
    po_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, partial, completed, cancelled
    created_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_po_number ON pharmacy_purchase_orders(po_number);

-- 5. Purchase Order Items
CREATE TABLE IF NOT EXISTS pharmacy_po_items (
    po_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES pharmacy_purchase_orders(po_id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES pharmacy_medicines(medicine_id),
    quantity_ordered INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percentage DECIMAL(5, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL
);

-- 6. Goods Receipt Note (GRN)
CREATE TABLE IF NOT EXISTS pharmacy_grn (
    grn_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_number VARCHAR(50) NOT NULL UNIQUE,
    po_id UUID REFERENCES pharmacy_purchase_orders(po_id),
    supplier_id UUID REFERENCES pharmacy_suppliers(supplier_id),
    invoice_number VARCHAR(100),
    invoice_date DATE,
    received_date DATE DEFAULT CURRENT_DATE,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    received_by UUID REFERENCES profiles(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inventory/Stock
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    stock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID REFERENCES pharmacy_medicines(medicine_id),
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    quantity_available INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    supplier_id UUID REFERENCES pharmacy_suppliers(supplier_id),
    grn_id UUID REFERENCES pharmacy_grn(grn_id),
    received_date DATE DEFAULT CURRENT_DATE,
    rack_location VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active', -- active, expired, damaged, sold_out
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inventory_batch ON pharmacy_inventory(batch_number);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON pharmacy_inventory(expiry_date);

-- 7. GRN Items (Links GRN to inventory)
CREATE TABLE IF NOT EXISTS pharmacy_grn_items (
    grn_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_id UUID REFERENCES pharmacy_grn(grn_id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES pharmacy_medicines(medicine_id),
    batch_number VARCHAR(50),
    expiry_date DATE,
    quantity_received INTEGER NOT NULL,
    free_quantity INTEGER DEFAULT 0,
    purchase_price DECIMAL(10, 2),
    mrp DECIMAL(10, 2),
    selling_price DECIMAL(10, 2),
    tax_percentage DECIMAL(5, 2),
    stock_id UUID REFERENCES pharmacy_inventory(stock_id) -- Link to created stock
);

-- 16. Shifts (For pharmacy staff)
CREATE TABLE IF NOT EXISTS pharmacy_shifts (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_date DATE DEFAULT CURRENT_DATE,
    user_id UUID REFERENCES profiles(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    opening_cash DECIMAL(15, 2) DEFAULT 0,
    closing_cash DECIMAL(15, 2),
    total_sales DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'open', -- open, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Sales/Bills
CREATE TABLE IF NOT EXISTS pharmacy_sales (
    bill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    bill_date DATE DEFAULT CURRENT_DATE,
    bill_time TIME DEFAULT CURRENT_TIME,
    patient_id UUID REFERENCES patients(id), -- Nullable for walk-in
    customer_name VARCHAR(200),
    customer_phone VARCHAR(50),
    bill_type VARCHAR(50), -- prescription, OTC, inpatient
    subtotal DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    round_off DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) DEFAULT 0,
    payment_mode VARCHAR(50), -- cash, card, UPI, insurance
    payment_status VARCHAR(50) DEFAULT 'pending', -- paid, partial, pending
    cashier_id UUID REFERENCES profiles(id),
    shift_id UUID REFERENCES pharmacy_shifts(shift_id),
    is_return BOOLEAN DEFAULT false,
    return_reference_bill_id UUID REFERENCES pharmacy_sales(bill_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bill_number ON pharmacy_sales(bill_number);

-- 9. Sales Items
CREATE TABLE IF NOT EXISTS pharmacy_sale_items (
    sale_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES pharmacy_sales(bill_id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES pharmacy_medicines(medicine_id),
    stock_id UUID REFERENCES pharmacy_inventory(stock_id),
    batch_number VARCHAR(50),
    expiry_date DATE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    tax_percentage DECIMAL(5, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    cost_price DECIMAL(10, 2) -- Snapshot for profit calc
);

-- 12. Returns
CREATE TABLE IF NOT EXISTS pharmacy_returns (
    return_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_number VARCHAR(50) NOT NULL UNIQUE,
    original_bill_id UUID REFERENCES pharmacy_sales(bill_id),
    return_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    return_amount DECIMAL(15, 2) NOT NULL,
    refund_mode VARCHAR(50),
    reason TEXT,
    processed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Stock Adjustments
CREATE TABLE IF NOT EXISTS pharmacy_stock_adjustments (
    adjustment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stock_id UUID REFERENCES pharmacy_inventory(stock_id),
    adjustment_type VARCHAR(50), -- damage, expiry, theft, found, correction
    quantity_adjusted INTEGER NOT NULL, -- positive or negative
    reason TEXT,
    adjusted_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Prescriptions (Pharmacy Specific Tracking)
CREATE TABLE IF NOT EXISTS pharmacy_prescriptions (
    prescription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES doctors(id),
    prescription_date DATE DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, partial, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Prescription Items
CREATE TABLE IF NOT EXISTS pharmacy_prescription_items (
    prescription_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES pharmacy_prescriptions(prescription_id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES pharmacy_medicines(medicine_id),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration_days INTEGER,
    quantity_prescribed INTEGER,
    instructions TEXT,
    dispensed_quantity INTEGER DEFAULT 0,
    is_dispensed BOOLEAN DEFAULT false
);

-- Seed basic categories
INSERT INTO pharmacy_drug_categories (category_name, description) VALUES
('Antibiotics', 'Medicines that fight bacterial infections'),
('Analgesics', 'Pain relievers'),
('Antipyretics', 'Fever reducers'),
('Antacids', 'Neutralize stomach acidity'),
('Vitamins', 'Dietary supplements')
ON CONFLICT DO NOTHING;

-- Seed basic manufacturers
INSERT INTO pharmacy_manufacturers (manufacturer_name, country) VALUES
('Sun Pharma', 'India'),
('Cipla', 'India'),
('Dr. Reddys', 'India'),
('GSK', 'UK'),
('Pfizer', 'USA')
ON CONFLICT DO NOTHING;
