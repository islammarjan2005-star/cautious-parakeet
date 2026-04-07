import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Trophy, RotateCcw } from 'lucide-react'
import { PLAYER_COLORS } from '../types/game'
import { countCompleteSets } from '../utils/helpers'
import { getColorHex } from './Card'

const CONFETTI_COLORS = ['#FF5252', '#FFD600', '#69F0AE', '#40C4FF', '#FF4081', '#7C4DFF', '#FF9800', '#00E5FF']

export default function GameOverScreen() {
  const { players, winnerId, initGame } = useGameStore()
  const winner = players.find(p => p.id === winnerId)

  if (!winner) return null

  const winnerIndex = players.findIndex(p => p.id === winnerId)
  const winnerColor = PLAYER_COLORS[winnerIndex % PLAYER_COLORS.length]

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Confetti */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            left: `${Math.random() * 100}%`,
            top: '-5%',
          }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, Math.random() * 720],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 1.5,
            ease: 'easeIn',
          }}
        />
      ))}

      <motion.div
        className="text-center frost-solid rounded-3xl p-10 max-w-lg mx-4"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 15 }}
      >
        {/* Trophy */}
        <motion.div
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
          style={{ background: `linear-gradient(135deg, #FFD600, #FF9800)`, boxShadow: '0 6px 0 #C6A800' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Trophy size={44} className="text-white" />
        </motion.div>

        {/* Winner text */}
        <motion.div
          className="mb-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="font-display text-accent text-lg tracking-wider">WINNER!</div>
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-3 mb-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-3"
            style={{
              backgroundColor: `${winnerColor}20`,
              borderColor: winnerColor,
              boxShadow: `0 4px 0 ${winnerColor}60`,
            }}
          >
            {winner.avatar}
          </div>
          <h2 className="text-3xl font-display text-game-text">
            {winner.name}
          </h2>
        </motion.div>

        <p className="text-game-text-light text-base font-bold mb-8">
          Won with {countCompleteSets(winner)} complete property sets!
        </p>

        {/* Winner's sets */}
        <div className="flex justify-center gap-3 mb-8">
          {winner.properties
            .filter(ps => ps.isComplete)
            .map(ps => (
              <motion.div
                key={ps.color}
                className="rounded-xl p-3 bg-white border-2 border-gray-200"
                style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.08)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
              >
                <div
                  className="w-10 h-10 rounded-lg mx-auto mb-1.5 border-2 border-white"
                  style={{ backgroundColor: getColorHex(ps.color), boxShadow: `0 3px 0 ${getColorHex(ps.color)}60` }}
                />
                <div className="text-[10px] text-game-text font-bold capitalize">{ps.color}</div>
                <div className="text-[8px] text-game-text-light font-semibold">{ps.cards.length} cards</div>
              </motion.div>
            ))}
        </div>

        {/* Play again */}
        <motion.button
          className="btn-primary text-lg px-10 py-4 flex items-center gap-2 mx-auto"
          onClick={() => initGame(players.map(p => p.name))}
          whileTap={{ scale: 0.92, y: 2 }}
          whileHover={{ scale: 1.05 }}
        >
          <RotateCcw size={18} />
          <span className="font-extrabold">PLAY AGAIN</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
