-- Add family_member_id to appointments table
ALTER TABLE public.appointments
ADD COLUMN family_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_family_member ON public.appointments(family_member_id);
