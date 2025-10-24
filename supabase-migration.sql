-- Migration to simplify organizations table
-- Remove the domain column and make name unique

-- Step 1: Keep only the first organization with each name, delete duplicates
DELETE FROM organizations a
USING organizations b
WHERE a.id > b.id 
AND a.name = b.name;

-- Step 2: Drop the domain constraint
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_domain_key;

-- Step 3: Drop the domain column
ALTER TABLE organizations DROP COLUMN IF EXISTS domain;

-- Step 4: Add unique constraint to name
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'organizations_name_key'
    ) THEN
        ALTER TABLE organizations ADD CONSTRAINT organizations_name_key UNIQUE (name);
    END IF;
END $$;

