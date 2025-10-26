"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Paperclip, User, Clock } from 'lucide-react'

interface Todo {
  id: string
  text: string
  assigned_to: string
  created_by: string
  organization_id: string
  due_date: string
  completed: boolean
  completed_by: string
  attached_links: string[]
  created_at: string
}

interface User {
  id: string
  name: string
  organization_id: string
}

interface Comment {
  id: string
  todo_id: string
  user_id: string
  user_name: string
  text: string
  attached_links: string[]
  created_at: string
}

const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function TodoDetail() {
  const router = useRouter()
  const params = useParams()
  const [todo, setTodo] = useState<Todo | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentLinks, setCommentLinks] = useState<string[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [showUserSuggestions, setShowUserSuggestions] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUserIndex, setSelectedUserIndex] = useState(0)
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([])

  useEffect(() => {
    // Load current user from localStorage
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser({ ...user, name: capitalizeWords(user.name) })
    }
  }, [])

  useEffect(() => {
    if (!params.id || !currentUser) return

    // Fetch all data in parallel for faster loading
    Promise.all([
      fetch(`/api/todos?id=${params.id}`).then(res => res.json()),
      fetch(`/api/comments?todoId=${params.id}`).then(res => res.json()),
      fetch(`/api/organizations/users?organizationId=${currentUser.organization_id}`).then(res => res.json())
    ])
      .then(([todoData, commentsData, usersData]) => {
        // Set todo data
        setTodo(todoData)
        
        // Set comments data
        setComments(Array.isArray(commentsData) ? commentsData : [])
        
        // Set users data
        if (Array.isArray(usersData)) {
          const capitalizedUsers = usersData.map((u: User) => ({ 
            ...u, 
            name: capitalizeWords(u.name) 
          }))
          setAllUsers(capitalizedUsers)
        }
        
        // Mark item as viewed
        fetch('/api/user-views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, todoId: params.id })
        }).catch(err => console.error('Failed to update view:', err))
        
        // All data loaded, hide skeleton
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch data:', err)
        setLoading(false)
      })
  }, [params.id, currentUser])

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser || !todo) return

    try {
      // Submit comment
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          todo_id: todo.id,
          user_id: currentUser.id,
          user_name: currentUser.name,
          text: newComment,
          attached_links: commentLinks
        })
      })

      if (response.ok) {
        const comment = await response.json()
        setComments(prev => [...prev, comment])

        // Add mentioned users to the todo if they're not already assigned
        if (mentionedUsers.length > 0) {
          const currentAssignees = todo.assigned_to.split(', ').map(name => name.trim().toLowerCase())
          const newAssignees = mentionedUsers.filter(name => 
            !currentAssignees.includes(name.toLowerCase())
          )

          if (newAssignees.length > 0) {
            const updatedAssignedTo = [...todo.assigned_to.split(', '), ...newAssignees].join(', ')
            
            // Update todo with new assignees
            await fetch('/api/todos', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: todo.id,
                assigned_to: updatedAssignedTo
              })
            })

            // Update local todo state
            setTodo(prev => prev ? { ...prev, assigned_to: updatedAssignedTo } : null)
          }
        }

        setNewComment('')
        setCommentLinks([])
        setMentionedUsers([])
      }
    } catch (err) {
      console.error('Failed to create comment:', err)
    }
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNewComment(value)

    // Check for @ mentions
    const words = value.split(/\s/)
    const lastWord = words[words.length - 1]

    if (lastWord.startsWith('@')) {
      // Add Dooo (AI assistant) to the user list
      const doooUser = {
        id: 'dooo-ai',
        name: 'Dooo',
        organization_id: '',
        created_at: new Date().toISOString()
      }
      const usersWithDooo = [...allUsers, doooUser]
      
      if (lastWord.length === 1) {
        // Show all users when just @ is typed
        setFilteredUsers(usersWithDooo)
        setShowUserSuggestions(usersWithDooo.length > 0)
        setSelectedUserIndex(0)
      } else {
        // Filter users based on search term
        const searchTerm = lastWord.substring(1).toLowerCase()
        const matches = usersWithDooo.filter(user =>
          user.name.toLowerCase().includes(searchTerm)
        )
        setFilteredUsers(matches)
        setShowUserSuggestions(matches.length > 0)
        setSelectedUserIndex(0)
      }
    } else {
      setShowUserSuggestions(false)
    }

    // Extract all mentioned users from the text
    const mentions = value.match(/@(\w+)/g)
    if (mentions) {
      const userNames = mentions
        .map(m => m.substring(1))
        .map(name => {
          const user = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase())
          return user ? user.name : null
        })
        .filter(Boolean) as string[]
      setMentionedUsers(userNames)
    } else {
      setMentionedUsers([])
    }
  }

  const handleUserSelect = (userName: string) => {
    const words = newComment.split(/\s/)
    words[words.length - 1] = `@${userName}`
    setNewComment(words.join(' ') + ' ')
    setShowUserSuggestions(false)
    
    // Add to mentioned users
    if (!mentionedUsers.includes(userName)) {
      setMentionedUsers(prev => [...prev, userName])
    }
  }

  const handleCommentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData?.getData('text')
    if (pastedText) {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      if (urlRegex.test(pastedText.trim())) {
        e.preventDefault()
        setCommentLinks(prev => [...prev, pastedText.trim()])
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col animate-in fade-in duration-300">
        {/* Header skeleton */}
        <div className="pt-8 pb-6">
          <div className="container mx-auto max-w-4xl px-4">
            <Skeleton className="h-9 w-20 mb-2" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 flex flex-col items-center pb-0">
          <div className="container mx-auto max-w-4xl px-4">
            {/* Title skeleton */}
            <div className="mb-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Activity section skeleton */}
            <div className="border-t border-border pt-6">
              <Skeleton className="h-5 w-20 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-[60px] w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Todo not found</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const assignees = todo.assigned_to.split(', ').map(name => name.trim())
  const completedBy = todo.completed_by ? todo.completed_by.split(', ').map(name => name.trim()) : []

  return (
    <div className="min-h-screen bg-background flex flex-col animate-in fade-in duration-500">
      {/* Header - matching main page height */}
      <div className="pt-8 pb-6">
        <div className="container mx-auto max-w-4xl px-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-2 -ml-3"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Detail Content - matching list start position */}
      <div className="flex-1 flex flex-col items-center pb-0">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Todo title */}
          <div className="mb-6">
            <h1 className="text-base mb-2">{todo.text}</h1>
            
            {/* Single horizontal metadata line - exactly like item cards */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>
                {todo.assigned_to.split(', ').map((name, index) => {
                  const isCompleted = completedBy.includes(name.trim())
                  return (
                    <span key={index}>
                      <span className={isCompleted ? 'line-through text-muted-foreground' : 'text-white'}>{capitalizeWords(name.trim())}</span>
                      {index < todo.assigned_to.split(', ').length - 1 && ', '}
                    </span>
                  )
                })}
              </span>
              
              {todo.attached_links && todo.attached_links.length > 0 && (
                <>
                  <span className="text-muted-foreground/60">•</span>
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
                </>
              )}
            </div>
          </div>

          {/* Activity section */}
          <div className="border-t border-border pt-6">
            <div className="mb-4">
              <h2 className="text-sm font-medium">Activity</h2>
            </div>

            {/* Activity item - Todo created */}
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-3 w-3 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground/60">
                <span className="text-foreground">{capitalizeWords(todo.created_by)}</span> created the item
              </p>
            </div>

            {/* Comments list */}
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-center gap-2 mb-4">
                <User className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground">{capitalizeWords(comment.user_name)}</span> {comment.text}
                  {comment.attached_links && comment.attached_links.length > 0 && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      {comment.attached_links.map((url, index) => (
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
                    </span>
                  )}
                </p>
              </div>
            ))}

            {/* Comment input */}
            <div className="mt-6 relative">
              {commentLinks.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {commentLinks.map((url, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs font-normal cursor-pointer hover:bg-muted-foreground/20"
                      onClick={() => setCommentLinks(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Paperclip className="h-3 w-3 mr-1" />
                      {url.length > 25 ? `${url.substring(0, 25)}...` : url}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* User suggestions dropdown */}
              {showUserSuggestions && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user.name)}
                      className={`px-3 py-2 text-xs cursor-pointer ${
                        index === selectedUserIndex ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      {user.name}
                    </div>
                  ))}
                </div>
              )}
              
              <textarea
                placeholder="Leave a comment..."
                value={newComment}
                onChange={handleCommentChange}
                className="w-full min-h-[60px] bg-muted/50 border border-border rounded-md px-3 py-2 pr-10 pb-8 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                onPaste={handleCommentPaste}
                onKeyDown={(e) => {
                  if (showUserSuggestions) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setSelectedUserIndex(prev => 
                        prev < filteredUsers.length - 1 ? prev + 1 : 0
                      )
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setSelectedUserIndex(prev => 
                        prev > 0 ? prev - 1 : filteredUsers.length - 1
                      )
                    } else if (e.key === 'Enter') {
                      e.preventDefault()
                      handleUserSelect(filteredUsers[selectedUserIndex].name)
                    } else if (e.key === 'Escape') {
                      setShowUserSuggestions(false)
                    }
                  } else if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment()
                  }
                }}
              />
              <button 
                onClick={handleSubmitComment}
                className="absolute bottom-[1rem] right-3 h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border rounded-full"
                aria-label="Submit comment"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

