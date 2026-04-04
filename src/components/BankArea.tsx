import { motion } from 'framer-motion'
import { Card as CardType } from '../types/game'
import { getTotalValue } from '../utils/helpers'
import { Banknote } from 'lucide-react'

interface BankAreaProps {
  cards: CardType[]
  compact?: boolean
  selectable?: boolean
  selectedIds?: string[]
  onCardClick?: (cardId: string) => void
}

export default function BankArea({ cards, compact, selectable, selectedIds = [], onCardClick }: BankAreaProps) {
  const total = getTotalValue(cards)

  if (cards.length === 0) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-8' : 'h-12'} text-white/20 text-xs italic`}>
        <Banknote size={14} className="mr-1 opacity-40" />
        Empty bank
      </div>
    )
  }

  // Group by value
  const grouped = cards.reduce((acc, card) => {
    const key = card.value
    if (!acc[key]) acc[key] = []
    acc[key].push(card)
    return acc
  }, {} as Record<number, CardType[]>)

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <Banknote size={12} className="text-yellow-400" />
        <span className="text-[10px] font-bold text-yellow-400">${total}M</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([value, groupCards]) => (
            <div key={value} className="flex gap-0.5">
              {groupCards.map(card => {
                const isSelected = selectedIds.includes(card.id)
                return (
                  <motion.div
                    key={card.id}
                    className={`
                      rounded-md px-1.5 py-0.5 text-[9px] font-bold border
                      ${isSelected
                        ? 'bg-yellow-400 text-black border-yellow-300 shadow-md'
                        : 'bg-green-900/50 text-green-300 border-green-700/50'
                      }
                      ${selectable ? 'cursor-pointer hover:bg-green-800/50 transition-colors' : ''}
                    `}
                    onClick={() => selectable && onCardClick?.(card.id)}
                    whileHover={selectable ? { scale: 1.1 } : undefined}
                    whileTap={selectable ? { scale: 0.95 } : undefined}
                    layout
                  >
                    ${card.value}M
                  </motion.div>
                )
              })}
            </div>
          ))}
      </div>
    </div>
  )
}
