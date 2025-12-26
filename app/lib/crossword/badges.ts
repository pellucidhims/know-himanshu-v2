/**
 * Badge System Types and Configuration
 * Frontend mirror of backend badge definitions
 */

export interface Badge {
  id: string
  name: string
  emoji: string
  category: BadgeCategory
  tier: number
  description: string
  requirement: number | null
  color: string
  earnedAt?: string
}

export type BadgeCategory = 'streak' | 'speed' | 'accuracy' | 'progress' | 'special'

// All badge definitions (must match backend)
export const BADGES: Record<string, Badge> = {
  // 🔥 Streak Badges
  'streak-spark': {
    id: 'streak-spark',
    name: 'Spark',
    emoji: '✨',
    category: 'streak',
    tier: 1,
    description: 'Maintain a 3-day streak',
    requirement: 3,
    color: '#f59e0b',
  },
  'streak-flame': {
    id: 'streak-flame',
    name: 'Flame',
    emoji: '🔥',
    category: 'streak',
    tier: 2,
    description: 'Maintain a 7-day streak',
    requirement: 7,
    color: '#ef4444',
  },
  'streak-inferno': {
    id: 'streak-inferno',
    name: 'Inferno',
    emoji: '🌋',
    category: 'streak',
    tier: 3,
    description: 'Maintain a 30-day streak',
    requirement: 30,
    color: '#dc2626',
  },
  'streak-legendary': {
    id: 'streak-legendary',
    name: 'Legendary',
    emoji: '👑',
    category: 'streak',
    tier: 4,
    description: 'Maintain a 100-day streak',
    requirement: 100,
    color: '#7c3aed',
  },

  // ⚡ Speed Badges
  'speed-quick': {
    id: 'speed-quick',
    name: 'Quick Thinker',
    emoji: '💨',
    category: 'speed',
    tier: 1,
    description: 'Complete a puzzle in under 5 minutes',
    requirement: 300,
    color: '#3b82f6',
  },
  'speed-demon': {
    id: 'speed-demon',
    name: 'Speed Demon',
    emoji: '⚡',
    category: 'speed',
    tier: 2,
    description: 'Complete a puzzle in under 3 minutes',
    requirement: 180,
    color: '#8b5cf6',
  },
  'speed-lightning': {
    id: 'speed-lightning',
    name: 'Lightning',
    emoji: '🌩️',
    category: 'speed',
    tier: 3,
    description: 'Complete a puzzle in under 2 minutes',
    requirement: 120,
    color: '#eab308',
  },
  'speed-timelord': {
    id: 'speed-timelord',
    name: 'Time Lord',
    emoji: '⏰',
    category: 'speed',
    tier: 4,
    description: 'Complete a puzzle in under 1 minute',
    requirement: 60,
    color: '#06b6d4',
  },

  // 🎯 Accuracy Badges
  'accuracy-sharp': {
    id: 'accuracy-sharp',
    name: 'Sharp Mind',
    emoji: '🎯',
    category: 'accuracy',
    tier: 1,
    description: 'Solve 5 puzzles on first attempt',
    requirement: 5,
    color: '#10b981',
  },
  'accuracy-perfect': {
    id: 'accuracy-perfect',
    name: 'Perfectionist',
    emoji: '💎',
    category: 'accuracy',
    tier: 2,
    description: 'Solve 10 puzzles on first attempt',
    requirement: 10,
    color: '#0ea5e9',
  },
  'accuracy-flawless': {
    id: 'accuracy-flawless',
    name: 'Flawless',
    emoji: '🌟',
    category: 'accuracy',
    tier: 3,
    description: 'Solve 25 puzzles on first attempt',
    requirement: 25,
    color: '#f472b6',
  },
  'accuracy-mastermind': {
    id: 'accuracy-mastermind',
    name: 'Mastermind',
    emoji: '🧠',
    category: 'accuracy',
    tier: 4,
    description: 'Solve 50 puzzles on first attempt',
    requirement: 50,
    color: '#a855f7',
  },

  // 📈 Progress Badges
  'progress-rookie': {
    id: 'progress-rookie',
    name: 'Rookie',
    emoji: '🌱',
    category: 'progress',
    tier: 1,
    description: 'Solve 10 puzzles',
    requirement: 10,
    color: '#22c55e',
  },
  'progress-regular': {
    id: 'progress-regular',
    name: 'Regular',
    emoji: '📚',
    category: 'progress',
    tier: 2,
    description: 'Solve 50 puzzles',
    requirement: 50,
    color: '#3b82f6',
  },
  'progress-veteran': {
    id: 'progress-veteran',
    name: 'Veteran',
    emoji: '🎖️',
    category: 'progress',
    tier: 3,
    description: 'Solve 100 puzzles',
    requirement: 100,
    color: '#f59e0b',
  },
  'progress-legend': {
    id: 'progress-legend',
    name: 'Legend',
    emoji: '🏆',
    category: 'progress',
    tier: 4,
    description: 'Solve 500 puzzles',
    requirement: 500,
    color: '#eab308',
  },

  // 🌟 Special Badges
  'special-earlybird': {
    id: 'special-earlybird',
    name: 'Early Bird',
    emoji: '🐦',
    category: 'special',
    tier: 1,
    description: 'Complete a puzzle before 7 AM',
    requirement: null,
    color: '#fb923c',
  },
  'special-nightowl': {
    id: 'special-nightowl',
    name: 'Night Owl',
    emoji: '🦉',
    category: 'special',
    tier: 1,
    description: 'Complete a puzzle after midnight',
    requirement: null,
    color: '#6366f1',
  },
  'special-weekendwarrior': {
    id: 'special-weekendwarrior',
    name: 'Weekend Warrior',
    emoji: '⚔️',
    category: 'special',
    tier: 2,
    description: 'Complete puzzles on 10 weekends',
    requirement: 10,
    color: '#ec4899',
  },
  'special-founder': {
    id: 'special-founder',
    name: 'Founder',
    emoji: '🚀',
    category: 'special',
    tier: 4,
    description: 'One of the first 100 players',
    requirement: null,
    color: '#14b8a6',
  },
}

// Get badge by ID with full details
export const getBadgeById = (id: string): Badge | null => {
  return BADGES[id] || null
}

// Get all badges as array
export const getAllBadges = (): Badge[] => {
  return Object.values(BADGES)
}

// Get badges by category
export const getBadgesByCategory = (category: BadgeCategory): Badge[] => {
  return Object.values(BADGES).filter(b => b.category === category)
}

// Format user badges with full details
export const formatUserBadges = (userBadges: { id: string; earnedAt?: string }[]): Badge[] => {
  const result: Badge[] = []
  
  for (const ub of userBadges) {
    const badge = BADGES[ub.id]
    if (badge) {
      result.push({
        ...badge,
        earnedAt: ub.earnedAt,
      })
    }
  }
  
  return result
}

// Get tier label
export const getTierLabel = (tier: number): string => {
  switch (tier) {
    case 1: return 'Bronze'
    case 2: return 'Silver'
    case 3: return 'Gold'
    case 4: return 'Platinum'
    default: return 'Common'
  }
}

// Get tier gradient
export const getTierGradient = (tier: number): string => {
  switch (tier) {
    case 1: return 'from-amber-700 to-amber-500'
    case 2: return 'from-slate-400 to-slate-300'
    case 3: return 'from-yellow-500 to-yellow-300'
    case 4: return 'from-purple-600 to-pink-400'
    default: return 'from-gray-600 to-gray-400'
  }
}

