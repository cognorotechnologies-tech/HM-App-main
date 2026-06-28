-- Check and fix all user roles in the database
-- This will show and update the actual roles stored in the profiles table

-- Step 1: Check current roles for all users
SELECT id, email, first_name, last_name, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- Step 2: Fix specific user roles (UPDATE THESE AS NEEDED)

-- Fix admin user
UPDATE profiles 
SET role = 'admin'
WHERE email = 'admin@hospital.com';

-- Fix receptionist user
UPDATE profiles 
SET role = 'receptionist'
WHERE email = 'hmappreceptionist@yopmail.com';

-- Fix doctor users (update emails as needed)
UPDATE profiles 
SET role = 'doctor'
WHERE email IN ('dr.cardio@hospital.com', 'dr.neuro@hospital.com');

-- Step 3: Verify the updates
SELECT id, email, first_name, last_name, role
FROM profiles
WHERE email IN (
    'admin@hospital.com',
    'hmappreceptionist@yopmail.com',
    'dr.cardio@hospital.com',
    'dr.neuro@hospital.com'
)
ORDER BY role, email;
