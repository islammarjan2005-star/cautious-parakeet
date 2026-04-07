import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Card as CardType, PropertyColor, Player, PLAYER_COLORS } from '../types/game'
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
          emoji={'\u{1F4B0}'}
          gradient="linear-gradient(135deg, #FFD600, #FF9800)"
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
          emoji={'\u{1F3E0}'}
          gradient="linear-gradient(135deg, #66BB6A, #43A047)"
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
          emoji={'\u{1F3E8}'}
          gradient="linear-gradient(135deg, #FF7043, #F4511E)"
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
        <div className="text-center py-6">
          <div className="text-3xl mb-2">{'\u{1F3E0}'}</div>
          <p className="text-game-text-light text-sm font-semibold">No matching properties to charge rent for.</p>
          <button className="btn-secondary text-sm mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg, #FF7043, #FF5722)' }}>
          {'\u{1F3E0}'}
        </div>
        <h3 className="text-lg font-extrabold text-game-text">Charge Rent</h3>
      </div>
      <p className="text-xs text-game-text-light font-semibold mb-4">Choose which property color to charge rent for</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {availableColors.map(color => {
          const set = player.properties.find(ps => ps.color === color)
          if (!set) return null
          return (
            <button
              key={color}
              className={`rounded-xl p-3 border-3 transition-all text-center
                ${selectedColor === color
                  ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                  : 'border-gray-200 bg-white hover:border-accent/40'
                }
              `}
              onClick={() => setSelectedColor(color)}
            >
              <div
                className="w-7 h-7 rounded-full mx-auto mb-1.5 border-2 border-white"
                style={{ backgroundColor: getColorHex(color), boxShadow: `0 2px 0 ${getColorHex(color)}60` }}
              />
              <div className="text-[10px] text-game-text font-bold capitalize">{color}</div>
              <div className="text-[8px] text-game-text-light font-semibold">{set.cards.length} cards</div>
            </button>
          )
        })}
      </div>

      {doubleRentCard && (
        <label className="flex items-center gap-2 mb-4 cursor-pointer bg-accent/10 border-2 border-accent/30 rounded-xl p-2.5">
          <input
            type="checkbox"
            checked={useDouble}
            onChange={e => setUseDouble(e.target.checked)}
            className="accent-[#FFD600] w-4 h-4"
          />
          <span className="text-lg">{'\u26A1'}</span>
          <span className="text-xs text-game-text font-bold">Double The Rent (uses extra action)</span>
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
  title, subtitle, emoji, gradient, icon: Icon, opponents, allPlayers, onClose, onSelect,
}: {
  title: string
  subtitle: string
  emoji: string
  gradient: string
  icon: LucideIcon
  opponents: Player[]
  allPlayers: Player[]
  onClose: () => void
  onSelect: (playerId: string) => void
}) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: gradient }}>
          {emoji}
        </div>
        <h3 className="text-lg font-extrabold text-game-text">{title}</h3>
      </div>
      <p className="text-xs text-game-text-light font-semibold mb-4">{subtitle}</p>

      <div className="space-y-2">
        {opponents.map(opp => {
          const idx = allPlayers.indexOf(opp)
          const color = PLAYER_COLORS[idx % PLAYER_COLORS.length]
          return (
            <motion.button
              key={opp.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-accent transition-colors"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.06)' }}
              onClick={() => onSelect(opp.id)}
              whileTap={{ scale: 0.97, y: 2 }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base border-2"
                style={{ backgroundColor: `${color}20`, borderColor: color }}
              >
                {opp.avatar}
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-bold text-game-text">{opp.name}</div>
                <div className="text-[10px] text-game-text-light font-semibold">
                  {opp.hand.length} cards, ${opp.bank.reduce((s, c) => s + c.value, 0)}M in bank
                </div>
              </div>
              <Target size={16} className="text-game-text-light" />
            </motion.button>
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
        <div className="text-center py-6">
          <div className="text-3xl mb-2">{'\u{1F60F}'}</div>
          <p className="text-game-text-light text-sm font-semibold">No stealable properties available.</p>
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
        emoji={'\u{1F60F}'}
        gradient="linear-gradient(135deg, #A18CD1, #FBC2EB)"
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
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg, #A18CD1, #FBC2EB)' }}>
          {'\u{1F60F}'}
        </div>
        <h3 className="text-lg font-extrabold text-game-text">Steal a Property</h3>
      </div>
      <p className="text-xs text-game-text-light font-semibold mb-4">Choose a property from {targetPlayer.name}</p>

      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
        {stealableSets.map(set =>
          set.cards.map(card => (
            <button
              key={card.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-accent transition-colors"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.06)' }}
              onClick={() => onConfirm(targetPlayer.id, { targetCardId: card.id })}
            >
              <div className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: getColorHex(set.color), boxShadow: `0 2px 0 ${getColorHex(set.color)}60` }} />
              <span className="text-sm text-game-text font-bold">{card.name}</span>
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
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)' }}>
            {'\u{1F500}'}
          </div>
          <h3 className="text-lg font-extrabold text-game-text">Forced Deal</h3>
        </div>
        <p className="text-xs text-game-text-light font-semibold mb-4">Choose YOUR property to give away</p>

        {myStealableCards.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-game-text-light text-sm font-semibold">No properties to trade.</p>
            <button className="btn-secondary text-sm mt-4" onClick={onClose}>Close</button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
            {myStealableCards.map(({ card, color }) => (
              <button
                key={card.id}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-accent transition-colors"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.06)' }}
                onClick={() => { setMyCardId(card.id); setStep('their-player') }}
              >
                <div className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: getColorHex(color), boxShadow: `0 2px 0 ${getColorHex(color)}60` }} />
                <span className="text-sm text-game-text font-bold">{card.name}</span>
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
        emoji={'\u{1F500}'}
        gradient="linear-gradient(135deg, #667EEA, #764BA2)"
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
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)' }}>
          {'\u{1F500}'}
        </div>
        <h3 className="text-lg font-extrabold text-game-text">Choose their property</h3>
      </div>
      <p className="text-xs text-game-text-light font-semibold mb-4">Take a property from {targetPlayer.name}</p>

      <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
        {theirStealableSets.map(set =>
          set.cards.map(card => (
            <button
              key={card.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-accent transition-colors"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.06)' }}
              onClick={() => onConfirm(targetPlayer.id, { targetCardId: card.id, sourceCardId: myCardId })}
            >
              <div className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: getColorHex(set.color), boxShadow: `0 2px 0 ${getColorHex(set.color)}60` }} />
              <span className="text-sm text-game-text font-bold">{card.name}</span>
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
        <div className="text-center py-6">
          <div className="text-3xl mb-2">{'\u{1F4A5}'}</div>
          <p className="text-game-text-light text-sm font-semibold">No complete sets to steal.</p>
          <button className="btn-secondary text-sm mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}>
          {'\u{1F4A5}'}
        </div>
        <h3 className="text-lg font-extrabold text-game-text">Deal Breaker</h3>
      </div>
      <p className="text-xs text-game-text-light font-semibold mb-4">Steal a complete property set</p>

      <div className="space-y-2">
        {completeSets.map(({ player, set }) => (
          <motion.button
            key={`${player.id}-${set.color}`}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-danger transition-colors"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.06)' }}
            onClick={() => onConfirm(player.id, { targetColor: set.color })}
            whileTap={{ scale: 0.97, y: 2 }}
          >
            <div
              className="w-9 h-9 rounded-xl border-2 border-white"
              style={{ backgroundColor: getColorHex(set.color), boxShadow: `0 3px 0 ${getColorHex(set.color)}60` }}
            />
            <div className="text-left">
              <div className="text-sm font-bold text-game-text capitalize">{set.color} Set ({set.cards.length} cards)</div>
              <div className="text-[10px] text-game-text-light font-semibold">from {player.name}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </ModalWrapper>
  )
}

// === Building Modal ===
function BuildingModal({
  title, subtitle, emoji, gradient, player, filter, onClose, onSelect,
}: {
  title: string
  subtitle: string
  emoji: string
  gradient: string
  player: Player
  filter: (set: any) => boolean
  onClose: () => void
  onSelect: (color: PropertyColor) => void
}) {
  const validSets = player.properties.filter(filter)

  if (validSets.length === 0) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">{emoji}</div>
          <p className="text-game-text-light text-sm font-semibold">No eligible property sets.</p>
          <button className="btn-secondary text-sm mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: gradient }}>
          {emoji}
        </div>
        <h3 className="text-lg font-extrabold text-game-text">{title}</h3>
      </div>
      <p className="text-xs text-game-text-light font-semibold mb-4">{subtitle}</p>

      <div className="space-y-2">
        {validSets.map(set => (
          <motion.button
            key={set.color}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-accent transition-colors"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.06)' }}
            onClick={() => onSelect(set.color)}
            whileTap={{ scale: 0.97, y: 2 }}
          >
            <div
              className="w-9 h-9 rounded-xl border-2 border-white"
              style={{ backgroundColor: getColorHex(set.color), boxShadow: `0 3px 0 ${getColorHex(set.color)}60` }}
            />
            <div className="text-left">
              <div className="text-sm font-bold text-game-text capitalize">{set.color}</div>
              <div className="text-[10px] text-game-text-light font-semibold">{set.cards.length} properties</div>
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="chrome-raised rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto scrollbar-thin relative"
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-danger/20 text-danger flex items-center justify-center hover:bg-danger/30 transition-colors"
          onClick={onClose}
        >
          <X size={14} strokeWidth={3} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  )
}

export { ModalWrapper }
