-- Phase 3: Patient Management - Medical Documents & Health Metrics
-- Migration: 20260117_create_medical_documents.sql

-- ============================================
-- 1. MEDICAL DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Document Details
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('lab_report', 'prescription', 'radiology', 'discharge_summary', 'insurance', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- File Metadata
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    
    -- Classification
    category VARCHAR(50) DEFAULT 'general',
    tags TEXT[],
    
    -- Meta
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_medical_documents_patient ON medical_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_type ON medical_documents(document_type);

-- RLS Policies
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;

-- Patients can view their own documents
CREATE POLICY "Patients view own documents" ON medical_documents
    FOR SELECT USING (
        patient_id IN (SELECT id FROM patients WHERE id = auth.uid())
    );

-- Patients can upload their own documents (insert)
CREATE POLICY "Patients upload own documents" ON medical_documents
    FOR INSERT WITH CHECK (
        patient_id IN (SELECT id FROM patients WHERE id = auth.uid())
    );

-- Patients can delete their own documents
CREATE POLICY "Patients delete own documents" ON medical_documents
    FOR DELETE USING (
        patient_id IN (SELECT id FROM patients WHERE id = auth.uid())
    );

-- Doctors can view documents of appointments they are assigned to
CREATE POLICY "Doctors view patient documents" ON medical_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.patient_id = medical_documents.patient_id
            AND d.id = auth.uid()
        )
    );

-- ============================================
-- 2. HEALTH METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Metric Data
    type VARCHAR(50) NOT NULL CHECK (type IN ('blood_pressure', 'blood_sugar', 'heart_rate', 'weight', 'height', 'temperature', 'bmi', 'spo2')),
    value JSONB NOT NULL, -- e.g., { systolic: 120, diastolic: 80 } or { value: 98.6 }
    unit VARCHAR(20) NOT NULL,
    
    -- Context
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    
    -- Meta
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_health_metrics_patient ON health_metrics(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_date ON health_metrics(measured_at);

-- RLS Policies
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own metrics
CREATE POLICY "Patients manage own metrics" ON health_metrics
    FOR ALL USING (
        patient_id IN (SELECT id FROM patients WHERE id = auth.uid())
    );

-- Doctors can view patient metrics
CREATE POLICY "Doctors view patient metrics" ON health_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.patient_id = health_metrics.patient_id
            AND d.id = auth.uid()
        )
    );

-- ============================================
-- 3. STORAGE BUCKET SETUP (To be run manually or via API usually, but SQL can grant access)
-- ============================================
-- Note: Bucket creation is not standard SQL in Supabase but we can set up policies if the bucket exists.
-- Assuming bucket 'medical-records' exists.

-- Storage Policies (pseudo-SQL, usually done in dashboard or separate storage API init)
-- INSERT INTO storage.buckets (id, name) VALUES ('medical-records', 'medical-records') ON CONFLICT DO NOTHING;

-- CREATE POLICY "Patients read own medical records" ON storage.objects
-- FOR SELECT USING ( bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1] );

-- CREATE POLICY "Patients upload own medical records" ON storage.objects
-- FOR INSERT WITH CHECK ( bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1] );
