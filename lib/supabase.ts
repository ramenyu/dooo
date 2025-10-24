import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are not configured')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          password: string
          organization_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          password: string
          organization_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          password?: string
          organization_id?: string
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          text: string
          assigned_to: string
          created_by: string
          created_by_user_id: string
          completed: boolean
          completed_by: string
          due_date: string | null
          organization_id: string
          attached_links: string[]
          created_at: string
        }
        Insert: {
          id?: string
          text: string
          assigned_to: string
          created_by: string
          created_by_user_id: string
          completed?: boolean
          completed_by?: string
          due_date?: string | null
          organization_id: string
          attached_links?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          text?: string
          assigned_to?: string
          created_by?: string
          created_by_user_id?: string
          completed?: boolean
          completed_by?: string
          due_date?: string | null
          organization_id?: string
          attached_links?: string[]
          created_at?: string
        }
      }
    }
  }
}
