'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, X, Check, AlertCircle } from 'lucide-react'
import { api } from '../../lib/api'

interface NotificationState {
  permission: NotificationPermission | 'unsupported'
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Convert a base64 string to Uint8Array (for VAPID key)
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Notification Permission Prompt Component
 * Allows users to subscribe/unsubscribe from push notifications
 */
export const NotificationPrompt = ({ 
  onClose,
  userId 
}: { 
  onClose?: () => void
  userId?: string 
}) => {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSubscribed: false,
    isLoading: true,
    error: null,
  })
  const [showSuccess, setShowSuccess] = useState(false)

  // Check current notification state
  const checkNotificationState = useCallback(async () => {
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setState(prev => ({ 
        ...prev, 
        permission: 'unsupported', 
        isLoading: false 
      }))
      return
    }

    const permission = Notification.permission
    
    // Check if already subscribed
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      setState({
        permission,
        isSubscribed: !!subscription,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('[Notification] Error checking state:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to check notification status' 
      }))
    }
  }, [])

  useEffect(() => {
    checkNotificationState()
  }, [checkNotificationState])

  // Subscribe to notifications
  const subscribe = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Request permission first
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        setState(prev => ({ 
          ...prev, 
          permission, 
          isLoading: false,
          error: permission === 'denied' 
            ? 'Notifications blocked. Please enable in browser settings.' 
            : 'Notification permission not granted'
        }))
        return
      }

      // Get VAPID public key from server
      const vapidResponse = await api.get('/push/vapid-public-key')
      if (!vapidResponse.data.success) {
        throw new Error('Failed to get VAPID key')
      }
      const vapidPublicKey = vapidResponse.data.data.publicKey

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready
      
      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Send subscription to server
      const subscriptionJson = subscription.toJSON()
      await api.post('/push/subscribe', {
        subscription: {
          endpoint: subscriptionJson.endpoint,
          expirationTime: subscriptionJson.expirationTime,
          keys: subscriptionJson.keys,
        },
        preferences: {
          dailyReminder: true,
          reminderHour: 17, // 5PM
          timezoneOffset: 330, // IST
        },
        userAgent: navigator.userAgent,
      })

      setState({
        permission: 'granted',
        isSubscribed: true,
        isLoading: false,
        error: null,
      })
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      // Send a test notification
      try {
        await api.post('/push/test', {
          endpoint: subscriptionJson.endpoint,
        })
      } catch (e) {
        console.log('[Notification] Test notification failed (non-critical)')
      }
    } catch (error: any) {
      console.error('[Notification] Subscribe error:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to enable notifications' 
      }))
    }
  }

  // Unsubscribe from notifications
  const unsubscribe = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe()
        
        // Remove from server
        await api.post('/push/unsubscribe', {
          endpoint: subscription.endpoint,
        })
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
        error: null,
      }))
    } catch (error: any) {
      console.error('[Notification] Unsubscribe error:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to disable notifications' 
      }))
    }
  }

  // Render unsupported state
  if (state.permission === 'unsupported') {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center">
        <BellOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Push notifications are not supported in this browser.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${
          state.isSubscribed 
            ? 'bg-green-500' 
            : 'bg-purple-500'
        }`}>
          {state.isSubscribed ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <Bell className="w-5 h-5 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm">
            {state.isSubscribed ? 'Notifications Enabled' : 'Daily Reminders'}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
            {state.isSubscribed 
              ? "You'll receive a reminder at 5PM IST if you haven't completed the puzzle."
              : "Get notified at 5PM IST to complete your daily crossword and maintain your streak!"
            }
          </p>
          
          {state.error && (
            <div className="flex items-center gap-1 mt-2 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              {state.error}
            </div>
          )}

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 mt-2 text-green-500 text-xs"
            >
              <Check className="w-3 h-3" />
              Notifications enabled! You'll receive a test notification shortly.
            </motion.div>
          )}
          
          <div className="mt-3 flex gap-2">
            {state.isSubscribed ? (
              <button
                onClick={unsubscribe}
                disabled={state.isLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <BellOff className="w-3 h-3" />
                {state.isLoading ? 'Disabling...' : 'Disable Notifications'}
              </button>
            ) : (
              <button
                onClick={subscribe}
                disabled={state.isLoading || state.permission === 'denied'}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                <Bell className="w-3 h-3" />
                {state.isLoading ? 'Enabling...' : 'Enable Notifications'}
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Floating notification bell button for quick access
 * Only shows for logged-in users in streak mode
 */
export const NotificationBellButton = ({ 
  className = '',
  isLoggedIn = false,
  userId,
}: { 
  className?: string
  isLoggedIn?: boolean
  userId?: string
}) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Don't check if not logged in
    if (!isLoggedIn) return
    
    const checkSubscription = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return
      }
      
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (e) {
        console.error('Error checking subscription:', e)
      }
    }
    
    checkSubscription()
  }, [isLoggedIn])

  // Don't show if not logged in
  if (!isLoggedIn) {
    return null
  }

  if (isSubscribed === null) {
    return null // Still loading
  }

  return (
    <>
      <motion.button
        onClick={() => setShowPrompt(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-2 rounded-lg transition-colors ${
          isSubscribed 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400'
        } ${className}`}
        title={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
      >
        <Bell className="w-5 h-5" />
        {!isSubscribed && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </motion.button>

      {/* Notification Prompt Modal */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-500" />
                Notification Settings
              </h3>
              
              <NotificationPrompt onClose={() => setShowPrompt(false)} />
              
              <button
                onClick={() => setShowPrompt(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default NotificationPrompt

