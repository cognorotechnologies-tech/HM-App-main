-- Migration: Create medical_documents table
-- Created: 2026-01-16
-- Description: Store patient medical documents (lab reports, X-rays, etc.)

CREATE TABLE IF NOT EXISTS medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'lab_report', 'xray', 'ct_scan', 'prescription', 'other'
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  category VARCHAR(50), -- 'radiology', 'pathology', 'prescription', 'documents'
  tags TEXT[], -- Array of tags for search
  notes TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES medical_documents(id), -- For versioning
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_medical_documents_patient ON medical_documents(patient_id);
CREATE INDEX idx_medical_documents_type ON medical_documents(document_type);
CREATE INDEX idx_medical_documents_category ON medical_documents(category);
CREATE INDEX idx_medical_documents_created ON medical_documents(created_at DESC);

-- Enable RLS
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Patients can view their own documents
CREATE POLICY "Patients can view own documents"
  ON medical_documents FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

-- Doctors can view documents of their patients (patients they have appointments with)
CREATE POLICY "Doctors can view patient documents"
  ON medical_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      INNER JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = medical_documents.patient_id
      AND d.id = auth.uid()
    )
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON medical_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Patients can upload their own documents
CREATE POLICY "Patients can upload documents"
  ON medical_documents FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Patients can update their own documents
CREATE POLICY "Patients can update own documents"
  ON medical_documents FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid());

-- Patients can delete their own documents
CREATE POLICY "Patients can delete own documents"
  ON medical_documents FOR DELETE
  TO authenticated
  USING (patient_id = auth.uid());

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_medical_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medical_documents_updated_at
  BEFORE UPDATE ON medical_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_documents_updated_at();
