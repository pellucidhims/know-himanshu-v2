'use client'

/**
 * Password Reset Page
 * Handles the password reset flow when user clicks the email link
 */

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { verifyResetToken, resetPassword } from '../../../lib/crossword/streak-api'

type ResetState = 'loading' | 'valid' | 'invalid' | 'success' | 'error'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [state, setState] = useState<ResetState>('loading')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verify token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setState('invalid')
        return
      }

      try {
        const result = await verifyResetToken(token)
        if (result.valid) {
          setMaskedEmail(result.email)
          setState('valid')
        } else {
          setState('invalid')
        }
      } catch {
        setState('invalid')
      }
    }

    checkToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword(token!, password)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
      setState('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Loading State */}
        {state === 'loading' && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-emerald-500 animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying reset link...</p>
          </div>
        )}

        {/* Invalid Token */}
        {state === 'invalid' && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Invalid or Expired Link
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/games/crossword"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Crossword
            </Link>
          </div>
        )}

        {/* Valid Token - Show Reset Form */}
        {(state === 'valid' || state === 'error') && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <KeyRound className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Reset Password</h1>
                  <p className="text-sm text-white/80">For {maskedEmail}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p className={password.length >= 6 ? 'text-emerald-500' : ''}>
                  ✓ At least 6 characters
                </p>
                <p className={password && password === confirmPassword ? 'text-emerald-500' : ''}>
                  ✓ Passwords match
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || password.length < 6 || password !== confirmPassword}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Reset Password
                  </>
                )}
              </motion.button>
            </form>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </motion.div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Password Reset!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <button
              onClick={() => router.push('/games/crossword')}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Go to Crossword
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

