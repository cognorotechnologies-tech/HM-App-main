-- Quick Admin Account Creation
-- Run this in Supabase SQL Editor

-- Step 1: First, create the user in Supabase Auth UI
-- Go to: Authentication → Users → Add User
-- Email: newadmin@hospital.com
-- Password: Admin@2026
-- Then copy the User ID and paste it below

-- Step 2: After creating in Auth UI, run this SQL:
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from step 1

-- Example format: 'a1b2c3d4-5678-90ab-cdef-1234567890ab'

INSERT INTO profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
    'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS with actual UUID
    'newadmin@hospital.com',
    'New',
    'Admin',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    email = 'newadmin@hospital.com',
    updated_at = NOW();

-- Step 3: Verify it worked
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE email = 'newadmin@hospital.com';
