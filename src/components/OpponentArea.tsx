import { motion } from 'framer-motion'
import { Player, PLAYER_COLORS } from '../types/game'
import { countCompleteSets, getTotalValue } from '../utils/helpers'
import { Trophy, CreditCard } from 'lucide-react'

interface OpponentAreaProps {
  player: Player
  index: number
  isTarget?: boolean
  onClick?: () => void
}

export default function OpponentArea({ player, index, isTarget, onClick }: OpponentAreaProps) {
  const completeSets = countCompleteSets(player)
  const bankTotal = getTotalValue(player.bank)
  const color = PLAYER_COLORS[index % PLAYER_COLORS.length]

  const Wrapper = onClick ? motion.div : 'div'
  const motionProps = onClick
    ? { whileTap: { scale: 0.96 } }
    : {}

  return (
    <Wrapper
      className={`
        flex items-center gap-2 chrome-panel px-3 py-2 min-w-[140px]
        ${isTarget ? 'ring-2 ring-accent cursor-pointer' : ''}
      `}
      onClick={onClick}
      {...motionProps}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 border-2"
        style={{
          backgroundColor: `${color}25`,
          borderColor: color,
        }}
      >
        {player.avatar}
      </div>

      {/* Name + stats */}
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-white truncate max-w-[70px]">
          {player.name}
        </div>
        <div className="text-[9px] text-white/60 flex items-center gap-1">
          <span>${bankTotal}M</span>
          <span>|</span>
          <span className="flex items-center gap-0.5">
            <CreditCard size={7} />
            {player.hand.length}
          </span>
        </div>
      </div>

      {/* Complete sets dots */}
      <div className="flex items-center gap-0.5 ml-auto shrink-0">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full flex items-center justify-center
              ${i < completeSets
                ? 'bg-accent border border-accent-dark'
                : 'bg-white/10 border border-white/20'
              }
            `}
          >
            {i < completeSets && <Trophy size={6} className="text-game-text" />}
          </div>
        ))}
      </div>
    </Wrapper>
  )
}
