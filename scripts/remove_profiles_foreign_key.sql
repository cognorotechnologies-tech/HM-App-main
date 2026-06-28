-- Fix: Remove foreign key constraint on profiles table
-- This allows walk-in patients to have profiles without auth.users entries

-- Step 1: Check current constraint
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND contype = 'f';  -- foreign key constraints

-- Step 2: Drop the foreign key constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 3: Verify it's removed
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND contype = 'f';

-- This should return no rows, confirming the constraint is removed
