-- Comprehensive fix for prescriptions schema
-- Adds all missing columns that should have been created

-- Fix prescriptions table
DO $$
BEGIN
    -- Add symptoms column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prescriptions' AND column_name = 'symptoms'
    ) THEN
        ALTER TABLE public.prescriptions ADD COLUMN symptoms TEXT;
    END IF;

    -- Add prescription_number column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prescriptions' AND column_name = 'prescription_number'
    ) THEN
        ALTER TABLE public.prescriptions ADD COLUMN prescription_number VARCHAR(50) UNIQUE;
    END IF;
END $$;

-- Fix prescription_items table
DO $$
BEGIN
    -- Add route column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prescription_items' AND column_name = 'route'
    ) THEN
        ALTER TABLE public.prescription_items ADD COLUMN route VARCHAR(100);
    END IF;
END $$;

-- Force schema cache reload
NOTIFY pgrst, 'reload';
