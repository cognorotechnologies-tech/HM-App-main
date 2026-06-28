-- Quick Script: Create New Test Admin User
-- Run this in Supabase SQL Editor to create a fresh admin account

-- This will create a new admin user: testadmin@hospital.com
-- Password: TestAdmin@123

-- Step 1: The user will be created in Supabase Auth through the application
-- You can create it by:
-- 1. Going to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" / "Invite User"  
-- 3. Email: testadmin@hospital.com
-- 4. Password: TestAdmin@123
-- 5. Click "Create user"

-- Step 2: After creating in Auth, run this SQL to add to profiles table
-- Replace 'USER_ID_HERE' with the actual UUID from the auth.users table

-- First, let's get the user ID (run this after creating in Supabase Auth UI)
SELECT id, email FROM auth.users WHERE email = 'testadmin@hospital.com';

-- Then insert into profiles (replace the UUID with actual ID from above query)
INSERT INTO profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
    'REPLACE_WITH_ACTUAL_USER_ID',  -- Get this from the query above
    'testadmin@hospital.com',
    'Test',
    'Admin',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    first_name = 'Test',
    last_name = 'Admin',
    updated_at = NOW();

-- Confirm it worked
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE email = 'testadmin@hospital.com';
