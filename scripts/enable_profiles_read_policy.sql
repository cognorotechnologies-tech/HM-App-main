-- Enable public read access to profiles so that names are visible on Doctors page
-- This is necessary because the Doctors page is public, but profiles are often restricted

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone"
        ON profiles FOR SELECT
        TO public
        USING (true);
    END IF;
END
$$;

-- Ensure RLS is enabled (it should be, but good to check)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant SELECT permission to anon and authenticated roles if not already granted
GRANT SELECT ON profiles TO anon, authenticated;
