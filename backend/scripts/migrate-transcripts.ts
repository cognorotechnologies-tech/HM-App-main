import { pool } from '../src/db';

const createTableQuery = `
-- Create table for consultation transcripts
CREATE TABLE IF NOT EXISTS consultation_transcripts (
    id UUID PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    patient_id UUID REFERENCES patients(id),
    transcript_text TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS idx_transcripts_appointment ON consultation_transcripts(appointment_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_patient ON consultation_transcripts(patient_id);
`;

async function migrate() {
    try {
        console.log('Running migration: create consultation_transcripts...');
        await pool.query(createTableQuery);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
