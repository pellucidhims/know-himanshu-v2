'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertCircle, Loader2, User, Sparkles } from 'lucide-react'
import { CrosswordAvatar, AVATAR_IDS } from './avatars'
import { 
  CrosswordUser,
  checkUsernameAvailability,
  updateProfile,
  getStoredUser,
} from '../../lib/crossword/streak-api'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: CrosswordUser
  onProfileUpdate: (updatedUser: Partial<CrosswordUser>) => void
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const ProfileEditModal = ({ isOpen, onClose, user, onProfileUpdate }: ProfileEditModalProps) => {
  const [username, setUsername] = useState(user?.username || '')
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar-1')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean | null
    message: string
  }>({ available: null, message: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Debounced username for API check
  const debouncedUsername = useDebounce(username, 500)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username || '')
      setSelectedAvatar(user.avatar || 'avatar-1')
      setUsernameStatus({ available: null, message: '' })
      setError('')
      setSuccess('')
    }
  }, [isOpen, user])

  // Check username availability when debounced value changes
  useEffect(() => {
    const checkUsername = async () => {
      // Skip if username is same as current or empty
      if (!debouncedUsername || debouncedUsername.toLowerCase() === user?.username?.toLowerCase()) {
        setUsernameStatus({ available: null, message: '' })
        return
      }

      // Validate format first
      const usernameRegex = /^[a-zA-Z0-9_.$]+$/
      if (!usernameRegex.test(debouncedUsername)) {
        setUsernameStatus({
          available: false,
          message: 'Only letters, numbers, _, ., and $ are allowed',
        })
        return
      }

      if (debouncedUsername.length < 3) {
        setUsernameStatus({
          available: false,
          message: 'Username must be at least 3 characters',
        })
        return
      }

      if (debouncedUsername.length > 30) {
        setUsernameStatus({
          available: false,
          message: 'Username must be at most 30 characters',
        })
        return
      }

      setIsCheckingUsername(true)
      try {
        const result = await checkUsernameAvailability(debouncedUsername)
        setUsernameStatus(result)
      } catch {
        setUsernameStatus({ available: false, message: 'Failed to check availability' })
      } finally {
        setIsCheckingUsername(false)
      }
    }

    checkUsername()
  }, [debouncedUsername, user?.username])

  const handleSave = async () => {
    setError('')
    setSuccess('')

    // Check if anything changed
    const usernameChanged = username.toLowerCase() !== user?.username?.toLowerCase()
    const avatarChanged = selectedAvatar !== user?.avatar

    if (!usernameChanged && !avatarChanged) {
      setError('No changes to save')
      return
    }

    // Validate username if changed
    if (usernameChanged) {
      if (usernameStatus.available === false) {
        setError(usernameStatus.message || 'Please choose a valid username')
        return
      }
      if (usernameStatus.available === null && username !== user?.username) {
        setError('Please wait for username validation')
        return
      }
    }

    setIsLoading(true)

    try {
      const updates: { username?: string; avatar?: string } = {}
      if (usernameChanged) updates.username = username
      if (avatarChanged) updates.avatar = selectedAvatar

      const result = await updateProfile(updates)
      
      // Update parent component
      onProfileUpdate({
        username: result.username,
        avatar: result.avatar,
      })

      setSuccess(result.message || 'Profile updated successfully!')
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remove commas and other disallowed characters
    const sanitized = value.replace(/[^a-zA-Z0-9_.$]/g, '')
    setUsername(sanitized)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        // onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-dark-elevated rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Profile
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Avatar
              </label>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <CrosswordAvatar avatarId={selectedAvatar} size={80} />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-green-500 rounded-full">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_IDS.map((avatarId) => (
                  <button
                    key={avatarId}
                    type="button"
                    onClick={() => setSelectedAvatar(avatarId)}
                    className={`p-1 rounded-xl transition-all ${
                      selectedAvatar === avatarId
                        ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-dark-elevated scale-110'
                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <CrosswordAvatar avatarId={avatarId} size={40} />
                  </button>
                ))}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Enter username"
                  maxLength={30}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                    usernameStatus.available === true
                      ? 'border-green-300 focus:border-green-500 bg-green-50 dark:bg-green-900/20'
                      : usernameStatus.available === false
                      ? 'border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-dark-border focus:border-purple-500 bg-white dark:bg-dark-bg'
                  } text-gray-900 dark:text-white`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingUsername ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : usernameStatus.available === true ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : usernameStatus.available === false ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              {/* Username validation message */}
              {usernameStatus.message && (
                <p className={`mt-1 text-xs ${
                  usernameStatus.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {usernameStatus.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Allowed: letters, numbers, underscore (_), dot (.), dollar ($)
              </p>
            </div>

            {/* Current User Info */}
            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Profile</p>
              <div className="flex items-center gap-3">
                <CrosswordAvatar avatarId={user?.avatar || 'avatar-1'} size={32} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-dark-border">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || (usernameStatus.available === false)}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProfileEditModal

