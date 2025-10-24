"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { InfoIcon } from 'lucide-react'
import { Plus, Calendar, User, CheckCircle, Circle, AtSign, ArrowUpRight, LogOut, X, ArrowUp, Paperclip } from 'lucide-react'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

export interface Todo {
  id: string
  text: string
  assigned_to: string
  assigned_to_user_id?: string
  created_by: string
  created_by_user_id: string
  organization_id: string
  due_date: string
  completed: boolean
  completed_by: string // Comma-separated list of user names who have completed their part
  attached_links: string[] // Array of URLs attached to the todo
  created_at: string
}

export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface User {
  id: string
  name: string
  password?: string
  organization_id: string
  created_at?: string
}

// API functions
async function fetchUsersByOrganization(organizationId: string): Promise<User[]> {
  const response = await fetch(`/api/organizations/users?organizationId=${organizationId}`)
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

async function fetchTodos(userId?: string, organizationId?: string): Promise<Todo[]> {
  if (!userId || !organizationId) {
    console.error('fetchTodos called without userId or organizationId')
    return []
  }
  const url = `/api/todos?userId=${userId}&organizationId=${organizationId}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch todos')
  return response.json()
}

async function createTodo(todo: Omit<Todo, 'id' | 'created_at'>): Promise<Todo> {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo)
  })
  if (!response.ok) throw new Error('Failed to create todo')
  return response.json()
}

async function updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
  const response = await fetch('/api/todos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  })
  if (!response.ok) throw new Error('Failed to update todo')
}

async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`/api/todos?id=${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete todo')
}

async function loginUser(name: string, password: string, organizationId: string): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, organizationId })
  })
  if (!response.ok) throw new Error('Invalid credentials')
  return response.json()
}

async function fetchAllUsers(): Promise<User[]> {
  const response = await fetch('/api/users/list')
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

async function registerUser(name: string, password: string, organizationId: string): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, organizationId })
  })
  if (!response.ok) throw new Error('Failed to register user')
  return response.json()
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [showMentionHint, setShowMentionHint] = useState(false)
  const [showUserSuggestions, setShowUserSuggestions] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUserIndex, setSelectedUserIndex] = useState(0)
  const [completedMentions, setCompletedMentions] = useState<string[]>([])
  const [attachedLinks, setAttachedLinks] = useState<string[]>([])
  const [autoCompleteHint, setAutoCompleteHint] = useState<string>('')
  const [myselfRemoved, setMyselfRemoved] = useState<boolean>(false)
  const [shakingTodos, setShakingTodos] = useState<Set<string>>(new Set())
  const [selectedTodoIndex, setSelectedTodoIndex] = useState<number>(-1)
  const [newOrgDomain, setNewOrgDomain] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut handler - must be at top level
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K to focus input
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setSelectedTodoIndex(-1) // Clear todo selection when focusing input
        return
      }
      
      // Cmd+Up/Down for todo navigation (only when not in input)
      if ((event.metaKey || event.ctrlKey) && !inputRef.current?.contains(document.activeElement)) {
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          setSelectedTodoIndex(prev => {
            // Filter todos inline to avoid dependency issues
            const filteredTodos = todos.filter(todo => {
              if (!currentUser) return false
              const assignees = todo.assigned_to.split(', ').map(name => name.trim())
              return assignees.includes(currentUser.name) && todo.organization_id === currentUser.organization_id
            })
            if (filteredTodos.length === 0) return -1
            if (prev <= 0) return filteredTodos.length - 1
            return prev - 1
          })
          return
        }
        
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setSelectedTodoIndex(prev => {
            // Filter todos inline to avoid dependency issues
            const filteredTodos = todos.filter(todo => {
              if (!currentUser) return false
              const assignees = todo.assigned_to.split(', ').map(name => name.trim())
              return assignees.includes(currentUser.name) && todo.organization_id === currentUser.organization_id
            })
            if (filteredTodos.length === 0) return -1
            if (prev >= filteredTodos.length - 1) return 0
            return prev + 1
          })
          return
        }
      }
      
      // Enter to complete selected todo (only when not in input)
      if (event.key === 'Enter' && !inputRef.current?.contains(document.activeElement) && selectedTodoIndex >= 0) {
        event.preventDefault()
        // Filter todos inline to avoid dependency issues
        const filteredTodos = todos.filter(todo => {
          if (!currentUser) return false
          const assignees = todo.assigned_to.split(', ').map(name => name.trim())
          return assignees.includes(currentUser.name) && todo.organization_id === currentUser.organization_id
        })
        
        // Sort the filtered todos the same way as userTodos
        const sortedTodos = filteredTodos.sort((a, b) => {
          // Completed todos go to bottom
          if (a.completed && !b.completed) return 1
          if (!a.completed && b.completed) return -1
          // Within same completion status, newest first (by creation time)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        
        const selectedTodo = sortedTodos[selectedTodoIndex]
        if (selectedTodo && currentUser) {
          // Call the completion function directly
          const todo = todos.find(t => t.id === selectedTodo.id)
          if (todo) {
            if (todo.completed) {
              // Delete completed todo
              fetch(`/api/todos?id=${todo.id}`, { method: 'DELETE' })
                .then(() => setTodos(prev => prev.filter(t => t.id !== todo.id)))
                .catch(err => console.error('Failed to delete todo:', err))
            } else {
              // Complete todo
              const completedBy = todo.completed_by ? todo.completed_by.split(', ').map(name => name.trim()) : []
              const isCurrentUserCompleted = completedBy.includes(currentUser.name)
              
              let newCompletedBy
              if (isCurrentUserCompleted) {
                // Remove current user from completed list
                newCompletedBy = completedBy.filter(name => name !== currentUser.name).join(', ')
              } else {
                // Add current user to completed list
                newCompletedBy = [...completedBy, currentUser.name].join(', ')
              }
              
              // Check if all assignees have completed
              const assignees = todo.assigned_to.split(', ').map(name => name.trim())
              const allCompleted = assignees.every(assignee => newCompletedBy.split(', ').includes(assignee))
              
              fetch('/api/todos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: todo.id,
                  completed: allCompleted,
                  completedBy: newCompletedBy
                })
              })
              .then(() => {
                setTodos(prev => prev.map(t => 
                  t.id === todo.id 
                    ? { ...t, completed: allCompleted, completedBy: newCompletedBy }
                    : t
                ))
              })
              .catch(err => console.error('Failed to update todo:', err))
            }
          }
        }
        return
      }
      
      // Delete key to discard selected todo (only when not in input)
      if ((event.key === 'Delete' || event.key === 'Backspace') && !inputRef.current?.contains(document.activeElement) && selectedTodoIndex >= 0) {
        console.log('Delete key pressed, selectedTodoIndex:', selectedTodoIndex)
        event.preventDefault()
        // Filter todos inline to avoid dependency issues
        const filteredTodos = todos.filter(todo => {
          if (!currentUser) return false
          const assignees = todo.assigned_to.split(', ').map(name => name.trim())
          return assignees.includes(currentUser.name) && todo.organization_id === currentUser.organization_id
        })
        
        // Sort the filtered todos the same way as userTodos
        const sortedTodos = filteredTodos.sort((a, b) => {
          // Completed todos go to bottom
          if (a.completed && !b.completed) return 1
          if (!a.completed && b.completed) return -1
          // Within same completion status, newest first (by creation time)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        
        const selectedTodo = sortedTodos[selectedTodoIndex]
        if (selectedTodo) {
          // Delete/discard the todo completely
          fetch(`/api/todos?id=${selectedTodo.id}`, { method: 'DELETE' })
            .then(() => {
              setTodos(prev => prev.filter(t => t.id !== selectedTodo.id))
              // Keep selection on the same index (item shifts up to fill the gap)
              // If we're at the last item, move to the previous one
              const newFilteredTodos = todos.filter(t => t.id !== selectedTodo.id).filter(todo => {
                if (!currentUser) return false
                const assignees = todo.assigned_to.split(', ').map(name => name.trim())
                return assignees.includes(currentUser.name) && todo.organization_id === currentUser.organization_id
              })
              const newSortedTodos = newFilteredTodos.sort((a, b) => {
                if (a.completed && !b.completed) return 1
                if (!a.completed && b.completed) return -1
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              })
              
              // Adjust selection index
              if (selectedTodoIndex >= newSortedTodos.length) {
                setSelectedTodoIndex(newSortedTodos.length - 1)
              }
              // Otherwise keep the same index (item shifts up)
            })
            .catch(err => console.error('Failed to delete todo:', err))
        }
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [todos, selectedTodoIndex, currentUser])

  // Default task suggestions
  const defaultSuggestions = [
    { emoji: '☕', text: "Let's go grab a coffee" }
  ]

  // Notification functions
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      } catch (error) {
        console.error('Error requesting permission:', error)
        return false
      }
    }
    return false
  }

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/notification-icon.png', // Use PNG version for better browser support
          badge: undefined, // Remove badge icon (right side)
          tag: 'todo-notification',
          requireInteraction: true
        })
        
        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      } catch (error) {
        console.error('Error creating notification:', error)
      }
    }
  }

  // Load todos from API when user changes
  useEffect(() => {
    if (currentUser) {
      fetchTodos(currentUser.id, currentUser.organization_id).then(setTodos).catch(console.error)
      // Request notification permission when user logs in
      requestNotificationPermission()
    }
  }, [currentUser])

  // Poll for updates every 5 seconds when user is logged in
  useEffect(() => {
    if (!currentUser || !currentOrganization) return

    const interval = setInterval(async () => {
      try {
        const updatedTodos = await fetchTodos(currentUser.id, currentUser.organization_id)
        
        // Check for newly assigned todos (created by someone else)
        const newAssignedTodos = updatedTodos.filter(newTodo => {
          const isNew = !todos.find(existingTodo => existingTodo.id === newTodo.id)
          const isAssignedBySomeoneElse = newTodo.created_by !== currentUser.name
          return isNew && isAssignedBySomeoneElse
        })
        
        // Show notifications for new todos
        newAssignedTodos.forEach(todo => {
          showNotification(
            'Hey! Someone needs you!',
            `${todo.created_by} needs you to: ${todo.text}`
          )
        })
        
        // Check for todos that were moved to top (createdAt timestamp changed)
        const movedTodos = updatedTodos.filter(updatedTodo => {
          const existingTodo = todos.find(t => t.id === updatedTodo.id)
          if (!existingTodo) return false
          
          // Check if createdAt timestamp changed (indicating move to top)
          const existingTime = new Date(existingTodo.created_at).getTime()
          const updatedTime = new Date(updatedTodo.created_at).getTime()
          const timeDifference = Math.abs(updatedTime - existingTime)
          
          // If timestamp changed by more than 1 second, it was likely moved to top
          return timeDifference > 1000
        })
        
        // Show notifications for moved todos (priority changes)
        movedTodos.forEach(todo => {
          showNotification(
            'Hey! Someone needs you!',
            `${todo.created_by} moved "${todo.text}" to top priority`
          )
        })
        
        // Combine both types of todos that should shake
        const todosToShake = [...newAssignedTodos, ...movedTodos]
        
        // Trigger shake effect for todos that need shaking
        if (todosToShake.length > 0) {
          const shakingIds = new Set(todosToShake.map(todo => todo.id))
          setShakingTodos(shakingIds)
          
          // Remove shake effect after animation completes
          setTimeout(() => {
            setShakingTodos(new Set())
          }, 500)
        }
        
        setTodos(updatedTodos)
        
        // Also refresh the user list to pick up new registrations
        const orgUsers = await fetchUsersByOrganization(currentOrganization.id)
        setAllUsers(orgUsers)
      } catch (error) {
        console.error('Failed to fetch updated todos:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [currentUser, currentOrganization, todos])

  // Load users from localStorage for @ mentions
  useEffect(() => {
    const savedUsers = localStorage.getItem('users')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }, [])

  // Save users to localStorage whenever users change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users))
    }
  }, [users])

  // Save current user to localStorage whenever current user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  const handleOrganizationSelect = (org: Organization) => {
    setCurrentOrganization(org)
  }

  const handleSelectOrganization = async () => {
    if (!newOrgDomain.trim()) return
    
    const orgName = newOrgDomain.trim()
    console.log('Looking for organization:', orgName)
    
    try {
      // Find existing organization by name
      const response = await fetch(`/api/organizations?name=${encodeURIComponent(orgName)}`)
      
      if (!response.ok) {
        alert(`Organization "${orgName}" not found. Please check the name and try again.`)
        return
      }
      
      const existingOrg = await response.json()
      console.log('Found organization:', existingOrg)
      setCurrentOrganization(existingOrg)
      
      // Load users for this organization
      const orgUsers = await fetchUsersByOrganization(existingOrg.id)
      console.log('Users loaded:', orgUsers)
      setAllUsers(orgUsers)
      
      setNewOrgDomain('')
    } catch (error) {
      console.error('Failed to find organization:', error)
      alert('Organization not found. Please check the name and try again.')
    }
  }

  const handleAddTodo = async () => {
    if (!newTodo.trim() || !currentUser) return

    // Support multiple assignees - include current user unless manually removed
    let assignees: string
    if (myselfRemoved) {
      // Only use completed mentions if "Myself" was removed
      assignees = completedMentions.length > 0 
        ? completedMentions.join(', ')
        : currentUser.name // Fallback to current user if no mentions
    } else {
      // Always include current user unless explicitly removed
      if (completedMentions.length > 0) {
        // Check if current user is already in the mentions to avoid duplicates
        const allAssignees = [currentUser.name, ...completedMentions]
        const uniqueAssignees = Array.from(new Set(allAssignees)) // Remove duplicates
        assignees = uniqueAssignees.join(', ')
      } else {
        assignees = currentUser.name
      }
    }

    try {
      const newTodoData = {
        text: newTodo.trim(),
        assigned_to: assignees,
        assigned_to_user_id: '', // Will be set by API
        created_by: currentUser.name,
        created_by_user_id: currentUser.id,
        organization_id: currentUser.organization_id,
        due_date: new Date().toISOString(),
        completed: false,
        completed_by: '',
        attached_links: attachedLinks
      }

      const createdTodo = await createTodo(newTodoData)
      setTodos(prev => [...prev, createdTodo])
      setNewTodo('')
      setCompletedMentions([])
      setAttachedLinks([]) // Clear attached links
      setMyselfRemoved(false) // Reset for next todo
      
      // Blur the input to exit focus so keyboard navigation works immediately
      inputRef.current?.blur()
    } catch (error) {
      console.error('Failed to create todo:', error)
      alert('Failed to create todo. Please try again.')
    }
  }

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    try {
      await updateTodo(id, { completed: !todo.completed })
      setTodos(prev => prev.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ))
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id)
      setTodos(prev => prev.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const handleCompleteOrDelete = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo || !currentUser) return

    if (todo.completed) {
      // If already completed, delete it
      try {
        await deleteTodo(id)
        setTodos(prev => prev.filter(t => t.id !== id))
      } catch (error) {
        console.error('Failed to delete todo:', error)
      }
    } else {
      // Handle individual user completion
      const assignees = todo.assigned_to.split(', ').map(name => name.trim())
      const completedBy = todo.completed_by ? todo.completed_by.split(', ').map(name => name.trim()) : []
      
      // Check if current user has already completed their part
      if (completedBy.includes(currentUser.name)) {
        // User already completed, remove them from completedBy
        const newCompletedBy = completedBy.filter(name => name !== currentUser.name).join(', ')
        const allCompleted = newCompletedBy.split(', ').length === assignees.length
        
        try {
          await updateTodo(id, { 
            completed_by: newCompletedBy,
            completed: allCompleted
          })
          setTodos(prev => prev.map(t => 
            t.id === id ? { 
              ...t, 
              completed_by: newCompletedBy,
              completed: allCompleted
            } : t
          ))
        } catch (error) {
          console.error('Failed to update todo:', error)
        }
      } else {
        // User hasn't completed yet, add them to completedBy
        const newCompletedBy = [...completedBy, currentUser.name].join(', ')
        const allCompleted = newCompletedBy.split(', ').length === assignees.length
        
        try {
          await updateTodo(id, { 
            completed_by: newCompletedBy,
            completed: allCompleted
          })
          setTodos(prev => prev.map(t => 
            t.id === id ? { 
              ...t, 
              completed_by: newCompletedBy,
              completed: allCompleted
            } : t
          ))
        } catch (error) {
          console.error('Failed to update todo:', error)
        }
      }
    }
  }

  const handleMoveToTop = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    try {
      // Update the todo's created_at to current time to move it to top
      const newCreatedAt = new Date().toISOString()
      await updateTodo(id, { created_at: newCreatedAt })
      
      // Update local state
      setTodos(prev => prev.map(t => 
        t.id === id ? { ...t, created_at: newCreatedAt } : t
      ))
      
      // Trigger shake animation for local feedback
      setShakingTodos(new Set([id]))
      setTimeout(() => {
        setShakingTodos(new Set())
      }, 500)
    } catch (error) {
      console.error('Failed to move todo to top:', error)
      alert('Failed to move todo to top. Please try again.')
    }
  }

  const handleSuggestionClick = (suggestionText: string) => {
    setNewTodo(suggestionText)
    // Clear all auto-complete states when using suggestion
    setAutoCompleteHint('')
    setShowMentionHint(false)
    setShowUserSuggestions(false)
    setFilteredUsers([])
    inputRef.current?.focus()
  }

  // URL detection function
  const detectAndExtractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.match(urlRegex) || []
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Debug: log all keyboard events with modifiers
    if (e.metaKey || e.ctrlKey) {
      console.log('Modifier key pressed:', e.key, 'metaKey:', e.metaKey, 'ctrlKey:', e.ctrlKey)
      console.log('Current state - showUserSuggestions:', showUserSuggestions, 'filteredUsers:', filteredUsers.length, 'selectedUserIndex:', selectedUserIndex)
    }
    
    if (e.key === 'Tab') {
      // If showing single user hint, auto-complete
      if (showMentionHint && filteredUsers.length === 1) {
        e.preventDefault()
        handleUserSelect(filteredUsers[0].name)
        return
      }
    } else if (e.key === 'Enter') {
      // If showing dropdown with selection, select the user
      if (showUserSuggestions && filteredUsers.length > 0) {
        e.preventDefault()
        handleUserSelect(filteredUsers[selectedUserIndex].name)
        return
      }
      
      // Otherwise, add todo
      handleAddTodo()
    } else if (e.key === ' ') {
      // Check if user manually typed @ + name and pressed space
      const atMatch = newTodo.match(/@(\w+)$/)
      if (atMatch) {
        const typedName = atMatch[1]
        console.log('Manual typing detected:', typedName, 'allUsers:', allUsers.map(u => u.name))
        const matchedUser = allUsers.find(user => 
          user.name.toLowerCase() === typedName.toLowerCase() && 
          user.id !== currentUser?.id &&
          user.organization_id === currentUser?.organization_id
        )
        console.log('Matched user:', matchedUser)
        if (matchedUser) {
          e.preventDefault()
          handleUserSelect(matchedUser.name) // Use original name with proper capitalization
          return
        }
      }
    } else if (e.key === 'ArrowDown') {
      if (showUserSuggestions && filteredUsers.length > 0) {
        e.preventDefault()
        setSelectedUserIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === 'ArrowUp') {
      if (showUserSuggestions && filteredUsers.length > 0) {
        e.preventDefault()
        setSelectedUserIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        )
      }
    } else if (e.key === 'Escape') {
      setShowUserSuggestions(false)
      setShowMentionHint(false)
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowUp') {
      // Cmd+Up to navigate up in user list
      console.log('Cmd+Up pressed, showUserSuggestions:', showUserSuggestions, 'filteredUsers:', filteredUsers.length, 'selectedUserIndex:', selectedUserIndex)
      if (showUserSuggestions && filteredUsers.length > 0) {
        e.preventDefault()
        setSelectedUserIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : filteredUsers.length - 1
          console.log('Updating selectedUserIndex from', prev, 'to', newIndex)
          return newIndex
        })
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowDown') {
      // Cmd+Down to navigate down in user list
      console.log('Cmd+Down pressed, showUserSuggestions:', showUserSuggestions, 'filteredUsers:', filteredUsers.length, 'selectedUserIndex:', selectedUserIndex)
      if (showUserSuggestions && filteredUsers.length > 0) {
        e.preventDefault()
        setSelectedUserIndex(prev => {
          const newIndex = prev < filteredUsers.length - 1 ? prev + 1 : 0
          console.log('Updating selectedUserIndex from', prev, 'to', newIndex)
          return newIndex
        })
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewTodo(value)
    
    // Handle URL detection - auto-convert URLs to badges
    const urls = detectAndExtractUrls(value)
    if (urls.length > 0) {
      // Add URLs to attached links
      setAttachedLinks(prev => [...prev, ...urls])
      // Remove URLs from the input text
      const textWithoutUrls = value.replace(/(https?:\/\/[^\s]+)/g, '').trim()
      setNewTodo(textWithoutUrls)
      return // Exit early since we've modified the input
    }
    
    // Handle user suggestions
    const atMatch = value.match(/@(\w*)$/)
    if (atMatch) {
      const query = atMatch[1].toLowerCase()
      const filtered = allUsers.filter(user => 
        user.name.toLowerCase().startsWith(query.toLowerCase()) && 
        user.id !== currentUser?.id && // Don't suggest current user
        user.organization_id === currentUser?.organization_id // Only show users from same organization
      )
      console.log('@ detected, query:', query, 'allUsers:', allUsers.length, 'filtered:', filtered.length)
      setFilteredUsers(filtered)
      setSelectedUserIndex(0) // Reset selection
      
      if (filtered.length === 1) {
        // Single match - show hint with remaining letters
        const matchedUser = filtered[0]
        const remainingLetters = matchedUser.name.substring(query.length)
        setAutoCompleteHint(remainingLetters)
        setShowMentionHint(true)
        setShowUserSuggestions(false)
      } else if (filtered.length > 1) {
        // Multiple matches - show dropdown
        setAutoCompleteHint('')
        setShowMentionHint(false)
        setShowUserSuggestions(true)
      } else {
        // No matches
        setAutoCompleteHint('')
        setShowMentionHint(false)
        setShowUserSuggestions(false)
      }
    } else {
      setAutoCompleteHint('')
      setShowMentionHint(false)
      setShowUserSuggestions(false)
    }
  }

  const getMentionedUser = () => {
    const match = newTodo.match(/@(\w+)/)
    if (match) {
      return match[1]
    }
    
    // For single user hint, always show the complete username
    if (filteredUsers.length === 1) {
      return filteredUsers[0].name
    }
    
    return null
  }

  const handleUserSelect = (userName: string) => {
    const atMatch = newTodo.match(/@(\w*)$/)
    if (atMatch) {
      const beforeAt = newTodo.substring(0, atMatch.index)
      const afterAt = newTodo.substring(atMatch.index! + atMatch[0].length)
      const newText = beforeAt + afterAt
      setNewTodo(newText)
      
      // Add the user to completed mentions
      if (!completedMentions.includes(userName)) {
        setCompletedMentions(prev => [...prev, userName])
      }
    }
    setShowUserSuggestions(false)
    setShowMentionHint(false)
    setAutoCompleteHint('')
    inputRef.current?.focus()
  }


  const handleLogin = async (name: string, password: string) => {
    if (!currentOrganization) return
    
    try {
      const user = await loginUser(name, password, currentOrganization.id)
      setCurrentUser({ ...user, organization_id: currentOrganization.id })
      
      // Add user to local users list for @ mentions
      if (!users.find(u => u.id === user.id)) {
        setUsers(prev => [...prev, { ...user, organization_id: currentOrganization.id }])
      }
    } catch (error) {
      alert('Invalid credentials')
    }
  }

  const handleRegister = async (name: string, password: string) => {
    if (!currentOrganization) return
    
    try {
      const newUser = await registerUser(name, password, currentOrganization.id)
      setCurrentUser({ ...newUser, organization_id: currentOrganization.id })
      setUsers(prev => [...prev, { ...newUser, organization_id: currentOrganization.id }])
      
      // Refresh the allUsers list to include the new user for @ mentions
      const orgUsers = await fetchUsersByOrganization(currentOrganization.id)
      setAllUsers(orgUsers)
    } catch (error) {
      alert('Failed to register user')
    }
  }

  // Organization selection step
  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xs font-normal text-center">Select Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center border border-input rounded-md bg-background focus-within:ring-1 focus-within:ring-ring">
              <div className="px-2 py-2 text-muted-foreground">@</div>
              <Input 
                id="org-domain" 
                placeholder="organization" 
                value={newOrgDomain}
                onChange={(e) => setNewOrgDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newOrgDomain.trim()) {
                    handleSelectOrganization()
                  }
                }}
                className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 flex-1 bg-transparent px-0 outline-none"
                autoComplete="off"
              />
            </div>
            
            <Button 
              onClick={() => {
                console.log('Button clicked, org name:', newOrgDomain.trim())
                handleSelectOrganization()
              }}
              disabled={!newOrgDomain.trim()}
              className="w-full cursor-pointer"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login/Register form
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <LoginForm onLogin={handleLogin} onRegister={handleRegister} />
      </div>
    )
  }

  // Filter todos for current user and sort them
  const userTodos = todos
.filter(todo => {
  // Check if current user is assigned to this todo (supports multiple assignees)
  const assignees = todo.assigned_to.split(', ').map(name => name.trim())
                return assignees.includes(currentUser.name) && todo.organization_id === currentUser.organization_id
})
    .sort((a, b) => {
      // Completed todos go to bottom
      if (a.completed && !b.completed) return 1
      if (!a.completed && b.completed) return -1
      // Within same completion status, newest first (by creation time)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-xs font-normal text-center">{currentOrganization.name}</h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setCurrentUser(null)
                setCurrentOrganization(null)
                setTodos([])
                setNewTodo('')
                setCompletedMentions([])
                setMyselfRemoved(false)
                setAutoCompleteHint('')
                setShowUserSuggestions(false)
                setShowMentionHint(false)
                setShakingTodos(new Set())
                localStorage.removeItem('currentUser')
              }}
              className="rounded-full"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-muted-foreground text-xs">
            Welcome, <span className="text-white">{currentUser.name}</span>! You have <span className="text-white">{userTodos.filter(t => !t.completed).length}</span> pending to-dos.
          </p>
        </div>
      </div>

      {/* Todo List */}
      <div className="flex-1 flex flex-col items-center px-4 pb-0 overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          {/* Pending Counter and Navigation Instruction */}
          <div className="mb-4 flex justify-between items-center">
            <Badge variant="secondary" className="text-xs font-normal">
              {userTodos.filter(t => !t.completed).length} pending
            </Badge>
            
            {/* Navigation keyboard shortcut instruction */}
            <p className="text-muted-foreground text-xs transform -translate-x-3.5 translate-y-1">
              Press{" "}
              <KbdGroup className="-ml-0.5">
                <Kbd>⌘</Kbd>
                <Kbd>↑</Kbd>
                <span className="text-muted-foreground text-xs mx-1">or</span>
                <Kbd>↓</Kbd>
              </KbdGroup>
            </p>
          </div>
          
          {/* Scrollable todo list */}
          <div className="max-h-[calc(100vh-22rem)] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
            {userTodos.length === 0 ? (
              <Card className="border border-border bg-card">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No todos yet. Add one below!</p>
                </CardContent>
              </Card>
            ) : (
              userTodos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  currentUser={currentUser}
                  onCompleteOrDelete={handleCompleteOrDelete}
                  onMoveToTop={handleMoveToTop}
                  isShaking={shakingTodos.has(todo.id)}
                  isSelected={selectedTodoIndex === index}
                  onSelect={(todoId) => {
                    const todoIndex = userTodos.findIndex(t => t.id === todoId)
                    console.log('Todo clicked, todoId:', todoId, 'todoIndex:', todoIndex)
                    if (todoIndex !== -1) {
                      setSelectedTodoIndex(todoIndex)
                    }
                  }}
                />
              ))
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Todo Input - Floating higher up */}
      <div className="fixed bottom-16 left-0 right-0 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Suggestion Tags */}
          <div className="mb-2 flex flex-wrap gap-2">
            {defaultSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="flex items-center justify-center w-8 h-8 bg-muted/50 hover:bg-muted border border-border rounded-md text-sm transition-colors cursor-pointer"
              >
                <span>{suggestion.emoji}</span>
              </button>
            ))}
          </div>
          
          <div className="relative">
            {/* Keyboard shortcut instruction - positioned absolutely above input */}
            <div className="absolute -top-7 right-2">
              <p className="text-muted-foreground text-xs">
                Press{" "}
                <Kbd className="mr-1">⌘</Kbd>
                <Kbd>K</Kbd>
              </p>
            </div>
            <div className="border border-input bg-background rounded-md h-20 p-3 grid grid-rows-2 gap-2 focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0">
              {/* Top row - Text input */}
              <div className="relative w-full">
                {/* Visible text with hint */}
                <div className="absolute inset-0 flex items-center pointer-events-none px-0 overflow-hidden">
                  <span className="text-sm text-foreground truncate">{newTodo}</span>
                  {autoCompleteHint && (
                    <span className="text-sm text-muted-foreground/60 whitespace-nowrap">{autoCompleteHint}</span>
                  )}
                </div>
                {/* Invisible input for typing */}
                <Input
                  ref={inputRef}
                  placeholder="Dump it ..."
                  value={newTodo}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onPaste={(e) => {
                    // Let the onChange handler handle URL detection automatically
                    // No need for special paste handling since onChange will catch URLs
                  }}
                  className="border-0 bg-transparent shadow-none text-sm placeholder:text-sm h-full w-full text-transparent caret-foreground px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 outline-none"
                  autoComplete="off"
                />
              </div>
              
              
              {/* Bottom row - Buttons */}
              <div className="flex items-center justify-end gap-2">
                {/* Default "Myself" badge - show unless manually removed */}
                {!myselfRemoved && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    <AtSign className="h-3 w-3 mr-1 text-muted-foreground" />
                    Myself
                    <button
                      type="button"
                      onClick={() => {
                        setMyselfRemoved(true)
                      }}
                      className="ml-1 hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {/* User mention badges */}
                {completedMentions.map((userName, index) => (
                  <Badge key={index} variant="secondary" className="text-xs font-normal">
                    <AtSign className="h-3 w-3 mr-1 text-muted-foreground" />
                    {userName}
                    <button
                      type="button"
                      onClick={() => {
                        setCompletedMentions(prev => prev.filter((_, i) => i !== index))
                      }}
                      className="ml-1 hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {/* Link badges */}
                {attachedLinks.map((url, index) => (
                  <Badge key={index} variant="secondary" className="text-xs font-normal">
                    <Paperclip className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    >
                      {url.length > 20 ? `${url.substring(0, 20)}...` : url}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedLinks(prev => prev.filter((_, i) => i !== index))
                      }}
                      className="ml-1 hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="outline"
                  className="rounded-full h-8 w-8 p-0"
                  onClick={handleAddTodo}
                  aria-label="Add todo"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* User Suggestions */}
            {(showUserSuggestions || showMentionHint) && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-muted rounded-md border z-20 shadow-lg max-h-48 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user.name)}
                    onMouseEnter={() => setSelectedUserIndex(index)}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 first:rounded-t-md last:rounded-b-md transition-colors cursor-pointer ${
                      index === selectedUserIndex 
                        ? 'bg-muted-foreground/20 text-foreground font-medium' 
                        : 'hover:bg-muted-foreground/10 hover:text-foreground'
                    }`}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TodoItem({ todo, currentUser, onCompleteOrDelete, onMoveToTop, isShaking, isSelected, onSelect }: {
  todo: Todo
  currentUser: User
  onCompleteOrDelete: (id: string) => void
  onMoveToTop: (id: string) => void
  isShaking: boolean
  isSelected: boolean
  onSelect: (todoId: string) => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(todo.id)}
    >
      
      {/* Up button - appears on hover (only for incomplete tasks) */}
      {isHovered && !todo.completed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMoveToTop(todo.id)}
          className="absolute top-2 right-2 z-10 h-6 w-6 p-0 bg-background border border-border shadow-sm hover:bg-muted cursor-pointer"
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
      )}
      
      <Item 
        variant="outline" 
        size="sm" 
        className={`transition-all duration-200 ${todo.completed ? 'opacity-60' : ''} ${isShaking ? 'shake' : ''} ${isSelected ? 'bg-primary/10 border-primary shadow-md' : isHovered ? 'bg-muted shadow-md border-border/80' : 'bg-muted/50'} gap-2`}
      >
      <ItemContent>
        <ItemTitle className={`text-sm font-normal ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
          {todo.text}
        </ItemTitle>
        <ItemDescription className="mt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>
              {todo.assigned_to.split(', ').map((name, index) => {
                const isCompleted = todo.completed_by ? todo.completed_by.split(', ').includes(name.trim()) : false
                return (
                  <span key={index}>
                    <span className={isCompleted ? 'line-through text-muted-foreground' : 'text-white'}>{name.trim()}</span>
                    {index < todo.assigned_to.split(', ').length - 1 && ', '}
                  </span>
                )
              })}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground/60">Assigned by {todo.created_by}</span>
            
            {/* Link badges - inline with assignee info */}
            {todo.attached_links && todo.attached_links.length > 0 && (
              <>
                <span className="text-muted-foreground/60">•</span>
                <div className="flex items-center gap-1">
                  {todo.attached_links.map((url, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs font-normal cursor-pointer hover:bg-muted-foreground/20"
                      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    >
                      <Paperclip className="h-3 w-3 mr-1" />
                      {url.length > 25 ? `${url.substring(0, 25)}...` : url}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCompleteOrDelete(todo.id)}
          className="h-6 px-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {(() => {
            if (todo.completed) return 'Delete'
            const completedBy = todo.completed_by ? todo.completed_by.split(', ').map(name => name.trim()) : []
            const isCurrentUserCompleted = completedBy.includes(currentUser.name)
            return isCurrentUserCompleted ? 'Undo' : 'Complete'
          })()}
        </Button>
      </ItemActions>
      </Item>
    </div>
  )
}

function LoginForm({ onLogin, onRegister }: {
  onLogin: (name: string, password: string) => void
  onRegister: (name: string, password: string) => void
}) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length === 4) {
      if (isLogin) {
        onLogin(name, password)
      } else {
        onRegister(name, password)
      }
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs"
                required
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Password</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={4} value={password} onChange={setPassword} autoComplete="off">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-6 flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full text-xs" 
            disabled={password.length !== 4}
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-xs"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </Button>
        </div>
      </form>
    </Card>
  )
}