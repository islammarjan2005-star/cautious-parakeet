import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import Card from './Card'
import { Card as CardType, PropertyColor, COLOR_DISPLAY_NAMES } from '../types/game'
import { canPlayCard, getAvailableColors } from '../utils/helpers'
import { getColorHex } from './Card'
import { useState } from 'react'
import { Landmark, MapPin, Play } from 'lucide-react'

interface PlayerHandProps {
  onCardAction: (card: CardType, action: 'bank' | 'property' | 'play', color?: PropertyColor) => void
}

export default function PlayerHand({ onCardAction }: PlayerHandProps) {
  const { players, currentPlayerIndex, actionsPlayedThisTurn, phase, selectedCard, setSelectedCard } = useGameStore()
  const player = players[currentPlayerIndex]
  const [showColorPicker, setShowColorPicker] = useState<CardType | null>(null)

  if (!player) return null

  const isActionPhase = phase === 'action'

  const handleCardClick = (card: CardType) => {
    if (!isActionPhase) return
    if (actionsPlayedThisTurn >= 3) return

    if (selectedCard?.id === card.id) {
      setSelectedCard(null)
      setShowColorPicker(null)
      return
    }

    setSelectedCard(card)
    setShowColorPicker(null)
  }

  const handleAction = (action: 'bank' | 'property' | 'play') => {
    if (!selectedCard) return

    if (action === 'property') {
      const colors = getAvailableColors(selectedCard)
      if (colors.length === 1) {
        onCardAction(selectedCard, 'property', colors[0])
        setSelectedCard(null)
      } else if (colors.length > 1) {
        setShowColorPicker(selectedCard)
      }
      return
    }

    onCardAction(selectedCard, action)
    setSelectedCard(null)
    setShowColorPicker(null)
  }

  const handleColorSelect = (color: PropertyColor) => {
    if (!showColorPicker) return
    onCardAction(showColorPicker, 'property', color)
    setSelectedCard(null)
    setShowColorPicker(null)
  }

  const canPlayAsProperty = (card: CardType) => {
    return card.type === 'property' || card.type === 'wild_property' || card.type === 'wild_multicolor'
  }

  const canPlayAsAction = (card: CardType) => {
    return card.type === 'action' || card.type === 'rent'
  }

  const fanAngle = Math.min(3, 30 / player.hand.length)
  const fanOffset = Math.min(40, 300 / player.hand.length)

  return (
    <div className="relative">
      {/* Action buttons when card selected */}
      <AnimatePresence>
        {selectedCard && isActionPhase && (
          <motion.div
            className="absolute -top-20 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
          >
            <div className="flex gap-2 justify-center items-center">
              <motion.button
                className="px-4 py-2 bg-[#66BB6A] text-white text-xs font-extrabold rounded-btn flex items-center gap-1.5 uppercase tracking-wide"
                style={{ boxShadow: '0 4px 0 #2E7D32' }}
                onClick={() => handleAction('bank')}
                whileTap={{ scale: 0.92, y: 2 }}
              >
                <Landmark size={14} />
                Bank ${selectedCard.value}M
              </motion.button>

              {canPlayAsProperty(selectedCard) && (
                <motion.button
                  className="px-4 py-2 bg-[#29B6F6] text-white text-xs font-extrabold rounded-btn flex items-center gap-1.5 uppercase tracking-wide"
                  style={{ boxShadow: '0 4px 0 #0288D1' }}
                  onClick={() => handleAction('property')}
                  whileTap={{ scale: 0.92, y: 2 }}
                >
                  <MapPin size={14} />
                  Property
                </motion.button>
              )}

              {canPlayAsAction(selectedCard) && canPlayCard(selectedCard, player, actionsPlayedThisTurn) && (
                <motion.button
                  className="btn-action px-6 py-3 text-white text-sm font-extrabold rounded-btn flex items-center gap-2 uppercase tracking-wide"
                  style={{ background: '#D32F2F', boxShadow: '0 4px 0 #9A0007', fontSize: '1rem' }}
                  onClick={() => handleAction('play')}
                  whileTap={{ scale: 0.92, y: 2 }}
                >
                  <Play size={20} />
                  PLAY
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color picker */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            className="absolute -top-28 left-1/2 -translate-x-1/2 chrome-raised rounded-2xl p-4 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
          >
            <p className="text-xs text-white font-bold mb-2 text-center">Choose color:</p>
            <div className="flex gap-2 flex-wrap justify-center max-w-[220px]">
              {getAvailableColors(showColorPicker).map(color => (
                <motion.button
                  key={color}
                  className="w-9 h-9 rounded-full border-3 border-white flex items-center justify-center text-[7px] font-extrabold text-white"
                  style={{
                    backgroundColor: getColorHex(color),
                    boxShadow: `0 3px 0 ${getColorHex(color)}80`,
                  }}
                  onClick={() => handleColorSelect(color)}
                  whileTap={{ scale: 0.85 }}
                  title={COLOR_DISPLAY_NAMES[color]}
                >
                  {color.slice(0, 2).toUpperCase()}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand of cards */}
      <div className="flex justify-center items-end py-2 px-4 min-h-[150px]">
        <AnimatePresence>
          {player.hand.map((card, i) => {
            const mid = (player.hand.length - 1) / 2
            const offset = i - mid
            const rotation = offset * fanAngle
            const x = offset * fanOffset

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 80 }}
                animate={{
                  opacity: 1,
                  y: selectedCard?.id === card.id ? -16 : 0,
                  rotate: rotation,
                  x,
                }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ zIndex: selectedCard?.id === card.id ? 50 : i, marginLeft: i > 0 ? '-16px' : '0' }}
              >
                <Card
                  card={card}
                  size="md"
                  onClick={() => handleCardClick(card)}
                  isSelected={selectedCard?.id === card.id}
                  isPlayable={isActionPhase && actionsPlayedThisTurn < 3}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
