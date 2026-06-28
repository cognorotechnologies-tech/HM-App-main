-- Add missing columns to schedules table for better slot management
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS start_time TIME NOT NULL DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS slot_duration INTEGER NOT NULL DEFAULT 30;

-- Update existing records to have start_time if they don't
UPDATE schedules 
SET start_time = '09:00' 
WHERE start_time IS NULL;

COMMENT ON COLUMN schedules.start_time IS 'Start time of doctor availability';
COMMENT ON COLUMN schedules.slot_duration IS 'Duration of each appointment slot in minutes';
