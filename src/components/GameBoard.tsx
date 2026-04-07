import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Card as CardType, PropertyColor, PLAYER_COLORS } from '../types/game'
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
  Trophy, CreditCard, Layers, SkipForward,
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
    <div className="h-screen game-bg flex flex-col overflow-hidden relative">
      {/* === TOP BAR === */}
      <div className="flex-shrink-0 frost border-b border-white/20 px-4 py-2.5 flex items-center justify-between relative z-10" style={{ borderRadius: 0 }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-display text-white drop-shadow">MONOPOLY</span>
            <span className="text-sm font-display text-accent drop-shadow">DEAL</span>
          </div>
          <div className="h-5 w-px bg-white/20" />
          <div className="bg-white/20 rounded-full px-3 py-0.5 text-xs font-bold text-white">
            Turn {turnNumber}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
            <Layers size={13} />
            <span>{drawPile.length} cards</span>
          </div>
          {discardPile.length > 0 && (
            <div className="text-xs font-bold text-white/60">
              Discard: {discardPile.length}
            </div>
          )}
        </div>
      </div>

      {/* === MAIN GAME AREA === */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* Left sidebar - Opponents */}
        <div className="w-64 flex-shrink-0 p-3 space-y-3 overflow-y-auto scrollbar-thin border-r border-white/10">
          <div className="text-xs text-white/70 font-bold uppercase tracking-wider mb-1">Opponents</div>
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
                <div className="text-xs text-white/70 mt-2 font-bold">
                  Draw ({drawPile.length})
                </div>
              </div>

              {/* Phase indicator / Draw button */}
              <div className="text-center min-w-[180px]">
                <AnimatePresence mode="wait">
                  {phase === 'draw' && (
                    <motion.button
                      key="draw"
                      className="btn-primary text-base px-8 py-4 flex items-center gap-2 mx-auto"
                      onClick={drawCards}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileTap={{ scale: 0.92, y: 2 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <ArrowDown size={20} strokeWidth={3} />
                      <span className="font-extrabold">DRAW</span>
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
                      {/* YOUR TURN pill */}
                      <div className="inline-block bg-success text-game-text font-extrabold text-xs px-4 py-1.5 rounded-full mb-3 animate-pulse-soft"
                        style={{ boxShadow: '0 3px 0 #2E7D32' }}>
                        YOUR TURN
                      </div>

                      {/* Action dots */}
                      <div className="flex items-center gap-2 justify-center mb-3">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className={`w-7 h-7 rounded-full border-3 flex items-center justify-center text-xs font-extrabold transition-all
                              ${i < actionsPlayedThisTurn
                                ? 'bg-accent border-accent-dark text-game-text'
                                : 'bg-white/20 border-white/40 text-white/60'
                              }
                            `}
                            style={i < actionsPlayedThisTurn ? { boxShadow: '0 3px 0 #C6A800' } : {}}
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-white/70 font-bold mb-3">
                        {actionsPlayedThisTurn}/3 actions
                      </p>
                      <motion.button
                        className="btn-secondary text-sm flex items-center gap-1.5 mx-auto"
                        onClick={endTurn}
                        whileTap={{ scale: 0.92 }}
                      >
                        <SkipForward size={14} />
                        <span className="font-bold">End Turn</span>
                      </motion.button>
                    </motion.div>
                  )}

                  {phase === 'discard' && (
                    <motion.div
                      key="discard"
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="inline-block bg-danger text-white font-extrabold text-xs px-4 py-1.5 rounded-full mb-2 animate-pulse-soft"
                        style={{ boxShadow: '0 3px 0 #C62828' }}>
                        DISCARD
                      </div>
                      <Hand size={28} className="mx-auto text-white mb-2" />
                      <p className="text-sm text-white font-bold">Tap cards to discard</p>
                      <p className="text-xs text-white/60 font-semibold mt-1">
                        {currentPlayer.hand.length} / 7 cards
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Discard pile */}
              <div className="text-center">
                <div className="w-24 h-[134px] rounded-card border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5">
                  {discardPile.length > 0 ? (
                    <Card card={discardPile[discardPile.length - 1]} size="md" showValue />
                  ) : (
                    <span className="text-xs text-white/30 font-bold">Discard</span>
                  )}
                </div>
                <div className="text-xs text-white/70 mt-2 font-bold">
                  Discard ({discardPile.length})
                </div>
              </div>
            </div>
          </div>

          {/* Current player property/bank area */}
          <div className="flex-shrink-0 frost border-t border-white/20 p-3" style={{ borderRadius: 0 }}>
            <div className="flex items-start gap-4">
              {/* Player info */}
              <div className="flex-shrink-0 w-48">
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-3"
                    style={{
                      backgroundColor: `${playerColor}25`,
                      borderColor: playerColor,
                      boxShadow: `0 3px 0 ${playerColor}60`,
                    }}
                  >
                    {currentPlayer.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{currentPlayer.name}</div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                      <span>${bankTotal}M</span>
                      <span className="flex items-center gap-0.5">
                        <CreditCard size={10} />{currentPlayer.hand.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete sets tracker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/60 font-bold">Sets:</span>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${i < completeSets
                          ? 'bg-accent border-accent-dark'
                          : 'bg-white/10 border-white/20'
                        }
                      `}
                      style={i < completeSets ? { boxShadow: '0 2px 0 #C6A800' } : {}}
                    >
                      {i < completeSets ? <Trophy size={11} className="text-game-text" /> : null}
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
                <div className="text-xs text-white/70 font-bold uppercase tracking-wider mb-1">Properties</div>
                <PropertyArea player={currentPlayer} isCurrentPlayer />
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Game Log */}
        <div className="w-56 flex-shrink-0 border-l border-white/10 p-3">
          <GameLog />
        </div>
      </div>

      {/* === BOTTOM - Player Hand === */}
      <div className="flex-shrink-0 frost border-t border-white/20 relative z-20" style={{ borderRadius: 0 }}>
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
