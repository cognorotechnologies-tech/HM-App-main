-- Fix the circular dependency in RLS policies
-- Allow ANY authenticated user to read their own profile
-- This is needed so users can log in and determine their role

-- Drop the restrictive policies that cause the circular dependency
DROP POLICY IF EXISTS "Receptionists can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create a simple policy: ANY authenticated user can read their OWN profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admin and receptionist can view ALL profiles
CREATE POLICY "Staff can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'receptionist')
  OR auth.uid() = id  -- Also allow viewing own profile
);

-- Verify the policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
