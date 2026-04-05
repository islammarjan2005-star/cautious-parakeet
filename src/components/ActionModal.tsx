import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Card as CardType, PropertyColor, Player, getPlayerInitials, PLAYER_COLORS } from '../types/game'
import { getAvailableColors, isSetComplete } from '../utils/helpers'
import { getColorHex } from './Card'
import {
  X, Target, ArrowLeftRight, HandCoins, Eye, Gavel,
  Receipt, Home, Building, ChevronsUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
          icon={HandCoins}
          opponents={opponents}
          allPlayers={players}
          onClose={onClose}
          onSelect={(targetId) => onConfirm(targetId)}
        />
      )

    case 'sly_deal':
      return (
        <SlyDealModal
          opponents={opponents}
          allPlayers={players}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )

    case 'forced_deal':
      return (
        <ForcedDealModal
          currentPlayer={currentPlayer}
          opponents={opponents}
          allPlayers={players}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )

    case 'deal_breaker':
      return (
        <DealBreakerModal
          opponents={opponents}
          allPlayers={players}
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

  const availableColors = (card.rentColors || []).filter(color =>
    player.properties.some(ps => ps.color === color && ps.cards.length > 0)
  )

  const doubleRentCard = player.hand.find(c => c.actionType === 'double_the_rent' && c.id !== card.id)
  const [useDouble, setUseDouble] = useState(false)

  if (availableColors.length === 0) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-4">
          <p className="text-text-muted text-sm">No matching properties to charge rent for.</p>
          <button className="btn-secondary text-sm mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-base font-semibold text-text-primary mb-1 flex items-center gap-2">
        <Receipt size={16} className="text-gold" /> Charge Rent
      </h3>
      <p className="text-[11px] text-text-muted mb-4">Choose which property color to charge rent for</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {availableColors.map(color => {
          const set = player.properties.find(ps => ps.color === color)
          if (!set) return null
          return (
            <button
              key={color}
              className={`rounded-lg p-2.5 border transition-all text-center
                ${selectedColor === color
                  ? 'border-gold/50 bg-gold/[0.06]'
                  : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                }
              `}
              onClick={() => setSelectedColor(color)}
            >
              <div
                className="w-5 h-5 rounded-full mx-auto mb-1"
                style={{ backgroundColor: getColorHex(color) }}
              />
              <div className="text-[10px] text-text-primary font-medium capitalize">{color}</div>
              <div className="text-[8px] text-text-muted">{set.cards.length} cards</div>
            </button>
          )
        })}
      </div>

      {doubleRentCard && (
        <label className="flex items-center gap-2 mb-4 cursor-pointer panel rounded-lg p-2">
          <input
            type="checkbox"
            checked={useDouble}
            onChange={e => setUseDouble(e.target.checked)}
            className="accent-gold"
          />
          <ChevronsUp size={12} className="text-gold" />
          <span className="text-[11px] text-text-primary">Double The Rent (uses extra action)</span>
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
  title, subtitle, icon: Icon, opponents, allPlayers, onClose, onSelect,
}: {
  title: string
  subtitle: string
  icon: LucideIcon
  opponents: Player[]
  allPlayers: Player[]
  onClose: () => void
  onSelect: (playerId: string) => void
}) {
  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-base font-semibold text-text-primary mb-1 flex items-center gap-2">
        <Icon size={16} className="text-gold" /> {title}
      </h3>
      <p className="text-[11px] text-text-muted mb-4">{subtitle}</p>

      <div className="space-y-1.5">
        {opponents.map(opp => {
          const idx = allPlayers.indexOf(opp)
          const color = PLAYER_COLORS[idx % PLAYER_COLORS.length]
          return (
            <button
              key={opp.id}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg panel hover:bg-white/[0.06] transition-colors"
              onClick={() => onSelect(opp.id)}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
                style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
              >
                {getPlayerInitials(opp.name)}
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-text-primary">{opp.name}</div>
                <div className="text-[9px] text-text-muted">
                  {opp.hand.length} cards, ${opp.bank.reduce((s, c) => s + c.value, 0)}M in bank
                </div>
              </div>
              <Target size={13} className="ml-auto text-text-muted" />
            </button>
          )
        })}
      </div>
    </ModalWrapper>
  )
}

// === Sly Deal Modal ===
function SlyDealModal({
  opponents, allPlayers, onClose, onConfirm,
}: {
  opponents: Player[]
  allPlayers: Player[]
  onClose: () => void
  onConfirm: (targetPlayerId: string, extraData: any) => void
}) {
  const [step, setStep] = useState<'player' | 'card'>('player')
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null)

  const validOpponents = opponents.filter(opp =>
    opp.properties.some(ps => !isSetComplete(ps) && ps.cards.length > 0)
  )

  if (validOpponents.length === 0) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-4">
          <p className="text-text-muted text-sm">No stealable properties available.</p>
          <button className="btn-secondary text-sm mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  if (step === 'player' || !targetPlayer) {
    return (
      <TargetPlayerModal
        title="Sly Deal"
        subtitle="Choose a player to steal a property from"
        icon={Eye}
        opponents={validOpponents}
        allPlayers={allPlayers}
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
      <h3 className="text-base font-semibold text-text-primary mb-1 flex items-center gap-2">
        <Eye size={16} className="text-gold" /> Steal a Property
      </h3>
      <p className="text-[11px] text-text-muted mb-4">Choose a property from {targetPlayer.name}</p>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
        {stealableSets.map(set =>
          set.cards.map(card => (
            <button
              key={card.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg panel hover:bg-white/[0.06] transition-colors"
              onClick={() => onConfirm(targetPlayer.id, { targetCardId: card.id })}
            >
              <div className="w-3 h-3 rounded" style={{ backgroundColor: getColorHex(set.color) }} />
              <span className="text-xs text-text-primary font-medium">{card.name}</span>
            </button>
          ))
        )}
      </div>

      <button className="btn-secondary text-sm mt-3 w-full" onClick={() => setStep('player')}>
        Back
      </button>
    </ModalWrapper>
  )
}

// === Forced Deal Modal ===
function ForcedDealModal({
  currentPlayer, opponents, allPlayers, onClose, onConfirm,
}: {
  currentPlayer: Player
  opponents: Player[]
  allPlayers: Player[]
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
        <h3 className="text-base font-semibold text-text-primary mb-1 flex items-center gap-2">
          <ArrowLeftRight size={16} className="text-gold" /> Forced Deal
        </h3>
        <p className="text-[11px] text-text-muted mb-4">Choose YOUR property to give away</p>

        {myStealableCards.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-text-muted text-sm">No properties to trade.</p>
            <button className="btn-secondary text-sm mt-4" onClick={onClose}>Close</button>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[250px] overflow-y-auto scrollbar-thin">
            {myStealableCards.map(({ card, color }) => (
              <button
                key={card.id}
                className="w-full flex items-center gap-3 p-2 rounded-lg panel hover:bg-white/[0.06] transition-colors"
                onClick={() => { setMyCardId(card.id); setStep('their-player') }}
              >
                <div className="w-3 h-3 rounded" style={{ backgroundColor: getColorHex(color) }} />
                <span className="text-xs text-text-primary font-medium">{card.name}</span>
              </button>
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
        icon={ArrowLeftRight}
        opponents={validOpponents}
        allPlayers={allPlayers}
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
      <h3 className="text-base font-semibold text-text-primary mb-1 flex items-center gap-2">
        <ArrowLeftRight size={16} className="text-gold" /> Choose their property
      </h3>
      <p className="text-[11px] text-text-muted mb-4">Take a property from {targetPlayer.name}</p>

      <div className="space-y-1.5 max-h-[250px] overflow-y-auto scrollbar-thin">
        {theirStealableSets.map(set =>
          set.cards.map(card => (
            <button
              key={card.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg panel hover:bg-white/[0.06] transition-colors"
              onClick={() => onConfirm(targetPlayer.id, { targetCardId: card.id, sourceCardId: myCardId })}
            >
              <div className="w-3 h-3 rounded" style={{ backgroundColor: getColorHex(set.color) }} />
              <span className="text-xs text-text-primary font-medium">{card.name}</span>
            </button>
          ))
        )}
      </div>

      <button className="btn-secondary text-sm mt-3 w-full" onClick={() => setStep('my-card')}>
        Start Over
      </button>
    </ModalWrapper>
  )
}

// === Deal Breaker Modal ===
function DealBreakerModal({
  opponents, allPlayers, onClose, onConfirm,
}: {
  opponents: Player[]
  allPlayers: Player[]
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
          <p className="text-text-muted text-sm">No complete sets to steal.</p>
          <button className="btn-secondary text-sm mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-base font-semibold text-text-primary mb-1 flex items-center gap-2">
        <Gavel size={16} className="text-gold" /> Deal Breaker
      </h3>
      <p className="text-[11px] text-text-muted mb-4">Steal a complete property set</p>

      <div className="space-y-1.5">
        {completeSets.map(({ player, set }) => (
          <button
            key={`${player.id}-${set.color}`}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg panel hover:bg-white/[0.06] transition-colors"
            onClick={() => onConfirm(player.id, { targetColor: set.color })}
          >
            <div
              className="w-7 h-7 rounded-md"
              style={{ backgroundColor: getColorHex(set.color) }}
            />
            <div className="text-left">
              <div className="text-xs font-medium text-text-primary capitalize">{set.color} Set ({set.cards.length} cards)</div>
              <div className="text-[9px] text-text-muted">from {player.name}</div>
            </div>
          </button>
        ))}
      </div>
    </ModalWrapper>
  )
}

// === Building Modal ===
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
          <p className="text-text-muted text-sm">No eligible property sets.</p>
          <button className="btn-secondary text-sm mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-base font-semibold text-text-primary mb-1 flex items-center gap-2">
        {title.includes('House') ? <Home size={16} className="text-gold" /> : <Building size={16} className="text-gold" />}
        {title}
      </h3>
      <p className="text-[11px] text-text-muted mb-4">{subtitle}</p>

      <div className="space-y-1.5">
        {validSets.map(set => (
          <button
            key={set.color}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg panel hover:bg-white/[0.06] transition-colors"
            onClick={() => onSelect(set.color)}
          >
            <div
              className="w-7 h-7 rounded-md"
              style={{ backgroundColor: getColorHex(set.color) }}
            />
            <div className="text-left">
              <div className="text-xs font-medium text-text-primary capitalize">{set.color}</div>
              <div className="text-[9px] text-text-muted">{set.cards.length} properties</div>
            </div>
          </button>
        ))}
      </div>
    </ModalWrapper>
  )
}

// === Modal Wrapper ===
function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="panel-raised rounded-xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto scrollbar-thin relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-text-muted hover:text-text-primary transition-colors"
          onClick={onClose}
        >
          <X size={16} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  )
}

export { ModalWrapper }
