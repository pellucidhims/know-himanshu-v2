'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone, Share, Sparkles } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

// Floating Pulsating Install Button (FAB style)
export const InstallPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [showAndroidModal, setShowAndroidModal] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasNativePrompt, setHasNativePrompt] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    const checkStandalone = () => {
      if (typeof window === 'undefined') return false
      const standalone = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as any).standalone === true
        || document.referrer.includes('android-app://')
      return standalone
    }
    
    const standalone = checkStandalone()
    setIsStandalone(standalone)
    
    if (standalone) {
      console.log('[PWA] Already installed in standalone mode')
      return
    }

    // Check if dismissed before
    const wasDismissed = localStorage.getItem('crossword-pwa-dismissed')
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10)
      // Show again after 1 day
      if (Date.now() - dismissedTime < 1 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
        console.log('[PWA] Button was dismissed, will show again later')
        return
      }
    }

    // Detect device type
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || ''
    
    // iOS detection (iPhone, iPad, iPod)
    const iOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
    setIsIOS(iOS)
    
    // Android detection
    const android = /android/i.test(userAgent)
    setIsAndroid(android)
    
    // General mobile detection
    const mobile = iOS || android || /webOS|BlackBerry|Opera Mini|IEMobile/i.test(userAgent)
      || (typeof window !== 'undefined' && window.innerWidth < 768)
    setIsMobile(mobile)
    
    console.log('[PWA] Device detection:', { iOS, android, mobile, standalone })

    // Listen for the beforeinstallprompt event (Android/Chrome only)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('[PWA] beforeinstallprompt event fired!')
      e.preventDefault()
      setDeferredPrompt(e)
      setHasNativePrompt(true)
      setShowButton(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed')
      setShowButton(false)
      setDeferredPrompt(null)
    })

    // Show button after a short delay - on ALL devices
    // This gives time for the page to load and the user to orient
    const showTimer = setTimeout(() => {
      if (!standalone) {
        console.log('[PWA] Showing install button')
        setShowButton(true)
      }
    }, 1500) // Show after 1.5 seconds

    // Auto-expand tooltip after 5 seconds to attract attention
    const expandTimer = setTimeout(() => {
      setShowTooltip(true)
      // Hide tooltip after 4 seconds
      setTimeout(() => setShowTooltip(false), 4000)
    }, 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(showTimer)
      clearTimeout(expandTimer)
    }
  }, [])

  const handleInstall = async () => {
    console.log('[PWA] Install button clicked', { isIOS, isAndroid, hasNativePrompt })
    
    // If we have the native prompt (Chrome/Android with beforeinstallprompt)
    if (hasNativePrompt && deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log('[PWA] User choice:', outcome)
        if (outcome === 'accepted') {
          setShowButton(false)
        }
        setDeferredPrompt(null)
        setHasNativePrompt(false)
      } catch (error) {
        console.error('[PWA] Error showing prompt:', error)
        // Fall back to manual instructions
        if (isAndroid) {
          setShowAndroidModal(true)
        }
      }
      return
    }
    
    // Show manual installation instructions
    if (isIOS) {
      setShowIOSModal(true)
    } else if (isAndroid) {
      setShowAndroidModal(true)
    } else {
      // Desktop or unknown - show generic instructions
      setShowAndroidModal(true)
    }
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDismissed(true)
    setShowButton(false)
    localStorage.setItem('crossword-pwa-dismissed', Date.now().toString())
    console.log('[PWA] Button dismissed')
  }

  // Don't show if already installed or dismissed
  if (isStandalone || dismissed || !showButton) {
    return null
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {/* Tooltip */}
          {(showTooltip || isExpanded) && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="absolute bottom-full right-0 mb-3 whitespace-nowrap"
            >
              <div className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Install for quick access!</span>
                </div>
                <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsating Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.8, 1.8],
              opacity: [0.6, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute w-16 h-16 rounded-full bg-emerald-500"
          />
          <motion.div
            animate={{
              scale: [1, 1.8, 1.8],
              opacity: [0.6, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.6,
            }}
            className="absolute w-16 h-16 rounded-full bg-emerald-500"
          />
          <motion.div
            animate={{
              scale: [1, 1.8, 1.8],
              opacity: [0.4, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 1.2,
            }}
            className="absolute w-16 h-16 rounded-full bg-teal-500"
          />
        </div>

        {/* Main Button */}
        <motion.button
          onClick={handleInstall}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          onTouchStart={() => setIsExpanded(true)}
          onTouchEnd={() => setTimeout(() => setIsExpanded(false), 1000)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            boxShadow: [
              '0 0 20px rgba(16, 185, 129, 0.4)',
              '0 0 40px rgba(16, 185, 129, 0.6)',
              '0 0 20px rgba(16, 185, 129, 0.4)',
            ],
          }}
          transition={{
            scale: { type: "spring", stiffness: 200, damping: 15 },
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="relative flex items-center gap-2 px-5 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-full font-bold shadow-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 min-w-[64px] min-h-[64px] justify-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Download className="w-6 h-6" />
          </motion.div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden whitespace-nowrap text-sm"
              >
                Install App
              </motion.span>
            )}
          </AnimatePresence>

          {/* Dismiss button - tiny, positioned at top-right corner */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleDismiss}
            className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center bg-gray-800 rounded-full text-white hover:bg-gray-600 transition-colors shadow-sm"
          >
            <X className="w-2 h-2 sm:w-2.5 sm:h-2.5" strokeWidth={2.5} />
          </motion.button>
        </motion.button>

        {/* Sparkle effects */}
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [-10, -30, -10],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute -top-2 left-0 pointer-events-none"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </motion.div>
        
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [-5, -25, -5],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -top-1 right-2 pointer-events-none"
        >
          <Sparkles className="w-3 h-3 text-emerald-300" />
        </motion.div>
      </div>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-emerald-500" />
                  Install on iOS
                </h3>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Add Daily Crossword to your home screen for quick access!
              </p>
              
              <div className="space-y-3">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl border border-blue-200 dark:border-blue-700"
                >
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg flex-shrink-0">
                    <Share className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Step 1</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Tap the <strong>Share</strong> button in Safari (bottom of screen)</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl border border-emerald-200 dark:border-emerald-700"
                >
                  <div className="p-3 bg-emerald-500 rounded-xl shadow-lg flex-shrink-0">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Step 2</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl border border-purple-200 dark:border-purple-700"
                >
                  <div className="p-3 bg-purple-500 rounded-xl shadow-lg flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Step 3</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Tap <strong>"Add"</strong> to install</p>
                  </div>
                </motion.div>
              </div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setShowIOSModal(false)}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Got it!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android/Chrome Instructions Modal */}
      <AnimatePresence>
        {showAndroidModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowAndroidModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-emerald-500" />
                  Install App
                </h3>
                <button
                  onClick={() => setShowAndroidModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Add Daily Crossword to your home screen for quick access!
              </p>
              
              <div className="space-y-3">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl border border-blue-200 dark:border-blue-700"
                >
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Step 1</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Tap the <strong>⋮ menu</strong> (three dots) in Chrome</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl border border-emerald-200 dark:border-emerald-700"
                >
                  <div className="p-3 bg-emerald-500 rounded-xl shadow-lg flex-shrink-0">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Step 2</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl border border-purple-200 dark:border-purple-700"
                >
                  <div className="p-3 bg-purple-500 rounded-xl shadow-lg flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Step 3</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Tap <strong>"Install"</strong> or <strong>"Add"</strong></p>
                  </div>
                </motion.div>
              </div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setShowAndroidModal(false)}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Got it!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Compact install button for header/inline use
// variant: 'compact' (default) - icon only on mobile, icon+text on desktop
// variant: 'full' - full width button with icon and text
export const InstallPWAButton = ({ 
  className = '',
  variant = 'compact'
}: { 
  className?: string
  variant?: 'compact' | 'full'
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [hasNativePrompt, setHasNativePrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    setIsStandalone(standalone)
    
    if (standalone) return

    // Detect iOS
    const userAgent = navigator.userAgent || ''
    const iOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
    setIsIOS(iOS)
    
    // Check if mobile
    const isMobile = iOS || /android/i.test(userAgent) || window.innerWidth < 768
    
    if (isMobile) {
      setShowButton(true)
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setHasNativePrompt(true)
      setShowButton(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleClick = async () => {
    if (hasNativePrompt && deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowButton(false)
      }
      setDeferredPrompt(null)
      return
    }
    
    // Show iOS instructions
    setShowIOSInstructions(true)
  }

  if (isStandalone || !showButton) {
    return null
  }

  // Full width variant for mobile
  if (variant === 'full') {
    return (
      <>
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all overflow-hidden ${className}`}
          title="Install App"
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
          <Download className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Install App</span>
        </motion.button>

        {/* iOS/Android Instructions Modal */}
        <AnimatePresence>
          {showIOSInstructions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowIOSInstructions(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-500" />
                  Install Crossword App
                </h3>
                {isIOS ? (
                  <div className="space-y-3 text-gray-600 dark:text-gray-300">
                    <p className="text-sm">To install on iOS:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Tap the <strong>Share</strong> button <span className="inline-block w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded text-center text-xs leading-5">↑</span></li>
                      <li>Scroll and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
                      <li>Tap <strong>&quot;Add&quot;</strong> to confirm</li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-3 text-gray-600 dark:text-gray-300">
                    <p className="text-sm">To install on Android:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Tap the <strong>menu</strong> (⋮) in your browser</li>
                      <li>Tap <strong>&quot;Add to Home Screen&quot;</strong> or <strong>&quot;Install App&quot;</strong></li>
                      <li>Tap <strong>&quot;Install&quot;</strong> to confirm</li>
                    </ol>
                  </div>
                )}
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Compact variant (default)
  return (
    <>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center gap-1.5 px-2 py-2 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all overflow-hidden ${className}`}
        title="Install App"
      >
        {/* Shimmer effect */}
        <motion.div
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        />
        <Download className="w-4 h-4 relative z-10" />
        <span className="hidden sm:inline relative z-10">Install</span>
      </motion.button>

      {/* iOS/Android Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {isIOS ? 'Install on iOS' : 'Install App'}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Share className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Step 1</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {isIOS ? 'Tap the Share button in Safari' : 'Tap the ⋮ menu in Chrome'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Step 2</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {isIOS ? 'Tap "Add to Home Screen"' : 'Tap "Add to Home screen" or "Install"'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Step 3</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Tap "Add" to install</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default InstallPWAPrompt
