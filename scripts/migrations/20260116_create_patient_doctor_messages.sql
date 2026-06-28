-- Migration: Create patient_doctor_messages table
-- Created: 2026-01-16
-- Description: Async messaging system between patients and doctors

CREATE TABLE IF NOT EXISTS patient_doctor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  attachments TEXT[], -- URLs to uploaded files in storage
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_sender ON patient_doctor_messages(sender_id);
CREATE INDEX idx_messages_recipient ON patient_doctor_messages(recipient_id);
CREATE INDEX idx_messages_appointment ON patient_doctor_messages(appointment_id);
CREATE INDEX idx_messages_created ON patient_doctor_messages(created_at DESC);
CREATE INDEX idx_messages_unread ON patient_doctor_messages(recipient_id, is_read) WHERE is_read = FALSE;

-- Enable RLS
ALTER TABLE patient_doctor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view messages they sent
CREATE POLICY "Users can view sent messages"
  ON patient_doctor_messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

-- Users can view messages sent to them
CREATE POLICY "Users can view received messages"
  ON patient_doctor_messages FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON patient_doctor_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Users can mark their received messages as read
CREATE POLICY "Users can update received messages"
  ON patient_doctor_messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

-- Function to automatically set read_at timestamp
CREATE OR REPLACE FUNCTION set_message_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_read_at_trigger
  BEFORE UPDATE ON patient_doctor_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_read_at();
