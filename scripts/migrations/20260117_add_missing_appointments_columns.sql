-- Fix: Add missing columns to appointments table
-- This script safely adds department_id and family_member_id if they don't exist

DO $$
BEGIN
    -- 1. Add department_id if missing
    IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='appointments' AND column_name='department_id') THEN
        ALTER TABLE public.appointments ADD COLUMN "department_id" UUID REFERENCES public.departments(id) ON DELETE SET NULL;
    END IF;

    -- 2. Add family_member_id if missing
    IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='appointments' AND column_name='family_member_id') THEN
        ALTER TABLE public.appointments ADD COLUMN "family_member_id" UUID REFERENCES public.family_members(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_department ON public.appointments(department_id);
CREATE INDEX IF NOT EXISTS idx_appointments_family_member ON public.appointments(family_member_id);

-- Force schema cache reload
NOTIFY pgrst, 'reload';
