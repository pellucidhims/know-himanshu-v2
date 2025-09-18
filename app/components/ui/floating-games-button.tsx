'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Gamepad2, Zap, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function FloatingGamesButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Show button after a delay to create entrance effect
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const buttonVariants = {
    hidden: {
      scale: 0,
      rotate: -180,
      opacity: 0,
      y: 100,
    },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 300,
        duration: 0.8,
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, 0],
      transition: {
        rotate: {
          duration: 0.5,
          ease: "easeInOut" as const
        },
        scale: {
          duration: 0.2
        }
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  }

  const iconVariants = {
    idle: {
      rotate: 0,
      scale: 1,
    },
    hover: {
      rotate: 360,
      scale: 1.2,
      transition: {
        duration: 0.6,
        ease: "easeInOut" as const
      }
    }
  }

  const sparkleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut" as const
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Floating sparkles */}
          <motion.div
            className="absolute -top-2 -left-2 text-yellow-400"
            variants={sparkleVariants}
            animate="visible"
            initial="hidden"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          
          <motion.div
            className="absolute -bottom-1 -right-1 text-pink-400"
            variants={sparkleVariants}
            animate="visible"
            initial="hidden"
            style={{ animationDelay: '0.5s' }}
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>

          <motion.div
            className="absolute -top-1 -right-2 text-blue-400"
            variants={sparkleVariants}
            animate="visible"
            initial="hidden"
            style={{ animationDelay: '1s' }}
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>

          {/* Main button */}
          <Link href="/games" passHref>
            <motion.button
              className={`
                relative w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20
                bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600
                rounded-full shadow-2xl border-4 border-white/20
                flex items-center justify-center
                transform-gpu overflow-hidden
                group cursor-pointer
              `}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              style={{
                boxShadow: isHovered 
                  ? '0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(168, 85, 247, 0.4)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.3)',
                backgroundImage: isHovered 
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #3b82f6 100%)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #2563eb 100%)'
              }}
            >
              {/* Animated background overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 rounded-full"
                animate={isHovered ? {
                  rotate: 360,
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
              />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 rounded-full"
                animate={isHovered ? {
                  x: ['-100%', '100%'],
                } : {}}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut"
                }}
              />

              {/* Gaming icon */}
              <motion.div
                variants={iconVariants}
                animate={isHovered ? "hover" : "idle"}
                className="relative z-10"
              >
                <Gamepad2 className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-white drop-shadow-lg" />
              </motion.div>

              {/* Lightning bolt accent */}
              <motion.div
                className="absolute top-1 right-1 z-10"
                animate={isHovered ? {
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360],
                } : {}}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut"
                }}
              >
                <Zap className="w-3 h-3 text-yellow-300 drop-shadow-sm" />
              </motion.div>

              {/* Pulse rings */}
              <AnimatePresence>
                {isHovered && (
                  <>
                    <motion.div
                      className="absolute inset-0 border-2 border-white/40 rounded-full"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ 
                        scale: [1, 1.5, 2],
                        opacity: [0.8, 0.4, 0]
                      }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 border-2 border-pink-400/40 rounded-full"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ 
                        scale: [1, 1.8, 2.5],
                        opacity: [0.6, 0.3, 0]
                      }}
                      exit={{ scale: 2.5, opacity: 0 }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0.2
                      }}
                    />
                  </>
                )}
              </AnimatePresence>
            </motion.button>
          </Link>

          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg shadow-xl whitespace-nowrap"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                🎮 Enter Game Zone!
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
