'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Lock, Sparkles } from 'lucide-react'
import { Badge, BADGES, getAllBadges, getTierLabel, getTierGradient, BadgeCategory } from '@/app/lib/crossword/badges'

interface BadgeDisplayProps {
  earnedBadges: Badge[]
  showAll?: boolean
  compact?: boolean
  onBadgeClick?: (badge: Badge) => void
}

// Single badge icon component
export const BadgeIcon = ({ 
  badge, 
  size = 'md',
  earned = true,
  showName = false,
  onClick,
}: { 
  badge: Badge
  size?: 'sm' | 'md' | 'lg' | 'xl'
  earned?: boolean
  showName?: boolean
  onClick?: () => void
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative cursor-pointer ${onClick ? '' : 'cursor-default'}`}
      title={`${badge.name}: ${badge.description}`}
    >
      <div
        className={`
          ${sizeClasses[size]}
          rounded-xl flex items-center justify-center
          ${earned 
            ? `bg-gradient-to-br ${getTierGradient(badge.tier)} shadow-lg` 
            : 'bg-slate-700/50 grayscale opacity-50'
          }
          border-2
          ${earned ? 'border-white/30' : 'border-slate-600'}
          transition-all duration-200
        `}
        style={earned ? { boxShadow: `0 4px 20px ${badge.color}40` } : undefined}
      >
        {earned ? (
          <span className="drop-shadow-lg">{badge.emoji}</span>
        ) : (
          <Lock className="w-1/2 h-1/2 text-slate-500" />
        )}
      </div>
      
      {showName && (
        <p className={`text-center mt-1 text-xs font-medium ${earned ? 'text-white' : 'text-slate-500'}`}>
          {badge.name}
        </p>
      )}

      {/* Tier indicator */}
      {earned && badge.tier >= 3 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-yellow-500" />
        </div>
      )}
    </motion.div>
  )
}

// Compact badge row (for profile/share card)
export const BadgeRow = ({ 
  badges, 
  maxShow = 5,
  size = 'md',
}: { 
  badges: Badge[]
  maxShow?: number
  size?: 'sm' | 'md' | 'lg'
}) => {
  const visibleBadges = badges.slice(0, maxShow)
  const remainingCount = badges.length - maxShow

  return (
    <div className="flex items-center gap-2">
      {visibleBadges.map((badge) => (
        <BadgeIcon key={badge.id} badge={badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <div className={`
          ${size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-16 h-16 text-base' : 'w-12 h-12 text-sm'}
          rounded-xl bg-slate-700/50 border border-slate-600
          flex items-center justify-center text-slate-400 font-medium
        `}>
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

// Full badge showcase modal
export const BadgeShowcase = ({
  isOpen,
  onClose,
  earnedBadges,
}: {
  isOpen: boolean
  onClose: () => void
  earnedBadges: Badge[]
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all')
  const earnedIds = new Set(earnedBadges.map(b => b.id))
  
  const allBadges = getAllBadges()
  const filteredBadges = selectedCategory === 'all' 
    ? allBadges 
    : allBadges.filter(b => b.category === selectedCategory)

  const categories: { key: BadgeCategory | 'all'; label: string; emoji: string }[] = [
    { key: 'all', label: 'All', emoji: '🏆' },
    { key: 'streak', label: 'Streak', emoji: '🔥' },
    { key: 'speed', label: 'Speed', emoji: '⚡' },
    { key: 'accuracy', label: 'Accuracy', emoji: '🎯' },
    { key: 'progress', label: 'Progress', emoji: '📈' },
    { key: 'special', label: 'Special', emoji: '🌟' },
  ]

  const totalEarned = earnedBadges.length
  const totalBadges = allBadges.length
  const percentage = Math.round((totalEarned / totalBadges) * 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-emerald-500/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Achievement Badges
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Collection Progress</span>
                  <span className="text-emerald-400 font-medium">{totalEarned} / {totalBadges}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  />
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${selectedCategory === cat.key
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }
                    `}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge grid */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {filteredBadges.map((badge) => {
                  const isEarned = earnedIds.has(badge.id)
                  const earnedBadge = isEarned ? earnedBadges.find(b => b.id === badge.id) : null
                  
                  return (
                    <div key={badge.id} className="flex flex-col items-center">
                      <BadgeIcon 
                        badge={badge} 
                        earned={isEarned}
                        size="lg"
                      />
                      <p className={`text-xs mt-2 font-medium text-center ${isEarned ? 'text-white' : 'text-slate-500'}`}>
                        {badge.name}
                      </p>
                      <p className="text-xs text-slate-500 text-center">
                        {getTierLabel(badge.tier)}
                      </p>
                      {earnedBadge?.earnedAt && (
                        <p className="text-xs text-emerald-400 mt-1">
                          {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
              <p className="text-center text-slate-400 text-sm">
                Complete puzzles to unlock more badges! 
                <span className="text-emerald-400 ml-1">{percentage}% complete</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// New badge unlock animation
export const NewBadgeUnlock = ({
  badges,
  onComplete,
}: {
  badges: Badge[]
  onComplete: () => void
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (badges.length === 0) return null

  const currentBadge = badges[currentIndex]

  const handleNext = () => {
    if (currentIndex < badges.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      onComplete()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        onClick={handleNext}
      >
        <motion.div
          key={currentBadge.id}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="text-center"
        >
          {/* Glow effect */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full blur-3xl -z-10"
            style={{ backgroundColor: currentBadge.color }}
          />

          {/* Sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos(i * 45 * Math.PI / 180) * 100,
                y: Math.sin(i * 45 * Math.PI / 180) * 100,
              }}
              transition={{ 
                duration: 1.5, 
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          ))}

          {/* Badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div 
              className={`
                w-32 h-32 rounded-2xl mx-auto mb-6
                flex items-center justify-center text-7xl
                bg-gradient-to-br ${getTierGradient(currentBadge.tier)}
                border-4 border-white/30
                shadow-2xl
              `}
              style={{ boxShadow: `0 10px 50px ${currentBadge.color}60` }}
            >
              {currentBadge.emoji}
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-emerald-400 text-lg font-medium mb-2">New Badge Unlocked!</p>
            <h2 className="text-3xl font-bold text-white mb-2">{currentBadge.name}</h2>
            <p className="text-slate-400 mb-4">{currentBadge.description}</p>
            <span 
              className="inline-block px-4 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: `${currentBadge.color}30`, color: currentBadge.color }}
            >
              {getTierLabel(currentBadge.tier)} Tier
            </span>
          </motion.div>

          {/* Continue button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={handleNext}
            className="mt-8 px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            {currentIndex < badges.length - 1 ? 'Next Badge' : 'Continue'}
            {badges.length > 1 && (
              <span className="ml-2 text-emerald-200">
                ({currentIndex + 1}/{badges.length})
              </span>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main badge display for profile section
export const BadgeDisplay = ({
  earnedBadges,
  showAll = false,
  compact = false,
}: BadgeDisplayProps) => {
  const [showShowcase, setShowShowcase] = useState(false)

  if (compact) {
    return <BadgeRow badges={earnedBadges} maxShow={3} size="sm" />
  }

  return (
    <>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Badges ({earnedBadges.length})
          </h3>
          <button
            onClick={() => setShowShowcase(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View All
          </button>
        </div>
        
        {earnedBadges.length > 0 ? (
          <BadgeRow badges={earnedBadges} maxShow={showAll ? 10 : 5} />
        ) : (
          <p className="text-slate-500 text-sm">
            Complete puzzles to earn badges!
          </p>
        )}
      </div>

      <BadgeShowcase
        isOpen={showShowcase}
        onClose={() => setShowShowcase(false)}
        earnedBadges={earnedBadges}
      />
    </>
  )
}

export default BadgeDisplay

