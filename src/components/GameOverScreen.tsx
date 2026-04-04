import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Trophy, RotateCcw, Sparkles } from 'lucide-react'
import { PLAYER_COLORS } from '../types/game'
import { countCompleteSets } from '../utils/helpers'

export default function GameOverScreen() {
  const { players, winnerId, initGame } = useGameStore()
  const winner = players.find(p => p.id === winnerId)

  if (!winner) return null

  const winnerIndex = players.findIndex(p => p.id === winnerId)
  const winnerColor = PLAYER_COLORS[winnerIndex % PLAYER_COLORS.length]

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Confetti particles */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: ['#E53935', '#1E88E5', '#43A047', '#FDD835', '#FB8C00', '#8E24AA'][i % 6],
            left: `${Math.random() * 100}%`,
            top: '-5%',
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: 'easeIn',
          }}
        />
      ))}

      <motion.div
        className="text-center relative z-10"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
      >
        {/* Trophy */}
        <motion.div
          className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-6"
          style={{ background: `radial-gradient(circle, ${winnerColor}44, ${winnerColor}11)` }}
          animate={{
            boxShadow: [
              `0 0 20px ${winnerColor}44`,
              `0 0 60px ${winnerColor}66`,
              `0 0 20px ${winnerColor}44`,
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Trophy size={56} className="text-yellow-400" />
          </motion.div>
        </motion.div>

        {/* Winner text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-yellow-400" size={20} />
            <span className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Winner!</span>
            <Sparkles className="text-yellow-400" size={20} />
          </div>

          <h2 className="monopoly-title text-5xl text-white text-glow mb-2">
            {winner.avatar} {winner.name}
          </h2>

          <p className="text-white/60 text-sm mb-8">
            Won with {countCompleteSets(winner)} complete property sets!
          </p>

          {/* Winner's sets */}
          <div className="flex justify-center gap-3 mb-8">
            {winner.properties
              .filter(ps => ps.isComplete)
              .map(ps => (
                <motion.div
                  key={ps.color}
                  className="rounded-xl p-3 border-2 border-yellow-400/30"
                  style={{ backgroundColor: `${winnerColor}22` }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: Math.random() }}
                >
                  <div className="text-2xl mb-1">🏠</div>
                  <div className="text-[10px] text-white/70 capitalize font-bold">{ps.color}</div>
                  <div className="text-[9px] text-white/40">{ps.cards.length} cards</div>
                </motion.div>
              ))}
          </div>

          {/* Play again */}
          <motion.button
            className="btn-primary text-lg px-10 py-4"
            onClick={() => initGame(players.map(p => p.name))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} className="inline mr-2" />
            Play Again
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
