import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { PLAYER_COLORS, getPlayerInitials } from '../types/game'
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
    <div className="min-h-screen table-bg flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-[0.2em] uppercase text-text-primary mb-1">
            Monopoly
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gold/30" />
            <span className="text-sm font-medium tracking-[0.3em] uppercase text-gold">Deal</span>
            <div className="h-px w-12 bg-gold/30" />
          </div>
          <p className="text-text-muted mt-3 text-xs tracking-wide">
            The fast-dealing card game
          </p>
        </div>

        {/* Setup panel */}
        <motion.div
          className="panel-raised rounded-xl p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Player count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-text-muted">
              <Users size={16} />
              <span className="text-sm font-medium">Players</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors disabled:opacity-30"
                onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                disabled={playerCount <= 2}
              >
                <Minus size={14} className="text-text-primary" />
              </button>
              <span className="text-xl font-semibold text-text-primary w-6 text-center">
                {playerCount}
              </span>
              <button
                className="w-8 h-8 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors disabled:opacity-30"
                onClick={() => setPlayerCount(Math.min(5, playerCount + 1))}
                disabled={playerCount >= 5}
              >
                <Plus size={14} className="text-text-primary" />
              </button>
            </div>
          </div>

          {/* Player names */}
          <div className="space-y-2.5 mb-6">
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
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: `${PLAYER_COLORS[i]}20`,
                      color: PLAYER_COLORS[i],
                      border: `1.5px solid ${PLAYER_COLORS[i]}40`,
                    }}
                  >
                    {getPlayerInitials(name)}
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => {
                      const updated = [...playerNames]
                      updated[i] = e.target.value
                      setPlayerNames(updated)
                    }}
                    className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary
                      placeholder-text-muted focus:outline-none focus:border-gold/30
                      transition-colors duration-200"
                    placeholder={`Player ${i + 1}`}
                    maxLength={20}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Start button */}
          <motion.button
            className="w-full btn-primary text-sm flex items-center justify-center gap-2 py-3"
            onClick={handleStart}
            whileTap={{ scale: 0.98 }}
            disabled={isStarting}
          >
            {isStarting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Play size={16} />
                <span>Start Game</span>
              </>
            )}
          </motion.button>
        </motion.div>

        <p className="text-center text-text-muted/50 text-[11px] mt-5 tracking-wide">
          Collect 3 complete property sets to win
        </p>
      </motion.div>
    </div>
  )
}
