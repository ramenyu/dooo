-- Create organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, organization_id)
);

-- Create todos table
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_by TEXT DEFAULT '',
  due_date TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  attached_links TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_todos_organization_id ON todos(organization_id);
CREATE INDEX idx_todos_assigned_to ON todos(assigned_to);
CREATE INDEX idx_todos_created_by_user_id ON todos(created_by_user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Organizations are viewable by everyone" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "Organizations can be created by anyone" ON organizations
  FOR INSERT WITH CHECK (true);

-- Create policies for users
CREATE POLICY "Users are viewable by organization members" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can be created by anyone" ON users
  FOR INSERT WITH CHECK (true);

-- Create policies for todos
CREATE POLICY "Todos are viewable by organization members" ON todos
  FOR SELECT USING (true);

CREATE POLICY "Todos can be created by organization members" ON todos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos can be updated by organization members" ON todos
  FOR UPDATE USING (true);

CREATE POLICY "Todos can be deleted by organization members" ON todos
  FOR DELETE USING (true);
