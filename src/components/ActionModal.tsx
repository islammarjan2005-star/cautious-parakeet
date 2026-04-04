import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Card as CardType, PropertyColor, Player } from '../types/game'
import { getAvailableColors, isSetComplete, getAllPropertyCards } from '../utils/helpers'
import { getColorHex } from './Card'
import { X, Target, ArrowRightLeft, Zap } from 'lucide-react'

interface ActionModalProps {
  card: CardType
  onClose: () => void
  onConfirm: (targetPlayerId?: string, extraData?: any) => void
}

export default function ActionModal({ card, onClose, onConfirm }: ActionModalProps) {
  const { players, currentPlayerIndex } = useGameStore()
  const currentPlayer = players[currentPlayerIndex]
  const opponents = players.filter((_, i) => i !== currentPlayerIndex)

  switch (card.actionType) {
    case 'debt_collector':
      return (
        <TargetPlayerModal
          title="Debt Collector"
          subtitle="Choose a player to charge $5M"
          icon={<Zap className="text-yellow-400" />}
          opponents={opponents}
          onClose={onClose}
          onSelect={(targetId) => onConfirm(targetId)}
        />
      )

    case 'sly_deal':
      return (
        <SlyDealModal
          opponents={opponents}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )

    case 'forced_deal':
      return (
        <ForcedDealModal
          currentPlayer={currentPlayer}
          opponents={opponents}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )

    case 'deal_breaker':
      return (
        <DealBreakerModal
          opponents={opponents}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )

    case 'house':
      return (
        <BuildingModal
          title="Place House"
          subtitle="Choose a complete property set"
          player={currentPlayer}
          filter={(set) => isSetComplete(set) && !set.hasHouse}
          onClose={onClose}
          onSelect={(color) => onConfirm(undefined, { targetColor: color })}
        />
      )

    case 'hotel':
      return (
        <BuildingModal
          title="Place Hotel"
          subtitle="Choose a set with a House"
          player={currentPlayer}
          filter={(set) => isSetComplete(set) && set.hasHouse && !set.hasHotel}
          onClose={onClose}
          onSelect={(color) => onConfirm(undefined, { targetColor: color })}
        />
      )

    default:
      onConfirm()
      return null
  }
}

// === Rent Modal ===
export function RentModal({
  card, onClose, onConfirm,
}: {
  card: CardType
  onClose: () => void
  onConfirm: (color: PropertyColor, doubleCardId?: string) => void
}) {
  const { players, currentPlayerIndex } = useGameStore()
  const player = players[currentPlayerIndex]
  const [selectedColor, setSelectedColor] = useState<PropertyColor | null>(null)

  // Find available colors from rent card that match player's properties
  const availableColors = (card.rentColors || []).filter(color =>
    player.properties.some(ps => ps.color === color && ps.cards.length > 0)
  )

  // Check for Double The Rent in hand
  const doubleRentCard = player.hand.find(c => c.actionType === 'double_the_rent' && c.id !== card.id)

  const [useDouble, setUseDouble] = useState(false)

  if (availableColors.length === 0) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-4">
          <p className="text-white/70">You don't have any matching properties to charge rent for.</p>
          <button className="btn-secondary mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        🏠 Charge Rent
      </h3>
      <p className="text-xs text-white/60 mb-4">Choose which property color to charge rent for</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {availableColors.map(color => {
          const set = player.properties.find(ps => ps.color === color)
          if (!set) return null
          return (
            <motion.button
              key={color}
              className={`rounded-xl p-3 border-2 transition-all text-center
                ${selectedColor === color
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-white/10 hover:border-white/30 bg-white/5'
                }
              `}
              onClick={() => setSelectedColor(color)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="w-6 h-6 rounded-full mx-auto mb-1 border-2 border-white/30"
                style={{ backgroundColor: getColorHex(color) }}
              />
              <div className="text-[10px] text-white font-bold capitalize">{color}</div>
              <div className="text-[9px] text-white/50">{set.cards.length} cards</div>
            </motion.button>
          )
        })}
      </div>

      {doubleRentCard && (
        <label className="flex items-center gap-2 mb-4 cursor-pointer glass rounded-lg p-2">
          <input
            type="checkbox"
            checked={useDouble}
            onChange={e => setUseDouble(e.target.checked)}
            className="accent-yellow-400"
          />
          <span className="text-xs text-white">⚡ Double The Rent (uses extra action)</span>
        </label>
      )}

      <div className="flex gap-2 justify-end">
        <button className="btn-secondary text-sm" onClick={onClose}>Cancel</button>
        <button
          className="btn-primary text-sm"
          disabled={!selectedColor}
          onClick={() => selectedColor && onConfirm(selectedColor, useDouble ? doubleRentCard?.id : undefined)}
        >
          Charge Rent
        </button>
      </div>
    </ModalWrapper>
  )
}

// === Target Player Modal ===
function TargetPlayerModal({
  title, subtitle, icon, opponents, onClose, onSelect,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  opponents: Player[]
  onClose: () => void
  onSelect: (playerId: string) => void
}) {
  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        {icon} {title}
      </h3>
      <p className="text-xs text-white/60 mb-4">{subtitle}</p>

      <div className="space-y-2">
        {opponents.map(opp => (
          <motion.button
            key={opp.id}
            className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/15 transition-colors"
            onClick={() => onSelect(opp.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">{opp.avatar}</span>
            <div className="text-left">
              <div className="text-sm font-bold text-white">{opp.name}</div>
              <div className="text-[10px] text-white/50">
                {opp.hand.length} cards • ${opp.bank.reduce((s, c) => s + c.value, 0)}M in bank
              </div>
            </div>
            <Target size={16} className="ml-auto text-red-400" />
          </motion.button>
        ))}
      </div>
    </ModalWrapper>
  )
}

// === Sly Deal Modal ===
function SlyDealModal({
  opponents, onClose, onConfirm,
}: {
  opponents: Player[]
  onClose: () => void
  onConfirm: (targetPlayerId: string, extraData: any) => void
}) {
  const [step, setStep] = useState<'player' | 'card'>('player')
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null)

  // Filter opponents who have non-complete sets
  const validOpponents = opponents.filter(opp =>
    opp.properties.some(ps => !isSetComplete(ps) && ps.cards.length > 0)
  )

  if (validOpponents.length === 0) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-4">
          <p className="text-white/70">No opponents have stealable properties (only incomplete sets can be stolen from).</p>
          <button className="btn-secondary mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  if (step === 'player' || !targetPlayer) {
    return (
      <TargetPlayerModal
        title="Sly Deal"
        subtitle="Choose a player to steal a property from"
        icon={<span>🤫</span>}
        opponents={validOpponents}
        onClose={onClose}
        onSelect={(id) => {
          setTargetPlayer(opponents.find(p => p.id === id)!)
          setStep('card')
        }}
      />
    )
  }

  const stealableSets = targetPlayer.properties.filter(ps => !isSetComplete(ps))

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-lg font-bold text-white mb-1">🤫 Steal a Property</h3>
      <p className="text-xs text-white/60 mb-4">Choose a property from {targetPlayer.name}</p>

      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
        {stealableSets.map(set =>
          set.cards.map(card => (
            <motion.button
              key={card.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg glass hover:bg-white/15 transition-colors"
              onClick={() => onConfirm(targetPlayer.id, { targetCardId: card.id })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getColorHex(set.color) }}
              />
              <span className="text-xs text-white font-semibold">{card.name}</span>
            </motion.button>
          ))
        )}
      </div>

      <button className="btn-secondary text-sm mt-3 w-full" onClick={() => setStep('player')}>
        ← Back
      </button>
    </ModalWrapper>
  )
}

// === Forced Deal Modal ===
function ForcedDealModal({
  currentPlayer, opponents, onClose, onConfirm,
}: {
  currentPlayer: Player
  opponents: Player[]
  onClose: () => void
  onConfirm: (targetPlayerId: string, extraData: any) => void
}) {
  const [step, setStep] = useState<'my-card' | 'their-player' | 'their-card'>('my-card')
  const [myCardId, setMyCardId] = useState<string | null>(null)
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null)

  const myStealableCards = currentPlayer.properties.flatMap(ps =>
    !isSetComplete(ps) ? ps.cards.map(c => ({ card: c, color: ps.color })) : []
  )

  if (step === 'my-card') {
    return (
      <ModalWrapper onClose={onClose}>
        <h3 className="text-lg font-bold text-white mb-1">🔄 Forced Deal</h3>
        <p className="text-xs text-white/60 mb-4">Choose YOUR property to give away</p>

        {myStealableCards.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-white/70 text-sm">You have no properties to trade (only incomplete sets).</p>
            <button className="btn-secondary mt-4" onClick={onClose}>Close</button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
            {myStealableCards.map(({ card, color }) => (
              <motion.button
                key={card.id}
                className="w-full flex items-center gap-3 p-2 rounded-lg glass hover:bg-white/15"
                onClick={() => { setMyCardId(card.id); setStep('their-player') }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getColorHex(color) }} />
                <span className="text-xs text-white font-semibold">{card.name}</span>
              </motion.button>
            ))}
          </div>
        )}
      </ModalWrapper>
    )
  }

  const validOpponents = opponents.filter(opp =>
    opp.properties.some(ps => !isSetComplete(ps) && ps.cards.length > 0)
  )

  if (step === 'their-player' || !targetPlayer) {
    return (
      <TargetPlayerModal
        title="Forced Deal"
        subtitle="Choose a player to swap with"
        icon={<ArrowRightLeft className="text-blue-400" />}
        opponents={validOpponents}
        onClose={onClose}
        onSelect={(id) => {
          setTargetPlayer(opponents.find(p => p.id === id)!)
          setStep('their-card')
        }}
      />
    )
  }

  const theirStealableSets = targetPlayer.properties.filter(ps => !isSetComplete(ps))

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-lg font-bold text-white mb-1">🔄 Choose their property</h3>
      <p className="text-xs text-white/60 mb-4">Take a property from {targetPlayer.name}</p>

      <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
        {theirStealableSets.map(set =>
          set.cards.map(card => (
            <motion.button
              key={card.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg glass hover:bg-white/15"
              onClick={() => onConfirm(targetPlayer.id, { targetCardId: card.id, sourceCardId: myCardId })}
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getColorHex(set.color) }} />
              <span className="text-xs text-white font-semibold">{card.name}</span>
            </motion.button>
          ))
        )}
      </div>

      <button className="btn-secondary text-sm mt-3 w-full" onClick={() => setStep('my-card')}>
        ← Start Over
      </button>
    </ModalWrapper>
  )
}

// === Deal Breaker Modal ===
function DealBreakerModal({
  opponents, onClose, onConfirm,
}: {
  opponents: Player[]
  onClose: () => void
  onConfirm: (targetPlayerId: string, extraData: any) => void
}) {
  const completeSets = opponents.flatMap(opp =>
    opp.properties
      .filter(ps => isSetComplete(ps))
      .map(ps => ({ player: opp, set: ps }))
  )

  if (completeSets.length === 0) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-4">
          <p className="text-white/70">No opponents have complete sets to steal.</p>
          <button className="btn-secondary mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-lg font-bold text-white mb-1">💥 Deal Breaker</h3>
      <p className="text-xs text-white/60 mb-4">Steal a complete property set!</p>

      <div className="space-y-2">
        {completeSets.map(({ player, set }) => (
          <motion.button
            key={`${player.id}-${set.color}`}
            className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/15 transition-colors"
            onClick={() => onConfirm(player.id, { targetColor: set.color })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-8 h-8 rounded-lg border-2 border-yellow-400/50"
              style={{ backgroundColor: getColorHex(set.color) }}
            />
            <div className="text-left">
              <div className="text-xs font-bold text-white capitalize">{set.color} Set ({set.cards.length} cards)</div>
              <div className="text-[10px] text-white/50">from {player.name}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </ModalWrapper>
  )
}

// === Building (House/Hotel) Modal ===
function BuildingModal({
  title, subtitle, player, filter, onClose, onSelect,
}: {
  title: string
  subtitle: string
  player: Player
  filter: (set: any) => boolean
  onClose: () => void
  onSelect: (color: PropertyColor) => void
}) {
  const validSets = player.properties.filter(filter)

  if (validSets.length === 0) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-4">
          <p className="text-white/70">No eligible property sets.</p>
          <button className="btn-secondary mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-white/60 mb-4">{subtitle}</p>

      <div className="space-y-2">
        {validSets.map(set => (
          <motion.button
            key={set.color}
            className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/15"
            onClick={() => onSelect(set.color)}
            whileHover={{ scale: 1.02 }}
          >
            <div
              className="w-8 h-8 rounded-lg border-2 border-white/20"
              style={{ backgroundColor: getColorHex(set.color) }}
            />
            <div className="text-left">
              <div className="text-xs font-bold text-white capitalize">{set.color}</div>
              <div className="text-[10px] text-white/50">{set.cards.length} properties</div>
            </div>
          </motion.button>
        ))}
      </div>
    </ModalWrapper>
  )
}

// === Modal Wrapper ===
function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-dark rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto scrollbar-thin relative"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  )
}

export { ModalWrapper }
