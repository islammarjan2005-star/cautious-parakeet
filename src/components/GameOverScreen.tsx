import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Trophy, RotateCcw } from 'lucide-react'
import { PLAYER_COLORS, getPlayerInitials } from '../types/game'
import { countCompleteSets } from '../utils/helpers'
import { getColorHex } from './Card'

export default function GameOverScreen() {
  const { players, winnerId, initGame } = useGameStore()
  const winner = players.find(p => p.id === winnerId)

  if (!winner) return null

  const winnerIndex = players.findIndex(p => p.id === winnerId)
  const winnerColor = PLAYER_COLORS[winnerIndex % PLAYER_COLORS.length]

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Trophy */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ backgroundColor: `${winnerColor}15`, border: `1.5px solid ${winnerColor}30` }}
        >
          <Trophy size={36} className="text-gold" />
        </div>

        {/* Winner text */}
        <div className="mb-2">
          <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-gold">Winner</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{
              backgroundColor: `${winnerColor}20`,
              color: winnerColor,
              border: `1.5px solid ${winnerColor}40`,
            }}
          >
            {getPlayerInitials(winner.name)}
          </div>
          <h2 className="text-2xl font-semibold text-text-primary tracking-wide">
            {winner.name}
          </h2>
        </div>

        <p className="text-text-muted text-sm mb-8">
          Won with {countCompleteSets(winner)} complete property sets
        </p>

        {/* Winner's sets */}
        <div className="flex justify-center gap-3 mb-8">
          {winner.properties
            .filter(ps => ps.isComplete)
            .map(ps => (
              <div
                key={ps.color}
                className="rounded-lg p-3 border border-white/[0.06] bg-white/[0.02]"
              >
                <div
                  className="w-8 h-8 rounded-md mx-auto mb-1.5"
                  style={{ backgroundColor: getColorHex(ps.color) }}
                />
                <div className="text-[10px] text-text-muted capitalize font-medium">{ps.color}</div>
                <div className="text-[8px] text-text-muted/50">{ps.cards.length} cards</div>
              </div>
            ))}
        </div>

        {/* Play again */}
        <button
          className="btn-primary text-sm px-8 py-3 flex items-center gap-2 mx-auto"
          onClick={() => initGame(players.map(p => p.name))}
        >
          <RotateCcw size={14} />
          Play Again
        </button>
      </motion.div>
    </motion.div>
  )
}
