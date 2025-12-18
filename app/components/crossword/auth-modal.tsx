'use client'

/**
 * Auth Modal for Crossword Streak Mode
 * Handles login, registration, and forgot password
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Flame, Loader2, ArrowLeft, KeyRound, CheckCircle, ShieldCheck } from 'lucide-react'
import { AvatarSelector, CrosswordAvatar } from './avatars'
import { register, login, forgotPassword } from '../../lib/crossword/streak-api'
import type { CrosswordUser } from '../../lib/crossword/streak-api'
import { api } from '../../lib/api'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: CrosswordUser) => void
}

type AuthMode = 'login' | 'register' | 'forgot-password'

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-1')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [isValidatingEmail, setIsValidatingEmail] = useState(false)

  // Validate email using the email validation API
  const validateEmail = async (emailToValidate: string): Promise<boolean> => {
    try {
      const response = await api.post('/email-validation/validate', { email: emailToValidate })
      // Response structure: { success: true, data: { valid: true, source: '...', checks: {...} } }
      if (response.data.success && response.data.data?.valid) {
        return true
      }
      // If not valid, show the reason
      if (response.data.data?.reason) {
        setError(`Invalid email: ${response.data.data.reason}`)
      } else if (response.data.error) {
        setError(response.data.error)
      } else {
        setError('Please provide a valid email address.')
      }
      return false
    } catch {
      // If validation service fails, allow registration to proceed
      // (don't block user due to validation service issues)
      console.warn('Email validation service unavailable, proceeding...')
      return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      if (mode === 'register') {
        // Validate email first for registration
        setIsValidatingEmail(true)
        const isEmailValid = await validateEmail(email)
        setIsValidatingEmail(false)
        
        if (!isEmailValid) {
          setIsLoading(false)
          return
        }
        
        const { user } = await register(email, password, selectedAvatar)
        onSuccess(user)
        onClose()
      } else if (mode === 'login') {
        const { user } = await login(email, password)
        onSuccess(user)
        onClose()
      } else if (mode === 'forgot-password') {
        const message = await forgotPassword(email)
        setSuccessMessage(message)
        // Don't close modal - show success message
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setIsValidatingEmail(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError(null)
    setSuccessMessage(null)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
            {mode === 'forgot-password' ? (
              <button
                onClick={() => switchMode('login')}
                className="absolute top-4 left-4 p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                {mode === 'forgot-password' ? (
                  <KeyRound className="w-8 h-8" />
                ) : (
                  <Flame className="w-8 h-8" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {mode === 'login' 
                    ? 'Welcome Back!' 
                    : mode === 'register' 
                      ? 'Join Streak Mode'
                      : 'Reset Password'}
                </h2>
                <p className="text-sm text-white/80">
                  {mode === 'login' 
                    ? 'Login to continue your streak' 
                    : mode === 'register'
                      ? 'Create account to track your progress'
                      : 'We\'ll send you a reset link'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message (for forgot password) */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                      Check your email
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                      {successMessage}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="mt-4 w-full py-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                >
                  ← Back to Login
                </button>
              </motion.div>
            )}

            {/* Only show form if no success message */}
            {!successMessage && (
              <>
                {/* Avatar Selection (Register only) */}
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Choose Your Avatar
                    </label>
                    <AvatarSelector
                      selectedAvatar={selectedAvatar}
                      onSelect={setSelectedAvatar}
                    />
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Password Input (not for forgot password) */}
                {mode !== 'forgot-password' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot-password')}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
                        className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Notice (Register only) */}
                {mode === 'register' && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Your password is encrypted and stored securely. We never store plain-text passwords.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isValidatingEmail ? 'Validating email...' : 'Please wait...'}
                    </>
                  ) : mode === 'login' ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      Login
                    </>
                  ) : mode === 'register' ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </motion.button>

                {/* Switch Mode */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {mode === 'login' ? (
                    <>
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                      >
                        Sign up
                      </button>
                    </>
                  ) : mode === 'register' ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                      >
                        Login
                      </button>
                    </>
                  ) : null}
                </div>
              </>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Compact user info display with avatar
interface UserInfoBadgeProps {
  user: CrosswordUser
  onLogout: () => void
  onClick?: () => void
}

export const UserInfoBadge = ({ user, onLogout, onClick }: UserInfoBadgeProps) => (
  <div className="flex items-center gap-3 p-2 bg-white/10 dark:bg-dark-elevated/30 rounded-xl">
    <CrosswordAvatar
      avatarId={user.avatar}
      size={40}
      onClick={onClick}
      className="cursor-pointer"
    />
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 dark:text-white truncate">
        {user.username}
      </p>
      <div className="flex items-center gap-1 text-sm text-orange-500">
        <Flame className="w-4 h-4" />
        <span>{user.stats.currentStreak} day streak</span>
      </div>
    </div>
    <button
      onClick={onLogout}
      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
    >
      Logout
    </button>
  </div>
)

export default AuthModal

