import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { PLAYER_COLORS, PLAYER_AVATARS } from '../types/game'
import { Plus, Minus, Play, Users, Loader2 } from 'lucide-react'

export default function SetupScreen() {
  const initGame = useGameStore(s => s.initGame)
  const [playerCount, setPlayerCount] = useState(2)
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5',
  ])
  const [isStarting, setIsStarting] = useState(false)

  const handleStart = () => {
    setIsStarting(true)
    setTimeout(() => {
      initGame(playerNames.slice(0, playerCount))
    }, 600)
  }

  return (
    <div className="min-h-screen game-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-32 right-16 w-40 h-40 bg-white/[0.07] rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/[0.08] rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }} />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
      >
        {/* Title */}
        <div className="text-center mb-10">
          <motion.h1
            className="text-5xl font-display text-white drop-shadow-lg"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 12 }}
          >
            MONOPOLY
          </motion.h1>
          <motion.div
            className="text-3xl font-display text-accent drop-shadow-md -mt-1"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 12 }}
          >
            DEAL
          </motion.div>
          <p className="text-white/70 mt-3 text-sm font-semibold tracking-wide">
            The fast-dealing card game
          </p>
        </div>

        {/* Setup panel */}
        <motion.div
          className="chrome-panel rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {/* Player count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-white font-bold">
              <Users size={18} />
              <span className="text-base">Players</span>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                className="w-10 h-10 rounded-full bg-white font-bold text-game-text text-lg flex items-center justify-center disabled:opacity-30 border-2 border-gray-200"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.1)' }}
                onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                disabled={playerCount <= 2}
                whileTap={{ scale: 0.9 }}
              >
                <Minus size={16} />
              </motion.button>
              <span className="text-3xl font-display text-white w-8 text-center drop-shadow">
                {playerCount}
              </span>
              <motion.button
                className="w-10 h-10 rounded-full bg-white font-bold text-game-text text-lg flex items-center justify-center disabled:opacity-30 border-2 border-gray-200"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.1)' }}
                onClick={() => setPlayerCount(Math.min(5, playerCount + 1))}
                disabled={playerCount >= 5}
                whileTap={{ scale: 0.9 }}
              >
                <Plus size={16} />
              </motion.button>
            </div>
          </div>

          {/* Player names */}
          <div className="space-y-3 mb-6">
            <AnimatePresence>
              {playerNames.slice(0, playerCount).map((name, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 border-3"
                    style={{
                      backgroundColor: `${PLAYER_COLORS[i]}25`,
                      borderColor: PLAYER_COLORS[i],
                      boxShadow: `0 3px 0 ${PLAYER_COLORS[i]}60`,
                    }}
                  >
                    {PLAYER_AVATARS[i]}
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => {
                      const updated = [...playerNames]
                      updated[i] = e.target.value
                      setPlayerNames(updated)
                    }}
                    className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm text-game-text font-semibold
                      placeholder-game-text-light border-2 border-gray-200
                      focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30
                      transition-all duration-200"
                    style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.06)' }}
                    placeholder={`Player ${i + 1}`}
                    maxLength={20}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Start button */}
          <motion.button
            className="w-full btn-primary text-lg flex items-center justify-center gap-2 py-4"
            onClick={handleStart}
            whileTap={{ scale: 0.95, y: 2 }}
            whileHover={{ scale: 1.02 }}
            disabled={isStarting}
          >
            {isStarting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span className="font-extrabold">START GAME</span>
              </>
            )}
          </motion.button>
        </motion.div>

        <p className="text-center text-white/50 text-xs mt-5 font-semibold tracking-wide">
          Collect 3 complete property sets to win
        </p>
      </motion.div>
    </div>
  )
}
