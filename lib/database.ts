import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const TODOS_FILE = path.join(DATA_DIR, 'todos.json')
const ORGANIZATIONS_FILE = path.join(DATA_DIR, 'organizations.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]))
}

if (!fs.existsSync(TODOS_FILE)) {
  fs.writeFileSync(TODOS_FILE, JSON.stringify([]))
}

if (!fs.existsSync(ORGANIZATIONS_FILE)) {
  fs.writeFileSync(ORGANIZATIONS_FILE, JSON.stringify([]))
}

export interface Organization {
  id: string
  name: string
  domain: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  password: string
  organizationId: string
  createdAt: string
}

export interface Todo {
  id: string
  text: string
  assignedTo: string
  assignedToUserId: string
  createdBy: string
  createdByUserId: string
  organizationId: string
  dueDate: string
  completed: boolean
  completedBy: string
  attachedLinks: string[]
  createdAt: string
}

// User operations
export function getUsers(): User[] {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading users:', error)
    return []
  }
}

export function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

export function addUser(user: User): void {
  const users = getUsers()
  users.push(user)
  saveUsers(users)
}

export function findUserByName(name: string): User | undefined {
  const users = getUsers()
  return users.find(user => user.name.toLowerCase() === name.toLowerCase())
}

export function findUserByNameAndOrganization(name: string, organizationId: string): User | undefined {
  const users = getUsers()
  return users.find(user => user.name.toLowerCase() === name.toLowerCase() && user.organizationId === organizationId)
}

export function findUserById(id: string): User | undefined {
  const users = getUsers()
  return users.find(user => user.id === id)
}

// Organization operations
export function getOrganizations(): Organization[] {
  try {
    const data = fs.readFileSync(ORGANIZATIONS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading organizations:', error)
    return []
  }
}

export function saveOrganizations(organizations: Organization[]): void {
  try {
    fs.writeFileSync(ORGANIZATIONS_FILE, JSON.stringify(organizations, null, 2))
  } catch (error) {
    console.error('Error saving organizations:', error)
  }
}

export function addOrganization(organization: Organization): void {
  const organizations = getOrganizations()
  organizations.push(organization)
  saveOrganizations(organizations)
}

export function findOrganizationById(id: string): Organization | undefined {
  const organizations = getOrganizations()
  return organizations.find(org => org.id === id)
}

export function findOrganizationByDomain(domain: string): Organization | undefined {
  const organizations = getOrganizations()
  return organizations.find(org => org.domain === domain)
}

export function getUsersByOrganization(organizationId: string): User[] {
  const users = getUsers()
  return users.filter(user => user.organizationId === organizationId)
}

// Todo operations
export function getTodos(): Todo[] {
  try {
    const data = fs.readFileSync(TODOS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading todos:', error)
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2))
  } catch (error) {
    console.error('Error saving todos:', error)
  }
}

export function addTodo(todo: Todo): void {
  const todos = getTodos()
  todos.push(todo)
  saveTodos(todos)
}

export function updateTodo(id: string, updates: Partial<Todo>): boolean {
  const todos = getTodos()
  const index = todos.findIndex(todo => todo.id === id)
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updates }
    saveTodos(todos)
    return true
  }
  return false
}

export function deleteTodo(id: string): boolean {
  const todos = getTodos()
  const index = todos.findIndex(todo => todo.id === id)
  if (index !== -1) {
    todos.splice(index, 1)
    saveTodos(todos)
    return true
  }
  return false
}

export function getTodosByUserId(userId: string): Todo[] {
  const todos = getTodos()
  const user = findUserById(userId)
  if (!user) return []
  
  return todos.filter(todo => {
    // Check if user is assigned to this todo (supports multiple assignees)
    const assignees = todo.assignedTo.split(', ').map(name => name.trim())
    return assignees.includes(user.name) && todo.organizationId === user.organizationId
  })
}
