-- Fix: Drop old incompatible family_members table and recreate with correct schema
DROP TABLE IF EXISTS public.family_members CASCADE;

-- Re-create family_members table with correct columns
CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    relationship TEXT NOT NULL, -- e.g., 'spouse', 'child', 'parent', 'sibling', 'other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Patients can view their own family members
CREATE POLICY "Patients can view their own family members"
    ON public.family_members
    FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE id = auth.uid()
        )
    );

-- 2. Patients can insert their own family members
CREATE POLICY "Patients can add family members"
    ON public.family_members
    FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT id FROM public.patients WHERE id = auth.uid()
        )
    );

-- 3. Patients can update their own family members
CREATE POLICY "Patients can update their own family members"
    ON public.family_members
    FOR UPDATE
    USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE id = auth.uid()
        )
    );

-- 4. Patients can delete their own family members
CREATE POLICY "Patients can delete their own family members"
    ON public.family_members
    FOR DELETE
    USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE id = auth.uid()
        )
    );

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger
CREATE TRIGGER update_family_members_updated_at
    BEFORE UPDATE ON public.family_members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
