/**
 * Crossword Streak API
 * Client-side API for authentication, streak tracking, and leaderboard
 */

import { api } from '../api'
import { AxiosError } from 'axios'

// Helper to extract user-friendly error messages from API errors
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AxiosError) {
    // Try to get error message from response data
    const responseError = error.response?.data?.error
    if (responseError && typeof responseError === 'string') {
      return responseError
    }
    // Common HTTP status code messages
    const status = error.response?.status
    switch (status) {
      case 400:
        return responseError || 'Invalid request. Please check your input.'
      case 401:
        return responseError || 'Invalid credentials. Please try again.'
      case 403:
        return 'Access denied. Please login again.'
      case 404:
        return 'Service not found. Please try again later.'
      case 429:
        return responseError || 'Too many requests. Please wait a moment.'
      case 500:
        return 'Server error. Please try again later.'
      case 503:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return responseError || defaultMessage
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return defaultMessage
}

// ==========================================
// Types
// ==========================================

export interface CrosswordUser {
  id: string
  email: string
  username: string
  avatar: string
  stats: UserStats
  createdAt?: string
}

export interface UserStats {
  currentStreak: number
  longestStreak: number
  totalPuzzlesSolved: number
  totalAttempts: number
  averageTimeSeconds: number
  lastPlayedDate: string | null
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar: string
  currentStreak: number
  longestStreak: number
  averageTime: number
  totalSolved: number
  isCurrentUser: boolean
}

export interface LeaderboardResponse {
  sortBy: 'streak' | 'time'
  leaderboard: LeaderboardEntry[]
  currentUserRank: LeaderboardEntry | null
}

export interface GameHistoryEntry {
  puzzleDate: string
  completed: boolean
  attempts: number
  timeToComplete: number | null
  gridState: string[][]
  timerState: number
  completedAt: string | null
}

export interface AuthResponse {
  user: CrosswordUser
  token: string
}

// ==========================================
// Token Management
// ==========================================

const TOKEN_KEY = 'crossword_auth_token'
const USER_KEY = 'crossword_user'

export const saveAuthData = (token: string, user: CrosswordUser) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const getStoredUser = (): CrosswordUser | null => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const clearAuthData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// ==========================================
// Auth API Functions
// ==========================================

export const register = async (
  email: string,
  password: string,
  avatar?: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post('/crossword-auth/register', {
      email,
      password,
      avatar,
    })
    
    if (response.data.success) {
      const { user, token } = response.data.data
      saveAuthData(token, user)
      return { user, token }
    }
    
    throw new Error(response.data.error || 'Registration failed')
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Registration failed. Please try again.'))
  }
}

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post('/crossword-auth/login', {
      email,
      password,
    })
    
    if (response.data.success) {
      const { user, token } = response.data.data
      saveAuthData(token, user)
      return { user, token }
    }
    
    throw new Error(response.data.error || 'Login failed')
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Login failed. Please check your credentials.'))
  }
}

export const logout = () => {
  clearAuthData()
}

export const verifyToken = async (): Promise<CrosswordUser | null> => {
  const token = getAuthToken()
  if (!token) return null
  
  try {
    const response = await api.post('/crossword-auth/verify-token', {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    
    if (response.data.success) {
      const user = response.data.data.user
      saveAuthData(token, user)
      return user
    }
    
    clearAuthData()
    return null
  } catch {
    clearAuthData()
    return null
  }
}

export const getProfile = async (): Promise<CrosswordUser> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  const response = await api.get('/crossword-auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  
  if (response.data.success) {
    return response.data.data
  }
  
  throw new Error(response.data.error || 'Failed to fetch profile')
}

export const updateAvatar = async (avatar: string): Promise<string> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  const response = await api.patch('/crossword-auth/avatar', { avatar }, {
    headers: { Authorization: `Bearer ${token}` },
  })
  
  if (response.data.success) {
    // Update stored user
    const user = getStoredUser()
    if (user) {
      user.avatar = response.data.data.avatar
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    return response.data.data.avatar
  }
  
  throw new Error(response.data.error || 'Failed to update avatar')
}

export const checkUsernameAvailability = async (username: string): Promise<{ available: boolean; message: string }> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  try {
    const response = await api.get(`/crossword-auth/check-username/${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    
    if (response.data.success) {
      return response.data.data
    }
    
    return { available: false, message: response.data.error || 'Failed to check username' }
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to check username availability')
    return { available: false, message }
  }
}

export const updateUsername = async (username: string): Promise<{ username: string; message: string }> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  try {
    const response = await api.patch('/crossword-auth/username', { username }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    
    if (response.data.success) {
      // Update stored user
      const user = getStoredUser()
      if (user) {
        user.username = response.data.data.username
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      }
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to update username')
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update username'))
  }
}

export const updateProfile = async (data: { username?: string; avatar?: string }): Promise<{ username: string; avatar: string; message: string }> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  try {
    const response = await api.patch('/crossword-auth/profile', data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    
    if (response.data.success) {
      // Update stored user
      const user = getStoredUser()
      if (user) {
        if (response.data.data.username) user.username = response.data.data.username
        if (response.data.data.avatar) user.avatar = response.data.data.avatar
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      }
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to update profile')
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update profile'))
  }
}

export const getAvatars = async (): Promise<string[]> => {
  const response = await api.get('/crossword-auth/avatars')
  
  if (response.data.success) {
    return response.data.data
  }
  
  return ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 
          'avatar-6', 'avatar-7', 'avatar-8', 'avatar-9', 'avatar-10']
}

// ==========================================
// Streak API Functions
// ==========================================

export const saveProgress = async (
  puzzleDate: string,
  gridState: string[][],
  timerState: number,
  attempts: number
): Promise<void> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  await api.post('/crossword-streak/save-progress', {
    puzzleDate,
    gridState,
    timerState,
    attempts,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export const completePuzzle = async (
  puzzleDate: string,
  attempts: number,
  timeToComplete: number,
  gridState?: string[][]
): Promise<{ stats: UserStats }> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  const response = await api.post('/crossword-streak/complete', {
    puzzleDate,
    attempts,
    timeToComplete,
    gridState,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  })
  
  if (response.data.success) {
    // Update stored user stats
    const user = getStoredUser()
    if (user) {
      user.stats = response.data.data.stats
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    return response.data.data
  }
  
  throw new Error(response.data.error || 'Failed to complete puzzle')
}

export const recordAttempt = async (puzzleDate: string): Promise<number> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  const response = await api.post('/crossword-streak/record-attempt', {
    puzzleDate,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  })
  
  if (response.data.success) {
    return response.data.data.attempts
  }
  
  throw new Error(response.data.error || 'Failed to record attempt')
}

export const getMyStats = async (): Promise<{
  stats: UserStats
  todayGame: GameHistoryEntry | null
  recentGames: GameHistoryEntry[]
}> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  const response = await api.get('/crossword-streak/my-stats', {
    headers: { Authorization: `Bearer ${token}` },
  })
  
  if (response.data.success) {
    return response.data.data
  }
  
  throw new Error(response.data.error || 'Failed to fetch stats')
}

export const loadGame = async (puzzleDate: string): Promise<GameHistoryEntry | null> => {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  
  const response = await api.get(`/crossword-streak/load-game/${puzzleDate}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  
  if (response.data.success) {
    return response.data.data
  }
  
  return null
}

export const getLeaderboard = async (
  sortBy: 'streak' | 'time' = 'streak'
): Promise<LeaderboardResponse> => {
  const token = getAuthToken()
  
  const response = await api.get('/crossword-streak/leaderboard', {
    params: { sortBy },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  
  if (response.data.success) {
    return response.data.data
  }
  
  throw new Error(response.data.error || 'Failed to fetch leaderboard')
}

// ==========================================
// Password Reset API Functions
// ==========================================

export const forgotPassword = async (email: string): Promise<string> => {
  try {
    const response = await api.post('/crossword-auth/forgot-password', { email })
    
    if (response.data.success) {
      return response.data.data.message
    }
    
    throw new Error(response.data.error || 'Failed to send reset email')
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to send reset email. Please try again.'))
  }
}

export const verifyResetToken = async (token: string): Promise<{ valid: boolean; email: string }> => {
  try {
    const response = await api.get(`/crossword-auth/verify-reset-token/${token}`)
    
    if (response.data.success) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Invalid or expired token')
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Invalid or expired reset link.'))
  }
}

export const resetPassword = async (token: string, password: string): Promise<string> => {
  try {
    const response = await api.post('/crossword-auth/reset-password', { token, password })
    
    if (response.data.success) {
      return response.data.data.message
    }
    
    throw new Error(response.data.error || 'Failed to reset password')
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to reset password. Please try again.'))
  }
}

