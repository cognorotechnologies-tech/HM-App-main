-- Add missing columns to prescriptions table
ALTER TABLE prescriptions
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id),
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id),
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS prescription_date DATE DEFAULT CURRENT_DATE;

-- Add RLS policies for the new columns if needed (assuming policies exist on the table already, 
-- but ensuring filters work based on doctor_id/patient_id is good practice)
-- But usually existing policies might rely on created_by or simple "authenticated" role. 
-- Let's check policies later if access fails.
