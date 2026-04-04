import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { ScrollText } from 'lucide-react'

export default function GameLog() {
  const { log, players } = useGameStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [log.length])

  const getPlayerColor = (playerId: string) => {
    const colors = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA']
    const idx = players.findIndex(p => p.id === playerId)
    return idx >= 0 ? colors[idx] : '#999'
  }

  return (
    <div className="glass-dark rounded-xl p-3 h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-2">
        <ScrollText size={14} className="text-yellow-400" />
        <span className="text-[11px] font-bold text-white/70">Game Log</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin space-y-1"
      >
        <AnimatePresence initial={false}>
          {log.slice(-30).map((entry, i) => (
            <motion.div
              key={entry.timestamp + i}
              className="text-[10px] leading-relaxed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: getPlayerColor(entry.playerId) }}
              />
              <span className="text-white/60">{entry.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
