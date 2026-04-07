import { motion } from 'framer-motion'
import { Player, PropertySet, PropertyColor, PROPERTY_SET_SIZES, COLOR_DISPLAY_NAMES, RENT_AMOUNTS } from '../types/game'
import { getColorHex } from './Card'
import { isSetComplete } from '../utils/helpers'

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
      <div className={`flex items-center justify-center ${compact ? 'h-16' : 'h-24'} text-white/30 text-xs font-semibold`}>
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
        rounded-xl border-2 p-1.5 relative bg-white/10
        ${complete ? 'border-success ring-2 ring-success/30' : 'border-white/20'}
        ${compact ? 'min-w-[80px]' : 'min-w-[100px]'}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
    >
      {/* Color header */}
      <div
        className="rounded-lg px-2 py-1 flex items-center justify-between mb-1"
        style={{ backgroundColor: colorHex }}
      >
        <span className="text-[8px] font-extrabold text-white uppercase tracking-wide truncate">
          {COLOR_DISPLAY_NAMES[set.color]}
        </span>
        <span className="text-[7px] text-white/80 font-bold bg-white/20 rounded-full px-1.5">
          {set.cards.length}/{required}
        </span>
      </div>

      {/* Complete indicator */}
      {complete && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center z-10 text-white text-[10px] font-bold border-2 border-white"
          style={{ boxShadow: '0 2px 0 #2E7D32' }}>
          {'\u2714'}
        </div>
      )}

      {/* Property cards stacked */}
      <div className="space-y-0.5">
        {set.cards.map((card, i) => (
          <motion.div
            key={card.id}
            className={`
              rounded-md px-1.5 py-0.5 text-[7.5px] font-bold truncate text-white
              ${selectableForSteal && !complete ? 'cursor-pointer hover:ring-2 hover:ring-accent transition-all' : ''}
            `}
            style={{ backgroundColor: `${colorHex}CC` }}
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
          <div className="flex items-center gap-0.5 bg-[#66BB6A] rounded-full px-1.5 py-0.5">
            <span className="text-[8px]">{'\u{1F3E0}'}</span>
            <span className="text-[6px] text-white font-bold">House</span>
          </div>
        )}
        {set.hasHotel && (
          <div className="flex items-center gap-0.5 bg-[#FF7043] rounded-full px-1.5 py-0.5">
            <span className="text-[8px]">{'\u{1F3E8}'}</span>
            <span className="text-[6px] text-white font-bold">Hotel</span>
          </div>
        )}
      </div>

      {/* Rent preview */}
      {!compact && rents && (
        <div className="mt-1 flex gap-0.5 justify-center">
          {rents.map((r, i) => (
            <div
              key={i}
              className={`text-[6px] px-1 rounded-full font-bold ${i < set.cards.length ? 'bg-accent/30 text-accent-dark' : 'bg-white/10 text-white/30'}`}
            >
              ${r}M
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
