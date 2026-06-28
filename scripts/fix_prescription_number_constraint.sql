-- Fix prescription_number unique constraint issue
-- Option 1: Make prescription_number auto-generated with a sequence

-- Create a sequence for prescription numbers
CREATE SEQUENCE IF NOT EXISTS prescription_number_seq START WITH 1001;

-- Create a function to generate unique prescription numbers
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_month TEXT;
BEGIN
    -- Format: RX-YYYYMM-XXXX (e.g., RX-202601-1001)
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    new_number := 'RX-' || year_month || '-' || LPAD(nextval('prescription_number_seq')::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Update the prescriptions table to auto-generate prescription_number
-- Set default value for prescription_number column
ALTER TABLE prescriptions 
ALTER COLUMN prescription_number 
SET DEFAULT generate_prescription_number();

-- Optionally, update existing NULL prescription_numbers
UPDATE prescriptions 
SET prescription_number = generate_prescription_number()
WHERE prescription_number IS NULL;

COMMENT ON COLUMN prescriptions.prescription_number IS 'Auto-generated unique prescription number in format RX-YYYYMM-XXXX';
