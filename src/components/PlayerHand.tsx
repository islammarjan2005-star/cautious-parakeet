import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import Card from './Card'
import { Card as CardType, PropertyColor } from '../types/game'
import { canPlayCard, getAvailableColors } from '../utils/helpers'
import { useState } from 'react'

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
            className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-2 z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <motion.button
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg shadow-lg whitespace-nowrap"
              onClick={() => handleAction('bank')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              💰 Bank (${selectedCard.value}M)
            </motion.button>

            {canPlayAsProperty(selectedCard) && (
              <motion.button
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg whitespace-nowrap"
                onClick={() => handleAction('property')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🏠 Property
              </motion.button>
            )}

            {canPlayAsAction(selectedCard) && canPlayCard(selectedCard, player, actionsPlayedThisTurn) && (
              <motion.button
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg whitespace-nowrap"
                onClick={() => handleAction('play')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⚡ Play
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color picker */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            className="absolute -top-28 left-1/2 -translate-x-1/2 glass-dark rounded-xl p-3 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
          >
            <p className="text-[10px] text-gray-300 mb-2 text-center">Choose color:</p>
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
              {getAvailableColors(showColorPicker).map(color => (
                <motion.button
                  key={color}
                  className="w-8 h-8 rounded-lg border-2 border-white/30 hover:border-yellow-400 transition-colors flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ backgroundColor: getColorHexForButton(color) }}
                  onClick={() => handleColorSelect(color)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  title={color}
                >
                  {color.slice(0, 2).toUpperCase()}
                </motion.button>
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
                initial={{ opacity: 0, y: 100, rotate: 0 }}
                animate={{
                  opacity: 1,
                  y: selectedCard?.id === card.id ? -12 : 0,
                  rotate: rotation,
                  x,
                }}
                exit={{ opacity: 0, y: 100, scale: 0.5 }}
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

function getColorHexForButton(color: PropertyColor): string {
  const map: Record<PropertyColor, string> = {
    red: '#E53935', blue: '#1E88E5', green: '#43A047', yellow: '#d4ac0d',
    orange: '#FB8C00', purple: '#8E24AA', brown: '#6D4C41', teal: '#00897B',
    pink: '#D81B60', sky: '#039BE5', railroad: '#424242', utility: '#66BB6A',
  }
  return map[color] || '#999'
}
