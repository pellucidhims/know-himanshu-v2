'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '../ui/theme-toggle'

export default function GamesNavbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const goToHomepage = () => {
    router.push('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full
        ${scrolled 
          ? 'bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-dark-border' 
          : 'bg-transparent'
        }
      `}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Back Button and Logo */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToHomepage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm border border-white/20 dark:border-dark-border/30 text-gray-700 dark:text-dark-text-secondary hover:bg-white/20 dark:hover:bg-dark-elevated/50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Back to Home</span>
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToHomepage}
              className="cursor-pointer"
            >
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Himanshu
              </h1>
            </motion.div>
          </div>

          {/* Game Zone Title */}
          <div className="hidden md:block">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary">
              🎮 Game Zone
            </h2>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
