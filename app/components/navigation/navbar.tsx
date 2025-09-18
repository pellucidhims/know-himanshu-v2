'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link as ScrollLink } from 'react-scroll'
import Link from 'next/link'
import { ThemeToggle } from '../ui/theme-toggle'
import { LINKS } from '../../lib/utils'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        mobile-navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full
        ${scrolled 
          ? 'bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-dark-border' 
          : 'bg-transparent'
        }
      `}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="cursor-pointer"
          >
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Himanshu
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {LINKS.map((link) => (
                <ScrollLink
                  key={link.id}
                  to={link.to}
                  spy={true}
                  smooth={true}
                  offset={-80}
                  duration={500}
                  onSetActive={() => setActiveSection(link.id)}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer
                    ${activeSection === link.id
                      ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'text-gray-700 dark:text-dark-text-secondary hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-dark-elevated'
                    }
                  `}
                >
                  {link.label}
                </ScrollLink>
              ))}
            </div>
          </div>

          {/* Theme Toggle and Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-elevated touch-manipulation"
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border w-full overflow-hidden"
          >
            <div className="px-4 pt-2 pb-3 space-y-1 w-full max-w-full">
              {LINKS.map((link) => (
                <ScrollLink
                  key={link.id}
                  to={link.to}
                  spy={true}
                  smooth={true}
                  offset={-80}
                  duration={500}
                  onClick={() => setIsOpen(false)}
                  onSetActive={() => setActiveSection(link.id)}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 cursor-pointer
                    ${activeSection === link.id
                      ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'text-gray-700 dark:text-dark-text-secondary hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-dark-elevated'
                    }
                  `}
                >
                  {link.label}
                </ScrollLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
