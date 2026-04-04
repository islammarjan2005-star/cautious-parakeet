import { motion } from 'framer-motion'
import { Player, PropertySet, PropertyColor, PROPERTY_SET_SIZES, COLOR_DISPLAY_NAMES, RENT_AMOUNTS } from '../types/game'
import Card, { getColorHex } from './Card'
import { isSetComplete } from '../utils/helpers'
import { Home, Building } from 'lucide-react'

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
      <div className={`flex items-center justify-center ${compact ? 'h-16' : 'h-24'} text-white/20 text-xs italic`}>
        No properties yet
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
        rounded-xl border-2 p-1.5 relative
        ${complete ? 'border-yellow-400/70 bg-yellow-400/5' : 'border-white/10 bg-white/5'}
        ${compact ? 'min-w-[80px]' : 'min-w-[100px]'}
      `}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      layout
    >
      {/* Color header */}
      <div
        className="rounded-t-lg px-2 py-0.5 flex items-center justify-between mb-1"
        style={{ backgroundColor: `${colorHex}33`, borderBottom: `2px solid ${colorHex}` }}
      >
        <span className="text-[9px] font-bold text-white truncate">
          {COLOR_DISPLAY_NAMES[set.color]}
        </span>
        <span className="text-[8px] text-white/70">
          {set.cards.length}/{required}
        </span>
      </div>

      {/* Complete badge */}
      {complete && (
        <motion.div
          className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          ✓ SET
        </motion.div>
      )}

      {/* Property cards stacked */}
      <div className="space-y-0.5">
        {set.cards.map((card, i) => (
          <motion.div
            key={card.id}
            className={`
              rounded-md px-1.5 py-0.5 text-[8px] font-semibold truncate text-white
              ${selectableForSteal && !complete ? 'cursor-pointer hover:ring-1 hover:ring-yellow-400 transition-all' : ''}
            `}
            style={{ backgroundColor: `${colorHex}88` }}
            onClick={() => selectableForSteal && !complete && onCardClick?.(card.id, set.color)}
            whileHover={selectableForSteal && !complete ? { scale: 1.05 } : undefined}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            {card.name}
          </motion.div>
        ))}
      </div>

      {/* House / Hotel indicators */}
      <div className="flex gap-1 mt-1 justify-center">
        {set.hasHouse && (
          <motion.div
            className="flex items-center gap-0.5 bg-green-700 rounded px-1 py-0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Home size={8} className="text-green-200" />
            <span className="text-[7px] text-green-200 font-bold">House</span>
          </motion.div>
        )}
        {set.hasHotel && (
          <motion.div
            className="flex items-center gap-0.5 bg-red-700 rounded px-1 py-0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Building size={8} className="text-red-200" />
            <span className="text-[7px] text-red-200 font-bold">Hotel</span>
          </motion.div>
        )}
      </div>

      {/* Rent preview for compact */}
      {!compact && rents && (
        <div className="mt-1 flex gap-0.5 justify-center">
          {rents.map((r, i) => (
            <div
              key={i}
              className={`text-[7px] px-1 rounded ${i < set.cards.length ? 'bg-yellow-400/30 text-yellow-200 font-bold' : 'bg-white/5 text-white/30'}`}
            >
              ${r}M
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
