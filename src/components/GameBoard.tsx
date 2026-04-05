import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Card as CardType, PropertyColor, PLAYER_COLORS, getPlayerInitials } from '../types/game'
import PlayerHand from './PlayerHand'
import PropertyArea from './PropertyArea'
import BankArea from './BankArea'
import OpponentArea from './OpponentArea'
import GameLog from './GameLog'
import ActionModal, { RentModal } from './ActionModal'
import PaymentModal from './PaymentModal'
import GameOverScreen from './GameOverScreen'
import Card from './Card'
import { countCompleteSets, getTotalValue } from '../utils/helpers'
import {
  Trophy, CreditCard, Landmark, Layers, SkipForward,
  ArrowDown, Hand,
} from 'lucide-react'

export default function GameBoard() {
  const store = useGameStore()
  const {
    players, currentPlayerIndex, phase, actionsPlayedThisTurn,
    drawPile, discardPile, pendingAction, winnerId, turnNumber,
    drawCards, endTurn, playCardToBank, playCardAsProperty,
    playActionCard, playRentCard, discardCard,
    selectedCard, setSelectedCard,
  } = store

  const [actionCard, setActionCard] = useState<CardType | null>(null)
  const [rentCard, setRentCard] = useState<CardType | null>(null)

  const currentPlayer = players[currentPlayerIndex]
  if (!currentPlayer) return null

  const opponents = players.filter((_, i) => i !== currentPlayerIndex)
  const completeSets = countCompleteSets(currentPlayer)
  const bankTotal = getTotalValue(currentPlayer.bank)
  const playerColor = PLAYER_COLORS[currentPlayerIndex % PLAYER_COLORS.length]

  const handleCardAction = (card: CardType, action: 'bank' | 'property' | 'play', color?: PropertyColor) => {
    if (action === 'bank') {
      playCardToBank(card.id)
    } else if (action === 'property' && color) {
      playCardAsProperty(card.id, color)
    } else if (action === 'play') {
      if (card.type === 'rent') {
        setRentCard(card)
      } else if (card.type === 'action') {
        if (card.actionType === 'pass_go' || card.actionType === 'its_my_birthday') {
          playActionCard(card.id)
        } else {
          setActionCard(card)
        }
      }
    }
  }

  const handleActionConfirm = (targetPlayerId?: string, extraData?: any) => {
    if (actionCard) {
      playActionCard(actionCard.id, targetPlayerId, extraData)
      setActionCard(null)
    }
  }

  const handleRentConfirm = (color: PropertyColor, doubleCardId?: string) => {
    if (rentCard) {
      playRentCard(rentCard.id, color, doubleCardId)
      setRentCard(null)
    }
  }

  return (
    <div className="h-screen table-bg flex flex-col overflow-hidden relative">
      {/* === TOP BAR === */}
      <div className="flex-shrink-0 panel border-b border-white/[0.06] px-4 py-2 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-[0.15em] uppercase text-text-primary">Monopoly</span>
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-gold">Deal</span>
          </div>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="text-[10px] text-text-muted">Turn {turnNumber}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <Layers size={11} />
            <span>{drawPile.length} cards left</span>
          </div>
          {discardPile.length > 0 && (
            <div className="text-[10px] text-text-muted">
              Discard: {discardPile.length}
            </div>
          )}
        </div>
      </div>

      {/* === MAIN GAME AREA === */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* Left sidebar - Opponents */}
        <div className="w-64 flex-shrink-0 p-3 space-y-3 overflow-y-auto scrollbar-thin border-r border-white/[0.04]">
          <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Opponents</div>
          {opponents.map((opp) => {
            const realIndex = players.indexOf(opp)
            return (
              <OpponentArea
                key={opp.id}
                player={opp}
                index={realIndex}
              />
            )
          })}
        </div>

        {/* Center area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Center play area */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="flex items-center gap-8">
              {/* Draw pile */}
              <div className="text-center">
                <div className="relative">
                  {[2, 1, 0].map(i => (
                    <div
                      key={i}
                      className="absolute"
                      style={{ top: -i * 2, left: -i * 1, zIndex: i }}
                    >
                      <Card card={{ id: 'deck', type: 'money', name: '', value: 0 }} size="md" faceDown />
                    </div>
                  ))}
                  <div className="opacity-0">
                    <Card card={{ id: 'deck', type: 'money', name: '', value: 0 }} size="md" faceDown />
                  </div>
                </div>
                <div className="text-[10px] text-text-muted mt-2 font-medium">
                  Draw Pile ({drawPile.length})
                </div>
              </div>

              {/* Phase indicator / Draw button */}
              <div className="text-center min-w-[160px]">
                <AnimatePresence mode="wait">
                  {phase === 'draw' && (
                    <motion.button
                      key="draw"
                      className="btn-primary text-sm px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
                      onClick={drawCards}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <ArrowDown size={16} />
                      Draw 2 Cards
                    </motion.button>
                  )}

                  {phase === 'action' && (
                    <motion.div
                      key="action"
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex items-center gap-1.5 justify-center mb-3">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-medium
                              ${i < actionsPlayedThisTurn
                                ? 'bg-gold border-gold-dark text-walnut'
                                : 'bg-white/[0.04] border-white/[0.08] text-text-muted'
                              }
                            `}
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-text-muted mb-3">
                        {actionsPlayedThisTurn}/3 actions played
                      </p>
                      <button
                        className="btn-secondary text-xs flex items-center gap-1.5 mx-auto"
                        onClick={endTurn}
                      >
                        <SkipForward size={12} />
                        End Turn
                      </button>
                    </motion.div>
                  )}

                  {phase === 'discard' && (
                    <motion.div
                      key="discard"
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Hand size={24} className="mx-auto text-gold mb-2" />
                      <p className="text-sm text-gold font-medium">Discard to 7 cards</p>
                      <p className="text-[11px] text-text-muted mt-1">
                        {currentPlayer.hand.length} cards in hand
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Discard pile */}
              <div className="text-center">
                <div className="w-24 h-[134px] rounded-lg border border-dashed border-white/[0.08] flex items-center justify-center">
                  {discardPile.length > 0 ? (
                    <Card card={discardPile[discardPile.length - 1]} size="md" showValue />
                  ) : (
                    <span className="text-[10px] text-text-muted/40">Discard</span>
                  )}
                </div>
                <div className="text-[10px] text-text-muted mt-2 font-medium">
                  Discard ({discardPile.length})
                </div>
              </div>
            </div>
          </div>

          {/* Current player property/bank area */}
          <div className="flex-shrink-0 panel border-t border-white/[0.06] p-3">
            <div className="flex items-start gap-4">
              {/* Player info */}
              <div className="flex-shrink-0 w-48">
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundColor: `${playerColor}20`,
                      color: playerColor,
                      border: `1.5px solid ${playerColor}40`,
                    }}
                  >
                    {getPlayerInitials(currentPlayer.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{currentPlayer.name}</div>
                    <div className="flex items-center gap-2 text-[9px] text-text-muted">
                      <span className="flex items-center gap-0.5">
                        <Landmark size={9} />${bankTotal}M
                      </span>
                      <span className="flex items-center gap-0.5">
                        <CreditCard size={9} />{currentPlayer.hand.length} cards
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete sets tracker */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-text-muted">Sets:</span>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`w-4.5 h-4.5 rounded border flex items-center justify-center
                        ${i < completeSets
                          ? 'bg-gold/20 border-gold/40'
                          : 'bg-white/[0.03] border-white/[0.06]'
                        }
                      `}
                    >
                      {i < completeSets && <Trophy size={9} className="text-gold" />}
                    </div>
                  ))}
                </div>

                {/* Bank */}
                <div className="mt-2">
                  <BankArea cards={currentPlayer.bank} />
                </div>
              </div>

              {/* Properties */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Properties</div>
                <PropertyArea player={currentPlayer} isCurrentPlayer />
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Game Log */}
        <div className="w-56 flex-shrink-0 border-l border-white/[0.04] p-3">
          <GameLog />
        </div>
      </div>

      {/* === BOTTOM - Player Hand === */}
      <div className="flex-shrink-0 panel border-t border-white/[0.06] relative z-20">
        {phase === 'discard' ? (
          <div className="p-2">
            <div className="flex justify-center items-end gap-1 py-2">
              <AnimatePresence>
                {currentPlayer.hand.map((card) => (
                  <motion.div key={card.id} layout>
                    <Card
                      card={card}
                      size="md"
                      onClick={() => discardCard(card.id)}
                      isPlayable
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <PlayerHand onCardAction={handleCardAction} />
        )}
      </div>

      {/* === MODALS === */}
      <AnimatePresence>
        {actionCard && (
          <ActionModal
            card={actionCard}
            onClose={() => setActionCard(null)}
            onConfirm={handleActionConfirm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rentCard && (
          <RentModal
            card={rentCard}
            onClose={() => setRentCard(null)}
            onConfirm={handleRentConfirm}
          />
        )}
      </AnimatePresence>

      {phase === 'respond' && pendingAction && <PaymentModal />}
      {phase === 'game_over' && winnerId && <GameOverScreen />}
    </div>
  )
}
