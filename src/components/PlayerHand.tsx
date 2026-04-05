import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import Card from './Card'
import { Card as CardType, PropertyColor } from '../types/game'
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
            className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-50"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <button
              className="px-3 py-1.5 bg-[#3a5a3a] hover:bg-[#4a6a4a] text-[#c0d8c0] text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-colors"
              onClick={() => handleAction('bank')}
            >
              <Landmark size={11} />
              Bank (${selectedCard.value}M)
            </button>

            {canPlayAsProperty(selectedCard) && (
              <button
                className="px-3 py-1.5 bg-[#3a4a5a] hover:bg-[#4a5a6a] text-[#b0c8d8] text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-colors"
                onClick={() => handleAction('property')}
              >
                <MapPin size={11} />
                Property
              </button>
            )}

            {canPlayAsAction(selectedCard) && canPlayCard(selectedCard, player, actionsPlayedThisTurn) && (
              <button
                className="px-3 py-1.5 bg-[#5a4a3a] hover:bg-[#6a5a4a] text-[#d8c8b0] text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-colors"
                onClick={() => handleAction('play')}
              >
                <Play size={11} />
                Play
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color picker */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            className="absolute -top-24 left-1/2 -translate-x-1/2 panel-raised rounded-lg p-3 z-50"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <p className="text-[10px] text-text-muted mb-2 text-center">Choose color:</p>
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
              {getAvailableColors(showColorPicker).map(color => (
                <button
                  key={color}
                  className="w-7 h-7 rounded-md border border-white/10 hover:border-gold/50 transition-colors flex items-center justify-center text-[7px] font-medium text-white/80"
                  style={{ backgroundColor: getColorHex(color) }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                >
                  {color.slice(0, 2).toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand of cards */}
      <div className="flex justify-center items-end py-2 px-4 min-h-[140px]">
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
                  y: selectedCard?.id === card.id ? -8 : 0,
                  rotate: rotation,
                  x,
                }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
