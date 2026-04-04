import { motion } from 'framer-motion'
import { Player, PLAYER_COLORS } from '../types/game'
import PropertyArea from './PropertyArea'
import BankArea from './BankArea'
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

  return (
    <motion.div
      className={`
        glass-dark rounded-xl p-3 relative overflow-hidden
        ${isTarget ? 'ring-2 ring-red-400 cursor-pointer hover:bg-white/10' : ''}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={isTarget ? { scale: 1.02 } : undefined}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{player.avatar}</span>
          <div>
            <div className="text-xs font-bold text-white truncate max-w-[100px]">{player.name}</div>
            <div className="flex items-center gap-2 text-[9px] text-white/50">
              <span className="flex items-center gap-0.5">
                <CreditCard size={8} />
                {player.hand.length} cards
              </span>
              <span className="flex items-center gap-0.5">
                💰 ${bankTotal}M
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${i < completeSets
                  ? 'bg-yellow-400 border-yellow-300'
                  : 'bg-white/5 border-white/10'
                }
              `}
              animate={i < completeSets ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
            >
              {i < completeSets && <Trophy size={8} className="text-yellow-800" />}
            </motion.div>
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
