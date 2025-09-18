'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Home, Trophy, Bot, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fadeIn, staggerContainer, zoomIn } from '../../lib/utils'
import GamesNavbar from '../../components/navigation/games-navbar'

interface CellProps {
  value: string | null
  onClick: () => void
  index: number
  winningCells: number[]
}

const Cell = ({ value, onClick, index, winningCells }: CellProps) => {
  const isWinning = winningCells.includes(index)
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotateZ: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative aspect-square bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm
        border-2 border-white/20 dark:border-dark-border/30 rounded-2xl
        cursor-pointer transition-all duration-300 flex items-center justify-center
        hover:bg-white/20 dark:hover:bg-dark-elevated/50 hover:border-primary-300 dark:hover:border-primary-500
        shadow-lg hover:shadow-xl group perspective-1000
        ${isWinning ? 'border-yellow-400 bg-yellow-100/20 dark:bg-yellow-900/20' : ''}
        ${value ? 'cursor-not-allowed' : ''}
      `}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <AnimatePresence>
        {value && (
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ 
              scale: 1, 
              rotateY: 0,
              rotateX: [0, 10, 0],
            }}
            transition={{ 
              duration: 0.5,
              ease: "backOut",
              rotateX: { repeat: 1, duration: 0.3 }
            }}
            className={`
              text-6xl md:text-7xl font-bold select-none
              ${value === 'X' 
                ? 'text-primary-500 dark:text-primary-400' 
                : 'text-secondary-500 dark:text-secondary-400'
              }
              ${isWinning ? 'animate-pulse scale-110' : ''}
              drop-shadow-lg transform-gpu
            `}
            style={{
              textShadow: value === 'X' 
                ? '0 0 20px rgba(59, 130, 246, 0.5)' 
                : '0 0 20px rgba(245, 158, 11, 0.5)'
            }}
          >
            {value}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-200/20 to-secondary-200/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
}

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
]

export default function TicTacToePage() {
  const router = useRouter()
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X')
  const [winner, setWinner] = useState<string | null>(null)
  const [winningCells, setWinningCells] = useState<number[]>([])
  const [gameStats, setGameStats] = useState({ wins: 0, losses: 0, draws: 0 })
  const [isThinking, setIsThinking] = useState(false)

  const calculateWinner = (squares: (string | null)[]) => {
    for (let i = 0; i < winningLines.length; i++) {
      const [a, b, c] = winningLines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] }
      }
    }
    return null
  }

  const isBoardFull = (squares: (string | null)[]) => {
    return squares.every(cell => cell !== null)
  }

  const calculateBotMove = (squares: (string | null)[]) => {
    const availableMoves = squares.reduce<number[]>((moves, cell, index) => {
      if (!cell) moves.push(index)
      return moves
    }, [])

    // Check if bot can win
    for (const move of availableMoves) {
      const tempBoard = [...squares]
      tempBoard[move] = 'O'
      if (calculateWinner(tempBoard)?.winner === 'O') {
        return move
      }
    }

    // Check if bot needs to block player
    for (const move of availableMoves) {
      const tempBoard = [...squares]
      tempBoard[move] = 'X'
      if (calculateWinner(tempBoard)?.winner === 'X') {
        return move
      }
    }

    // Take center if available
    if (availableMoves.includes(4)) return 4

    // Take corners
    const corners = [0, 2, 6, 8]
    const availableCorners = corners.filter(corner => availableMoves.includes(corner))
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)]
    }

    // Take any available move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  const handleCellClick = (index: number) => {
    if (board[index] || winner || currentPlayer === 'O') return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const result = calculateWinner(newBoard)
    if (result) {
      setWinner(result.winner)
      setWinningCells(result.line)
      setGameStats(prev => ({
        ...prev,
        [result.winner === 'X' ? 'wins' : 'losses']: prev[result.winner === 'X' ? 'wins' : 'losses'] + 1
      }))
    } else if (isBoardFull(newBoard)) {
      setWinner('Draw')
      setGameStats(prev => ({ ...prev, draws: prev.draws + 1 }))
    } else {
      setCurrentPlayer('O')
    }
  }

  useEffect(() => {
    if (currentPlayer === 'O' && !winner) {
      setIsThinking(true)
      const timer = setTimeout(() => {
        const botMove = calculateBotMove(board)
        const newBoard = [...board]
        newBoard[botMove] = 'O'
        setBoard(newBoard)

        const result = calculateWinner(newBoard)
        if (result) {
          setWinner(result.winner)
          setWinningCells(result.line)
          setGameStats(prev => ({
            ...prev,
            [result.winner === 'X' ? 'wins' : 'losses']: prev[result.winner === 'X' ? 'wins' : 'losses'] + 1
          }))
        } else if (isBoardFull(newBoard)) {
          setWinner('Draw')
          setGameStats(prev => ({ ...prev, draws: prev.draws + 1 }))
        } else {
          setCurrentPlayer('X')
        }
        setIsThinking(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, board, winner])

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
    setWinningCells([])
    setIsThinking(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
      <GamesNavbar />
      <div className="flex items-center justify-center p-4 pt-24">
        <motion.div
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        animate="show"
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <motion.div
          variants={fadeIn('down', 0)}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Tic Tac Toe
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Challenge the AI in this classic strategy game
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Game Stats */}
          <motion.div
            variants={fadeIn('left', 0.2)}
            className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Game Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-dark-text-secondary">Wins</span>
                <span className="text-green-500 font-bold">{gameStats.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-dark-text-secondary">Losses</span>
                <span className="text-red-500 font-bold">{gameStats.losses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-dark-text-secondary">Draws</span>
                <span className="text-yellow-500 font-bold">{gameStats.draws}</span>
              </div>
            </div>
          </motion.div>

          {/* Game Board */}
          <motion.div
            variants={fadeIn('up', 0.3)}
            className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6"
          >
            {/* Current Player */}
            <div className="text-center mb-6">
              <AnimatePresence mode="wait">
                {winner ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="space-y-2"
                  >
                    <div className="text-2xl font-bold">
                      {winner === 'Draw' ? (
                        <span className="text-yellow-500">It's a Draw!</span>
                      ) : winner === 'X' ? (
                        <span className="text-green-500">You Won! 🎉</span>
                      ) : (
                        <span className="text-red-500">AI Won! 🤖</span>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentPlayer}
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: -180 }}
                    className="flex items-center justify-center gap-3"
                  >
                    {currentPlayer === 'X' ? (
                      <>
                        <User className="w-6 h-6 text-primary-500" />
                        <span className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                          Your Turn
                        </span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-6 h-6 text-secondary-500" />
                        <span className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                          {isThinking ? 'AI Thinking...' : 'AI Turn'}
                        </span>
                        {isThinking && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-secondary-500 border-t-transparent rounded-full"
                          />
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Board */}
            <motion.div
              variants={staggerContainer(0.05, 0.1)}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              {board.map((cell, index) => (
                <motion.div
                  key={index}
                  variants={zoomIn(index * 0.05, 0.3)}
                >
                  <Cell
                    value={cell}
                    onClick={() => handleCellClick(index)}
                    index={index}
                    winningCells={winningCells}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Reset Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              New Game
            </motion.button>
          </motion.div>

          {/* Game Rules */}
          <motion.div
            variants={fadeIn('right', 0.4)}
            className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              How to Play
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-dark-text-secondary">
              <div className="flex items-start gap-2">
                <span className="text-primary-500 font-bold">1.</span>
                <span>You are X, AI is O</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-500 font-bold">2.</span>
                <span>Click any empty cell to make your move</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-500 font-bold">3.</span>
                <span>Get 3 in a row (horizontal, vertical, or diagonal) to win</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-500 font-bold">4.</span>
                <span>The AI will try to beat you - good luck!</span>
              </div>
            </div>
          </motion.div>
        </div>
        </motion.div>
      </div>
    </div>
  )
}
