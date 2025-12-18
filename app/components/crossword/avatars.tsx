'use client'

/**
 * Avatar Components for Crossword Streak Mode
 * 10 unique avatars - mix of male and female designs
 */

import { motion } from 'framer-motion'

interface AvatarProps {
  size?: number
  className?: string
}

// Avatar 1 - Male with glasses
const Avatar1 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#4F46E5" />
    <circle cx="50" cy="42" r="22" fill="#FDE68A" />
    <ellipse cx="50" cy="85" rx="28" ry="20" fill="#4F46E5" />
    <circle cx="40" cy="38" r="6" fill="white" />
    <circle cx="60" cy="38" r="6" fill="white" />
    <circle cx="40" cy="38" r="3" fill="#1F2937" />
    <circle cx="60" cy="38" r="3" fill="#1F2937" />
    <path d="M44 50 Q50 55 56 50" stroke="#1F2937" strokeWidth="2" fill="none" />
    <rect x="30" y="34" width="40" height="10" rx="5" fill="none" stroke="#1F2937" strokeWidth="2" />
  </svg>
)

// Avatar 2 - Female with long hair
const Avatar2 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#EC4899" />
    <ellipse cx="50" cy="55" rx="35" ry="40" fill="#7C3AED" />
    <circle cx="50" cy="40" r="22" fill="#FDE68A" />
    <ellipse cx="50" cy="85" rx="25" ry="18" fill="#EC4899" />
    <circle cx="40" cy="36" r="3" fill="#1F2937" />
    <circle cx="60" cy="36" r="3" fill="#1F2937" />
    <ellipse cx="50" cy="45" rx="2" ry="1" fill="#F59E0B" />
    <path d="M44 50 Q50 54 56 50" stroke="#EC4899" strokeWidth="2" fill="none" />
  </svg>
)

// Avatar 3 - Male with beard
const Avatar3 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#059669" />
    <circle cx="50" cy="38" r="22" fill="#D4A574" />
    <ellipse cx="50" cy="55" rx="18" ry="12" fill="#8B5A2B" />
    <ellipse cx="50" cy="85" rx="26" ry="20" fill="#059669" />
    <circle cx="40" cy="34" r="3" fill="#1F2937" />
    <circle cx="60" cy="34" r="3" fill="#1F2937" />
    <rect x="35" y="22" width="30" height="8" rx="2" fill="#8B5A2B" />
  </svg>
)

// Avatar 4 - Female with bun
const Avatar4 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#F59E0B" />
    <circle cx="50" cy="18" r="12" fill="#1F2937" />
    <circle cx="50" cy="42" r="22" fill="#FDE68A" />
    <ellipse cx="50" cy="85" rx="26" ry="20" fill="#F59E0B" />
    <circle cx="40" cy="38" r="3" fill="#1F2937" />
    <circle cx="60" cy="38" r="3" fill="#1F2937" />
    <path d="M44 50 Q50 54 56 50" stroke="#EC4899" strokeWidth="2" fill="none" />
  </svg>
)

// Avatar 5 - Male casual
const Avatar5 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#3B82F6" />
    <circle cx="50" cy="40" r="22" fill="#D4A574" />
    <rect x="32" y="22" width="36" height="10" rx="2" fill="#1F2937" />
    <ellipse cx="50" cy="85" rx="26" ry="20" fill="#3B82F6" />
    <circle cx="40" cy="36" r="3" fill="#1F2937" />
    <circle cx="60" cy="36" r="3" fill="#1F2937" />
    <path d="M44 50 Q50 55 56 50" stroke="#1F2937" strokeWidth="2" fill="none" />
  </svg>
)

// Avatar 6 - Female with curly hair
const Avatar6 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#8B5CF6" />
    <circle cx="30" cy="30" r="10" fill="#1F2937" />
    <circle cx="50" cy="25" r="10" fill="#1F2937" />
    <circle cx="70" cy="30" r="10" fill="#1F2937" />
    <circle cx="25" cy="45" r="8" fill="#1F2937" />
    <circle cx="75" cy="45" r="8" fill="#1F2937" />
    <circle cx="50" cy="42" r="22" fill="#FDE68A" />
    <ellipse cx="50" cy="85" rx="26" ry="20" fill="#8B5CF6" />
    <circle cx="40" cy="38" r="3" fill="#1F2937" />
    <circle cx="60" cy="38" r="3" fill="#1F2937" />
    <path d="M44 50 Q50 54 56 50" stroke="#EC4899" strokeWidth="2" fill="none" />
  </svg>
)

// Avatar 7 - Male with cap
const Avatar7 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#EF4444" />
    <ellipse cx="50" cy="20" rx="30" ry="12" fill="#1F2937" />
    <rect x="25" y="18" width="50" height="10" fill="#1F2937" />
    <circle cx="50" cy="42" r="22" fill="#D4A574" />
    <ellipse cx="50" cy="85" rx="26" ry="20" fill="#EF4444" />
    <circle cx="40" cy="38" r="3" fill="#1F2937" />
    <circle cx="60" cy="38" r="3" fill="#1F2937" />
    <path d="M44 50 Q50 55 56 50" stroke="#1F2937" strokeWidth="2" fill="none" />
  </svg>
)

// Avatar 8 - Female with headband
const Avatar8 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#14B8A6" />
    <ellipse cx="50" cy="50" rx="32" ry="38" fill="#8B5A2B" />
    <circle cx="50" cy="42" r="22" fill="#FDE68A" />
    <rect x="28" y="28" width="44" height="6" rx="3" fill="#EC4899" />
    <ellipse cx="50" cy="85" rx="26" ry="20" fill="#14B8A6" />
    <circle cx="40" cy="38" r="3" fill="#1F2937" />
    <circle cx="60" cy="38" r="3" fill="#1F2937" />
    <path d="M44 50 Q50 54 56 50" stroke="#EC4899" strokeWidth="2" fill="none" />
  </svg>
)

// Avatar 9 - Male professional
const Avatar9 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#1F2937" />
    <circle cx="50" cy="40" r="22" fill="#D4A574" />
    <path d="M30 25 Q50 15 70 25 L68 35 Q50 30 32 35 Z" fill="#1F2937" />
    <ellipse cx="50" cy="85" rx="26" ry="20" fill="#1F2937" />
    <rect x="40" y="68" width="20" height="12" fill="white" />
    <polygon points="50,68 45,80 55,80" fill="#EF4444" />
    <circle cx="40" cy="36" r="3" fill="#1F2937" />
    <circle cx="60" cy="36" r="3" fill="#1F2937" />
    <path d="M44 50 Q50 54 56 50" stroke="#1F2937" strokeWidth="2" fill="none" />
  </svg>
)

// Avatar 10 - Female with ponytail
const Avatar10 = ({ size = 48, className = '' }: AvatarProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#F97316" />
    <circle cx="80" cy="40" r="15" fill="#FDE047" />
    <ellipse cx="85" cy="60" rx="8" ry="20" fill="#FDE047" />
    <circle cx="50" cy="42" r="22" fill="#FDE68A" />
    <path d="M28 30 Q50 20 72 30 L70 38 Q50 32 30 38 Z" fill="#FDE047" />
    <ellipse cx="50" cy="85" rx="26" ry="20" fill="#F97316" />
    <circle cx="40" cy="38" r="3" fill="#1F2937" />
    <circle cx="60" cy="38" r="3" fill="#1F2937" />
    <path d="M44 50 Q50 54 56 50" stroke="#EC4899" strokeWidth="2" fill="none" />
  </svg>
)

// Avatar mapping
const avatarComponents: Record<string, React.FC<AvatarProps>> = {
  'avatar-1': Avatar1,
  'avatar-2': Avatar2,
  'avatar-3': Avatar3,
  'avatar-4': Avatar4,
  'avatar-5': Avatar5,
  'avatar-6': Avatar6,
  'avatar-7': Avatar7,
  'avatar-8': Avatar8,
  'avatar-9': Avatar9,
  'avatar-10': Avatar10,
}

// Main Avatar component
interface CrosswordAvatarProps {
  avatarId: string
  size?: number
  className?: string
  onClick?: () => void
  selected?: boolean
}

export const CrosswordAvatar = ({
  avatarId,
  size = 48,
  className = '',
  onClick,
  selected = false,
}: CrosswordAvatarProps) => {
  const AvatarComponent = avatarComponents[avatarId] || Avatar1

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.1 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`
        rounded-full overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${selected ? 'ring-4 ring-primary-500 ring-offset-2' : ''}
        ${className}
      `}
    >
      <AvatarComponent size={size} />
    </motion.div>
  )
}

// Avatar selector grid
interface AvatarSelectorProps {
  selectedAvatar: string
  onSelect: (avatarId: string) => void
}

export const AvatarSelector = ({ selectedAvatar, onSelect }: AvatarSelectorProps) => {
  const avatarIds = Object.keys(avatarComponents)

  return (
    <div className="grid grid-cols-5 gap-3">
      {avatarIds.map((avatarId) => (
        <CrosswordAvatar
          key={avatarId}
          avatarId={avatarId}
          size={48}
          onClick={() => onSelect(avatarId)}
          selected={selectedAvatar === avatarId}
        />
      ))}
    </div>
  )
}

export default CrosswordAvatar

