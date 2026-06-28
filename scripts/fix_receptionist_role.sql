-- Check and fix receptionist user role
-- This verifies the role is set correctly for the receptionist account

-- Step 1: Check current role
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE email = 'hmappreceptionist@yopmail.com';

-- Step 2: Fix the role if it's wrong (UPDATE to receptionist)
UPDATE profiles 
SET role = 'receptionist'
WHERE email = 'hmappreceptionist@yopmail.com';

-- Step 3: Verify the fix
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE email = 'hmappreceptionist@yopmail.com';

-- Step 4: Also check auth.users metadata
SELECT id, email, raw_user_meta_data->>'role' as metadata_role
FROM auth.users
WHERE email = 'hmappreceptionist@yopmail.com';

-- Step 5: Update auth metadata if needed
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"receptionist"'
)
WHERE email = 'hmappreceptionist@yopmail.com';
