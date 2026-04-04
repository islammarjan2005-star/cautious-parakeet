import { motion } from 'framer-motion'
import { Card as CardType, PropertyColor, COLOR_DISPLAY_NAMES } from '../types/game'

interface CardProps {
  card: CardType
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  isPlayable?: boolean
  isSelected?: boolean
  faceDown?: boolean
  style?: React.CSSProperties
  className?: string
  showValue?: boolean
}

const SIZE_CLASSES = {
  sm: 'w-16 h-[90px] text-[8px]',
  md: 'w-24 h-[134px] text-[10px]',
  lg: 'w-32 h-[179px] text-xs',
}

function getCardBackground(card: CardType): string {
  if (card.type === 'money') return 'card-money'
  if (card.type === 'rent') return 'card-rent'
  if (card.type === 'action') return 'card-action'
  if (card.type === 'wild_multicolor') return 'card-property-wild'
  if (card.type === 'wild_property' && card.colors) {
    return `card-property-${card.colors[0]}`
  }
  if (card.color) return `card-property-${card.color}`
  return 'card-action'
}

function getCardIcon(card: CardType): string {
  if (card.type === 'money') return '💵'
  if (card.type === 'rent') return '🏠'
  if (card.type === 'wild_multicolor') return '🌈'
  if (card.type === 'wild_property') return '🔀'
  if (card.type === 'property') return '🏘️'

  switch (card.actionType) {
    case 'pass_go': return '▶️'
    case 'deal_breaker': return '💥'
    case 'sly_deal': return '🤫'
    case 'forced_deal': return '🔄'
    case 'debt_collector': return '💰'
    case 'its_my_birthday': return '🎂'
    case 'just_say_no': return '🚫'
    case 'house': return '🏠'
    case 'hotel': return '🏨'
    case 'double_the_rent': return '⚡'
    default: return '🃏'
  }
}

function getActionDescription(card: CardType): string {
  switch (card.actionType) {
    case 'pass_go': return 'Draw 2 cards'
    case 'deal_breaker': return 'Steal a complete set'
    case 'sly_deal': return 'Steal 1 property'
    case 'forced_deal': return 'Swap a property'
    case 'debt_collector': return 'Charge $5M'
    case 'its_my_birthday': return 'All pay $2M'
    case 'just_say_no': return 'Cancel an action'
    case 'house': return '+$3M rent on full set'
    case 'hotel': return '+$4M rent (needs house)'
    case 'double_the_rent': return 'Double rent amount'
    default: return ''
  }
}

export default function Card({
  card, onClick, size = 'md', isPlayable = false,
  isSelected = false, faceDown = false, style, className = '', showValue = true,
}: CardProps) {
  if (faceDown) {
    return (
      <motion.div
        className={`${SIZE_CLASSES[size]} rounded-xl border-2 border-red-900 cursor-default select-none
          bg-gradient-to-br from-red-700 via-red-600 to-red-800 shadow-card flex items-center justify-center ${className}`}
        style={style}
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-center">
          <div className={`font-bold text-white ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'}`}>
            M
          </div>
          <div className={`text-red-200 font-bold ${size === 'sm' ? 'text-[6px]' : 'text-[8px]'}`}>
            DEAL
          </div>
        </div>
      </motion.div>
    )
  }

  const bgClass = getCardBackground(card)
  const icon = getCardIcon(card)

  return (
    <motion.div
      className={`
        ${SIZE_CLASSES[size]} ${bgClass} rounded-xl border-2 select-none
        flex flex-col overflow-hidden relative
        ${isPlayable ? 'card-playable cursor-pointer' : ''}
        ${isSelected ? 'ring-3 ring-yellow-300 shadow-card-active -translate-y-3 scale-110 z-50' : 'shadow-card'}
        ${onClick ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-1' : ''}
        ${className}
      `}
      style={style}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      layout
    >
      {/* Value badge */}
      {showValue && card.value > 0 && (
        <div className={`absolute top-0.5 left-0.5 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center border border-yellow-600
          ${size === 'sm' ? 'w-3.5 h-3.5 text-[6px]' : size === 'md' ? 'w-5 h-5 text-[8px]' : 'w-6 h-6 text-[10px]'}
        `}>
          {card.value}
        </div>
      )}

      {/* Card content */}
      <div className="flex flex-col items-center justify-center h-full p-1 text-center">
        <span className={`${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-3xl'}`}>
          {icon}
        </span>

        <div className={`font-extrabold text-gray-900 leading-tight mt-0.5 px-0.5
          ${size === 'sm' ? 'text-[6px]' : size === 'md' ? 'text-[9px]' : 'text-[11px]'}
        `}>
          {card.name}
        </div>

        {/* Action description */}
        {card.type === 'action' && (
          <div className={`text-gray-600 leading-tight mt-0.5 px-1
            ${size === 'sm' ? 'text-[5px]' : size === 'md' ? 'text-[7px]' : 'text-[9px]'}
          `}>
            {getActionDescription(card)}
          </div>
        )}

        {/* Rent card - show applicable colors */}
        {card.type === 'rent' && card.rentColors && (
          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
            {card.rentColors.slice(0, 4).map(color => (
              <div
                key={color}
                className={`rounded-full border border-gray-400
                  ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}
                `}
                style={{ backgroundColor: getColorHex(color) }}
                title={COLOR_DISPLAY_NAMES[color]}
              />
            ))}
            {card.rentColors.length > 4 && (
              <span className="text-[6px] text-gray-600">+{card.rentColors.length - 4}</span>
            )}
          </div>
        )}

        {/* Wild property - show both colors */}
        {card.type === 'wild_property' && card.colors && (
          <div className="flex gap-0.5 mt-0.5">
            {card.colors.map(color => (
              <div
                key={color}
                className={`rounded-sm border border-gray-400
                  ${size === 'sm' ? 'w-3 h-2' : 'w-4 h-2.5'}
                `}
                style={{ backgroundColor: getColorHex(color) }}
                title={COLOR_DISPLAY_NAMES[color]}
              />
            ))}
          </div>
        )}

        {/* Money value display */}
        {card.type === 'money' && (
          <div className={`font-black text-green-800 mt-0.5
            ${size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-sm' : 'text-lg'}
          `}>
            ${card.value}M
          </div>
        )}
      </div>
    </motion.div>
  )
}

function getColorHex(color: PropertyColor): string {
  const map: Record<PropertyColor, string> = {
    red: '#E53935',
    blue: '#1E88E5',
    green: '#43A047',
    yellow: '#FDD835',
    orange: '#FB8C00',
    purple: '#8E24AA',
    brown: '#6D4C41',
    teal: '#00897B',
    pink: '#D81B60',
    sky: '#039BE5',
    railroad: '#424242',
    utility: '#66BB6A',
  }
  return map[color] || '#999'
}

export { getColorHex }
