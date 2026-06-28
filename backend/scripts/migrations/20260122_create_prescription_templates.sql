
-- Create Prescription Templates Table
CREATE TABLE IF NOT EXISTS prescription_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE, -- Null for system templates
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis TEXT, -- Can be comma separated
    medicines JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of MedicineItem
    tests TEXT[], -- Array of test names
    instructions TEXT,
    follow_up_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for doctor-specific templates
CREATE INDEX IF NOT EXISTS idx_prescription_templates_doctor_id ON prescription_templates(doctor_id);

-- System Templates Seeding (doctor_id IS NULL)

-- 1. Viral Fever
INSERT INTO prescription_templates (template_name, description, diagnosis, medicines, tests, instructions, follow_up_days, is_active)
VALUES (
    'Viral Fever',
    'Standard treatment for viral fever',
    'Viral Fever',
    '[
        {
            "medicine_name": "Paracetamol 650mg",
            "dosage": "1-1-1",
            "frequency": "Daily",
            "duration": "5 Days",
            "timing": "After Food"
        },
        {
            "medicine_name": "Vitamin C 500mg",
            "dosage": "1-0-0",
            "frequency": "Daily",
            "duration": "10 Days",
            "timing": "After Food"
        }
    ]'::jsonb,
    ARRAY['CBC', 'Dengue NS1'],
    'Drink plenty of fluids. Rest well. Sponge bath if fever exceeds 102F.',
    5,
    true
);

-- 2. Hypertension (Mild)
INSERT INTO prescription_templates (template_name, description, diagnosis, medicines, tests, instructions, follow_up_days, is_active)
VALUES (
    'Hypertension (Initial)',
    'Initial management for mild hypertension',
    'Essential Hypertension',
    '[
        {
            "medicine_name": "Amlodipine 5mg",
            "dosage": "1-0-0",
            "frequency": "Daily",
            "duration": "30 Days",
            "timing": "Morning"
        }
    ]'::jsonb,
    ARRAY['Lipid Profile', 'ECG', 'Serum Creatinine'],
    'Low salt diet. regular exercise (30 mins walk). Monitor BP weekly.',
    30,
    true
);

-- 3. Type 2 Diabetes
INSERT INTO prescription_templates (template_name, description, diagnosis, medicines, tests, instructions, follow_up_days, is_active)
VALUES (
    'Type 2 Diabetes (Maintenance)',
    'Maintenance therapy for T2DM',
    'Type 2 Diabetes Mellitus',
    '[
        {
            "medicine_name": "Metformin 500mg",
            "dosage": "1-0-1",
            "frequency": "Daily",
            "duration": "30 Days",
            "timing": "After Food"
        }
    ]'::jsonb,
    ARRAY['HbA1c', 'FBS', 'PPBS'],
    'Avoid sugar and sweets. Foot care daily. Regular exercise.',
    30,
    true
);

-- 4. Acute Gastritis
INSERT INTO prescription_templates (template_name, description, diagnosis, medicines, tests, instructions, follow_up_days, is_active)
VALUES (
    'Acute Gastritis',
    'Treatment for acidity and gastritis',
    'Acute Gastritis',
    '[
        {
            "medicine_name": "Pantoprazole 40mg",
            "dosage": "1-0-0",
            "frequency": "Daily",
            "duration": "7 Days",
            "timing": "Before Food"
        },
        {
            "medicine_name": "Antacid Syrup",
            "dosage": "10ml-10ml-10ml",
            "frequency": "Daily",
            "duration": "5 Days",
            "timing": "Before Food"
        }
    ]'::jsonb,
    ARRAY[]::TEXT[],
    'Avoid spicy and oily food. Have small frequent meals.',
    7,
    true
);

-- 5. URI (Upper Respiratory Infection)
INSERT INTO prescription_templates (template_name, description, diagnosis, medicines, tests, instructions, follow_up_days, is_active)
VALUES (
    'URI',
    'Common cold and cough',
    'Upper Respiratory Tract Infection',
    '[
        {
            "medicine_name": "Levocetirizine 5mg",
            "dosage": "0-0-1",
            "frequency": "Daily",
            "duration": "5 Days",
            "timing": "After Food"
        },
        {
            "medicine_name": "Cough Syrup",
            "dosage": "10ml-10ml-10ml",
            "frequency": "Daily",
            "duration": "5 Days",
            "timing": "After Food"
        }
    ]'::jsonb,
    ARRAY[]::TEXT[],
    'Steam inhalation twice daily. Warm saline gargle.',
    5,
    true
);
