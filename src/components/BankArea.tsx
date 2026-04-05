import { motion } from 'framer-motion'
import { Card as CardType } from '../types/game'
import { getTotalValue } from '../utils/helpers'
import { Landmark } from 'lucide-react'

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
      <div className={`flex items-center justify-center ${compact ? 'h-8' : 'h-12'} text-text-muted/30 text-[11px]`}>
        <Landmark size={11} className="mr-1 opacity-40" />
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
        <Landmark size={10} className="text-gold" />
        <span className="text-[10px] font-medium text-gold">${total}M</span>
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
                      rounded px-1.5 py-0.5 text-[9px] font-medium border
                      ${isSelected
                        ? 'bg-gold/20 text-gold border-gold/40'
                        : 'bg-white/[0.04] text-text-muted border-white/[0.06]'
                      }
                      ${selectable ? 'cursor-pointer hover:bg-white/[0.08] transition-colors' : ''}
                    `}
                    onClick={() => selectable && onCardClick?.(card.id)}
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
