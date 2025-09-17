'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Gamepad2, Zap, Trophy, Target, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { fadeIn, staggerContainer, textVariant, zoomIn } from '../../lib/utils'

const DiceFalling = () => {
  const [dicePositions, setDicePositions] = useState<Array<{id: number, x: number, delay: number}>>([])
  
  useEffect(() => {
    const positions = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2
    }))
    setDicePositions(positions)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dicePositions.map((dice) => (
        <motion.div
          key={dice.id}
          className="absolute text-4xl opacity-20"
          style={{ left: `${dice.x}%`, top: '-10%' }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, 360, 720],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + dice.delay,
            repeat: Infinity,
            delay: dice.delay,
            ease: "easeInOut"
          }}
        >
          🎲
        </motion.div>
      ))}
    </div>
  )
}

const RopePulling = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Left rope */}
      <motion.div
        className="absolute left-0 w-32 h-2 bg-gradient-to-r from-amber-600 to-amber-800 opacity-30"
        style={{ top: '50%', transformOrigin: 'right center' }}
        animate={{
          scaleX: [1, 1.2, 0.8, 1],
          x: [-20, 10, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Right rope */}
      <motion.div
        className="absolute right-0 w-32 h-2 bg-gradient-to-l from-blue-600 to-blue-800 opacity-30"
        style={{ top: '50%', transformOrigin: 'left center' }}
        animate={{
          scaleX: [1, 1.2, 0.8, 1],
          x: [20, -10, 10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
      
      {/* Center token */}
      <motion.div
        className="absolute text-6xl opacity-40"
        style={{ top: '45%' }}
        animate={{
          x: [-20, 20, -10, 10, 0],
          scale: [1, 1.1, 0.9, 1],
          rotate: [-5, 5, -3, 3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🎯
      </motion.div>
    </div>
  )
}

const FloatingGameIcons = () => {
  const icons = ['🎮', '🎲', '🏆', '⚡', '🎯', '✨']
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((icon, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl opacity-20"
          style={{
            left: `${10 + (index * 15)}%`,
            top: `${20 + (index % 3) * 20}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            rotate: [-10, 10, -10],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + (index * 0.5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  )
}

export default function Games() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
  const [showAnimations, setShowAnimations] = useState(false)

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setShowAnimations(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isInView])

  const gameFeatures = [
    {
      icon: Gamepad2,
      title: "Strategic Gameplay",
      description: "Challenge your mind with AI-powered tic-tac-toe",
      color: "text-blue-500"
    },
    {
      icon: Target,
      title: "Competitive Fun",
      description: "Battle friends in the exciting Puller game",
      color: "text-green-500"
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor your wins and celebrate victories",
      color: "text-yellow-500"
    }
  ]

  return (
    <section 
      ref={sectionRef}
      id="games" 
      className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20"
    >
      {/* Animated Background Elements */}
      {showAnimations && (
        <>
          <DiceFalling />
          <RopePulling />
          <FloatingGameIcons />
        </>
      )}
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent dark:via-black/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="text-center space-y-16"
        >
          {/* Header */}
          <motion.div variants={textVariant(0)} className="space-y-6">
            <motion.div
              variants={zoomIn(0.2, 0.6)}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-6 shadow-2xl"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2 
              variants={textVariant(0.1)}
              className="text-5xl md:text-7xl font-bold"
            >
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Game Zone
              </span>
            </motion.h2>
            
            <motion.p 
              variants={textVariant(0.2)}
              className="text-xl md:text-2xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto leading-relaxed"
            >
              Step into a world of <span className="font-bold text-purple-600 dark:text-purple-400">mind-bending challenges</span> and 
              <span className="font-bold text-pink-600 dark:text-pink-400"> competitive thrills</span>! 
              Experience games that will test your strategy, luck, and reflexes.
            </motion.p>
          </motion.div>

          {/* Game Features */}
          <motion.div
            variants={staggerContainer(0.1, 0.3)}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {gameFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              
              return (
                <motion.div
                  key={index}
                  variants={fadeIn('up', index * 0.1)}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  className="group relative p-8 bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 shadow-xl hover:shadow-2xl transition-all duration-500"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 bg-white/20 dark:bg-dark-elevated/50 backdrop-blur-sm border border-white/30 dark:border-dark-border/40 ${feature.color}`}
                    whileHover={{ rotateY: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <IconComponent className="w-8 h-8" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Main CTA */}
          <motion.div
            variants={fadeIn('up', 0.5)}
            className="space-y-8"
          >
            <motion.div
              variants={textVariant(0.6)}
              className="space-y-4"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">
                Ready for the <span className="text-purple-600 dark:text-purple-400">Ultimate</span> Challenge?
              </h3>
              <p className="text-lg text-gray-600 dark:text-dark-text-secondary max-w-2xl mx-auto">
                🎯 Outsmart our AI in Tic-Tac-Toe • 🎲 Master the strategy in Puller • 🏆 Claim your victories!
              </p>
            </motion.div>

            {/* Animated CTA Button */}
            <motion.div
              variants={zoomIn(0.7, 0.8)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/games"
                className="group relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 overflow-hidden"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="relative z-10"
                >
                  <Zap className="w-6 h-6" />
                </motion.div>
                
                <span className="relative z-10">Enter Game Zone</span>
                
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Teaser Stats */}
            <motion.div
              variants={fadeIn('up', 0.8)}
              className="grid grid-cols-3 gap-8 max-w-md mx-auto pt-8"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                >
                  2
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Epic Games</div>
              </div>
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="text-2xl font-bold text-pink-600 dark:text-pink-400"
                >
                  ∞
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Hours of Fun</div>
              </div>
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                >
                  100%
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Free to Play</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating Action Elements */}
          <motion.div
            variants={fadeIn('up', 1)}
            className="flex justify-center items-center gap-4 text-sm text-gray-500 dark:text-dark-text-muted"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <span>No downloads required</span>
              <span className="text-green-500">✓</span>
            </motion.span>
            <span>•</span>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="flex items-center gap-2"
            >
              <span>Instant play</span>
              <span className="text-green-500">✓</span>
            </motion.span>
            <span>•</span>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 2 }}
              className="flex items-center gap-2"
            >
              <span>Mobile friendly</span>
              <span className="text-green-500">✓</span>
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
