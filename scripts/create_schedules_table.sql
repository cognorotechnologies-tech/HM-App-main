-- Drop table if exists to ensure clean slate (CAUTION: Data loss)
DROP TABLE IF EXISTS public.schedules CASCADE;

-- Create schedules table for doctor availability
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL,
    slot_duration INTEGER NOT NULL DEFAULT 30,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_schedules_doctor_day ON public.schedules(doctor_id, day_of_week);

-- Add RLS policies
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Doctors can manage their own schedules
CREATE POLICY "Doctors can view own schedules"
    ON public.schedules
    FOR SELECT
    USING (
        auth.uid() = doctor_id
    );

CREATE POLICY "Doctors can insert own schedules"
    ON public.schedules
    FOR INSERT
    WITH CHECK (
        auth.uid() = doctor_id
    );

CREATE POLICY "Doctors can update own schedules"
    ON public.schedules
    FOR UPDATE
    USING (
        auth.uid() = doctor_id
    );

CREATE POLICY "Doctors can delete own schedules"
    ON public.schedules
    FOR DELETE
    USING (
        auth.uid() = doctor_id
    );

-- Patients and receptionists can view all doctor schedules for booking
CREATE POLICY "Users can view all schedules for booking"
    ON public.schedules
    FOR SELECT
    USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_schedules_updated_at();

-- Add comments
COMMENT ON TABLE public.schedules IS 'Doctor weekly availability schedules';
COMMENT ON COLUMN public.schedules.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN public.schedules.start_time IS 'Start time of doctor availability';
COMMENT ON COLUMN public.schedules.end_time IS 'End time of doctor availability';
COMMENT ON COLUMN public.schedules.slot_duration IS 'Duration of each appointment slot in minutes';
