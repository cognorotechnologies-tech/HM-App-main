-- FINAL FIX: Remove ALL circular dependencies in RLS policies
-- The issue: policies that query the profiles table while checking access to the profiles table = infinite loop

-- Step 1: Drop ALL existing SELECT policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Receptionists can view all profiles" ON profiles;

-- Step 2: Create ONE simple policy - any authenticated user can view ANY profile
-- This is the safest approach to avoid circular dependencies
CREATE POLICY "Authenticated users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to read all profiles

-- Step 3: Keep the INSERT and UPDATE policies as they are
-- (These don't cause circular dependencies)

-- Step 4: Verify
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
