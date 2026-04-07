import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { ScrollText, X } from 'lucide-react'
import { PLAYER_COLORS } from '../types/game'

interface GameLogProps {
  isOpen: boolean
  onClose: () => void
}

export default function GameLog({ isOpen, onClose }: GameLogProps) {
  const { log, players } = useGameStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [log.length])

  const getPlayerColor = (playerId: string) => {
    const idx = players.findIndex(p => p.id === playerId)
    return idx >= 0 ? PLAYER_COLORS[idx % PLAYER_COLORS.length] : '#999'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Slide-out panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 z-50 flex flex-col rounded-l-2xl p-4"
            style={{
              background: 'rgba(36, 59, 94, 0.92)',
              border: '1px solid rgba(74, 106, 144, 0.5)',
              borderRight: 'none',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <ScrollText size={13} className="text-white/60" />
                <span className="text-xs font-bold text-white/70">Game Log</span>
              </div>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white/90 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Log entries */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto scrollbar-thin space-y-1"
            >
              <AnimatePresence initial={false}>
                {log.slice(-30).map((entry, i) => (
                  <motion.div
                    key={entry.timestamp + i}
                    className="text-[9px] leading-relaxed"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle border border-white/30"
                      style={{ backgroundColor: getPlayerColor(entry.playerId) }}
                    />
                    <span className="text-white/70 font-semibold">{entry.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
