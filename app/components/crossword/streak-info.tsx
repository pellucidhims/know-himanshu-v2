'use client'

/**
 * Streak Info Display Component
 * Shows user's current streak and stats during gameplay
 */

import { motion } from 'framer-motion'
import { Flame, Trophy, Clock, Target, Calendar, TrendingUp } from 'lucide-react'
import { CrosswordAvatar } from './avatars'
import type { UserStats, CrosswordUser } from '../../lib/crossword/streak-api'

interface StreakInfoProps {
  user: CrosswordUser
  className?: string
}

// Format time from seconds to readable format
const formatTime = (seconds: number): string => {
  if (!seconds || seconds === 0) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Stat card component
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <div className={`flex items-center gap-2 p-2 rounded-lg ${color}`}>
    {icon}
    <div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p className="font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
)

export const StreakInfo = ({ user, className = '' }: StreakInfoProps) => {
  const stats = user.stats

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800/50 p-4 ${className}`}
    >
      {/* User Info */}
      <div className="flex items-center gap-3 mb-4">
        <CrosswordAvatar avatarId={user.avatar} size={48} />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white">{user.username}</h3>
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            <Flame className="w-4 h-4" />
            <span className="font-semibold">{stats.currentStreak} day streak</span>
          </div>
        </div>
        
        {/* Streak Badge */}
        {stats.currentStreak >= 7 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold shadow-lg"
          >
            🔥 {stats.currentStreak >= 30 ? 'Legend' : stats.currentStreak >= 14 ? 'Hot' : 'On Fire'}
          </motion.div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard
          icon={<Flame className="w-4 h-4 text-orange-500" />}
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          color="bg-orange-100 dark:bg-orange-900/30"
        />
        <StatCard
          icon={<Trophy className="w-4 h-4 text-amber-500" />}
          label="Best Streak"
          value={`${stats.longestStreak} days`}
          color="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-blue-500" />}
          label="Avg. Time"
          value={formatTime(stats.averageTimeSeconds)}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          icon={<Target className="w-4 h-4 text-green-500" />}
          label="Puzzles Solved"
          value={stats.totalPuzzlesSolved}
          color="bg-green-100 dark:bg-green-900/30"
        />
      </div>
    </motion.div>
  )
}

// Compact streak badge for display during gameplay
interface StreakBadgeProps {
  currentStreak: number
  className?: string
}

export const StreakBadge = ({ currentStreak, className = '' }: StreakBadgeProps) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={`inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold shadow-lg ${className}`}
  >
    <Flame className="w-4 h-4" />
    <span>{currentStreak}</span>
  </motion.div>
)

// Streak mode opt-in button
interface StreakModeButtonProps {
  onClick: () => void
  disabled?: boolean
}

export const StreakModeButton = ({ onClick, disabled = false }: StreakModeButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
  >
    <div className="p-2 bg-white/20 rounded-lg">
      <Flame className="w-6 h-6" />
    </div>
    <div className="text-left">
      <p className="text-lg">Streak Mode</p>
      <p className="text-sm font-normal opacity-80">Login to track your daily streak</p>
    </div>
    <TrendingUp className="w-6 h-6 ml-auto" />
  </motion.button>
)

// Streak completion celebration
interface StreakCompletionProps {
  stats: UserStats
  todayTime: number
  todayAttempts: number
}

export const StreakCompletion = ({ stats, todayTime, todayAttempts }: StreakCompletionProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', delay: 0.2 }}
      className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4"
    >
      <Flame className="w-8 h-8 text-white" />
    </motion.div>
    
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Streak Extended! 🎉
    </h3>
    
    <p className="text-4xl font-bold text-orange-500 mb-4">
      {stats.currentStreak} Days
    </p>
    
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Today's Time</p>
        <p className="font-bold text-gray-900 dark:text-white">{formatTime(todayTime)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Attempts</p>
        <p className="font-bold text-gray-900 dark:text-white">{todayAttempts}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Best Streak</p>
        <p className="font-bold text-gray-900 dark:text-white">{stats.longestStreak} days</p>
      </div>
    </div>
  </motion.div>
)

export default StreakInfo

