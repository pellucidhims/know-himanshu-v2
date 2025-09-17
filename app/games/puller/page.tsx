'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Home, Dices, Users, Trophy, ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fadeIn, staggerContainer, zoomIn } from '../../lib/utils'

const DiceComponent = ({ value, isRolling }: { value: number | string, isRolling: boolean }) => {
  const getDiceDisplay = (val: number | string) => {
    if (typeof val === 'string') return val
    const dots = '●'.repeat(val)
    const dicePatterns: { [key: number]: JSX.Element } = {
      1: <div className="text-5xl md:text-5xl">⚀</div>,
      2: <div className="text-5xl md:text-5xl">⚁</div>,
      3: <div className="text-5xl md:text-5xl">⚂</div>,
      4: <div className="text-5xl md:text-5xl">⚃</div>,
      5: <div className="text-5xl md:text-5xl">⚄</div>,
      6: <div className="text-5xl md:text-5xl">⚅</div>,
    }
    return dicePatterns[val] || <div className="text-lg font-bold">{val}</div>
  }

  return (
    <motion.div
      className={`
        w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
        flex items-center justify-center rounded-xl font-bold
        bg-white text-gray-800 border-4 border-gray-300 shadow-2xl
        relative transform-gpu
        ${isRolling ? 'animate-none' : ''}
      `}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: isRolling 
          ? '0 0 30px rgba(59, 130, 246, 0.8)' 
          : '0 8px 25px rgba(0, 0, 0, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.4)'
      }}
      animate={isRolling ? {
        rotateX: [0, 360, 720, 1080],
        rotateY: [0, 360, 720, 1080],
        rotateZ: [0, 180, 360, 540],
        scale: [1, 1.1, 1.05, 1],
        boxShadow: [
          '0 8px 25px rgba(0, 0, 0, 0.3)',
          '0 12px 35px rgba(59, 130, 246, 0.6)',
          '0 8px 25px rgba(0, 0, 0, 0.3)'
        ]
      } : {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1
      }}
      transition={{
        duration: isRolling ? 1.5 : 0.3,
        ease: isRolling ? "easeOut" : "easeInOut"
      }}
    >
      {/* Dice face */}
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-white to-gray-100">
        {isRolling ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            className="text-2xl"
          >
            🎲
          </motion.div>
        ) : (
          getDiceDisplay(value)
        )}
      </div>
      
      {/* 3D edges */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 opacity-30 transform translate-x-1 translate-y-1 -z-10" />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-l from-gray-400 to-gray-500 opacity-20 transform translate-x-2 translate-y-2 -z-20" />
    </motion.div>
  )
}

interface BoxProps {
  markerPosition: number
  boxIndex: number
  marker: string
  isCenter: boolean
  isEndzone: boolean
  playerZone: 'A' | 'B' | null
}

const Box = ({ markerPosition, boxIndex, marker, isCenter, isEndzone, playerZone }: BoxProps) => {
  const hasMarker = markerPosition === boxIndex
  
  return (
    <motion.div
      className={`
        relative flex items-center justify-center rounded-lg transition-all duration-300
        border-2 font-bold shadow-lg transform-gpu
        w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12
        ${hasMarker ? 'scale-110 border-yellow-400 bg-yellow-100/20 dark:bg-yellow-900/20' : 'border-white/20 dark:border-dark-border/30'}
        ${isCenter ? 'bg-white/20 dark:bg-dark-elevated/40 border-primary-300 dark:border-primary-500' : ''}
        ${isEndzone && playerZone === 'A' ? 'bg-gradient-to-r from-green-200/30 to-green-300/30 dark:from-green-900/20 dark:to-green-800/20 border-green-400 dark:border-green-500' : ''}
        ${isEndzone && playerZone === 'B' ? 'bg-gradient-to-r from-blue-200/30 to-blue-300/30 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-400 dark:border-blue-500' : ''}
        ${!isEndzone && !isCenter ? 'bg-white/10 dark:bg-dark-elevated/20' : ''}
        perspective-1000
      `}
      style={{ transformStyle: 'preserve-3d' }}
      animate={hasMarker ? { 
        rotateY: [0, 10, -10, 0], 
        scale: [1, 1.1, 1.1, 1.1],
        y: [0, -4, 0] 
      } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <AnimatePresence>
        {hasMarker && (
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ 
              scale: 1, 
              rotateY: 0,
              rotateX: [0, 15, 0],
            }}
            transition={{ 
              duration: 0.5,
              ease: "backOut",
              rotateX: { duration: 0.4, repeat: 1 }
            }}
            className="text-sm sm:text-base md:text-lg lg:text-xl select-none text-yellow-600 dark:text-yellow-400 drop-shadow-lg"
            style={{
              textShadow: '0 0 15px rgba(245, 158, 11, 0.8)'
            }}
          >
            {marker}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface PlayHistoryProps {
  playStack: string[]
}

const PlayHistory = ({ playStack }: PlayHistoryProps) => (
  <motion.div
    variants={fadeIn('up', 0.4)}
    className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6 max-h-96 overflow-hidden"
  >
    <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2 sticky top-0 bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-lg p-2 -m-2">
      <Trophy className="w-5 h-5 text-yellow-500" />
      Game History
    </h3>
    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
      <AnimatePresence>
        {playStack.map((step, idx) => (
          <motion.div
            key={`${step}-${idx}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="flex items-start gap-2 p-2 bg-white/5 dark:bg-dark-elevated/20 rounded-lg border border-white/10 dark:border-dark-border/20"
          >
            <span className="text-primary-500 font-bold text-sm">
              {playStack.length - idx}.
            </span>
            <span className="text-sm text-gray-600 dark:text-dark-text-secondary flex-1">
              {step}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
      {playStack.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No moves yet. Start playing!
        </div>
      )}
    </div>
  </motion.div>
)

export default function PullerPage() {
  const router = useRouter()
  const boxCount = 23 // Ensure odd number for center positioning
  const [boxes] = useState(() => Array(boxCount).fill(null))
  const [markerPosition, setMarkerPosition] = useState(() => Math.floor(boxCount / 2))
  const [marker] = useState(() => "🎯")
  const [diceCount, setDiceCount] = useState<number | string>("")
  const [loading, setLoading] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<'A' | 'B'>('A')
  const [winner, setWinner] = useState<string | null>(null)
  const [playStack, setPlayStack] = useState<string[]>([])
  const [gameStats, setGameStats] = useState({ playerA: 0, playerB: 0 })

  useEffect(() => {
    const newWinner = checkWinner()
    if (newWinner && !winner) {
      setPlayStack(prevStack => [`🎉 Player ${newWinner} Won the Game!`, ...prevStack])
      setWinner(newWinner)
      setGameStats(prev => ({
        ...prev,
        [newWinner === 'A' ? 'playerA' : 'playerB']: prev[newWinner === 'A' ? 'playerA' : 'playerB'] + 1
      }))
    }
  }, [markerPosition, winner])

  const checkWinner = (): string | null => {
    if (markerPosition === 0) return 'A'
    if (markerPosition === boxCount - 1) return 'B'
    return null
  }

  const handleRollDice = () => {
    if (loading || winner) return
    
    setLoading(true)
    
    setTimeout(() => {
      const newCount = Math.floor(Math.random() * 6) + 1
      setDiceCount(newCount)
      
      const direction = currentPlayer === 'A' ? -1 : 1
      const newMarkerPosition = markerPosition + newCount * direction
      
      const isValidMove = currentPlayer === 'A' 
        ? newMarkerPosition >= 0 
        : newMarkerPosition <= boxCount - 1

      if (isValidMove) {
        setPlayStack(prevStack => [
          `Player ${currentPlayer} rolled ${newCount} and moved ${currentPlayer === 'A' ? 'left' : 'right'}`,
          ...prevStack
        ])
        animateMarker(newMarkerPosition)
      } else {
        setPlayStack(prevStack => [
          `Player ${currentPlayer} rolled ${newCount} but couldn't move (invalid position)`,
          ...prevStack
        ])
        setLoading(false)
        setCurrentPlayer(prevPlayer => prevPlayer === 'A' ? 'B' : 'A')
      }
    }, 1500)
  }

  const animateMarker = (newPosition: number) => {
    let currentPosition = markerPosition
    const step = currentPosition < newPosition ? 1 : -1

    const interval = setInterval(() => {
      currentPosition += step
      setMarkerPosition(currentPosition)

      if (currentPosition === newPosition) {
        clearInterval(interval)
        setLoading(false)
        setCurrentPlayer(prevPlayer => prevPlayer === 'A' ? 'B' : 'A')
      }
    }, 200)
  }

  const resetGame = () => {
    setMarkerPosition(Math.floor(boxCount / 2))
    setCurrentPlayer('A')
    setWinner(null)
    setPlayStack([])
    setDiceCount("")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
      <motion.div
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div
          variants={fadeIn('down', 0)}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/games')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-dark-border/30 text-gray-700 dark:text-dark-text-secondary hover:bg-white/20 dark:hover:bg-dark-elevated/50 transition-all duration-300 mb-6"
          >
            <Home className="w-4 h-4" />
            Back to Games
          </motion.button>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Puller Game
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary text-sm sm:text-base">
            Roll the dice and pull the token to your side!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Game Stats */}
          <motion.div
            variants={fadeIn('left', 0.2)}
            className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-4 lg:p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Score
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-100/20 dark:bg-green-900/20 rounded-lg border border-green-300/30">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-green-700 dark:text-green-400">Player A</span>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{gameStats.playerA}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-100/20 dark:bg-blue-900/20 rounded-lg border border-blue-300/30">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-700 dark:text-blue-400">Player B</span>
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{gameStats.playerB}</span>
              </div>
            </div>
          </motion.div>

          {/* Game Board */}
          <motion.div
            variants={fadeIn('up', 0.3)}
            className="lg:col-span-2 bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-4 lg:p-6"
          >
            {/* Players */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <motion.div
                className={`
                  flex items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-xl transition-all duration-300
                  ${currentPlayer === 'A' && !winner 
                    ? 'bg-green-100/30 dark:bg-green-900/30 border-2 border-green-400 shadow-lg scale-105' 
                    : 'bg-green-100/10 dark:bg-green-900/10 border-2 border-green-300/30'
                  }
                `}
                animate={currentPlayer === 'A' && !winner ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
                <span className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">A</span>
              </motion.div>

              <motion.div
                className={`
                  flex items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-xl transition-all duration-300
                  ${currentPlayer === 'B' && !winner 
                    ? 'bg-blue-100/30 dark:bg-blue-900/30 border-2 border-blue-400 shadow-lg scale-105' 
                    : 'bg-blue-100/10 dark:bg-blue-900/10 border-2 border-blue-300/30'
                  }
                `}
                animate={currentPlayer === 'B' && !winner ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">B</span>
                <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
              </motion.div>
            </div>

            {/* Game Board */}
            <div className="overflow-x-auto pb-4">
              <motion.div
                variants={staggerContainer(0.02, 0.1)}
                className="grid gap-1 sm:gap-2 mb-6 mx-auto justify-center"
                style={{ 
                  gridTemplateColumns: `repeat(${boxCount}, minmax(24px, 1fr))`,
                  maxWidth: '100%',
                  width: 'fit-content'
                }}
              >
              {boxes.map((_, idx) => {
                const isCenter = idx === Math.floor(boxCount / 2)
                const isEndzone = idx === 0 || idx === boxCount - 1
                const playerZone = idx === 0 ? 'A' : idx === boxCount - 1 ? 'B' : null
                
                return (
                  <motion.div
                    key={idx}
                    variants={zoomIn(idx * 0.02, 0.3)}
                  >
                    <Box
                      markerPosition={markerPosition}
                      boxIndex={idx}
                      marker={marker}
                      isCenter={isCenter}
                      isEndzone={isEndzone}
                      playerZone={playerZone}
                    />
                  </motion.div>
                )
              })}
              </motion.div>
            </div>

            {/* Game Controls */}
            <div className="space-y-4">
              {/* Current Status */}
              <div className="text-center">
                <AnimatePresence mode="wait">
                  {winner ? (
                    <motion.div
                      initial={{ scale: 0, rotateY: 180 }}
                      animate={{ scale: 1, rotateY: 0 }}
                      className="text-2xl font-bold"
                    >
                      <span className={winner === 'A' ? 'text-green-500' : 'text-blue-500'}>
                        🎉 Player {winner} Wins! 🎉
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentPlayer}
                      initial={{ rotateY: 180 }}
                      animate={{ rotateY: 0 }}
                      exit={{ rotateY: -180 }}
                      className="flex items-center justify-center gap-3"
                    >
                      <Users className="w-6 h-6 text-gray-500" />
                      <span className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                        Player {currentPlayer}'s Turn
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dice and Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRollDice}
                  disabled={loading || !!winner}
                  className={`
                    px-6 sm:px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 
                    flex items-center gap-2 w-full sm:w-auto justify-center
                    ${loading || winner 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-primary-500 to-primary-700 hover:shadow-lg'
                    }
                  `}
                >
                  <Dices className="w-5 h-5" />
                  <span className="text-sm sm:text-base">
                    {loading ? 'Rolling...' : winner ? `Player ${winner} Won!` : `Roll Dice`}
                  </span>
                </motion.button>

                {/* 3D Dice Display */}
                <DiceComponent value={diceCount || '?'} isRolling={loading} />
              </div>

              {/* Reset Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="w-full py-3 px-6 bg-gradient-to-r from-secondary-500 to-secondary-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                New Game
              </motion.button>
            </div>
          </motion.div>

          {/* Play History */}
          <PlayHistory playStack={playStack} />
        </div>

        {/* Game Rules */}
        <motion.div
          variants={fadeIn('up', 0.5)}
          className="mt-8 bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
            How to Play
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-dark-text-secondary">
            <div className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">1.</span>
              <span>Players A and B take turns rolling the dice</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">2.</span>
              <span>Player A moves token left, Player B moves right</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">3.</span>
              <span>Move exactly the number of steps shown on dice</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">4.</span>
              <span>First player to pull token to their end wins!</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
