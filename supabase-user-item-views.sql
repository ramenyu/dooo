-- Create user_item_views table to track when users last viewed items
CREATE TABLE IF NOT EXISTS user_item_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, todo_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_item_views_user_id ON user_item_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_item_views_todo_id ON user_item_views(todo_id);
CREATE INDEX IF NOT EXISTS idx_user_item_views_last_viewed ON user_item_views(last_viewed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_item_views ENABLE ROW LEVEL SECURITY;

-- Create policies for user_item_views
CREATE POLICY "Users can view their own item views" ON user_item_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own item views" ON user_item_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own item views" ON user_item_views
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own item views" ON user_item_views
  FOR DELETE USING (true);

