'use client'

/**
 * Crossword Leaderboard Component
 * Shows top players by streak or average solve time
 * With rate limiting support and local caching
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Clock, ChevronDown, Crown, Medal, Award, AlertCircle, RefreshCw } from 'lucide-react'
import { CrosswordAvatar } from './avatars'
import { getLeaderboard } from '../../lib/crossword/streak-api'
import type { LeaderboardEntry, LeaderboardResponse } from '../../lib/crossword/streak-api'

interface LeaderboardProps {
  className?: string
  compact?: boolean
}

// Cache keys for localStorage
const CACHE_KEY_PREFIX = 'crossword_leaderboard_'
const RATE_LIMIT_KEY = 'crossword_leaderboard_rate_limit'

interface CachedLeaderboard {
  data: LeaderboardResponse
  timestamp: number
  sortBy: 'streak' | 'time'
}

interface RateLimitInfo {
  isLimited: boolean
  expiresAt: number // timestamp when rate limit expires
}

// Get cached leaderboard data
const getCachedData = (sortBy: 'streak' | 'time'): CachedLeaderboard | null => {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${sortBy}`)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

// Save leaderboard data to cache
const setCachedData = (sortBy: 'streak' | 'time', data: LeaderboardResponse): void => {
  if (typeof window === 'undefined') return
  try {
    const cacheEntry: CachedLeaderboard = {
      data,
      timestamp: Date.now(),
      sortBy
    }
    localStorage.setItem(`${CACHE_KEY_PREFIX}${sortBy}`, JSON.stringify(cacheEntry))
  } catch {
    // Ignore storage errors
  }
}

// Get rate limit info
const getRateLimitInfo = (): RateLimitInfo | null => {
  if (typeof window === 'undefined') return null
  try {
    const info = localStorage.getItem(RATE_LIMIT_KEY)
    if (!info) return null
    const parsed = JSON.parse(info) as RateLimitInfo
    // Check if rate limit has expired
    if (parsed.expiresAt < Date.now()) {
      localStorage.removeItem(RATE_LIMIT_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

// Set rate limit info
const setRateLimitInfo = (retryAfterMs: number): void => {
  if (typeof window === 'undefined') return
  try {
    const info: RateLimitInfo = {
      isLimited: true,
      expiresAt: Date.now() + retryAfterMs
    }
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(info))
  } catch {
    // Ignore storage errors
  }
}

// Format remaining time
const formatRemainingTime = (expiresAt: number): string => {
  const remaining = expiresAt - Date.now()
  if (remaining <= 0) return 'now'
  const minutes = Math.ceil(remaining / (60 * 1000))
  if (minutes === 1) return '1 minute'
  return `${minutes} minutes`
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false) // Always start collapsed
  const [hasFetched, setHasFetched] = useState(false) // Track if we've fetched for current sortBy
  const [rateLimitInfo, setRateLimitState] = useState<RateLimitInfo | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [, forceUpdate] = useState(0) // For re-rendering countdown

  // Check rate limit status on mount and periodically
  useEffect(() => {
    const checkRateLimit = () => {
      const info = getRateLimitInfo()
      setRateLimitState(info)
      if (!info) {
        setIsFromCache(false)
      }
    }
    
    checkRateLimit()
    // Check every 30 seconds to update countdown
    const interval = setInterval(() => {
      checkRateLimit()
      forceUpdate(n => n + 1)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Fetch leaderboard with rate limit handling
  const fetchLeaderboard = useCallback(async (forceFetch = false) => {
    // Check if rate limited
    const currentRateLimit = getRateLimitInfo()
    if (currentRateLimit && !forceFetch) {
      // Use cached data if rate limited
      const cached = getCachedData(sortBy)
      if (cached) {
        setData(cached.data)
        setIsFromCache(true)
        setRateLimitState(currentRateLimit)
      }
      return
    }

    setIsLoading(true)
    setError(null)
    setIsFromCache(false)
    
    try {
      const response = await getLeaderboard(sortBy)
      setData(response)
      setCachedData(sortBy, response) // Cache the response
      setHasFetched(true)
      setRateLimitState(null)
    } catch (err: unknown) {
      // Check if it's a rate limit error
      const errorResponse = err as { response?: { data?: { rateLimited?: boolean; retryAfterMs?: number } } }
      if (errorResponse?.response?.data?.rateLimited) {
        const retryAfterMs = errorResponse.response.data.retryAfterMs || 30 * 60 * 1000
        setRateLimitInfo(retryAfterMs)
        setRateLimitState({ isLimited: true, expiresAt: Date.now() + retryAfterMs })
        
        // Load from cache
        const cached = getCachedData(sortBy)
        if (cached) {
          setData(cached.data)
          setIsFromCache(true)
        } else {
          setError('Rate limited. Please try again later.')
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
        // Try to use cached data on error
        const cached = getCachedData(sortBy)
        if (cached) {
          setData(cached.data)
          setIsFromCache(true)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [sortBy])

  // Only fetch when expanded
  useEffect(() => {
    if (!isExpanded) return
    fetchLeaderboard()
  }, [sortBy, isExpanded, fetchLeaderboard])
  
  // Reset hasFetched when sortBy changes
  useEffect(() => {
    setHasFetched(false)
  }, [sortBy])

  // Show collapsed state if not expanded
  if (!isExpanded) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(true)}
        className={`
          flex items-center justify-between w-full p-4 
          bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20
          border border-amber-200 dark:border-amber-800 rounded-xl
          hover:shadow-md transition-all
          ${className}
        `}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-gray-900 dark:text-white">Leaderboard</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">(click to expand)</span>
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
            {isFromCache && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                Cached
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Refresh button - disabled if rate limited */}
            {!isLoading && (
              <button
                onClick={() => fetchLeaderboard(false)}
                disabled={!!rateLimitInfo}
                className={`
                  p-1.5 rounded-lg transition-all
                  ${rateLimitInfo 
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
                title={rateLimitInfo ? `Refresh available in ${formatRemainingTime(rateLimitInfo.expiresAt)}` : 'Refresh leaderboard'}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
              Collapse
            </button>
          </div>
        </div>

        {/* Rate Limit Banner */}
        {rateLimitInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <p className="text-amber-700 dark:text-amber-300 font-medium">
                Leaderboard refresh limit reached
              </p>
              <p className="text-amber-600 dark:text-amber-400 text-xs">
                {isFromCache ? 'Showing cached data. ' : ''}
                Refresh available in {formatRemainingTime(rateLimitInfo.expiresAt)}
              </p>
            </div>
          </motion.div>
        )}

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

