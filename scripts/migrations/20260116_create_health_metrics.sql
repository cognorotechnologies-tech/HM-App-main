-- Migration: Create health_metrics table
-- Created: 2026-01-16
-- Description: Track patient health metrics over time (BP, sugar, weight, etc.)

CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- 'blood_pressure', 'blood_sugar', 'weight', 'height', 'temperature', 'heart_rate'
  metric_value JSONB NOT NULL, -- {"systolic": 120, "diastolic": 80} or {"value": 72.5}
  unit VARCHAR(20), -- 'mmHg', 'mg/dL', 'kg', 'cm', '°F', 'bpm'
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_health_metrics_patient ON health_metrics(patient_id);
CREATE INDEX idx_health_metrics_type ON health_metrics(metric_type);
CREATE INDEX idx_health_metrics_recorded ON health_metrics(recorded_at DESC);
CREATE INDEX idx_health_metrics_patient_type ON health_metrics(patient_id, metric_type);

-- Enable RLS
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Patients can view their own metrics
CREATE POLICY "Patients can view own metrics"
  ON health_metrics FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

-- Patients can insert their own metrics
CREATE POLICY "Patients can insert own metrics"
  ON health_metrics FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Patients can update their own metrics
CREATE POLICY "Patients can update own metrics"
  ON health_metrics FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid());

-- Patients can delete their own metrics
CREATE POLICY "Patients can delete own metrics"
  ON health_metrics FOR DELETE
  TO authenticated
  USING (patient_id = auth.uid());

-- Doctors can view metrics of their patients
CREATE POLICY "Doctors can view patient metrics"
  ON health_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      INNER JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = health_metrics.patient_id
      AND d.id = auth.uid()
    )
  );

-- Admins can view all metrics
CREATE POLICY "Admins can view all metrics"
  ON health_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
