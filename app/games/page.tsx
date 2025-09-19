'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Gamepad2, Dices, Zap, Brain, Users } from 'lucide-react'
import { fadeIn, staggerContainer, zoomIn } from '../lib/utils'
import GamesNavbar from '../components/navigation/games-navbar'

const JoinRoomSection = () => {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomId.trim()) {
      router.push(`/games/room/${roomId.trim().toUpperCase()}`)
    }
  }

  return (
    <motion.div
      variants={fadeIn('up', 0.4)}
      className="text-center mb-8"
    >
      <div className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">
            Join Multiplayer Room
          </h3>
        </div>
        <form onSubmit={handleJoinRoom} className="flex gap-2">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            placeholder="Enter Room ID (e.g., ABC12345)..."
            maxLength={8}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-surface dark:text-dark-text-primary uppercase placeholder:normal-case"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!roomId.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join
          </motion.button>
        </form>
        <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-2">
          Enter the room ID shared by your friend to join their game
        </p>
      </div>
    </motion.div>
  )
}

const games = [
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    description: 'Classic strategy game with AI opponent. Can you outsmart the computer?',
    icon: Gamepad2,
    color: 'from-primary-500 to-primary-700',
    bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
    iconColor: 'text-primary-500',
    difficulty: 'Medium',
    players: '1 Player vs AI'
  },
  {
    id: 'puller',
    title: 'Puller',
    description: 'Strategic dice game where two players compete to pull the token to their side.',
    icon: Dices,
    color: 'from-secondary-500 to-secondary-700',
    bgColor: 'bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20',
    iconColor: 'text-secondary-500',
    difficulty: 'Easy',
    players: '2 Players'
  },
  {
    id: 'find-pairs',
    title: 'Find Pairs',
    description: 'Memory game where you match pairs of cards. Test your memory and concentration!',
    icon: Brain,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    iconColor: 'text-purple-500',
    difficulty: 'Easy',
    players: '1 Player'
  }
]

export default function GamesPage() {
  const router = useRouter()

  const handleGameClick = (gameId: string) => {
    window.open(`/games/${gameId}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
      <GamesNavbar />
      
      <motion.main
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        animate="show"
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            variants={fadeIn('down', 0)}
            className="text-center mb-16"
          >
            <motion.div
              variants={zoomIn(0.2, 0.6)}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-6 shadow-glow"
            >
              <Zap className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Game Zone
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-dark-text-secondary max-w-2xl mx-auto">
              Challenge yourself with these interactive games. Test your strategy, luck, and skills!
            </p>
          </motion.div>

          {/* Join Room Section */}
          <JoinRoomSection />

          {/* Games Grid */}
          <motion.div
            variants={staggerContainer(0.2, 0.4)}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {games.map((game, index) => {
              const IconComponent = game.icon
              
              return (
                <motion.div
                  key={game.id}
                  variants={zoomIn(index * 0.1, 0.6)}
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGameClick(game.id)}
                  className={`
                    group relative cursor-pointer overflow-hidden rounded-2xl p-8
                    ${game.bgColor}
                    border border-white/20 dark:border-dark-border/50
                    backdrop-blur-sm shadow-xl hover:shadow-2xl
                    transition-all duration-500 ease-out
                    perspective-1000 transform-gpu
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Animated Background Gradient */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 
                    group-hover:opacity-10 transition-opacity duration-500
                  `} />
                  
                  {/* Floating Icon */}
                  <motion.div
                    className={`
                      inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6
                      bg-white/10 dark:bg-dark-elevated/50 backdrop-blur-sm
                      border border-white/20 dark:border-dark-border/30
                      shadow-lg group-hover:shadow-xl transition-all duration-300
                    `}
                    whileHover={{ 
                      rotateY: 360,
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <IconComponent className={`w-8 h-8 ${game.iconColor}`} />
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      {game.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-dark-text-secondary mb-6 leading-relaxed">
                      {game.description}
                    </p>

                    {/* Game Info */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-dark-text-muted">Difficulty:</span>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${game.difficulty === 'Easy' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          }
                        `}>
                          {game.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-dark-text-muted">Players:</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                          {game.players}
                        </span>
                      </div>
                    </div>

                    {/* Play Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        w-full py-3 px-6 rounded-xl font-semibold text-white
                        bg-gradient-to-r ${game.color} 
                        hover:shadow-lg active:shadow-md
                        transition-all duration-300
                        group-hover:shadow-glow-secondary
                      `}
                    >
                      Play Now
                    </motion.button>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700" />
                </motion.div>
              )
            })}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            variants={fadeIn('up', 0.6)}
            className="text-center mt-16"
          >
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
              More games coming soon! Have a suggestion?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/#contact')}
              className="px-6 py-3 bg-white/10 dark:bg-dark-elevated/50 backdrop-blur-sm rounded-xl border border-white/20 dark:border-dark-border/30 text-gray-700 dark:text-dark-text-secondary hover:bg-white/20 dark:hover:bg-dark-elevated/70 transition-all duration-300"
            >
              Contact Me
            </motion.button>
          </motion.div>
        </div>
      </motion.main>
    </div>
  )
}
