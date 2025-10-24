-- Migration to make user names case-insensitive
-- This ensures "Test" and "test" are treated as the same user

-- Step 1: Drop the existing unique constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_name_organization_id_key;

-- Step 2: Delete duplicate users first (keep the first one, delete others)
DELETE FROM users a
USING users b
WHERE a.id > b.id 
AND LOWER(a.name) = LOWER(b.name)
AND a.organization_id = b.organization_id;

-- Step 3: Create a case-insensitive unique index
CREATE UNIQUE INDEX IF NOT EXISTS users_name_organization_id_lower_idx 
ON users (LOWER(name), organization_id);

-- Note: After this migration, user names will be matched case-insensitively
-- but the original capitalization will be preserved for display

