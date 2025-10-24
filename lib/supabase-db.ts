import { supabase, Database } from './supabase'

type User = Database['public']['Tables']['users']['Row']
type Organization = Database['public']['Tables']['organizations']['Row']
type Todo = Database['public']['Tables']['todos']['Row']

// User operations
export async function createUser(user: Database['public']['Tables']['users']['Insert']) {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function findUserByNameAndOrganization(name: string, organizationId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('name', name) // Case-insensitive matching
    .eq('organization_id', organizationId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getUsersByOrganization(organizationId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', organizationId)
  
  if (error) throw error
  return data || []
}

// Organization operations
export async function createOrganization(org: Database['public']['Tables']['organizations']['Insert']) {
  const { data, error } = await supabase
    .from('organizations')
    .insert(org)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function findOrganizationByName(name: string) {
  const { data, error} = await supabase
    .from('organizations')
    .select('*')
    .ilike('name', name) // Case-insensitive matching
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function findOrganizationById(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Todo operations
export async function createTodo(todo: Database['public']['Tables']['todos']['Insert']) {
  const { data, error } = await supabase
    .from('todos')
    .insert(todo)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTodosByUserName(userName: string, organizationId: string) {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('organization_id', organizationId)
    .ilike('assigned_to', `%${userName}%`)
  
  if (error) throw error
  return data || []
}

export async function updateTodo(id: string, updates: Database['public']['Tables']['todos']['Update']) {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTodo(id: string) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
