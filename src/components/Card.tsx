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

const BAND_HEIGHTS = { sm: 'h-7', md: 'h-11', lg: 'h-16' }
const EMOJI_SIZES = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }
const MONEY_SIZES = { sm: 'text-base', md: 'text-2xl', lg: 'text-4xl' }

function getCardEmoji(card: CardType): string {
  if (card.type === 'money') return '\u{1F4B5}'
  if (card.type === 'rent') return '\u{1F3E0}'
  if (card.type === 'wild_multicolor') return '\u{1F308}'
  if (card.type === 'wild_property') return '\u{1F500}'
  if (card.type === 'property') return '\u{1F3D8}\uFE0F'

  switch (card.actionType) {
    case 'pass_go': return '\u{1F3C3}'
    case 'deal_breaker': return '\u{1F4A5}'
    case 'sly_deal': return '\u{1F60F}'
    case 'forced_deal': return '\u{1F500}'
    case 'debt_collector': return '\u{1F4B0}'
    case 'its_my_birthday': return '\u{1F382}'
    case 'just_say_no': return '\u{1F6AB}'
    case 'house': return '\u{1F3E0}'
    case 'hotel': return '\u{1F3E8}'
    case 'double_the_rent': return '\u26A1'
    default: return '\u{1F3B4}'
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

function getActionGradient(card: CardType): string {
  switch (card.actionType) {
    case 'pass_go': return 'linear-gradient(135deg, #43E97B, #38F9D7)'
    case 'deal_breaker': return 'linear-gradient(135deg, #FF6B6B, #FF8E53)'
    case 'sly_deal': return 'linear-gradient(135deg, #A18CD1, #FBC2EB)'
    case 'forced_deal': return 'linear-gradient(135deg, #667EEA, #764BA2)'
    case 'debt_collector': return 'linear-gradient(135deg, #FFD600, #FF9800)'
    case 'its_my_birthday': return 'linear-gradient(135deg, #F093FB, #F5576C)'
    case 'just_say_no': return 'linear-gradient(135deg, #FF5252, #FF1744)'
    case 'house': return 'linear-gradient(135deg, #66BB6A, #43A047)'
    case 'hotel': return 'linear-gradient(135deg, #FF7043, #F4511E)'
    case 'double_the_rent': return 'linear-gradient(135deg, #FFD600, #FF6D00)'
    default: return 'linear-gradient(135deg, #667EEA, #764BA2)'
  }
}

function getMoneyColor(value: number): string {
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

function getCardCssClass(card: CardType): string {
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

export default function Card({
  card, onClick, size = 'md', isPlayable = false,
  isSelected = false, faceDown = false, style, className = '', showValue = true,
}: CardProps) {
  const bandHeight = BAND_HEIGHTS[size]
  const emojiSize = EMOJI_SIZES[size]

  if (faceDown) {
    return (
      <motion.div
        className={`${SIZE_CLASSES[size]} rounded-card border-3 cursor-default select-none
          flex items-center justify-center overflow-hidden ${className}`}
        style={{
          ...style,
          background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
          borderColor: '#5A6FD1',
          boxShadow: '0 6px 0 rgba(90,60,130,0.4)',
        }}
        whileHover={{ y: -1 }}
      >
        <div className="text-center">
          <div className={`font-display text-white/80 ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'}`}>
            M
          </div>
          <div className="text-white/30 text-[8px]">{'\u2B50'}</div>
        </div>
      </motion.div>
    )
  }

  const cssClass = getCardCssClass(card)

  return (
    <motion.div
      className={`
        ${SIZE_CLASSES[size]} card-base ${cssClass} select-none
        flex flex-col overflow-hidden relative
        ${isPlayable ? 'cursor-pointer ring-2 ring-accent/50' : ''}
        ${isSelected ? 'z-50' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        ...style,
        ...(isSelected ? {
          transform: 'translateY(-16px)',
          boxShadow: '0 0 0 4px #FFD600, 0 8px 0 rgba(0,0,0,0.15)',
        } : {}),
      }}
      onClick={onClick}
      whileHover={onClick && !isSelected ? { y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      layout
    >
      {/* Color band / header */}
      {card.type === 'money' ? (
        /* Money card: big denomination */
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div
            className="absolute inset-0 opacity-[0.06] flex items-center justify-center"
            style={{ fontSize: size === 'sm' ? '60px' : size === 'md' ? '90px' : '120px' }}
          >
            {'\u2B50'}
          </div>
          <div
            className={`font-display ${MONEY_SIZES[size]} leading-none relative z-10`}
            style={{ color: getMoneyColor(card.value) }}
          >
            ${card.value}M
          </div>
          <div className={`text-game-text-light font-bold mt-1 uppercase tracking-wider
            ${size === 'sm' ? 'text-[5px]' : size === 'md' ? 'text-[7px]' : 'text-[9px]'}
          `}>
            Monopoly Deal
          </div>
        </div>
      ) : (
        <>
          {/* Color band at top */}
          <div
            className={`${bandHeight} w-full flex items-center justify-center relative overflow-hidden`}
            style={{
              background: card.type === 'action'
                ? getActionGradient(card)
                : card.type === 'wild_property' && card.colors && card.colors.length >= 2
                ? `linear-gradient(135deg, ${getColorHex(card.colors[0])} 50%, ${getColorHex(card.colors[1])} 50%)`
                : card.type === 'wild_multicolor'
                ? 'linear-gradient(135deg, #F44336 0%, #FF9800 20%, #FFEE58 40%, #66BB6A 60%, #1E88E5 80%, #AB47BC 100%)'
                : card.type === 'rent' && card.rentColors
                ? card.rentColors.length >= 2
                  ? `linear-gradient(135deg, ${getColorHex(card.rentColors[0])} 50%, ${getColorHex(card.rentColors[1])} 50%)`
                  : getColorHex(card.rentColors[0])
                : card.color
                ? getColorHex(card.color)
                : '#667EEA',
            }}
          >
            {/* Emoji on band */}
            <span className={`${emojiSize} relative z-10 drop-shadow-sm`}>
              {getCardEmoji(card)}
            </span>
          </div>

          {/* Card body */}
          <div className="flex-1 flex flex-col items-center justify-center px-1.5 py-0.5 text-center">
            <div className={`font-extrabold text-game-text uppercase tracking-wide leading-tight
              ${size === 'sm' ? 'text-[5.5px]' : size === 'md' ? 'text-[8px]' : 'text-[10px]'}
            `}>
              {card.name}
            </div>

            {card.type === 'action' && (
              <div className={`text-game-text-light leading-tight mt-0.5 font-semibold
                ${size === 'sm' ? 'text-[4px]' : size === 'md' ? 'text-[6.5px]' : 'text-[8px]'}
              `}>
                {getActionDescription(card)}
              </div>
            )}

            {card.type === 'rent' && card.rentColors && (
              <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                {card.rentColors.slice(0, 4).map(color => (
                  <div
                    key={color}
                    className={`rounded-full border-2 border-white ${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`}
                    style={{ backgroundColor: getColorHex(color) }}
                    title={COLOR_DISPLAY_NAMES[color]}
                  />
                ))}
                {card.rentColors.length > 4 && (
                  <span className="text-[6px] text-game-text-light font-bold">+{card.rentColors.length - 4}</span>
                )}
              </div>
            )}

            {card.type === 'wild_property' && card.colors && (
              <div className="flex gap-1 mt-1">
                {card.colors.map(color => (
                  <div
                    key={color}
                    className={`rounded border-2 border-white ${size === 'sm' ? 'w-3 h-2' : 'w-4 h-2.5'}`}
                    style={{ backgroundColor: getColorHex(color) }}
                    title={COLOR_DISPLAY_NAMES[color]}
                  />
                ))}
              </div>
            )}

            {card.type === 'wild_multicolor' && (
              <div className={`font-display text-game-text mt-0.5
                ${size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[10px]' : 'text-sm'}
              `}>
                WILD
              </div>
            )}
          </div>

          {/* Value badge — bottom-right, colored pill */}
          {showValue && card.value > 0 && (
            <div className={`absolute bottom-1 right-1 bg-game-text/10 rounded-full font-bold text-game-text/60 flex items-center justify-center
              ${size === 'sm' ? 'text-[5px] w-4 h-4' : size === 'md' ? 'text-[7px] w-5 h-5' : 'text-[9px] w-6 h-6'}
            `}>
              ${card.value}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

function getColorHex(color: PropertyColor): string {
  const map: Record<PropertyColor, string> = {
    red: '#F44336',
    blue: '#1E88E5',
    green: '#66BB6A',
    yellow: '#FFEE58',
    orange: '#FF7043',
    purple: '#AB47BC',
    brown: '#8B4513',
    teal: '#26A69A',
    pink: '#EC407A',
    sky: '#29B6F6',
    railroad: '#424242',
    utility: '#78909C',
  }
  return map[color] || '#999'
}

export { getColorHex }
