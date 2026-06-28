-- Phase 1 Feature 3: Lab Test Ordering System
-- Enable doctors to order lab tests digitally and track results

-- 1. Lab Tests Master Table (Catalog of available tests)
CREATE TABLE IF NOT EXISTS lab_tests (
    id SERIAL PRIMARY KEY,
    test_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "CBC", "LFT", "HbA1c"
    test_name VARCHAR(200) NOT NULL,
    category VARCHAR(100), -- e.g., "Hematology", "Biochemistry", "Microbiology"
    description TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discounted_price DECIMAL(10, 2),
    
    -- Requirements
    fasting_required BOOLEAN DEFAULT false,
    sample_type VARCHAR(100), -- e.g., "Blood", "Urine", "Stool"
    preparation_instructions TEXT,
    
    -- Turnaround time
    tat_hours INTEGER DEFAULT 24, -- Turnaround time in hours
    urgent_tat_hours INTEGER, -- For urgent tests
    
    -- Grouping (for test panels)
    is_panel BOOLEAN DEFAULT false,
    panel_tests JSONB, -- Array of test_ids if this is a panel
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lab Orders Table
CREATE TABLE IF NOT EXISTS lab_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "LAB-2024-001234"
    
    -- Relationships
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    appointment_id INTEGER REFERENCES appointments(id), -- Optional link to appointment
    
    -- Order details
    ordered_tests JSONB NOT NULL, -- Array of {test_id, test_name, price, urgent}
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending', -- pending, collected, processing, completed, cancelled
    priority VARCHAR(20) DEFAULT 'routine', -- routine, urgent, stat
    
    -- Scheduling
    scheduled_date DATE,
    scheduled_time TIME,
    collection_date TIMESTAMP,
    
    -- Results
    results_available BOOLEAN DEFAULT false,
    results_file_url TEXT, -- PDF/image of results
    results_data JSONB, -- Structured result data
    result_summary TEXT,
    abnormal_flags JSONB, -- Array of abnormal values
    
    -- Clinical info
    clinical_notes TEXT, -- Doctor's notes/indications
    patient_symptoms TEXT,
    
    -- Lab info
    lab_name VARCHAR(200),
    lab_technician_id INTEGER,
    verified_by INTEGER, -- Doctor who verified results
    verified_at TIMESTAMP,
    
    -- Billing
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, partial
    payment_id INTEGER REFERENCES payment_transactions(id),
    
    -- Metadata
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Lab Test Results Detail Table (for storing individual test results)
CREATE TABLE IF NOT EXISTS lab_test_results (
    id SERIAL PRIMARY KEY,
    lab_order_id INTEGER NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    test_id INTEGER REFERENCES lab_tests(id),
    
    -- Result details
    test_name VARCHAR(200) NOT NULL,
    parameter_name VARCHAR(200), -- For tests with multiple parameters
    result_value VARCHAR(500),
    unit VARCHAR(50),
    reference_range VARCHAR(200),
    
    -- Flags
    is_abnormal BOOLEAN DEFAULT false,
    abnormal_flag VARCHAR(20), -- 'H' (high), 'L' (low), 'CRITICAL'
    
    -- Interpretation
    interpretation TEXT,
    remarks TEXT,
    
    performed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Indexes
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_doctor ON lab_orders(doctor_id);
CREATE INDEX idx_lab_orders_appointment ON lab_orders(appointment_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
CREATE INDEX idx_lab_orders_order_number ON lab_orders(order_number);
CREATE INDEX idx_lab_tests_category ON lab_tests(category);
CREATE INDEX idx_lab_tests_active ON lab_tests(is_active);
CREATE INDEX idx_lab_test_results_order ON lab_test_results(lab_order_id);

-- 5. Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_lab_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num TEXT;
    order_num TEXT;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Get next sequence number for this year
    SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO sequence_num
    FROM lab_orders
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    order_num := 'LAB-' || year_part || '-' || sequence_num;
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger to set order number on insert
CREATE OR REPLACE FUNCTION set_lab_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_lab_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_lab_order_number
    BEFORE INSERT ON lab_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_lab_order_number();

-- 7. Sample lab tests data
INSERT INTO lab_tests (test_code, test_name, category, price, sample_type, fasting_required, is_popular) VALUES
-- Hematology
('CBC', 'Complete Blood Count', 'Hematology', 300.00, 'Blood', false, true),
('ESR', 'Erythrocyte Sedimentation Rate', 'Hematology', 150.00, 'Blood', false, false),
('HB', 'Hemoglobin', 'Hematology', 100.00, 'Blood', false, true),
('PLATELET', 'Platelet Count', 'Hematology', 150.00, 'Blood', false, false),

-- Biochemistry
('FBS', 'Fasting Blood Sugar', 'Biochemistry', 150.00, 'Blood', true, true),
('PPBS', 'Post Prandial Blood Sugar', 'Biochemistry', 150.00, 'Blood', false, true),
('HBA1C', 'HbA1c (Glycated Hemoglobin)', 'Biochemistry', 800.00, 'Blood', false, true),
('LFT', 'Liver Function Test', 'Biochemistry', 600.00, 'Blood', true, true),
('RFT', 'Renal Function Test', 'Biochemistry', 600.00, 'Blood', true, true),
('LIPID', 'Lipid Profile', 'Biochemistry', 700.00, 'Blood', true, true),
('TSH', 'Thyroid Stimulating Hormone', 'Biochemistry', 400.00, 'Blood', false, true),
('T3T4', 'T3, T4 (Thyroid Profile)', 'Biochemistry', 600.00, 'Blood', false, false),

-- Microbiology
('URINE', 'Urine Routine & Microscopy', 'Microbiology', 200.00, 'Urine', false, true),
('STOOL', 'Stool Routine & Microscopy', 'Microbiology', 200.00, 'Stool', false, false),
('CULTURE', 'Blood Culture', 'Microbiology', 800.00, 'Blood', false, false),

-- Radiology
('XRAY_CHEST', 'Chest X-Ray', 'Radiology', 400.00, 'Imaging', false, true),
('XRAY_ABDOMEN', 'Abdomen X-Ray', 'Radiology', 500.00, 'Imaging', false, false),
('ECG', 'Electrocardiogram (ECG)', 'Cardiology', 300.00, 'Physical', false, true),

-- Panels
('DIABETIC_PANEL', 'Diabetic Screening Panel', 'Panels', 1500.00, 'Blood', true, true),
('HEALTH_CHECKUP', 'Basic Health Checkup', 'Panels', 2500.00, 'Blood', true, true);

-- Mark panels
UPDATE lab_tests SET is_panel = true, 
panel_tests = '[{"test_code": "FBS"}, {"test_code": "HBA1C"}, {"test_code": "LIPID"}]'::jsonb
WHERE test_code = 'DIABETIC_PANEL';

UPDATE lab_tests SET is_panel = true,
panel_tests = '[{"test_code": "CBC"}, {"test_code": "FBS"}, {"test_code": "LFT"}, {"test_code": "RFT"}, {"test_code": "LIPID"}, {"test_code": "TSH"}]'::jsonb
WHERE test_code = 'HEALTH_CHECKUP';

-- 8. View for popular tests
CREATE OR REPLACE VIEW popular_lab_tests AS
SELECT * FROM lab_tests
WHERE is_popular = true AND is_active = true
ORDER BY category, test_name;

-- 9. Function to get patient's lab order history
CREATE OR REPLACE FUNCTION get_patient_lab_history(p_patient_id INTEGER)
RETURNS TABLE (
    order_id INTEGER,
    order_number VARCHAR,
    ordered_date TIMESTAMP,
    status VARCHAR,
    tests_ordered TEXT,
    total_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lo.id,
        lo.order_number,
        lo.created_at,
        lo.status,
        STRING_AGG((lo.ordered_tests->>'test_name')::TEXT, ', ') as tests_ordered,
        lo.total_amount
    FROM lab_orders lo
    WHERE lo.patient_id = p_patient_id
    GROUP BY lo.id, lo.order_number, lo.created_at, lo.status, lo.total_amount
    ORDER BY lo.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE lab_tests IS 'Master catalog of available laboratory tests';
COMMENT ON TABLE lab_orders IS 'Lab test orders placed by doctors for patients';
COMMENT ON TABLE lab_test_results IS 'Individual test results for each ordered test';
COMMENT ON COLUMN lab_orders.ordered_tests IS 'JSONB array of ordered tests with details';
COMMENT ON COLUMN lab_orders.abnormal_flags IS 'JSONB array of abnormal test results for quick review';
