import { motion } from 'framer-motion'
import { Card as CardType, PropertyColor, COLOR_DISPLAY_NAMES } from '../types/game'
import {
  DollarSign, MapPin, Receipt, Palette, Shuffle,
  ArrowRight, Gavel, Eye, ArrowLeftRight, HandCoins,
  Gift, ShieldX, Home, Building, ChevronsUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

const ICON_SIZES = { sm: 10, md: 14, lg: 18 }
const BAND_HEIGHTS = { sm: 'h-6', md: 'h-10', lg: 'h-14' }

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

function getCardLucideIcon(card: CardType): LucideIcon {
  if (card.type === 'money') return DollarSign
  if (card.type === 'rent') return Receipt
  if (card.type === 'wild_multicolor') return Palette
  if (card.type === 'wild_property') return Shuffle
  if (card.type === 'property') return MapPin

  switch (card.actionType) {
    case 'pass_go': return ArrowRight
    case 'deal_breaker': return Gavel
    case 'sly_deal': return Eye
    case 'forced_deal': return ArrowLeftRight
    case 'debt_collector': return HandCoins
    case 'its_my_birthday': return Gift
    case 'just_say_no': return ShieldX
    case 'house': return Home
    case 'hotel': return Building
    case 'double_the_rent': return ChevronsUp
    default: return MapPin
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

function getActionBandColor(card: CardType): string {
  switch (card.actionType) {
    case 'pass_go': return '#4A7FA5'
    case 'deal_breaker': return '#8B3A3A'
    case 'sly_deal': return '#6B5B73'
    case 'forced_deal': return '#5A6B7A'
    case 'debt_collector': return '#7A6B3A'
    case 'its_my_birthday': return '#7A5A6B'
    case 'just_say_no': return '#8B4A4A'
    case 'house': return '#5A8F5A'
    case 'hotel': return '#8B5A3A'
    case 'double_the_rent': return '#6B6B3A'
    default: return '#5A6B7A'
  }
}

export default function Card({
  card, onClick, size = 'md', isPlayable = false,
  isSelected = false, faceDown = false, style, className = '', showValue = true,
}: CardProps) {
  const iconSize = ICON_SIZES[size]
  const bandHeight = BAND_HEIGHTS[size]

  if (faceDown) {
    return (
      <motion.div
        className={`${SIZE_CLASSES[size]} rounded-lg border cursor-default select-none
          shadow-card flex items-center justify-center ${className}`}
        style={{
          ...style,
          background: 'linear-gradient(145deg, #5C1A1A 0%, #4A1515 50%, #3D1010 100%)',
          borderColor: '#3a0f0f',
        }}
        whileHover={{ y: -1 }}
      >
        <div className="text-center opacity-40">
          <div className={`font-semibold text-amber-200/70 tracking-wider ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-base' : 'text-xl'}`}>
            M
          </div>
        </div>
      </motion.div>
    )
  }

  const bgClass = getCardBackground(card)
  const Icon = getCardLucideIcon(card)
  const bandColor = card.type === 'property' && card.color
    ? getColorHex(card.color)
    : card.type === 'action'
    ? getActionBandColor(card)
    : card.type === 'money'
    ? '#5A7A5A'
    : card.type === 'rent'
    ? '#7A5A3A'
    : card.type === 'wild_multicolor'
    ? '#6B5B73'
    : card.type === 'wild_property' && card.colors
    ? getColorHex(card.colors[0])
    : '#5A6B7A'

  return (
    <motion.div
      className={`
        ${SIZE_CLASSES[size]} ${bgClass} rounded-lg border select-none
        flex flex-col overflow-hidden relative
        ${isPlayable ? 'border-gold/40 cursor-pointer' : ''}
        ${isSelected ? 'shadow-card-selected -translate-y-2 z-50' : 'shadow-card'}
        ${onClick ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${className}
      `}
      style={style}
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      layout
    >
      {/* Color band at top */}
      <div
        className={`${bandHeight} w-full flex items-center justify-center relative overflow-hidden`}
        style={{ backgroundColor: bandColor }}
      >
        {/* Wild property: diagonal split */}
        {card.type === 'wild_property' && card.colors && card.colors.length >= 2 && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${getColorHex(card.colors[0])} 50%, ${getColorHex(card.colors[1])} 50%)`,
            }}
          />
        )}

        {/* Wild multicolor: subtle multi-band */}
        {card.type === 'wild_multicolor' && (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #B45B5B 0%, #C0883A 25%, #5A8F5A 50%, #4A7FA5 75%, #8A6AAE 100%)',
            }}
          />
        )}

        <Icon size={iconSize} className="text-white/90 relative z-10" strokeWidth={1.5} />
      </div>

      {/* Card body */}
      <div className="flex-1 flex flex-col items-center justify-center px-1 py-0.5 text-center">
        <div className={`font-medium text-text-card leading-tight
          ${size === 'sm' ? 'text-[5.5px]' : size === 'md' ? 'text-[8px]' : 'text-[10px]'}
        `}>
          {card.name}
        </div>

        {card.type === 'action' && (
          <div className={`text-text-card/50 leading-tight mt-0.5
            ${size === 'sm' ? 'text-[4.5px]' : size === 'md' ? 'text-[6.5px]' : 'text-[8px]'}
          `}>
            {getActionDescription(card)}
          </div>
        )}

        {card.type === 'rent' && card.rentColors && (
          <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
            {card.rentColors.slice(0, 4).map(color => (
              <div
                key={color}
                className={`rounded-full ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
                style={{ backgroundColor: getColorHex(color) }}
                title={COLOR_DISPLAY_NAMES[color]}
              />
            ))}
            {card.rentColors.length > 4 && (
              <span className="text-[5px] text-text-card/40">+{card.rentColors.length - 4}</span>
            )}
          </div>
        )}

        {card.type === 'wild_property' && card.colors && (
          <div className="flex gap-0.5 mt-0.5">
            {card.colors.map(color => (
              <div
                key={color}
                className={`rounded-sm ${size === 'sm' ? 'w-2.5 h-1.5' : 'w-3.5 h-2'}`}
                style={{ backgroundColor: getColorHex(color) }}
                title={COLOR_DISPLAY_NAMES[color]}
              />
            ))}
          </div>
        )}

        {card.type === 'money' && (
          <div className={`font-semibold text-text-card/80 mt-0.5
            ${size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[11px]' : 'text-sm'}
          `}>
            ${card.value}M
          </div>
        )}
      </div>

      {/* Value in bottom-right corner */}
      {showValue && card.value > 0 && (
        <div className={`absolute bottom-0.5 right-1 text-text-card/30 font-medium
          ${size === 'sm' ? 'text-[5px]' : size === 'md' ? 'text-[7px]' : 'text-[9px]'}
        `}>
          ${card.value}M
        </div>
      )}
    </motion.div>
  )
}

function getColorHex(color: PropertyColor): string {
  const map: Record<PropertyColor, string> = {
    red: '#B45B5B',
    blue: '#4A7FA5',
    green: '#5A8F5A',
    yellow: '#BFA840',
    orange: '#C0883A',
    purple: '#8A6AAE',
    brown: '#7A6050',
    teal: '#4A8A80',
    pink: '#A85A75',
    sky: '#5A9AB5',
    railroad: '#555555',
    utility: '#6A9A6A',
  }
  return map[color] || '#777'
}

export { getColorHex }
