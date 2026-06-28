-- Prescription Templates & Doctor Preferences Migration
-- This adds support for prescription templates, recently used medicines, and doctor notes

-- 1. Prescription Templates Table
CREATE TABLE IF NOT EXISTS prescription_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis TEXT,
    medicines JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {medicine_name, dosage, frequency, duration, timing}
    tests JSONB DEFAULT '[]'::jsonb, -- Array of test names
    instructions TEXT,
    follow_up_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    use_count INTEGER DEFAULT 0, -- Track how often template is used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recently Prescribed Medicines (per doctor tracking)
CREATE TABLE IF NOT EXISTS doctor_medicine_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    timing VARCHAR(100),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    use_count INTEGER DEFAULT 1,
    UNIQUE(doctor_id, medicine_name, dosage)
);

-- 3. Doctor Quick Notes (Sticky Notes for Patients)
CREATE TABLE IF NOT EXISTS doctor_patient_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    flag_color VARCHAR(20) DEFAULT 'yellow', -- yellow, red, blue, green
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, patient_id) -- One note per doctor-patient pair
);

-- 4. Add allergy fields to patients table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'allergies') THEN
        ALTER TABLE patients ADD COLUMN allergies JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'chronic_conditions') THEN
        ALTER TABLE patients ADD COLUMN chronic_conditions JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 5. Add consultation tracking columns to appointments
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'consultation_start_time') THEN
        ALTER TABLE appointments ADD COLUMN consultation_start_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'consultation_end_time') THEN
        ALTER TABLE appointments ADD COLUMN consultation_end_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'consultation_duration_minutes') THEN
        ALTER TABLE appointments ADD COLUMN consultation_duration_minutes INTEGER;
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prescription_templates_doctor ON prescription_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescription_templates_active ON prescription_templates(doctor_id, is_active);
CREATE INDEX IF NOT EXISTS idx_doctor_medicine_history_doctor ON doctor_medicine_history(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_medicine_history_recent ON doctor_medicine_history(doctor_id, last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_notes_doctor ON doctor_patient_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_notes_patient ON doctor_patient_notes(doctor_id, patient_id);

-- RLS Policies

-- Prescription Templates: Doctors can only see their own templates
ALTER TABLE prescription_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own templates"
    ON prescription_templates FOR SELECT
    USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create own templates"
    ON prescription_templates FOR INSERT
    WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own templates"
    ON prescription_templates FOR UPDATE
    USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own templates"
    ON prescription_templates FOR DELETE
    USING (doctor_id = auth.uid());

-- Doctor Medicine History: Doctors can only see their own history
ALTER TABLE doctor_medicine_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own medicine history"
    ON doctor_medicine_history FOR SELECT
    USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own medicine history"
    ON doctor_medicine_history FOR INSERT
    WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own medicine history"
    ON doctor_medicine_history FOR UPDATE
    USING (doctor_id = auth.uid());

-- Doctor Patient Notes: Doctors can only see their own notes
ALTER TABLE doctor_patient_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own patient notes"
    ON doctor_patient_notes FOR SELECT
    USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create own patient notes"
    ON doctor_patient_notes FOR INSERT
    WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own patient notes"
    ON doctor_patient_notes FOR UPDATE
    USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own patient notes"
    ON doctor_patient_notes FOR DELETE
    USING (doctor_id = auth.uid());

-- Function to update template use count
CREATE OR REPLACE FUNCTION increment_template_use_count(template_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE prescription_templates
    SET use_count = use_count + 1,
        updated_at = NOW()
    WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update medicine history
CREATE OR REPLACE FUNCTION update_medicine_history(
    p_doctor_id UUID,
    p_medicine_name VARCHAR,
    p_dosage VARCHAR,
    p_frequency VARCHAR,
    p_duration VARCHAR,
    p_timing VARCHAR
)
RETURNS void AS $$
BEGIN
    INSERT INTO doctor_medicine_history (
        doctor_id, medicine_name, dosage, frequency, duration, timing, last_used_at, use_count
    )
    VALUES (
        p_doctor_id, p_medicine_name, p_dosage, p_frequency, p_duration, p_timing, NOW(), 1
    )
    ON CONFLICT (doctor_id, medicine_name, dosage)
    DO UPDATE SET
        frequency = EXCLUDED.frequency,
        duration = EXCLUDED.duration,
        timing = EXCLUDED.timing,
        last_used_at = NOW(),
        use_count = doctor_medicine_history.use_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prescription_templates_updated_at
    BEFORE UPDATE ON prescription_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_patient_notes_updated_at
    BEFORE UPDATE ON doctor_patient_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
