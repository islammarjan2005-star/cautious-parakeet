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
    <div className={`flex flex-col ${compact ? 'max-h-[100px]' : ''} overflow-y-auto scrollbar-thin`}>
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

  if (compact) {
    return (
      <motion.div
        className="flex items-center gap-2 px-2 py-1 mb-1 rounded-lg"
        style={{ backgroundColor: `${colorHex}15` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        layout
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colorHex }}
        />
        <span className="text-white/80 text-[10px] font-semibold truncate flex-1">
          {COLOR_DISPLAY_NAMES[set.color]}
        </span>
        {set.hasHouse && <span className="text-[10px]">{'\u{1F3E0}'}</span>}
        {set.hasHotel && <span className="text-[10px]">{'\u{1F3E8}'}</span>}
        <span className="text-white/50 text-[10px] font-bold flex-shrink-0">
          {set.cards.length}/{required}
        </span>
        {complete && <span className="text-[10px] text-green-400">{'\u2714'}</span>}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`flex items-center px-3 py-2 rounded-xl mb-1.5 transition-shadow ${
        complete ? 'shadow-[0_0_8px_rgba(76,175,80,0.4)]' : ''
      }`}
      style={{
        backgroundColor: `${colorHex}20`,
        border: `2px solid ${complete ? '#4CAF50' : colorHex}`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
    >
      {/* Color label */}
      <div
        className="text-white font-bold text-xs uppercase w-16 flex-shrink-0 rounded-md px-1.5 py-0.5 text-center"
        style={{ backgroundColor: colorHex }}
      >
        {COLOR_DISPLAY_NAMES[set.color]}
      </div>

      {/* Property name pills */}
      <div className="flex-1 flex gap-1.5 flex-wrap text-white/90 text-[11px] ml-3">
        {set.cards.map((card, i) => (
          <motion.span
            key={card.id}
            className={`
              rounded-full px-2 py-0.5 font-semibold
              ${selectableForSteal && !complete
                ? 'cursor-pointer hover:ring-2 hover:ring-accent hover:brightness-125 transition-all'
                : ''}
            `}
            style={{ backgroundColor: `${colorHex}55` }}
            onClick={() => selectableForSteal && !complete && onCardClick?.(card.id, set.color)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            {card.name}
          </motion.span>
        ))}
        {/* House / Hotel badges inline */}
        {set.hasHouse && (
          <span className="rounded-full px-1.5 py-0.5 bg-[#66BB6A]/30 text-[10px]">
            {'\u{1F3E0}'} House
          </span>
        )}
        {set.hasHotel && (
          <span className="rounded-full px-1.5 py-0.5 bg-[#FF7043]/30 text-[10px]">
            {'\u{1F3E8}'} Hotel
          </span>
        )}
      </div>

      {/* Right side: completion badge + count */}
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        {complete && (
          <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">
            {'\u2714'}
          </span>
        )}
        <span className="text-white/60 text-[10px] font-bold bg-white/10 rounded-full px-2 py-0.5">
          {set.cards.length}/{required}
        </span>
      </div>
    </motion.div>
  )
}
