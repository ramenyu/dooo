-- Template for creating a new organization in Supabase
-- Replace 'your-organization-name' with the actual organization name

INSERT INTO organizations (name, created_at)
VALUES ('your-organization-name', NOW())
RETURNING *;

-- Examples:
-- INSERT INTO organizations (name, created_at) VALUES ('acme-corp', NOW()) RETURNING *;
-- INSERT INTO organizations (name, created_at) VALUES ('tech-startup', NOW()) RETURNING *;
-- INSERT INTO organizations (name, created_at) VALUES ('consulting-firm', NOW()) RETURNING *;

-- To view all organizations:
-- SELECT * FROM organizations;

-- To delete an organization (and all its users/todos due to CASCADE):
-- DELETE FROM organizations WHERE name = 'organization-name';

