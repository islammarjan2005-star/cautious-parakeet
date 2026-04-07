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

function getMoneyPillColor(value: number): string {
  switch (value) {
    case 1: return '#FF4081'
    case 2: return '#40C4FF'
    case 3: return '#7C4DFF'
    case 4: return '#FF6D00'
    case 5: return '#FF1744'
    case 10: return '#FFD600'
    default: return '#66BB6A'
  }
}

export default function BankArea({ cards, compact, selectable, selectedIds = [], onCardClick }: BankAreaProps) {
  const total = getTotalValue(cards)

  if (cards.length === 0) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-8' : 'h-12'} text-white/30 text-xs font-semibold`}>
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
        <Landmark size={11} className="text-success" />
        <span className="text-xs font-extrabold text-success">${total}M</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([value, groupCards]) => (
            <div key={value} className="flex gap-0.5">
              {groupCards.map(card => {
                const isSelected = selectedIds.includes(card.id)
                const pillColor = getMoneyPillColor(card.value)
                return (
                  <motion.div
                    key={card.id}
                    className={`
                      rounded-full px-2 py-0.5 text-[9px] font-extrabold border-2
                      ${isSelected
                        ? 'ring-2 ring-accent text-white'
                        : 'text-white'
                      }
                      ${selectable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
                    `}
                    style={{
                      backgroundColor: isSelected ? '#FFD600' : pillColor,
                      borderColor: isSelected ? '#C6A800' : `${pillColor}80`,
                      color: isSelected ? '#1A1A2E' : '#FFFFFF',
                      boxShadow: `0 2px 0 ${isSelected ? '#C6A800' : pillColor}60`,
                    }}
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
