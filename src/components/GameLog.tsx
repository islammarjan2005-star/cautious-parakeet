import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { ScrollText } from 'lucide-react'
import { PLAYER_COLORS } from '../types/game'

export default function GameLog() {
  const { log, players } = useGameStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [log.length])

  const getPlayerColor = (playerId: string) => {
    const idx = players.findIndex(p => p.id === playerId)
    return idx >= 0 ? PLAYER_COLORS[idx % PLAYER_COLORS.length] : '#555'
  }

  return (
    <div className="panel rounded-lg p-3 h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-2">
        <ScrollText size={12} className="text-text-muted" />
        <span className="text-[10px] font-medium text-text-muted">Game Log</span>
      </div>

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
                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle opacity-60"
                style={{ backgroundColor: getPlayerColor(entry.playerId) }}
              />
              <span className="text-text-muted/60">{entry.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
