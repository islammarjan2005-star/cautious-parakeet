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
        frost rounded-2xl p-2.5 relative overflow-hidden
        ${isTarget ? 'ring-2 ring-accent cursor-pointer hover:bg-white/5' : ''}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: color }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 mt-0.5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-base border-2"
            style={{
              backgroundColor: `${color}25`,
              borderColor: color,
              boxShadow: `0 2px 0 ${color}50`,
            }}
          >
            {player.avatar}
          </div>
          <div>
            <div className="text-[11px] font-bold text-white truncate max-w-[100px]">{player.name}</div>
            <div className="flex items-center gap-2 text-[8px] font-semibold text-white/60">
              <span className="flex items-center gap-0.5">
                <CreditCard size={7} />
                {player.hand.length}
              </span>
              <span>${bankTotal}M</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${i < completeSets
                  ? 'bg-accent border-accent-dark'
                  : 'bg-white/10 border-white/20'
                }
              `}
              style={i < completeSets ? { boxShadow: '0 1px 0 #C6A800' } : {}}
            >
              {i < completeSets && <Trophy size={8} className="text-game-text" />}
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
