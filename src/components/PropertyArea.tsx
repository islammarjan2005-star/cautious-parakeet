import { motion } from 'framer-motion'
import { Player, PropertySet, PropertyColor, PROPERTY_SET_SIZES, COLOR_DISPLAY_NAMES, RENT_AMOUNTS } from '../types/game'
import { getColorHex } from './Card'
import { isSetComplete } from '../utils/helpers'
import { Home, Building, Check } from 'lucide-react'

interface PropertyAreaProps {
  player: Player
  isCurrentPlayer?: boolean
  compact?: boolean
  onPropertyClick?: (cardId: string, color: PropertyColor) => void
  selectableForSteal?: boolean
}

export default function PropertyArea({ player, isCurrentPlayer, compact, onPropertyClick, selectableForSteal }: PropertyAreaProps) {
  if (player.properties.length === 0) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-16' : 'h-24'} text-text-muted/30 text-[11px]`}>
        No properties
      </div>
    )
  }

  return (
    <div className={`flex gap-2 flex-wrap ${compact ? 'max-h-[100px]' : ''} overflow-y-auto scrollbar-thin`}>
      {player.properties.map((set) => (
        <PropertySetDisplay
          key={set.color}
          set={set}
          compact={compact}
          onCardClick={onPropertyClick}
          selectableForSteal={selectableForSteal}
        />
      ))}
    </div>
  )
}

function PropertySetDisplay({
  set, compact, onCardClick, selectableForSteal,
}: {
  set: PropertySet
  compact?: boolean
  onCardClick?: (cardId: string, color: PropertyColor) => void
  selectableForSteal?: boolean
}) {
  const complete = isSetComplete(set)
  const required = PROPERTY_SET_SIZES[set.color]
  const colorHex = getColorHex(set.color)
  const rents = RENT_AMOUNTS[set.color]

  return (
    <motion.div
      className={`
        rounded-lg border p-1.5 relative
        ${complete ? 'border-gold/30 bg-gold/[0.03]' : 'border-white/[0.06] bg-white/[0.02]'}
        ${compact ? 'min-w-[80px]' : 'min-w-[100px]'}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
    >
      {/* Color header */}
      <div
        className="rounded-t px-2 py-0.5 flex items-center justify-between mb-1"
        style={{ backgroundColor: colorHex, opacity: 0.85 }}
      >
        <span className="text-[8px] font-medium text-white/90 truncate">
          {COLOR_DISPLAY_NAMES[set.color]}
        </span>
        <span className="text-[7px] text-white/60">
          {set.cards.length}/{required}
        </span>
      </div>

      {/* Complete indicator */}
      {complete && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold flex items-center justify-center z-10">
          <Check size={9} className="text-walnut" strokeWidth={3} />
        </div>
      )}

      {/* Property cards stacked */}
      <div className="space-y-0.5">
        {set.cards.map((card, i) => (
          <motion.div
            key={card.id}
            className={`
              rounded px-1.5 py-0.5 text-[7.5px] font-medium truncate text-white/80
              ${selectableForSteal && !complete ? 'cursor-pointer hover:ring-1 hover:ring-gold/40 transition-all' : ''}
            `}
            style={{ backgroundColor: `${colorHex}66` }}
            onClick={() => selectableForSteal && !complete && onCardClick?.(card.id, set.color)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            {card.name}
          </motion.div>
        ))}
      </div>

      {/* House / Hotel indicators */}
      <div className="flex gap-1 mt-1 justify-center">
        {set.hasHouse && (
          <div className="flex items-center gap-0.5 bg-[#3a5a3a] rounded px-1 py-0.5">
            <Home size={7} className="text-[#a0c8a0]" />
            <span className="text-[6px] text-[#a0c8a0] font-medium">House</span>
          </div>
        )}
        {set.hasHotel && (
          <div className="flex items-center gap-0.5 bg-[#5a3a3a] rounded px-1 py-0.5">
            <Building size={7} className="text-[#c8a0a0]" />
            <span className="text-[6px] text-[#c8a0a0] font-medium">Hotel</span>
          </div>
        )}
      </div>

      {/* Rent preview */}
      {!compact && rents && (
        <div className="mt-1 flex gap-0.5 justify-center">
          {rents.map((r, i) => (
            <div
              key={i}
              className={`text-[6px] px-1 rounded ${i < set.cards.length ? 'bg-gold/15 text-gold font-medium' : 'bg-white/[0.03] text-text-muted/30'}`}
            >
              ${r}M
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
