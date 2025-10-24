-- Fix duplicate organizations (case-insensitive duplicates)
-- This script will handle duplicate users when merging organizations

-- Step 1: Find duplicate users that exist in both orgs
-- We'll keep the users from the "Gradient" org and reassign todos from duplicate users in "gradient" org

-- First, update todos created by users in the "gradient" org to reference the equivalent user in "Gradient" org
-- This assumes users with the same name (case-insensitive) are the same person
UPDATE todos t
SET 
  created_by_user_id = (
    SELECT u.id 
    FROM users u 
    WHERE LOWER(u.name) = LOWER(t.created_by) 
    AND u.organization_id = '00e982f6-8b46-490e-8aad-4afc6d807b44'
    LIMIT 1
  ),
  organization_id = '00e982f6-8b46-490e-8aad-4afc6d807b44'
WHERE t.organization_id = '0012bcb0-2159-4af6-a1d1-c7122573b532';

-- Step 2: Delete users from the "gradient" org (they're duplicates)
DELETE FROM users 
WHERE organization_id = '0012bcb0-2159-4af6-a1d1-c7122573b532';

-- Step 3: Now delete the duplicate "gradient" organization
DELETE FROM organizations 
WHERE id = '0012bcb0-2159-4af6-a1d1-c7122573b532';

-- Step 4: Verify we only have one "gradient" organization now
SELECT * FROM organizations WHERE LOWER(name) = 'gradient';

