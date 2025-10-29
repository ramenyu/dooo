-- Fix duplicate organizations (case-insensitive duplicates)
-- This script will:
-- 1. Find all users/todos associated with the duplicate "gradient" org
-- 2. Move them to the "Gradient" org
-- 3. Delete the duplicate "gradient" org

-- First, let's move all users from "gradient" to "Gradient"
UPDATE users 
SET organization_id = '00e982f6-8b46-490e-8aad-4afc6d807b44'
WHERE organization_id = '0012bcb0-2159-4af6-a1d1-c7122573b532';

-- Move all todos from "gradient" to "Gradient"
UPDATE todos 
SET organization_id = '00e982f6-8b46-490e-8aad-4afc6d807b44'
WHERE organization_id = '0012bcb0-2159-4af6-a1d1-c7122573b532';

-- Now delete the duplicate organization
DELETE FROM organizations 
WHERE id = '0012bcb0-2159-4af6-a1d1-c7122573b532';

-- Verify we only have one "gradient" organization now
SELECT * FROM organizations WHERE LOWER(name) = 'gradient';



