-- Fix missing symptoms column in prescriptions table
-- This can happen if the table existed before the full creation script was run

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'prescriptions' 
        AND column_name = 'symptoms'
    ) THEN
        ALTER TABLE public.prescriptions ADD COLUMN symptoms TEXT;
    END IF;
END $$;

-- Reload schema cache to ensure PostgREST sees the new column
NOTIFY pgrst, 'reload';
