'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Clock, Hash, Trophy, Play, Pause, Brain } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fadeIn, staggerContainer, zoomIn } from '../../lib/utils'
import GamesNavbar from '../../components/navigation/games-navbar'

// Card characters/emojis for the game
const CARD_CHARACTERS = [
  '🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸',
  '🎹', '🎤', '🎧', '🎬', '🎭', '🎨', '🎪', '🎯',
  '🏀', '⚽', '🏈', '🎾', '🏐', '🏓', '🏸', '🏒'
]

interface Card {
  id: string
  character: string
  isFlipped: boolean
  isMatched: boolean
  pairId: number
}

interface GameStats {
  turns: number
  time: number
  isRunning: boolean
  gameMode: 'timer' | 'turns'
}

const ConfettiAnimation = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    rotation: Math.random() * 360,
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 6)]
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded"
          style={{
            backgroundColor: piece.color,
            left: `${piece.x}%`,
            top: '-10px'
          }}
          initial={{ 
            y: -100, 
            rotate: 0,
            opacity: 1 
          }}
          animate={{ 
            y: window.innerHeight + 100,
            rotate: piece.rotation * 4,
            opacity: 0
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

const ResetConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-dark-elevated rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-dark-border"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Reset Game?
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
              Are you sure you want to reset the current game? Your progress will be lost.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reset Game
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ModeChangeConfirmationModal = ({ 
  isOpen, 
  newMode,
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean
  newMode: 'timer' | 'turns'
  onConfirm: () => void
  onCancel: () => void 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-dark-elevated rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-dark-border"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
              {newMode === 'timer' ? <Clock className="w-5 h-5 text-primary-500" /> : <Hash className="w-5 h-5 text-secondary-500" />}
              Switch to {newMode === 'timer' ? 'Timer' : 'Turns'} Mode?
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
              Switching modes will restart the current game. Your progress will be lost but you'll keep the same card arrangement.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  newMode === 'timer' 
                    ? 'bg-primary-500 hover:bg-primary-600' 
                    : 'bg-secondary-500 hover:bg-secondary-600'
                }`}
              >
                Switch Mode
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const GameModeSelector = ({ 
  onModeSelect, 
  selectedMode 
}: { 
  onModeSelect: (mode: 'timer' | 'turns') => void
  selectedMode: 'timer' | 'turns' | null 
}) => {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Mode Selection Cards */}
      <div className="lg:col-span-2">
        <motion.div
          variants={fadeIn('up', 0.3)}
          className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 text-center">
            Choose Your Challenge Mode
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onModeSelect('timer')}
              className="group relative p-6 rounded-2xl border-2 transition-all duration-500 flex flex-col items-center gap-3 overflow-hidden transform-gpu perspective-1000"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderStyle: 'solid'
              }}
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
                    animate={{
                      y: [100, -20],
                      x: [Math.random() * 200, Math.random() * 200],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
              
              <motion.div
                whileHover={{ rotateZ: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
              >
                <Clock className="w-12 h-12 text-blue-500" />
              </motion.div>
              <span className="font-bold text-lg text-gray-900 dark:text-dark-text-primary relative z-10">Timer Mode</span>
              <span className="text-sm text-center opacity-75 text-gray-600 dark:text-dark-text-secondary relative z-10">
                ⏱️ Race against time<br />
                <span className="text-xs">Complete all pairs as fast as possible!</span>
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                rotateY: -5,
                rotateX: 5,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onModeSelect('turns')}
              className="group relative p-6 rounded-2xl border-2 transition-all duration-500 flex flex-col items-center gap-3 overflow-hidden transform-gpu perspective-1000"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 101, 101, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)',
                borderColor: 'rgba(245, 101, 101, 0.3)',
                borderStyle: 'solid'
              }}
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-orange-400/40 rounded-full"
                    animate={{
                      y: [100, -20],
                      x: [Math.random() * 200, Math.random() * 200],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
              
              <motion.div
                whileHover={{ rotateZ: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
              >
                <Hash className="w-12 h-12 text-orange-500" />
              </motion.div>
              <span className="font-bold text-lg text-gray-900 dark:text-dark-text-primary relative z-10">Turns Mode</span>
              <span className="text-sm text-center opacity-75 text-gray-600 dark:text-dark-text-secondary relative z-10">
                🎯 Minimize your moves<br />
                <span className="text-xs">Complete with the fewest flips possible!</span>
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* How to Play Instructions */}
      <motion.div
        variants={fadeIn('right', 0.4)}
        className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6"
      >
        <h4 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          How to Play
        </h4>
        <div className="space-y-3 text-gray-700 dark:text-dark-text-secondary text-sm">
          <div className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">1.</span>
            <span>Choose Timer or Turns mode to start playing.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">2.</span>
            <span>Tap cards to flip and reveal hidden characters.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">3.</span>
            <span>Find matching pairs by remembering their positions.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">4.</span>
            <span>Matched pairs stay open, mismatched cards flip back.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">5.</span>
            <span>Complete all pairs to win and see your score!</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10 dark:border-dark-border/20">
          <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
            <strong className="text-blue-500">Timer Mode:</strong> Best time wins<br />
            <strong className="text-orange-500">Turns Mode:</strong> Fewer moves = better score
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const GameCard = ({ 
  card, 
  onClick, 
  isDisabled,
  logoLoaded,
  cachedLogoDataUrl
}: { 
  card: Card
  onClick: () => void
  isDisabled: boolean
  logoLoaded: boolean
  cachedLogoDataUrl: string
}) => {
  return (
    <motion.div
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      onClick={!isDisabled ? onClick : undefined}
      className={`
        relative aspect-square cursor-pointer
        ${isDisabled ? 'cursor-not-allowed opacity-75' : ''}
      `}
    >
      {/* Simple approach: Show either back or front based on flip state */}
      <AnimatePresence mode="wait">
        {!card.isFlipped ? (
          // Back of card - Game Logo (when card is face down)
          <motion.div
            key="back"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex flex-col items-center justify-center shadow-lg border-2 border-white/20 p-3"
          >
            <div className="bg-white/90 rounded-full mb-2 shadow-lg">
              {logoLoaded && cachedLogoDataUrl ? (
                <img
                  src={cachedLogoDataUrl}
                  alt="Game Logo"
                  className="w-16 h-16 object-contain"
                  style={{ imageRendering: 'auto' }}
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-4xl">
                  🧠
                </div>
              )}
            </div>
            <div className="text-white text-xs font-bold text-center leading-tight">
              MEMORY
              <br />
              MASTER!
            </div>
          </motion.div>
        ) : (
          // Front of card - Character (when card is flipped)
          <motion.div
            key="front"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 rounded-xl bg-white dark:bg-dark-elevated flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-dark-border"
          >
            <span className="text-4xl">{card.character}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Matched overlay */}
      {card.isMatched && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 bg-green-400/20 rounded-xl flex items-center justify-center z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-green-500 text-2xl"
          >
            ✓
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function FindPairsPage() {
  const router = useRouter()
  const [gameMode, setGameMode] = useState<'timer' | 'turns' | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<Card[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({
    turns: 0,
    time: 0,
    isRunning: false,
    gameMode: 'timer'
  })
  const [isGameComplete, setIsGameComplete] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showModeChangeModal, setShowModeChangeModal] = useState(false)
  const [pendingModeChange, setPendingModeChange] = useState<'timer' | 'turns' | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [cachedLogoDataUrl, setCachedLogoDataUrl] = useState<string>('')

  const cardCount = 12 // 6 pairs

  // Preload and convert logo to data URL for true caching
  useEffect(() => {
    const loadAndCacheImage = async () => {
      try {
        // Fetch the image as blob
        const response = await fetch('/siteLogo.png')
        if (!response.ok) throw new Error('Failed to fetch logo')
        
        const blob = await response.blob()
        
        // Convert to data URL for caching
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          setCachedLogoDataUrl(dataUrl)
          setLogoLoaded(true)
        }
        reader.onerror = () => {
          setLogoLoaded(false)
          setCachedLogoDataUrl('')
        }
        reader.readAsDataURL(blob)
        
      } catch (error) {
        // console.warn('Failed to load logo, using fallback:', error)
        setLogoLoaded(false)
        setCachedLogoDataUrl('')
      }
    }

    loadAndCacheImage()
  }, [])
  
  const generateCards = useCallback(() => {
    const selectedCharacters = CARD_CHARACTERS.slice(0, cardCount / 2)
    const cardPairs = selectedCharacters.flatMap((char, index) => [
      {
        id: `${index}-1`,
        character: char,
        isFlipped: false,
        isMatched: false,
        pairId: index
      },
      {
        id: `${index}-2`, 
        character: char,
        isFlipped: false,
        isMatched: false,
        pairId: index
      }
    ])
    
    // Shuffle cards
    return cardPairs.sort(() => Math.random() - 0.5)
  }, [cardCount])

  const initializeGame = useCallback((mode: 'timer' | 'turns') => {
    const newCards = generateCards()
    setCards(newCards)
    setFlippedCards([])
    setGameStats({
      turns: 0,
      time: 0,
      isRunning: mode === 'timer',
      gameMode: mode
    })
    setIsGameComplete(false)
    setGameStarted(true)
  }, [generateCards])

  const handleModeSelect = (mode: 'timer' | 'turns') => {
    setGameMode(mode)
    initializeGame(mode)
  }

  const handleCardClick = (clickedCard: Card) => {
    if (clickedCard.isFlipped || clickedCard.isMatched || flippedCards.length >= 2) {
      return
    }

    const newCards = cards.map(card => 
      card.id === clickedCard.id 
        ? { ...card, isFlipped: true }
        : card
    )
    setCards(newCards)

    const newFlippedCards = [...flippedCards, { ...clickedCard, isFlipped: true }]
    setFlippedCards(newFlippedCards)

    // Increment turns
    if (flippedCards.length === 0) {
      setGameStats(prev => ({ ...prev, turns: prev.turns + 1 }))
    }

    // Check for match
    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards
      
      if (first.pairId === second.pairId) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.pairId === first.pairId 
              ? { ...card, isMatched: true }
              : card
          ))
          setFlippedCards([])
        }, 1000)
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.some(flipped => flipped.id === card.id)
              ? { ...card, isFlipped: false }
              : card
          ))
          setFlippedCards([])
        }, 1500)
      }
    }
  }

  const handleReset = () => {
    if (gameStarted && !isGameComplete) {
      setShowResetModal(true)
    } else {
      confirmReset()
    }
  }

  const confirmReset = () => {
    if (gameMode) {
      initializeGame(gameMode)
    }
    setShowResetModal(false)
  }

  const handleModeSwitch = (newMode: 'timer' | 'turns') => {
    if (gameStarted && !isGameComplete && cards.some(card => card.isFlipped || card.isMatched)) {
      setPendingModeChange(newMode)
      setShowModeChangeModal(true)
    } else {
      switchMode(newMode)
    }
  }

  const switchMode = (newMode: 'timer' | 'turns') => {
    setGameMode(newMode)
    // Keep the same card arrangement but reset game state
    setFlippedCards([])
    setCards(prev => prev.map(card => ({ ...card, isFlipped: false, isMatched: false })))
    setGameStats({
      turns: 0,
      time: 0,
      isRunning: newMode === 'timer',
      gameMode: newMode
    })
    setIsGameComplete(false)
    setGameStarted(true)
  }

  const confirmModeChange = () => {
    if (pendingModeChange) {
      switchMode(pendingModeChange)
      setPendingModeChange(null)
    }
    setShowModeChangeModal(false)
  }

  const cancelModeChange = () => {
    setPendingModeChange(null)
    setShowModeChangeModal(false)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStats.isRunning && gameStarted && !isGameComplete) {
      interval = setInterval(() => {
        setGameStats(prev => ({ ...prev, time: prev.time + 1 }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStats.isRunning, gameStarted, isGameComplete])

  // Check for game completion
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setIsGameComplete(true)
      setGameStats(prev => ({ ...prev, isRunning: false }))
    }
  }, [cards])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
      <GamesNavbar />
      
      <motion.div
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-8"
      >
        {/* Header */}
        <motion.div
          variants={fadeIn('down', 0)}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Find Pairs
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary text-sm sm:text-base">
            Match all the pairs to win the game!
          </p>
        </motion.div>

        {/* Game Mode Selection */}
        {!gameMode && (
          <GameModeSelector onModeSelect={handleModeSelect} selectedMode={gameMode} />
        )}

        {/* Game Interface */}
        {gameMode && (
          <>
            {/* Scoreboard */}
            <motion.div
              variants={fadeIn('up', 0.2)}
              className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  {gameMode === 'timer' ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary-500" />
                      <span className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                        {formatTime(gameStats.time)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-secondary-500" />
                      <span className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                        {gameStats.turns} turns
                      </span>
                    </div>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-dark-elevated/50 backdrop-blur-sm rounded-lg border border-white/20 dark:border-dark-border/30 hover:bg-white/20 dark:hover:bg-dark-elevated/70 transition-all duration-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </motion.button>
              </div>
              
              {/* Mode Switch Buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeSwitch('timer')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                    ${gameMode === 'timer' 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-600' 
                      : 'bg-white/5 dark:bg-dark-elevated/20 text-gray-600 dark:text-dark-text-secondary hover:bg-white/10 dark:hover:bg-dark-elevated/30 border border-transparent'
                    }
                  `}
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Timer</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeSwitch('turns')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                    ${gameMode === 'turns' 
                      ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 border border-secondary-300 dark:border-secondary-600' 
                      : 'bg-white/5 dark:bg-dark-elevated/20 text-gray-600 dark:text-dark-text-secondary hover:bg-white/10 dark:hover:bg-dark-elevated/30 border border-transparent'
                    }
                  `}
                >
                  <Hash className="w-4 h-4" />
                  <span className="hidden sm:inline">Turns</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Game Board */}
            <motion.div
              variants={staggerContainer(0.05, 0.3)}
              className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto"
            >
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  variants={zoomIn(index * 0.05, 0.3)}
                >
                  <GameCard
                    card={card}
                    onClick={() => handleCardClick(card)}
                    isDisabled={card.isMatched || flippedCards.length >= 2}
                    logoLoaded={logoLoaded}
                    cachedLogoDataUrl={cachedLogoDataUrl}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Game Rules */}
            <motion.div
              variants={fadeIn('up', 0.5)}
              className="mt-8 bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                How to Play
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                <div className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">1.</span>
                  <span>Tap cards to reveal their characters</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">2.</span>
                  <span>Find matching pairs of characters</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">3.</span>
                  <span>Matched pairs stay open permanently</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">4.</span>
                  <span>Match all pairs to win the game!</span>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Win Message */}
        <AnimatePresence>
          {isGameComplete && (
            <>
              <ConfettiAnimation />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white dark:bg-dark-elevated rounded-2xl p-8 text-center shadow-2xl border border-gray-200 dark:border-dark-border max-w-md w-full"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
                    Congratulations!
                  </h2>
                  <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
                    You found all pairs!
                  </p>
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-lg font-bold text-gray-900 dark:text-dark-text-primary">
                      {gameMode === 'timer' ? (
                        <>
                          <Clock className="w-5 h-5 text-primary-500" />
                          Final Time: {formatTime(gameStats.time)}
                        </>
                      ) : (
                        <>
                          <Hash className="w-5 h-5 text-secondary-500" />
                          Total Turns: {gameStats.turns}
                        </>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmReset}
                    className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Play Again
                  </motion.button>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Reset Confirmation Modal */}
        <ResetConfirmationModal
          isOpen={showResetModal}
          onConfirm={confirmReset}
          onCancel={() => setShowResetModal(false)}
        />

        {/* Mode Change Confirmation Modal */}
        <ModeChangeConfirmationModal
          isOpen={showModeChangeModal}
          newMode={pendingModeChange || 'timer'}
          onConfirm={confirmModeChange}
          onCancel={cancelModeChange}
        />
      </motion.div>
    </div>
  )
}
