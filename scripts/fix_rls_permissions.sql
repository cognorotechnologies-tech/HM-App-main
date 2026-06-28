-- Fix RLS (Row Level Security) permissions for Patient Registration
-- Error: "new row violates row-level security policy for table 'profiles'"
-- Solution: Allow receptionist role to insert patient profiles and records

-- ==========================================
-- STEP 1: Update Profiles Table RLS Policies
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Receptionists can insert patient profiles" ON profiles;
DROP POLICY IF EXISTS "Receptionists can view all profiles" ON profiles;  
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow receptionists to INSERT patient profiles
CREATE POLICY "Receptionists can insert patient profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'receptionist'
  AND role = 'patient'
);

-- Allow receptionists to VIEW all profiles (needed for their work)
CREATE POLICY "Receptionists can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('receptionist', 'admin')
);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ==========================================
-- STEP 2: Update Patients Table RLS Policies
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Receptionists can insert patients" ON patients;
DROP POLICY IF EXISTS "Receptionists can view all patients" ON patients;
DROP POLICY IF EXISTS "Doctors can view their patients" ON patients;
DROP POLICY IF EXISTS "Patients can view own record" ON patients;

-- Allow receptionists and admins to INSERT patients
CREATE POLICY "Receptionists can insert patients"
ON patients FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('receptionist', 'admin')
);

-- Allow receptionists and admins to VIEW all patients
CREATE POLICY "Receptionists can view all patients"
ON patients FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('receptionist', 'admin', 'doctor')
);

-- Allow patients to view their own record
CREATE POLICY "Patients can view own record"
ON patients FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ==========================================
-- STEP 3: Update Patient Visits Table RLS
-- ==========================================

DROP POLICY IF EXISTS "Staff can manage patient visits" ON patient_visits;
DROP POLICY IF EXISTS "Staff can view patient visits" ON patient_visits;

CREATE POLICY "Staff can manage patient visits"
ON patient_visits FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('receptionist', 'admin', 'doctor')
);

CREATE POLICY "Staff can view patient visits"
ON patient_visits FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('receptionist', 'admin', 'doctor')
  OR patient_id = auth.uid()
);

-- ==========================================
-- STEP 4: Grant Table Permissions
-- ==========================================

GRANT ALL ON profiles TO authenticated;
GRANT ALL ON patients TO authenticated;
GRANT ALL ON patient_visits TO authenticated;

-- ==========================================
-- STEP 5: Verify RLS is Enabled
-- ==========================================

-- Enable RLS on tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_visits ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 6: Verify Policies
-- ==========================================

-- Check that policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('profiles', 'patients', 'patient_visits')
ORDER BY tablename, policyname;

