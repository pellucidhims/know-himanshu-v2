'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  Send, 
  RotateCcw, 
  ArrowDown, 
  ArrowRight, 
  Trophy,
  Timer,
  Lightbulb,
  Calendar,
  AlertCircle,
  RefreshCw,
  Flame,
  LogOut,
  Settings
} from 'lucide-react'
import { fadeIn, staggerContainer, zoomIn } from '../../lib/utils'
import GamesNavbar from '../../components/navigation/games-navbar'
import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'
import { 
  fetchDailyPuzzle, 
  CrosswordPuzzleData, 
  CrosswordCell as CellData,
  WordHash 
} from '../../lib/crossword/api'
import { verifyAllAnswers } from '../../lib/crossword/hash-utils'

// Streak mode components
import { AuthModal, UserInfoBadge } from '../../components/crossword/auth-modal'
import { Leaderboard } from '../../components/crossword/leaderboard'
import { StreakInfo, StreakBadge, StreakCompletion } from '../../components/crossword/streak-info'
import { CrosswordAvatar } from '../../components/crossword/avatars'
import ProfileEditModal from '../../components/crossword/profile-edit-modal'
import { InstallPWAPrompt, InstallPWAButton } from '../../components/crossword/install-pwa-prompt'
import { NotificationBellButton } from '../../components/crossword/notification-prompt'
import {
  CrosswordUser,
  isAuthenticated,
  getStoredUser,
  verifyToken,
  logout as authLogout,
  saveProgress,
  completePuzzle,
  recordAttempt,
  loadGame,
} from '../../lib/crossword/streak-api'

// LocalStorage key for crossword puzzle state
const STORAGE_KEY = 'crossword_puzzle_state'

// Game mode type including streak mode (casual mode removed - always timed)
type GameMode = 'timer' | 'streak' | null

// Saved puzzle state interface
interface SavedPuzzleState {
  puzzleDate: string
  userGrid: string[][]
  gameMode: GameMode
  timer: number
  submissions: number
  isComplete: boolean
  // Add grid dimensions for validation
  gridRows: number
  gridCols: number
  // Save verification results to persist correct/incorrect status
  verificationResults?: [string, boolean][]
}

// LocalStorage helper functions
const savePuzzleState = (state: SavedPuzzleState) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save puzzle state:', e)
  }
}

const loadPuzzleState = (): SavedPuzzleState | null => {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    
    const parsed = JSON.parse(saved)
    
    // Validate required fields exist
    if (
      !parsed ||
      typeof parsed.puzzleDate !== 'string' ||
      !Array.isArray(parsed.userGrid) ||
      parsed.userGrid.length === 0
    ) {
    //   console.warn('Invalid saved puzzle state, clearing...')
      clearPuzzleState()
      return null
    }
    
    return parsed as SavedPuzzleState
  } catch (e) {
    console.error('Failed to load puzzle state:', e)
    clearPuzzleState()
    return null
  }
}

const clearPuzzleState = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear puzzle state:', e)
  }
}

// Validate that saved grid matches the puzzle structure
const isValidSavedState = (
  savedState: SavedPuzzleState,
  puzzleData: CrosswordPuzzleData
): boolean => {
  // Defensive check for missing dateGenerated
  if (!savedState.puzzleDate || !puzzleData.dateGenerated) {
    // console.warn('Missing puzzle date, clearing saved state...')
    return false
  }
  
  // Check date matches exactly (both come from server in YYYY-MM-DD format)
  if (savedState.puzzleDate !== puzzleData.dateGenerated) {
    // console.log(
    //   'Puzzle date mismatch. Saved:', savedState.puzzleDate,
    //   'Current:', puzzleData.dateGenerated
    // )
    return false
  }
  
  // Defensive check for grid existence
  if (!puzzleData.grid || !Array.isArray(puzzleData.grid) || puzzleData.grid.length === 0) {
    // console.warn('Invalid puzzle grid from server')
    return false
  }
  
  // Check grid dimensions match
  const expectedRows = puzzleData.grid.length
  const expectedCols = puzzleData.grid[0]?.length || 0
  
  if (
    savedState.userGrid.length !== expectedRows ||
    savedState.userGrid[0]?.length !== expectedCols
  ) {
    // console.warn('Saved grid dimensions do not match puzzle, clearing...')
    return false
  }
  
  // Also check stored dimensions if available (for extra validation)
  if (
    savedState.gridRows !== undefined && 
    savedState.gridCols !== undefined &&
    (savedState.gridRows !== expectedRows || savedState.gridCols !== expectedCols)
  ) {
    // console.warn('Stored grid dimensions do not match, clearing...')
    return false
  }
  
  // Validate each row has correct number of columns
  for (const row of savedState.userGrid) {
    if (!Array.isArray(row) || row.length !== expectedCols) {
    //   console.warn('Saved grid row structure invalid, clearing...')
      return false
    }
  }
  
  return true
}

// Confetti Animation Component
const ConfettiAnimation = () => {
  const confettiPieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    rotation: Math.random() * 360,
    color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)]
  })), [])

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
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
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

// Cell Component with wobbly animation
interface CellProps {
  value: string
  isBlocked: boolean
  number: number | null
  isSelected: boolean
  isHighlighted: boolean
  highlightDirection: 'across' | 'down' | null
  isCorrect: boolean | null
  isIncorrect: boolean | null
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  cellKey: string
  cellRefs: React.MutableRefObject<Map<string, HTMLInputElement>>
  isRecentlyTyped: boolean
}

const CrosswordCell = ({
  value,
  isBlocked,
  number,
  isSelected,
  isHighlighted,
  highlightDirection,
  isCorrect,
  isIncorrect,
  onClick,
  onKeyDown,
  cellKey,
  cellRefs,
  isRecentlyTyped,
}: CellProps) => {
  if (isBlocked) {
    return (
      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-gray-800 dark:bg-gray-900 rounded-sm" />
    )
  }

  // Different highlight colors for Across (blue) and Down (golden/amber)
  const getHighlightClasses = () => {
    if (isSelected) {
      return highlightDirection === 'down'
        ? 'border-amber-500 ring-2 ring-amber-300 dark:ring-amber-600 z-10'
        : 'border-primary-500 ring-2 ring-primary-300 dark:ring-primary-600 z-10'
    }
    if (isHighlighted) {
      return highlightDirection === 'down'
        ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30'
        : 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/30'
    }
    return 'border-gray-300 dark:border-gray-600'
  }

  return (
    <motion.div
      className={`
        relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11
        border-2 rounded-sm cursor-pointer
        flex items-center justify-center
        transition-all duration-200
        ${getHighlightClasses()}
        ${isCorrect === true ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : ''}
        ${isIncorrect === true ? 'bg-red-100 dark:bg-red-900/50 border-red-500' : ''}
        ${!isCorrect && !isIncorrect && !isSelected && !isHighlighted ? 'bg-white dark:bg-dark-surface' : ''}
      `}
      onClick={onClick}
      animate={isRecentlyTyped ? {
        scale: [1, 1.15, 0.95, 1.05, 1],
        rotate: [0, -3, 3, -1, 0],
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Number indicator */}
      {number && (
        <span className="absolute top-0.5 left-0.5 text-[8px] sm:text-[9px] font-bold text-gray-500 dark:text-gray-400">
          {number}
        </span>
      )}
      
      {/* Letter display */}
      <span className={`
        text-base sm:text-lg md:text-xl font-bold uppercase
        ${isCorrect === true ? 'text-green-700 dark:text-green-300' : ''}
        ${isIncorrect === true ? 'text-red-700 dark:text-red-300' : ''}
        ${!isCorrect && !isIncorrect ? 'text-gray-900 dark:text-white' : ''}
      `}>
        {value}
      </span>
      
      {/* Hidden input for keyboard handling */}
      <input
        ref={(el) => {
          if (el) cellRefs.current.set(cellKey, el)
        }}
        type="text"
        inputMode="text"
        pattern="[A-Za-z]"
        maxLength={1}
        value=""
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-manipulation"
        onKeyDown={onKeyDown}
        onInput={(e) => {
          // Handle input for mobile keyboards
          const target = e.target as HTMLInputElement
          const newValue = target.value.toUpperCase().replace(/[^A-Z]/g, '')
          
          // Clear the input immediately to allow next character
          target.value = ''
          
          if (newValue.length > 0) {
            // Trigger a synthetic key event to use the same logic
            const syntheticEvent = {
              key: newValue[0],
              preventDefault: () => {},
              stopPropagation: () => {},
            } as React.KeyboardEvent
            onKeyDown(syntheticEvent)
          }
        }}
        onFocus={(e) => {
          // Clear on focus for clean slate
          e.target.value = ''
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-label={`Cell ${number || ''}`}
      />
    </motion.div>
  )
}

// Clue Component with direction-based coloring
interface ClueProps {
  number: number
  clue: string
  isActive: boolean
  direction: 'across' | 'down'
  onClick: () => void
}

const ClueItem = ({ number, clue, isActive, direction, onClick }: ClueProps) => (
  <motion.div
    whileHover={{ x: 4 }}
    onClick={onClick}
    className={`
      p-2 rounded-lg cursor-pointer transition-all duration-200
      ${isActive 
        ? direction === 'down'
          ? 'bg-amber-100 dark:bg-amber-900/40 border-l-4 border-amber-500'
          : 'bg-primary-100 dark:bg-primary-900/40 border-l-4 border-primary-500'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }
    `}
  >
    <span className={`font-bold mr-2 ${
      direction === 'down' 
        ? 'text-amber-600 dark:text-amber-400' 
        : 'text-primary-600 dark:text-primary-400'
    }`}>
      {number}.
    </span>
    <span className="text-sm text-gray-700 dark:text-gray-300">{clue}</span>
  </motion.div>
)

// Game Mode Selector with Streak Mode
const GameModeSelector = ({ 
  onModeSelect,
  user,
  onStreakClick,
}: { 
  onModeSelect: (mode: 'timer') => void
  user: CrosswordUser | null
  onStreakClick: () => void
}) => {
  return (
    <motion.div
      variants={fadeIn('up', 0.3)}
      className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6 max-w-3xl mx-auto"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 text-center flex items-center justify-center gap-2">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        Choose Your Challenge Mode
      </h3>
      
      {/* Streak Mode - Featured */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStreakClick}
        className="w-full mb-6 p-5 rounded-2xl border-2 border-orange-400 dark:border-orange-600 bg-gradient-to-r from-orange-50 via-amber-50 to-red-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-red-900/20 transition-all duration-300 flex items-center gap-4"
      >
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900 dark:text-dark-text-primary">Streak Mode</span>
            {user && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {user.stats.currentStreak} day streak
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
            {user ? 'Continue your daily streak!' : 'Login to track your progress across days'}
          </span>
        </div>
        {user ? (
          <CrosswordAvatar avatarId={user.avatar} size={48} />
        ) : (
          <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm">
            Login
          </div>
        )}
      </motion.button>
      
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white/50 dark:bg-dark-elevated/50 text-sm text-gray-500">or play without login</span>
        </div>
      </div>
      
      {/* Timed Challenge - Only option for non-login */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onModeSelect('timer')}
        className="w-full p-5 rounded-2xl border-2 border-primary-300 dark:border-primary-600 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 transition-all duration-300 flex items-center gap-4"
      >
        <div className="p-3 bg-gradient-to-br from-primary-500 to-teal-600 rounded-xl shadow-lg">
          <Timer className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 text-left">
          <span className="font-bold text-lg text-gray-900 dark:text-dark-text-primary">Timed Challenge</span>
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
            ⏱️ Race against time! You can switch to Streak Mode anytime.
          </p>
        </div>
      </motion.button>
      
      {/* Games Lobby & Install App Links */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border/50 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/games"
          className="flex items-center justify-center gap-2 py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <Gamepad2 className="w-5 h-5" />
          <span>Browse Other Games</span>
        </Link>
        <InstallPWAButton className="py-2" />
      </div>
    </motion.div>
  )
}

// Error Component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-auto text-center"
  >
    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
      Failed to Load Puzzle
    </h3>
    <p className="text-red-600 dark:text-red-300 text-sm mb-4">
      {error}
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg mx-auto hover:bg-red-600 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Try Again
    </motion.button>
  </motion.div>
)

// Main Crossword Game Component
export default function CrosswordPage() {
  // Game state
  const [gameMode, setGameMode] = useState<GameMode>(null)
  const [puzzleData, setPuzzleData] = useState<CrosswordPuzzleData | null>(null)
  const [userGrid, setUserGrid] = useState<string[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [direction, setDirection] = useState<'across' | 'down'>('across')
  const [verificationResults, setVerificationResults] = useState<Map<string, boolean>>(new Map())
  const [recentlyTypedCell, setRecentlyTypedCell] = useState<{ row: number; col: number } | null>(null)
  
  // Loading and error state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Timer and score state
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [submissions, setSubmissions] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showWinModal, setShowWinModal] = useState(false) // Separate state for modal visibility
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Streak mode state
  const [user, setUser] = useState<CrosswordUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileEditModal, setShowProfileEditModal] = useState(false)
  const [showStreakCompletion, setShowStreakCompletion] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false) // Reset confirmation modal
  
  // Refs for cell inputs
  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  
  // Track auth check completion
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  
  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const storedUser = getStoredUser()
        if (storedUser) {
          setUser(storedUser)
          // Verify token is still valid
          const verifiedUser = await verifyToken()
          if (verifiedUser) {
            setUser(verifiedUser)
            // Check if saved state has streak mode
            const savedState = loadPuzzleState()
            if (savedState?.gameMode === 'streak') {
              setGameMode('streak')
              setIsTimerRunning(true)
            } else {
              // Even if localStorage is cleared (new day/new window),
              // auto-start streak mode for authenticated users
              // This ensures logged-in users always see their streak data
              setGameMode('streak')
              setIsTimerRunning(true)
            }
          } else {
            setUser(null)
            // If user was in streak mode but token is invalid, switch to timer mode
            setGameMode(prev => prev === 'streak' ? 'timer' : prev)
          }
        }
      }
      setIsAuthChecked(true)
    }
    checkAuth()
  }, [])
  
  // Fetch puzzle from API
  const loadPuzzle = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await fetchDailyPuzzle()
      setPuzzleData(data)
      
      // Check for saved state in localStorage
      const savedState = loadPuzzleState()
      
      // Validate saved state matches today's puzzle completely
      if (savedState && isValidSavedState(savedState, data)) {
        // Restore saved state for today's puzzle
        // console.log('Restoring saved puzzle state for:', data.dateGenerated)
        setUserGrid(savedState.userGrid)
        if (savedState.gameMode) {
          // Handle legacy 'casual' mode - treat as 'timer'
          const savedMode = savedState.gameMode as string
          let normalizedMode: GameMode = savedMode === 'casual' ? 'timer' : (savedMode as GameMode)
          
          // If saved mode is 'streak' but user is not authenticated, fallback to 'timer'
          // This prevents the undefined user error on reload
          // Check localStorage which is synchronous and doesn't have stale closure issues
          if (normalizedMode === 'streak' && (!isAuthenticated() || !getStoredUser())) {
            normalizedMode = 'timer'
          }
          
          setGameMode(normalizedMode)
          if (normalizedMode === 'timer' || normalizedMode === 'streak') {
            setTimer(savedState.timer || 0)
            setSubmissions(savedState.submissions || 0)
            // Don't auto-start timer if puzzle was completed
            if (!savedState.isComplete) {
              setIsTimerRunning(true)
            }
          }
          setIsComplete(savedState.isComplete || false)
          // Show win modal if puzzle was already completed
          if (savedState.isComplete) {
            setShowWinModal(true)
          }
        }
        // Restore verification results if available
        if (savedState.verificationResults && Array.isArray(savedState.verificationResults)) {
          setVerificationResults(new Map(savedState.verificationResults))
        }
      } else {
        // Invalid, different day, or no saved state - clear old data and start fresh
        if (savedState) {
        //   console.log('Clearing old puzzle state. Saved date:', savedState.puzzleDate, 'Current date:', data.dateGenerated)
          clearPuzzleState()
        }
        
        // Reset game state, but respect authenticated users
        // If user is authenticated, they should be in streak mode
        const isUserAuthenticated = !!(isAuthenticated() && getStoredUser())
        if (isUserAuthenticated) {
          // Authenticated user - set to streak mode and start timer
          setGameMode('streak')
        } else {
          // Non-authenticated user - show mode selection
          setGameMode(null)
        }
        
        setTimer(0)
        setSubmissions(0)
        setIsComplete(false)
        // Start timer for authenticated users, stop for non-authenticated
        setIsTimerRunning(isUserAuthenticated)
        setVerificationResults(new Map())
        setSelectedCell(null)
        
        // Initialize empty user grid
        const emptyGrid = data.grid.map(row =>
          row.map(cell => cell.isBlocked ? '' : '')
        )
        setUserGrid(emptyGrid)
      }
    } catch (err) {
    //   console.error('Failed to load puzzle:', err)
      setError(err instanceof Error ? err.message : 'Failed to load puzzle')
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Initialize puzzle after auth check completes
  // This ensures user state is available when deciding game mode
  useEffect(() => {
    if (isAuthChecked) {
      loadPuzzle()
    }
  }, [isAuthChecked, loadPuzzle])
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && !isComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, isComplete])
  
  // Save puzzle state to localStorage whenever relevant state changes
  useEffect(() => {
    if (!puzzleData || userGrid.length === 0) return
    
    // Only save if user has started playing (gameMode selected or has input)
    const hasInput = userGrid.some(row => row.some(cell => cell !== ''))
    if (!gameMode && !hasInput) return
    
    savePuzzleState({
      puzzleDate: puzzleData.dateGenerated,
      userGrid,
      gameMode,
      timer,
      submissions,
      isComplete,
      // Store grid dimensions for validation on load
      gridRows: puzzleData.grid.length,
      gridCols: puzzleData.grid[0]?.length || 0,
      // Store verification results to persist correct/incorrect cell status
      verificationResults: Array.from(verificationResults.entries()),
    })
  }, [puzzleData, userGrid, gameMode, timer, submissions, isComplete, verificationResults])
  
  // Format timer
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Start game with mode
  const handleModeSelect = (mode: 'timer') => {
    setGameMode(mode)
    setIsTimerRunning(true)
  }
  
  // Handle streak mode click
  const handleStreakClick = async () => {
    if (!user) {
      // Show auth modal if not logged in
      setShowAuthModal(true)
    } else {
      // Start streak mode - pass user since state is available
      startStreakMode(false, user)
    }
  }
  
  // Start streak mode after authentication
  // preserveCurrentState: if true, keep the current timer and user input (when switching from timed mode)
  // authenticatedUser: optionally pass the user directly (for cases where state hasn't updated yet)
  const startStreakMode = async (preserveCurrentState: boolean = false, authenticatedUser?: CrosswordUser) => {
    const activeUser = authenticatedUser || user
    if (!activeUser || !puzzleData) {
      console.warn('startStreakMode: Missing user or puzzleData', { hasUser: !!activeUser, hasPuzzle: !!puzzleData })
      return
    }
    
    // Store current state before switching
    const wasPlaying = gameMode === 'timer'
    
    // Set game mode immediately (before async operations)
    setGameMode('streak')
    setIsTimerRunning(true)
    
    // Try to load saved game from server (but don't block on it)
    try {
      const savedGame = await loadGame(puzzleData.dateGenerated)
      if (savedGame?.completed) {
        // Already completed today on server - ALWAYS use server data
        // This takes priority over any local progress since the puzzle was already solved
        setIsComplete(true)
        setIsTimerRunning(false)
        setShowWinModal(true) // Show win modal for completed puzzle
        setShowStreakCompletion(true)
        
        // Restore the completed grid state from server
        if (savedGame.gridState && savedGame.gridState.length > 0) {
          setUserGrid(savedGame.gridState)
        }
        // For completed puzzles, use timeToComplete (final time), not timerState (progress time)
        const completedTime = savedGame.timeToComplete || savedGame.timerState || 0
        setTimer(completedTime)
        setSubmissions(savedGame.attempts || 0)
        
        // Mark all cells as correct (since puzzle was completed)
        const newResults = new Map<string, boolean>()
        puzzleData.wordHashes.forEach(wh => {
          newResults.set(`${wh.number}-${wh.direction}`, true)
        })
        setVerificationResults(newResults)
        
        // Sync localStorage with server state
        savePuzzleState({
          puzzleDate: puzzleData.dateGenerated,
          userGrid: savedGame.gridState || [],
          gameMode: 'streak',
          timer: completedTime,
          submissions: savedGame.attempts || 0,
          isComplete: true,
          gridRows: puzzleData.grid.length,
          gridCols: puzzleData.grid[0]?.length || 0,
          verificationResults: Array.from(newResults.entries()),
        })
      } else if (preserveCurrentState && wasPlaying) {
        // User was playing timed challenge - preserve their progress
        // Keep current grid, timer and submissions (already set)
        // No need to override from server since user has local progress
      } else if (savedGame && !savedGame.completed) {
        // Restore saved state from server (fresh login, no local progress)
        if (savedGame.gridState && savedGame.gridState.length > 0) {
          setUserGrid(savedGame.gridState)
        }
        setTimer(savedGame.timerState || 0)
        setSubmissions(savedGame.attempts || 0)
      }
      // If no saved game and not preserving, start fresh (already initialized)
    } catch (err) {
      // Continue with current state if loading fails - streak mode is already set
      console.error('Failed to load saved game:', err)
    }
  }
  
  // Handle successful authentication
  const handleAuthSuccess = (newUser: CrosswordUser) => {
    setUser(newUser)
    setShowAuthModal(false)
    // Auto-start streak mode after login
    // Preserve current state if user was already playing timed challenge
    const wasPlayingTimed = gameMode === 'timer'
    // Pass the user directly since state update is async
    startStreakMode(wasPlayingTimed, newUser)
  }
  
  // Handle logout
  const handleLogout = () => {
    authLogout()
    setUser(null)
    setGameMode(null)
    setShowStreakCompletion(false)
    
    // Clear localStorage to prevent data leakage between users
    clearPuzzleState()
    
    // Reset game state to fresh
    if (puzzleData) {
      setUserGrid(puzzleData.grid.map(row => row.map(cell => cell.isBlocked ? '' : '')))
    }
    setTimer(0)
    setSubmissions(0)
    setIsComplete(false)
    setShowWinModal(false)
    setVerificationResults(new Map())
    setSelectedCell(null)
    setIsTimerRunning(false)
  }
  
  // Save progress to server in streak mode
  const saveStreakProgress = useCallback(async () => {
    if (gameMode !== 'streak' || !user || !puzzleData || isComplete) return
    
    try {
      await saveProgress(
        puzzleData.dateGenerated,
        userGrid,
        timer,
        submissions
      )
    } catch (err) {
      console.error('Failed to save progress:', err)
    }
  }, [gameMode, user, puzzleData, userGrid, timer, submissions, isComplete])
  
  // Auto-save progress every 30 seconds in streak mode
  useEffect(() => {
    if (gameMode !== 'streak' || !user) return
    
    const interval = setInterval(saveStreakProgress, 30000)
    return () => clearInterval(interval)
  }, [gameMode, user, saveStreakProgress])
  
  // Find word hash at cell
  const findWordAtCell = useCallback((row: number, col: number, dir: 'across' | 'down'): WordHash | null => {
    if (!puzzleData) return null
    
    return puzzleData.wordHashes.find(w => {
      if (w.direction !== dir) return false
      
      // Check if cell is part of this word
      if (dir === 'across') {
        return row === w.startRow && col >= w.startCol && col < w.startCol + w.length
      } else {
        return col === w.startCol && row >= w.startRow && row < w.startRow + w.length
      }
    }) || null
  }, [puzzleData])
  
  // Get highlighted cells for current selection
  const getHighlightedCells = useCallback((): Set<string> => {
    if (!selectedCell || !puzzleData) return new Set()
    
    const word = findWordAtCell(selectedCell.row, selectedCell.col, direction)
    if (!word) return new Set()
    
    const cells = new Set<string>()
    for (let i = 0; i < word.length; i++) {
      if (direction === 'across') {
        cells.add(`${word.startRow}-${word.startCol + i}`)
      } else {
        cells.add(`${word.startRow + i}-${word.startCol}`)
      }
    }
    return cells
  }, [selectedCell, direction, puzzleData, findWordAtCell])
  
  const highlightedCells = useMemo(() => getHighlightedCells(), [getHighlightedCells])
  
  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (!puzzleData || puzzleData.grid[row][col].isBlocked) return
    
    // If clicking the same cell, toggle direction
    if (selectedCell?.row === row && selectedCell?.col === col) {
      const cell = puzzleData.grid[row][col]
      if (cell.isPartOfAcross && cell.isPartOfDown) {
        setDirection(prev => prev === 'across' ? 'down' : 'across')
      }
    } else {
      setSelectedCell({ row, col })
      
      // Auto-select direction based on cell's word membership
      const cell = puzzleData.grid[row][col]
      if (cell.isPartOfAcross && !cell.isPartOfDown) {
        setDirection('across')
      } else if (cell.isPartOfDown && !cell.isPartOfAcross) {
        setDirection('down')
      }
    }
    
    // Focus the cell
    const key = `${row}-${col}`
    cellRefs.current.get(key)?.focus()
  }, [selectedCell, puzzleData])
  
  // Move to next cell
  const moveToNextCell = useCallback((row: number, col: number) => {
    if (!puzzleData) return
    
    let nextRow = row
    let nextCol = col
    
    if (direction === 'across') {
      nextCol = col + 1
    } else {
      nextRow = row + 1
    }
    
    // Check if next cell is valid
    if (
      nextRow < puzzleData.grid.length && 
      nextCol < puzzleData.grid[0].length && 
      !puzzleData.grid[nextRow][nextCol].isBlocked
    ) {
      // Check if still in same word
      const word = findWordAtCell(row, col, direction)
      if (word) {
        const isInWord = direction === 'across'
          ? nextRow === word.startRow && nextCol >= word.startCol && nextCol < word.startCol + word.length
          : nextCol === word.startCol && nextRow >= word.startRow && nextRow < word.startRow + word.length
        
        if (isInWord) {
          setSelectedCell({ row: nextRow, col: nextCol })
          cellRefs.current.get(`${nextRow}-${nextCol}`)?.focus()
        }
      }
    }
  }, [puzzleData, direction, findWordAtCell])
  
  // Move to previous cell
  const moveToPrevCell = useCallback((row: number, col: number) => {
    if (!puzzleData) return
    
    let prevRow = row
    let prevCol = col
    
    if (direction === 'across') {
      prevCol = col - 1
    } else {
      prevRow = row - 1
    }
    
    // Check if previous cell is valid
    if (
      prevRow >= 0 && 
      prevCol >= 0 && 
      !puzzleData.grid[prevRow][prevCol].isBlocked
    ) {
      const word = findWordAtCell(row, col, direction)
      if (word) {
        const isInWord = direction === 'across'
          ? prevRow === word.startRow && prevCol >= word.startCol && prevCol < word.startCol + word.length
          : prevCol === word.startCol && prevRow >= word.startRow && prevRow < word.startRow + word.length
        
        if (isInWord) {
          setSelectedCell({ row: prevRow, col: prevCol })
          cellRefs.current.get(`${prevRow}-${prevCol}`)?.focus()
        }
      }
    }
  }, [puzzleData, direction, findWordAtCell])
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    if (!puzzleData) return
    
    const key = e.key.toUpperCase()
    
    // Handle letter input
    if (/^[A-Z]$/.test(key)) {
      e.preventDefault()
      
      // Update user grid
      setUserGrid(prev => {
        const newGrid = prev.map(r => [...r])
        newGrid[row][col] = key
        return newGrid
      })
      
      // Trigger wobbly animation
      setRecentlyTypedCell({ row, col })
      setTimeout(() => setRecentlyTypedCell(null), 300)
      
      // Clear verification result for this cell's words
      setVerificationResults(prev => {
        const newMap = new Map(prev)
        const acrossWord = findWordAtCell(row, col, 'across')
        const downWord = findWordAtCell(row, col, 'down')
        if (acrossWord) newMap.delete(`${acrossWord.number}-across`)
        if (downWord) newMap.delete(`${downWord.number}-down`)
        return newMap
      })
      
      // Move to next cell
      moveToNextCell(row, col)
    }
    
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault()
      
      if (userGrid[row][col]) {
        // Clear current cell
        setUserGrid(prev => {
          const newGrid = prev.map(r => [...r])
          newGrid[row][col] = ''
          return newGrid
        })
        
        // Clear verification result
        setVerificationResults(prev => {
          const newMap = new Map(prev)
          const acrossWord = findWordAtCell(row, col, 'across')
          const downWord = findWordAtCell(row, col, 'down')
          if (acrossWord) newMap.delete(`${acrossWord.number}-across`)
          if (downWord) newMap.delete(`${downWord.number}-down`)
          return newMap
        })
      } else {
        // Move to previous cell
        moveToPrevCell(row, col)
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (col + 1 < puzzleData.grid[0].length && !puzzleData.grid[row][col + 1].isBlocked) {
        setSelectedCell({ row, col: col + 1 })
        cellRefs.current.get(`${row}-${col + 1}`)?.focus()
      }
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (col - 1 >= 0 && !puzzleData.grid[row][col - 1].isBlocked) {
        setSelectedCell({ row, col: col - 1 })
        cellRefs.current.get(`${row}-${col - 1}`)?.focus()
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (row + 1 < puzzleData.grid.length && !puzzleData.grid[row + 1][col].isBlocked) {
        setSelectedCell({ row: row + 1, col })
        cellRefs.current.get(`${row + 1}-${col}`)?.focus()
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (row - 1 >= 0 && !puzzleData.grid[row - 1][col].isBlocked) {
        setSelectedCell({ row: row - 1, col })
        cellRefs.current.get(`${row - 1}-${col}`)?.focus()
      }
    }
    
    // Handle Tab to switch direction
    if (e.key === 'Tab') {
      e.preventDefault()
      const cell = puzzleData.grid[row][col]
      if (cell.isPartOfAcross && cell.isPartOfDown) {
        setDirection(prev => prev === 'across' ? 'down' : 'across')
      }
    }
  }, [puzzleData, userGrid, moveToNextCell, moveToPrevCell, findWordAtCell])
  
  // Check if all cells are filled
  const allCellsFilled = useMemo((): boolean => {
    if (!puzzleData || userGrid.length === 0) return false
    
    for (let r = 0; r < puzzleData.grid.length; r++) {
      for (let c = 0; c < puzzleData.grid[r].length; c++) {
        if (!puzzleData.grid[r][c].isBlocked && !userGrid[r][c]) {
          return false
        }
      }
    }
    return true
  }, [puzzleData, userGrid])
  
  // Submit answers
  const handleSubmit = async () => {
    if (!puzzleData) return
    
    const newSubmissions = submissions + 1
    setSubmissions(newSubmissions)
    
    // Record attempt in streak mode
    if (gameMode === 'streak' && user) {
      try {
        await recordAttempt(puzzleData.dateGenerated)
      } catch (err) {
        console.error('Failed to record attempt:', err)
      }
    }
    
    // Collect user answers
    const userAnswers = puzzleData.wordHashes.map(wordHash => {
      let letters = ''
      for (let i = 0; i < wordHash.length; i++) {
        const row = wordHash.direction === 'down' ? wordHash.startRow + i : wordHash.startRow
        const col = wordHash.direction === 'across' ? wordHash.startCol + i : wordHash.startCol
        letters += userGrid[row]?.[col] || ''
      }
      return {
        word: letters,
        number: wordHash.number,
        direction: wordHash.direction,
      }
    })
    
    // Verify against hashes
    const { results, allCorrect } = await verifyAllAnswers(userAnswers, puzzleData.wordHashes)
    
    // Update verification results
    const newResults = new Map<string, boolean>()
    results.forEach(r => {
      newResults.set(`${r.number}-${r.direction}`, r.correct)
    })
    setVerificationResults(newResults)
    
    // Check for completion
    if (allCorrect) {
      setIsComplete(true)
      setIsTimerRunning(false)
      setShowWinModal(true) // Show win modal
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
      
      // Complete puzzle in streak mode
      if (gameMode === 'streak' && user) {
        try {
          const result = await completePuzzle(
            puzzleData.dateGenerated,
            newSubmissions,
            timer,
            userGrid  // Include the final grid state
          )
          // Update user with new stats
          setUser(prev => prev ? { ...prev, stats: result.stats } : null)
          setShowStreakCompletion(true)
        } catch (err) {
          console.error('Failed to complete puzzle:', err)
        }
      }
    }
  }
  
  // Reset game
  // Show reset confirmation modal
  const handleResetClick = () => {
    if (!puzzleData || isComplete) return
    setShowResetConfirm(true)
  }
  
  // Confirm reset - only clears user input, timer continues
  const handleResetConfirm = () => {
    if (!puzzleData) return
    
    // Clear user input only - timer and submissions continue
    setUserGrid(puzzleData.grid.map(row => row.map(cell => cell.isBlocked ? '' : '')))
    setVerificationResults(new Map())
    setSelectedCell(null)
    
    // Close confirmation modal
    setShowResetConfirm(false)
    
    // Note: Timer and submissions are NOT reset - they continue as is
    // localStorage will be updated automatically by the save effect
  }
  
  // Cancel reset
  const handleResetCancel = () => {
    setShowResetConfirm(false)
  }
  
  // Get cell verification status
  const getCellStatus = (row: number, col: number): { correct: boolean | null; incorrect: boolean | null } => {
    if (!puzzleData) return { correct: null, incorrect: null }
    
    const cell = puzzleData.grid[row][col]
    let isCorrect: boolean | null = null
    let isIncorrect: boolean | null = null
    
    // Check across word
    if (cell.isPartOfAcross && cell.acrossNumber !== null) {
      const result = verificationResults.get(`${cell.acrossNumber}-across`)
      if (result === true) isCorrect = true
      if (result === false) isIncorrect = true
    }
    
    // Check down word
    if (cell.isPartOfDown && cell.downNumber !== null) {
      const result = verificationResults.get(`${cell.downNumber}-down`)
      if (result === true) isCorrect = true
      if (result === false) isIncorrect = true
    }
    
    return { correct: isCorrect, incorrect: isIncorrect }
  }
  
  // Select clue
  const handleClueClick = (number: number, clueDirection: 'across' | 'down') => {
    if (!puzzleData) return
    
    const word = puzzleData.wordHashes.find(w => w.number === number && w.direction === clueDirection)
    if (!word) return
    
    // Find the first empty cell in this word, or the first cell if all filled
    let targetRow = word.startRow
    let targetCol = word.startCol
    
    for (let i = 0; i < word.length; i++) {
      const row = clueDirection === 'down' ? word.startRow + i : word.startRow
      const col = clueDirection === 'across' ? word.startCol + i : word.startCol
      if (!userGrid[row]?.[col]) {
        targetRow = row
        targetCol = col
        break
      }
    }
    
    setSelectedCell({ row: targetRow, col: targetCol })
    setDirection(clueDirection)
    cellRefs.current.get(`${targetRow}-${targetCol}`)?.focus()
  }
  
  // Get active clue number
  const getActiveClue = (): { number: number; direction: 'across' | 'down' } | null => {
    if (!selectedCell || !puzzleData) return null
    
    const word = findWordAtCell(selectedCell.row, selectedCell.col, direction)
    if (!word) return null
    
    return { number: word.number, direction: word.direction }
  }
  
  const activeClue = useMemo(() => getActiveClue(), [selectedCell, direction, puzzleData])
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
        <GamesNavbar />
        <div className="flex flex-col items-center justify-center pt-24 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading today's puzzle...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
        <GamesNavbar />
        <div className="pt-24 px-4">
          <ErrorDisplay error={error} onRetry={loadPuzzle} />
        </div>
      </div>
    )
  }
  
  // No puzzle data
  if (!puzzleData) {
    return null
  }
  
  // Game mode selection
  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
        <GamesNavbar />
        
        <motion.div
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-8"
        >
          {/* Header */}
          <motion.div
            variants={fadeIn('down', 0)}
            className="text-center mb-8"
          >
            <motion.div
              variants={zoomIn(0.2, 0.6)}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6 shadow-lg"
            >
              <span className="text-4xl">🧩</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-4">
              Daily Crossword
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary text-sm sm:text-base mb-2">
              A new puzzle every day at midnight IST!
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-text-muted flex items-center justify-center gap-1">
              <Calendar className="w-4 h-4" />
              Today's puzzle: {puzzleData.dateGenerated}
            </p>
          </motion.div>
          
          {/* User Info (if logged in) */}
          {user && (
            <motion.div
              variants={fadeIn('up', 0.25)}
              className="max-w-3xl mx-auto mb-6"
            >
              <UserInfoBadge 
                user={user} 
                onLogout={handleLogout}
              />
            </motion.div>
          )}
          
          {/* Mode Selection */}
          <GameModeSelector 
            onModeSelect={handleModeSelect}
            user={user}
            onStreakClick={handleStreakClick}
          />
          
          {/* Leaderboard */}
          <motion.div
            variants={fadeIn('up', 0.4)}
            className="mt-8 max-w-3xl mx-auto"
          >
            <Leaderboard compact />
          </motion.div>
          
          {/* Auth Modal */}
          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
          
          {/* How to Play */}
          <motion.div
            variants={fadeIn('up', 0.5)}
            className="mt-8 bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6 max-w-2xl mx-auto"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4 text-center">
              How to Play
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-dark-text-secondary">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">1.</span>
                <span>Click a cell or clue to start typing</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">2.</span>
                <span>Type letters to fill in words</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">3.</span>
                <span>Click same cell or press Tab to switch direction</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">4.</span>
                <span>Submit when all cells are filled</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary-100 dark:bg-primary-900/50 border-2 border-primary-400 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Across highlight</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-400 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Down highlight</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
      <GamesNavbar />
      
      {showConfetti && <ConfettiAnimation />}
      
      <motion.div
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto pt-20 sm:pt-24 px-2 sm:px-4 lg:px-8 pb-8"
      >
        {/* Header with stats */}
        <motion.div
          variants={fadeIn('down', 0)}
          className="text-center mb-4 sm:mb-6"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2">
            Daily Crossword
          </h1>
          <p className="text-xs text-gray-500 dark:text-dark-text-muted">
            {puzzleData.dateGenerated}
          </p>
        </motion.div>
        
        {/* Streak Mode User Info */}
        {gameMode === 'streak' && user && (
          <motion.div
            variants={fadeIn('up', 0.05)}
            className="mb-4"
          >
            <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800/50">
              {/* Row 1: User Info + Action Icons */}
              <div className="flex items-center justify-between gap-2">
                {/* User Info - Left Side */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setShowProfileEditModal(true)}
                    className="relative group flex-shrink-0"
                    title="Edit Profile"
                  >
                    <CrosswordAvatar avatarId={user.avatar} size={36} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings className="w-3 h-3 text-white" />
                    </div>
                  </button>
                  <div className="min-w-0">
                    <button
                      onClick={() => setShowProfileEditModal(true)}
                      className="font-semibold text-sm text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate block max-w-[100px] sm:max-w-none"
                      title="Edit Profile"
                    >
                      {user?.username}
                    </button>
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs">
                      <Flame className="w-3 h-3 flex-shrink-0" />
                      <span>{user?.stats?.currentStreak ?? 0} day streak</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Icons - Right Side (same row) */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Edit Profile Button - Hidden on mobile (avatar click works) */}
                  <button
                    onClick={() => setShowProfileEditModal(true)}
                    className="hidden sm:flex p-2 text-gray-500 hover:text-purple-500 transition-colors rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    title="Edit Profile"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  {/* Games Lobby Button */}
                  <Link
                    href="/games"
                    className="flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                    title="Games Lobby"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Games</span>
                  </Link>
                  
                  {/* Install PWA Button - Desktop only in this row */}
                  <div className="hidden sm:block">
                    <InstallPWAButton />
                  </div>
                  
                  {/* Notification Bell */}
                  <NotificationBellButton isLoggedIn={!!user} userId={user?.id} />
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Row 2: Install App Button - Mobile Only */}
              <div className="sm:hidden mt-3">
                <InstallPWAButton variant="full" />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Stats Bar */}
        <motion.div
          variants={fadeIn('up', 0.1)}
          className="flex flex-wrap items-center justify-center gap-4 mb-4 sm:mb-6"
        >
          {(gameMode === 'timer' || gameMode === 'streak') && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-dark-elevated/50 rounded-xl border border-gray-200 dark:border-dark-border">
                <Clock className={`w-5 h-5 ${isComplete ? 'text-green-500' : 'text-primary-500'}`} />
                <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                  {formatTime(timer)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-dark-elevated/50 rounded-xl border border-gray-200 dark:border-dark-border">
                <Send className="w-5 h-5 text-secondary-500" />
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {submissions} {submissions === 1 ? 'attempt' : 'attempts'}
                </span>
              </div>
              
              {gameMode === 'streak' && user?.stats && (
                <StreakBadge currentStreak={user.stats.currentStreak ?? 0} />
              )}
              
              {/* Completed badge when puzzle is solved */}
              {isComplete && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg">
                  <Trophy className="w-5 h-5" />
                  <span>Completed!</span>
                </div>
              )}
              
              {/* Enter Streak Mode button during timed play */}
              {gameMode === 'timer' && !isComplete && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                >
                  <Flame className="w-4 h-4" />
                  <span className="hidden sm:inline">Enter Streak Mode</span>
                  <span className="sm:hidden">Streak</span>
                </motion.button>
              )}
              
              {/* Games Lobby button for timer mode */}
              {gameMode === 'timer' && (
                <>
                  <Link
                    href="/games"
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-200 dark:hover:bg-dark-surface transition-all border border-gray-200 dark:border-dark-border"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Games</span>
                  </Link>
                  <InstallPWAButton />
                </>
              )}
            </>
          )}
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDirection(direction === 'across' ? 'down' : 'across')}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${
                direction === 'down'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              }`}
            >
              {direction === 'across' ? <ArrowRight className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {direction === 'across' ? 'Across' : 'Down'}
            </motion.button>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6">
          {/* Across Clues */}
          <motion.div
            variants={fadeIn('right', 0.2)}
            className="bg-white/80 dark:bg-dark-elevated/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-dark-border p-4 overflow-y-auto max-h-[300px] lg:max-h-[600px] order-2 lg:order-1"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 sticky top-0 bg-white/80 dark:bg-dark-elevated/50 backdrop-blur-sm py-1">
              <ArrowRight className="w-5 h-5 text-primary-500" />
              Across
            </h3>
            <div className="space-y-1">
              {puzzleData.acrossClues.map(clue => (
                <ClueItem
                  key={`across-${clue.number}`}
                  number={clue.number}
                  clue={clue.clue}
                  direction="across"
                  isActive={activeClue?.number === clue.number && activeClue?.direction === 'across'}
                  onClick={() => handleClueClick(clue.number, 'across')}
                />
              ))}
            </div>
          </motion.div>
          
          {/* Crossword Grid */}
          <motion.div
            variants={fadeIn('up', 0.3)}
            className="bg-white/80 dark:bg-dark-elevated/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-dark-border p-3 sm:p-4 flex flex-col items-center order-1 lg:order-2"
          >
            {/* Grid */}
            <div 
              className="grid gap-0.5 mb-4"
              style={{ 
                gridTemplateColumns: `repeat(${puzzleData.grid[0].length}, minmax(0, 1fr))` 
              }}
            >
              {puzzleData.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`
                  const { correct, incorrect } = getCellStatus(rowIndex, colIndex)
                  const isHighlighted = highlightedCells.has(key)
                  
                  return (
                    <CrosswordCell
                      key={key}
                      value={userGrid[rowIndex]?.[colIndex] || ''}
                      isBlocked={cell.isBlocked}
                      number={cell.number}
                      isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                      isHighlighted={isHighlighted}
                      highlightDirection={isHighlighted ? direction : null}
                      isCorrect={correct}
                      isIncorrect={incorrect}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      cellKey={key}
                      cellRefs={cellRefs}
                      isRecentlyTyped={recentlyTypedCell?.row === rowIndex && recentlyTypedCell?.col === colIndex}
                    />
                  )
                })
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!allCellsFilled || isComplete}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300
                  ${allCellsFilled && !isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Send className="w-5 h-5" />
                Submit Answer
              </motion.button>
              
              <motion.button
                whileHover={{ scale: isComplete ? 1 : 1.02 }}
                whileTap={{ scale: isComplete ? 1 : 0.98 }}
                onClick={handleResetClick}
                disabled={isComplete}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isComplete
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </motion.button>
            </div>
          </motion.div>
          
          {/* Down Clues */}
          <motion.div
            variants={fadeIn('left', 0.2)}
            className="bg-white/80 dark:bg-dark-elevated/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-dark-border p-4 overflow-y-auto max-h-[300px] lg:max-h-[600px] order-3"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 sticky top-0 bg-white/80 dark:bg-dark-elevated/50 backdrop-blur-sm py-1">
              <ArrowDown className="w-5 h-5 text-amber-500" />
              Down
            </h3>
            <div className="space-y-1">
              {puzzleData.downClues.map(clue => (
                <ClueItem
                  key={`down-${clue.number}`}
                  number={clue.number}
                  clue={clue.clue}
                  direction="down"
                  isActive={activeClue?.number === clue.number && activeClue?.direction === 'down'}
                  onClick={() => handleClueClick(clue.number, 'down')}
                />
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Leaderboard for logged-in users */}
        {gameMode === 'streak' && user && (
          <motion.div
            variants={fadeIn('up', 0.4)}
            className="mt-6"
          >
            <Leaderboard className="max-w-2xl mx-auto" />
          </motion.div>
        )}
        
        {/* Public Leaderboard for timer mode (collapsed by default) */}
        {gameMode === 'timer' && (
          <motion.div
            variants={fadeIn('up', 0.4)}
            className="mt-6"
          >
            <Leaderboard className="max-w-2xl mx-auto" compact={true} />
          </motion.div>
        )}
        
        {/* Auth Modal (for switching to streak mode mid-game) */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
        
        {/* Profile Edit Modal */}
        {user && (
          <ProfileEditModal
            isOpen={showProfileEditModal}
            onClose={() => setShowProfileEditModal(false)}
            user={user}
            onProfileUpdate={(updates) => {
              // Update local user state with new profile data
              setUser(prev => prev ? { ...prev, ...updates } : null)
            }}
          />
        )}
        
        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={handleResetCancel}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-dark-elevated rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-dark-border max-w-sm w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Clear Input?
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  This will clear all your entered letters.
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timer and attempts will continue.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetCancel}
                    className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetConfirm}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Clear Input
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Win Modal */}
        <AnimatePresence>
          {showWinModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-dark-elevated rounded-2xl p-8 text-center shadow-2xl border border-gray-200 dark:border-dark-border max-w-md w-full"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Congratulations!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You solved today&apos;s crossword!
                </p>
                
                {(gameMode === 'timer' || gameMode === 'streak') && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <span className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
                        {formatTime(timer)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {submissions} {submissions === 1 ? 'attempt' : 'attempts'}
                      </span>
                    </div>
                    {gameMode === 'streak' && user?.stats && (
                      <div className="flex items-center justify-center gap-3 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {user.stats.currentStreak ?? 0} day streak!
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWinModal(false)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  View Puzzle
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* PWA Install Prompt - Outside main container for fixed positioning */}
      <InstallPWAPrompt />
    </div>
  )
}
