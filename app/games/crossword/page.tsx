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
  RefreshCw
} from 'lucide-react'
import { fadeIn, staggerContainer, zoomIn } from '../../lib/utils'
import GamesNavbar from '../../components/navigation/games-navbar'
import { 
  fetchDailyPuzzle, 
  CrosswordPuzzleData, 
  CrosswordCell as CellData,
  WordHash 
} from '../../lib/crossword/api'
import { verifyAllAnswers } from '../../lib/crossword/hash-utils'

// LocalStorage key for crossword puzzle state
const STORAGE_KEY = 'crossword_puzzle_state'

// Saved puzzle state interface
interface SavedPuzzleState {
  puzzleDate: string
  userGrid: string[][]
  gameMode: 'timer' | 'casual' | null
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
      console.warn('Invalid saved puzzle state, clearing...')
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
    console.warn('Missing puzzle date, clearing saved state...')
    return false
  }
  
  // Check date matches exactly (both come from server in YYYY-MM-DD format)
  if (savedState.puzzleDate !== puzzleData.dateGenerated) {
    console.log(
      'Puzzle date mismatch. Saved:', savedState.puzzleDate,
      'Current:', puzzleData.dateGenerated
    )
    return false
  }
  
  // Defensive check for grid existence
  if (!puzzleData.grid || !Array.isArray(puzzleData.grid) || puzzleData.grid.length === 0) {
    console.warn('Invalid puzzle grid from server')
    return false
  }
  
  // Check grid dimensions match
  const expectedRows = puzzleData.grid.length
  const expectedCols = puzzleData.grid[0]?.length || 0
  
  if (
    savedState.userGrid.length !== expectedRows ||
    savedState.userGrid[0]?.length !== expectedCols
  ) {
    console.warn('Saved grid dimensions do not match puzzle, clearing...')
    return false
  }
  
  // Also check stored dimensions if available (for extra validation)
  if (
    savedState.gridRows !== undefined && 
    savedState.gridCols !== undefined &&
    (savedState.gridRows !== expectedRows || savedState.gridCols !== expectedCols)
  ) {
    console.warn('Stored grid dimensions do not match, clearing...')
    return false
  }
  
  // Validate each row has correct number of columns
  for (const row of savedState.userGrid) {
    if (!Array.isArray(row) || row.length !== expectedCols) {
      console.warn('Saved grid row structure invalid, clearing...')
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
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onKeyDown={onKeyDown}
        readOnly
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

// Game Mode Selector
const GameModeSelector = ({ 
  onModeSelect 
}: { 
  onModeSelect: (mode: 'timer' | 'casual') => void 
}) => {
  return (
    <motion.div
      variants={fadeIn('up', 0.3)}
      className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6 max-w-2xl mx-auto"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 text-center flex items-center justify-center gap-2">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        Choose Your Challenge Mode
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onModeSelect('timer')}
          className="group relative p-6 rounded-2xl border-2 border-primary-300 dark:border-primary-600 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 transition-all duration-300 flex flex-col items-center gap-3"
        >
          <Timer className="w-12 h-12 text-primary-500" />
          <span className="font-bold text-lg text-gray-900 dark:text-dark-text-primary">Timed Challenge</span>
          <span className="text-sm text-center text-gray-600 dark:text-dark-text-secondary">
            ⏱️ Race against time!<br />
            <span className="text-xs">Timer + submission count tracked</span>
          </span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onModeSelect('casual')}
          className="group relative p-6 rounded-2xl border-2 border-secondary-300 dark:border-secondary-600 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 transition-all duration-300 flex flex-col items-center gap-3"
        >
          <Calendar className="w-12 h-12 text-secondary-500" />
          <span className="font-bold text-lg text-gray-900 dark:text-dark-text-primary">Casual Play</span>
          <span className="text-sm text-center text-gray-600 dark:text-dark-text-secondary">
            🧩 Take your time<br />
            <span className="text-xs">No pressure, just fun!</span>
          </span>
        </motion.button>
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
  const [gameMode, setGameMode] = useState<'timer' | 'casual' | null>(null)
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
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Refs for cell inputs
  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  
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
        console.log('Restoring saved puzzle state for:', data.dateGenerated)
        setUserGrid(savedState.userGrid)
        if (savedState.gameMode) {
          setGameMode(savedState.gameMode)
          if (savedState.gameMode === 'timer') {
            setTimer(savedState.timer || 0)
            setSubmissions(savedState.submissions || 0)
            // Don't auto-start timer if puzzle was completed
            if (!savedState.isComplete) {
              setIsTimerRunning(true)
            }
          }
          setIsComplete(savedState.isComplete || false)
        }
        // Restore verification results if available
        if (savedState.verificationResults && Array.isArray(savedState.verificationResults)) {
          setVerificationResults(new Map(savedState.verificationResults))
        }
      } else {
        // Invalid, different day, or no saved state - clear old data and start fresh
        if (savedState) {
          console.log('Clearing old puzzle state. Saved date:', savedState.puzzleDate, 'Current date:', data.dateGenerated)
          clearPuzzleState()
        }
        
        // Reset all game state
        setGameMode(null)
        setTimer(0)
        setSubmissions(0)
        setIsComplete(false)
        setIsTimerRunning(false)
        setVerificationResults(new Map())
        setSelectedCell(null)
        
        // Initialize empty user grid
        const emptyGrid = data.grid.map(row =>
          row.map(cell => cell.isBlocked ? '' : '')
        )
        setUserGrid(emptyGrid)
      }
    } catch (err) {
      console.error('Failed to load puzzle:', err)
      setError(err instanceof Error ? err.message : 'Failed to load puzzle')
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Initialize puzzle on mount
  useEffect(() => {
    loadPuzzle()
  }, [loadPuzzle])
  
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
  const handleModeSelect = (mode: 'timer' | 'casual') => {
    setGameMode(mode)
    if (mode === 'timer') {
      setIsTimerRunning(true)
    }
  }
  
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
    
    setSubmissions(prev => prev + 1)
    
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
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
    }
  }
  
  // Reset game
  const handleReset = () => {
    if (!puzzleData) return
    
    // Clear user input
    setUserGrid(puzzleData.grid.map(row => row.map(cell => cell.isBlocked ? '' : '')))
    setVerificationResults(new Map())
    setSelectedCell(null)
    setIsComplete(false)
    
    if (gameMode === 'timer') {
      setTimer(0)
      setSubmissions(0)
      setIsTimerRunning(true)
    }
    
    // Clear saved state from localStorage (will be re-saved with empty grid)
    clearPuzzleState()
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
          
          {/* Mode Selection */}
          <GameModeSelector onModeSelect={handleModeSelect} />
          
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
        
        {/* Stats Bar */}
        <motion.div
          variants={fadeIn('up', 0.1)}
          className="flex flex-wrap items-center justify-center gap-4 mb-4 sm:mb-6"
        >
          {gameMode === 'timer' && (
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
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
        
        {/* Win Modal */}
        <AnimatePresence>
          {isComplete && (
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
                  You solved today's crossword!
                </p>
                
                {gameMode === 'timer' && (
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
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsComplete(false)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  View Puzzle
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
