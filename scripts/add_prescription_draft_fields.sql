-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'status') THEN
        ALTER TABLE prescriptions ADD COLUMN status text DEFAULT 'final';
    END IF;
END $$;

-- Add follow_up_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'follow_up_date') THEN
        ALTER TABLE prescriptions ADD COLUMN follow_up_date date;
    END IF;
END $$;

-- Update RLS if needed (optional, assuming existing policies cover updates)
-- Grant access to receptionists to read prescriptions (essential for the print view)

-- Check if policy exists for receptionists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'prescriptions' 
        AND policyname = 'Receptionists can view all prescriptions'
    ) THEN
        CREATE POLICY "Receptionists can view all prescriptions" 
        ON prescriptions FOR SELECT 
        TO authenticated 
        USING ( 
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'receptionist'
            )
        );
    END IF;
END $$;
