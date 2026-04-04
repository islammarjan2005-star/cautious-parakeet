import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { PLAYER_AVATARS, PLAYER_COLORS } from '../types/game'
import { Plus, Minus, Play, Users, Sparkles } from 'lucide-react'

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
    }, 800)
  }

  return (
    <div className="min-h-screen felt-bg flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -200],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        className="w-full max-w-lg relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <h1 className="monopoly-title text-6xl md:text-7xl text-white text-glow mb-2">
            MONOPOLY
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-yellow-400" />
            <span className="monopoly-title text-3xl md:text-4xl text-yellow-400">DEAL</span>
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-yellow-400" />
          </div>
          <p className="text-green-200/70 mt-3 text-sm">The fast-dealing card game</p>
        </motion.div>

        {/* Setup Card */}
        <motion.div
          className="glass rounded-2xl p-6 md:p-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          {/* Player count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-yellow-400" />
              <span className="font-bold text-lg">Players</span>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                whileTap={{ scale: 0.9 }}
                disabled={playerCount <= 2}
              >
                <Minus size={18} className={playerCount <= 2 ? 'text-gray-500' : 'text-white'} />
              </motion.button>
              <motion.span
                className="text-3xl font-black text-yellow-400 w-8 text-center"
                key={playerCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {playerCount}
              </motion.span>
              <motion.button
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={() => setPlayerCount(Math.min(5, playerCount + 1))}
                whileTap={{ scale: 0.9 }}
                disabled={playerCount >= 5}
              >
                <Plus size={18} className={playerCount >= 5 ? 'text-gray-500' : 'text-white'} />
              </motion.button>
            </div>
          </div>

          {/* Player names */}
          <div className="space-y-3 mb-8">
            <AnimatePresence>
              {playerNames.slice(0, playerCount).map((name, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 shadow-md flex-shrink-0"
                    style={{
                      borderColor: PLAYER_COLORS[i],
                      background: `${PLAYER_COLORS[i]}22`,
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
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white
                      placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10
                      transition-all duration-200"
                    placeholder={`Player ${i + 1}`}
                    maxLength={20}
                  />
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PLAYER_COLORS[i] }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Start button */}
          <motion.button
            className="w-full btn-primary text-lg flex items-center justify-center gap-2 py-4 rounded-xl"
            onClick={handleStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isStarting}
          >
            <AnimatePresence mode="wait">
              {isStarting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{ rotate: { repeat: Infinity, duration: 1, ease: 'linear' } }}
                >
                  <Sparkles size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Play size={22} />
                  <span>Start Game</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Rules hint */}
        <motion.p
          className="text-center text-green-200/40 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Collect 3 complete property sets to win!
        </motion.p>
      </motion.div>
    </div>
  )
}
