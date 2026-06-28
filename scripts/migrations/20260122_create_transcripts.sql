-- Create table for consultation transcripts
CREATE TABLE IF NOT EXISTS consultation_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    patient_id UUID REFERENCES patients(id),
    transcript_text TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- For storing duration, potentially timestamps later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for quick lookup
CREATE INDEX idx_transcripts_appointment ON consultation_transcripts(appointment_id);
CREATE INDEX idx_transcripts_patient ON consultation_transcripts(patient_id);

-- Enable RLS
ALTER TABLE consultation_transcripts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Doctors can view their own transcripts" ON consultation_transcripts
    FOR ALL USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their own transcripts" ON consultation_transcripts
    FOR SELECT USING (auth.uid() = patient_id);
