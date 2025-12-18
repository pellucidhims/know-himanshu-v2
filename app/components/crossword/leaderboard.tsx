'use client'

/**
 * Crossword Leaderboard Component
 * Shows top players by streak or average solve time
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Clock, ChevronDown, Crown, Medal, Award } from 'lucide-react'
import { CrosswordAvatar } from './avatars'
import { getLeaderboard } from '../../lib/crossword/streak-api'
import type { LeaderboardEntry, LeaderboardResponse } from '../../lib/crossword/streak-api'

interface LeaderboardProps {
  className?: string
  compact?: boolean
}

// Format time from seconds to readable format
const formatTime = (seconds: number): string => {
  if (!seconds || seconds === 0) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Get rank icon based on position
const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />
    default:
      return <span className="w-5 h-5 text-center font-bold text-gray-500">#{rank}</span>
  }
}

// Leaderboard row component
interface LeaderboardRowProps {
  entry: LeaderboardEntry
  sortBy: 'streak' | 'time'
  index: number
}

const LeaderboardRow = ({ entry, sortBy, index }: LeaderboardRowProps) => {
  const isTopThree = entry.rank <= 3

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center gap-3 p-3 rounded-xl transition-all
        ${entry.isCurrentUser 
          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-500 shadow-lg' 
          : 'bg-white/50 dark:bg-dark-elevated/30 hover:bg-white/80 dark:hover:bg-dark-elevated/50'}
        ${isTopThree ? 'shadow-md' : ''}
      `}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-8">
        {getRankIcon(entry.rank)}
      </div>

      {/* Avatar */}
      <CrosswordAvatar avatarId={entry.avatar} size={40} />

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${entry.isCurrentUser ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>
          {entry.username}
          {entry.isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{entry.totalSolved} puzzles</span>
          <span>Best: {entry.longestStreak} days</span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-right">
        {sortBy === 'streak' ? (
          <div className="flex items-center gap-1 text-orange-500 font-bold">
            <Flame className="w-4 h-4" />
            <span>{entry.currentStreak}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-blue-500 font-bold">
            <Clock className="w-4 h-4" />
            <span>{formatTime(entry.averageTime)}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export const Leaderboard = ({ className = '', compact = false }: LeaderboardProps) => {
  const [sortBy, setSortBy] = useState<'streak' | 'time'>('streak')
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(!compact)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getLeaderboard(sortBy)
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [sortBy])

  if (compact && !isExpanded) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(true)}
        className={`
          flex items-center justify-between w-full p-4 
          bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20
          border border-amber-200 dark:border-amber-800 rounded-xl
          ${className}
        `}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-gray-900 dark:text-white">Leaderboard</span>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-500" />
      </motion.button>
    )
  }

  return (
    <div className={`bg-white/80 dark:bg-dark-elevated/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leaderboard</h3>
          </div>
          
          {compact && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Collapse
            </button>
          )}
        </div>

        {/* Sort Toggle */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setSortBy('streak')}
            className={`
              flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${sortBy === 'streak'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface'}
            `}
          >
            <Flame className="w-4 h-4" />
            By Streak
          </button>
          <button
            onClick={() => setSortBy('time')}
            className={`
              flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${sortBy === 'time'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface'}
            `}
          >
            <Clock className="w-4 h-4" />
            By Time
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-dark-border border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : data && data.leaderboard.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {data.leaderboard.map((entry, index) => (
                <LeaderboardRow 
                  key={entry.userId} 
                  entry={entry} 
                  sortBy={sortBy}
                  index={index}
                />
              ))}
            </AnimatePresence>

            {/* Current user if not in top 10 */}
            {data.currentUserRank && !data.leaderboard.some(e => e.isCurrentUser) && (
              <>
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600" />
                  <span className="text-xs text-gray-500">Your Rank</span>
                  <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600" />
                </div>
                <LeaderboardRow 
                  entry={data.currentUserRank} 
                  sortBy={sortBy}
                  index={10}
                />
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No players yet</p>
            <p className="text-sm">Be the first to start a streak!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard

