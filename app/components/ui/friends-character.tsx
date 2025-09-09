'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface FriendsCharacterProps {
  sectionId: string
  character?: string
  position?: 'left' | 'right'
  offset?: number
}

const FRIENDS_CHARACTERS = [
  { name: 'Ross', image: '/friends-characters/ross_geller.png', quotes: ['We were on a break!', 'Pivot!', 'UNAGI - is a total state of awareness'] },
  { name: 'Rachel', image: '/friends-characters/rachel_green.png', quotes: ['I\'m gonna go get one of those job things.', 'I got off the plane!', 'He\'s so pretty, I want to cry.'] },
  { name: 'Monica', image: '/friends-characters/monica_geller.png', quotes: ['I KNOW!', 'Welcome to the real world!', 'Not just health-department clean, "Monica" clean.'] },
  { name: 'Chandler', image: '/friends-characters/chandler_bing.png', quotes: ['Hi, I\'m Chandler. I make jokes when I\'m uncomfortable.', 'Could this BE any more obvious?', 'I\'m not great at the advice'] },
  { name: 'Joey', image: '/friends-characters/joey_tribbiani.png', quotes: ['How you doin\'?', 'Joey doesn\'t share food!', 'It\'s a moo point'] },
  { name: 'Phoebe', image: '/friends-characters/phoebe_buffay.png', quotes: ['My Eyes! MY EYES!', 'This is brand new information!','Smelly cat!'] }
]

// Fallback character icons using emojis for when images aren't available
const FALLBACK_CHARACTERS = [
  { name: 'Ross', emoji: '🦕', color: 'from-blue-400 to-blue-600' },
  { name: 'Rachel', emoji: '💄', color: 'from-pink-400 to-pink-600' },
  { name: 'Monica', emoji: '👩‍🍳', color: 'from-purple-400 to-purple-600' },
  { name: 'Chandler', emoji: '💼', color: 'from-gray-400 to-gray-600' },
  { name: 'Joey', emoji: '🍕', color: 'from-orange-400 to-orange-600' },
  { name: 'Phoebe', emoji: '🎸', color: 'from-yellow-400 to-yellow-600' }
]

export default function FriendsCharacter({ 
  sectionId, 
  character,
  position = 'right',
  offset = 0 
}: FriendsCharacterProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [opacity, setOpacity] = useState(0)
  const [selectedCharacter, setSelectedCharacter] = useState(0)
  const [showQuote, setShowQuote] = useState(false)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [usedQuotes, setUsedQuotes] = useState<Set<number>>(new Set())
  const [imageError, setImageError] = useState(false)
  const [lastQuoteTime, setLastQuoteTime] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const quoteTimeoutRef = useRef<NodeJS.Timeout>()

  // Select random character if not specified
  useEffect(() => {
    if (!character) {
      const randomIndex = Math.floor(Math.random() * FRIENDS_CHARACTERS.length)
      setSelectedCharacter(randomIndex)
    } else {
      const characterIndex = FRIENDS_CHARACTERS.findIndex(c => c.name.toLowerCase() === character.toLowerCase())
      setSelectedCharacter(characterIndex >= 0 ? characterIndex : 0)
    }
  }, [character])

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById(sectionId)
      if (!section) return

      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionHeight = rect.height
      const sectionTop = rect.top
      const sectionBottom = rect.bottom

      // Check if section is in viewport
      const isInViewport = sectionTop < windowHeight && sectionBottom > 0

      if (isInViewport) {
        // Calculate position relative to section center
        const sectionCenter = sectionTop + sectionHeight / 2
        const windowCenter = windowHeight / 2
        const distanceFromCenter = Math.abs(sectionCenter - windowCenter)
        const maxDistance = windowHeight / 2 + sectionHeight / 2

        // Calculate opacity based on distance from optimal viewing position
        let calculatedOpacity = 1 - (distanceFromCenter / maxDistance)
        calculatedOpacity = Math.max(0, Math.min(1, calculatedOpacity))

        setIsVisible(true)
        setOpacity(calculatedOpacity)

        // Show quote when character is most visible and enough time has passed
        const currentTime = Date.now()
        const timeSinceLastQuote = currentTime - lastQuoteTime
        const minTimeBetweenQuotes = 5000 // 5 seconds minimum between quotes
        
        if (calculatedOpacity > 0.7 && !showQuote && timeSinceLastQuote > minTimeBetweenQuotes) {
          const availableQuotes = FRIENDS_CHARACTERS[selectedCharacter].quotes
          
          // Find next unused quote
          let nextQuoteIndex = currentQuoteIndex
          let attempts = 0
          
          // Try to find an unused quote, if all are used, reset the set
          while (usedQuotes.has(nextQuoteIndex) && attempts < availableQuotes.length) {
            nextQuoteIndex = (nextQuoteIndex + 1) % availableQuotes.length
            attempts++
          }
          
          // If all quotes have been used, reset and start over
          if (attempts === availableQuotes.length) {
            setUsedQuotes(new Set())
            nextQuoteIndex = 0
          }
          
          setCurrentQuoteIndex(nextQuoteIndex)
          setUsedQuotes(prev => new Set(prev).add(nextQuoteIndex))
          setShowQuote(true)
          setLastQuoteTime(currentTime)
          
          // Clear any existing timeout
          if (quoteTimeoutRef.current) {
            clearTimeout(quoteTimeoutRef.current)
          }
          
          // Hide quote after 4 seconds (longer for better readability while scrolling)
          quoteTimeoutRef.current = setTimeout(() => {
            setShowQuote(false)
          }, 4000)
        }
      } else {
        setIsVisible(false)
        setOpacity(0)
        // Don't immediately hide quote when leaving viewport to allow reading time
        if (showQuote) {
          // Give extra time to read if user scrolled away
          if (quoteTimeoutRef.current) {
            clearTimeout(quoteTimeoutRef.current)
          }
          quoteTimeoutRef.current = setTimeout(() => {
            setShowQuote(false)
          }, 2000)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (quoteTimeoutRef.current) {
        clearTimeout(quoteTimeoutRef.current)
      }
    }
  }, [sectionId, showQuote, selectedCharacter, currentQuoteIndex, usedQuotes, lastQuoteTime])

  const currentCharacter = FRIENDS_CHARACTERS[selectedCharacter]
  const fallbackCharacter = FALLBACK_CHARACTERS[selectedCharacter]
  
  const positionClasses = position === 'left' 
    ? 'left-4 md:left-8' 
    : 'right-4 md:right-8'

  const characterVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      x: position === 'left' ? -100 : 100,
      y: 50
    },
    visible: { 
      opacity: opacity,
      scale: 0.8 + (opacity * 0.4), // Scale from 0.8 to 1.2 based on visibility
      x: 0,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    }
  }

  const quoteVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25
      }
    }
  }

  return (
    <div ref={sectionRef} className={`fixed top-1/2 transform -translate-y-1/2 ${positionClasses} z-10 pointer-events-none`} style={{ top: `calc(50% + ${offset}px)` }}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={characterVariants}
            className="relative"
          >
            {/* Character Image or Fallback */}
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              {!imageError ? (
                <div className="relative w-full h-full">
                  <Image
                    src={currentCharacter.image}
                    alt={currentCharacter.name}
                    fill
                    className="object-contain drop-shadow-lg"
                    onError={() => setImageError(true)}
                    priority={false}
                    sizes="(max-width: 768px) 96px, 128px"
                  />
                </div>
              ) : (
                /* Fallback character with emoji */
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${fallbackCharacter.color} flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800`}>
                  <span className="text-3xl md:text-4xl">{fallbackCharacter.emoji}</span>
                </div>
              )}
              
              {/* Character name badge with quote progress */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {currentCharacter.name}
                    </span>
                    {/* Quote progress dots */}
                    <div className="flex gap-1">
                      {currentCharacter.quotes.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                            usedQuotes.has(index)
                              ? 'bg-primary-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote bubble */}
            <AnimatePresence>
              {showQuote && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={quoteVariants}
                  className={`absolute ${position === 'left' ? 'left-full ml-4' : 'right-full mr-4'} top-1/2 transform -translate-y-1/2 w-48 md:w-56`}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-600 relative">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      "{currentCharacter.quotes[currentQuoteIndex]}"
                    </p>
                    
                    {/* Speech bubble arrow */}
                    <div className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rotate-45 ${
                      position === 'left' 
                        ? '-left-1.5 border-r border-b' 
                        : '-right-1.5 border-l border-t'
                    }`}></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating animation effect */}
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
