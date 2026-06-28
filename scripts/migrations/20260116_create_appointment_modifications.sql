-- Migration: Create appointment_modifications table
-- Created: 2026-01-16
-- Description: Track appointment cancellations and rescheduling history

CREATE TABLE IF NOT EXISTS appointment_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  modification_type VARCHAR(20) NOT NULL, -- 'cancelled', 'rescheduled'
  old_date DATE,
  old_start_time TIME,
  old_end_time TIME,
  new_date DATE,
  new_start_time TIME,
  new_end_time TIME,
  reason TEXT,
  modified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_appointment_modifications_appointment ON appointment_modifications(appointment_id);
CREATE INDEX idx_appointment_modifications_type ON appointment_modifications(modification_type);
CREATE INDEX idx_appointment_modifications_created ON appointment_modifications(created_at DESC);

-- Enable RLS
ALTER TABLE appointment_modifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Patients can view modifications to their own appointments
CREATE POLICY "Patients can view own appointment modifications"
  ON appointment_modifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_modifications.appointment_id
      AND appointments.patient_id = auth.uid()
    )
  );

-- Doctors can view modifications to their appointments
CREATE POLICY "Doctors can view their appointment modifications"
  ON appointment_modifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      INNER JOIN doctors d ON d.id = a.doctor_id
      WHERE a.id = appointment_modifications.appointment_id
      AND d.id = auth.uid()
    )
  );

-- Admins can view all modifications
CREATE POLICY "Admins can view all modifications"
  ON appointment_modifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Patients can create modifications for their appointments
CREATE POLICY "Patients can modify own appointments"
  ON appointment_modifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_modifications.appointment_id
      AND appointments.patient_id = auth.uid()
    )
  );
