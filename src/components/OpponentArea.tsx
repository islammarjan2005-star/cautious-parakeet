import { motion } from 'framer-motion'
import { Player, PLAYER_COLORS, getPlayerInitials } from '../types/game'
import PropertyArea from './PropertyArea'
import BankArea from './BankArea'
import { countCompleteSets, getTotalValue } from '../utils/helpers'
import { Trophy, CreditCard, Landmark } from 'lucide-react'

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

  return (
    <motion.div
      className={`
        panel rounded-lg p-2.5 relative overflow-hidden
        ${isTarget ? 'ring-1 ring-gold/40 cursor-pointer hover:bg-white/[0.03]' : ''}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
            style={{
              backgroundColor: `${color}18`,
              color: color,
              border: `1px solid ${color}30`,
            }}
          >
            {getPlayerInitials(player.name)}
          </div>
          <div>
            <div className="text-[11px] font-medium text-text-primary truncate max-w-[100px]">{player.name}</div>
            <div className="flex items-center gap-2 text-[8px] text-text-muted">
              <span className="flex items-center gap-0.5">
                <CreditCard size={7} />
                {player.hand.length}
              </span>
              <span className="flex items-center gap-0.5">
                <Landmark size={7} />
                ${bankTotal}M
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center
                ${i < completeSets
                  ? 'bg-gold/20 border-gold/40'
                  : 'bg-white/[0.02] border-white/[0.06]'
                }
              `}
            >
              {i < completeSets && <Trophy size={7} className="text-gold" />}
            </div>
          ))}
        </div>
      </div>

      {/* Properties */}
      <PropertyArea player={player} compact />

      {/* Bank */}
      <div className="mt-2">
        <BankArea cards={player.bank} compact />
      </div>
    </motion.div>
  )
}
