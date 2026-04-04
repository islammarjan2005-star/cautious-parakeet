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
  Trophy, CreditCard, Banknote, Layers, SkipForward,
  ArrowDown, Sparkles, Hand,
} from 'lucide-react'

export default function GameBoard() {
  const store = useGameStore()
  const {
    players, currentPlayerIndex, phase, actionsPlayedThisTurn,
    drawPile, discardPile, pendingAction, winnerId, turnNumber,
    drawCards, endTurn, playCardToBank, playCardAsProperty,
    playActionCard, playRentCard, discardCard,
    selectedCard, setSelectedCard, showActionModal, setShowActionModal,
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
    <div className="h-screen felt-bg flex flex-col overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* === TOP BAR === */}
      <div className="flex-shrink-0 glass-dark border-b border-white/10 px-4 py-2 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="monopoly-title text-xl text-white">MONOPOLY</span>
            <span className="monopoly-title text-lg text-yellow-400">DEAL</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-[10px] text-white/40">Turn {turnNumber}</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Deck info */}
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <Layers size={12} />
            <span>{drawPile.length} cards left</span>
          </div>
          {discardPile.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <span>Discard: {discardPile.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* === MAIN GAME AREA === */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* Left sidebar - Opponents */}
        <div className="w-64 flex-shrink-0 p-3 space-y-3 overflow-y-auto scrollbar-thin border-r border-white/5">
          <div className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1">Opponents</div>
          {opponents.map((opp, i) => {
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
              <motion.div className="text-center">
                <div className="relative">
                  {[2, 1, 0].map(i => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        top: -i * 2,
                        left: -i * 1,
                        zIndex: i,
                      }}
                    >
                      <Card card={{ id: 'deck', type: 'money', name: '', value: 0 }} size="md" faceDown />
                    </div>
                  ))}
                  <div className="opacity-0">
                    <Card card={{ id: 'deck', type: 'money', name: '', value: 0 }} size="md" faceDown />
                  </div>
                </div>
                <div className="text-[10px] text-white/40 mt-2 font-bold">
                  Draw Pile ({drawPile.length})
                </div>
              </motion.div>

              {/* Phase indicator / Draw button */}
              <div className="text-center">
                <AnimatePresence mode="wait">
                  {phase === 'draw' && (
                    <motion.button
                      key="draw"
                      className="btn-primary text-base px-8 py-4 rounded-2xl flex items-center gap-2"
                      onClick={drawCards}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowDown size={20} />
                      Draw 2 Cards
                    </motion.button>
                  )}

                  {phase === 'action' && (
                    <motion.div
                      key="action"
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center gap-2 justify-center mb-3">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold
                              ${i < actionsPlayedThisTurn
                                ? 'bg-yellow-400 border-yellow-300 text-black'
                                : 'bg-white/5 border-white/20 text-white/30'
                              }
                            `}
                            animate={i === actionsPlayedThisTurn ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            {i + 1}
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-xs text-white/50 mb-3">
                        {actionsPlayedThisTurn}/3 actions played
                      </p>
                      <motion.button
                        className="btn-secondary text-sm flex items-center gap-2 mx-auto"
                        onClick={endTurn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <SkipForward size={14} />
                        End Turn
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
                      <motion.div
                        className="text-yellow-400 mb-2"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Hand size={32} className="mx-auto" />
                      </motion.div>
                      <p className="text-sm text-yellow-400 font-bold">Discard down to 7 cards!</p>
                      <p className="text-xs text-white/50">
                        {currentPlayer.hand.length} cards in hand (max 7)
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Discard pile */}
              <div className="text-center">
                <div className="w-24 h-[134px] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                  {discardPile.length > 0 ? (
                    <Card card={discardPile[discardPile.length - 1]} size="md" showValue />
                  ) : (
                    <span className="text-[10px] text-white/20">Discard</span>
                  )}
                </div>
                <div className="text-[10px] text-white/40 mt-2 font-bold">
                  Discard ({discardPile.length})
                </div>
              </div>
            </div>
          </div>

          {/* Current player property/bank area */}
          <div className="flex-shrink-0 glass-dark border-t border-white/10 p-3">
            <div className="flex items-start gap-4">
              {/* Player info */}
              <div className="flex-shrink-0 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 shadow-lg"
                    style={{ borderColor: playerColor, background: `${playerColor}22` }}
                  >
                    {currentPlayer.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{currentPlayer.name}</div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="text-yellow-400 font-bold">
                        <Banknote size={10} className="inline mr-0.5" />${bankTotal}M
                      </span>
                      <span className="text-white/40">
                        <CreditCard size={10} className="inline mr-0.5" />{currentPlayer.hand.length} cards
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete sets tracker */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-white/40">Sets:</span>
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center
                        ${i < completeSets
                          ? 'bg-yellow-400 border-yellow-300 shadow-neon'
                          : 'bg-white/5 border-white/10'
                        }
                      `}
                      animate={i < completeSets ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                    >
                      {i < completeSets && <Trophy size={10} className="text-yellow-800" />}
                    </motion.div>
                  ))}
                  {completeSets >= 3 && (
                    <motion.span
                      className="text-xs text-yellow-400 font-bold ml-1"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                      <Sparkles size={14} />
                    </motion.span>
                  )}
                </div>

                {/* Bank */}
                <div className="mt-2">
                  <BankArea cards={currentPlayer.bank} />
                </div>
              </div>

              {/* Properties */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1">Properties</div>
                <PropertyArea player={currentPlayer} isCurrentPlayer />
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Game Log */}
        <div className="w-56 flex-shrink-0 border-l border-white/5 p-3">
          <GameLog />
        </div>
      </div>

      {/* === BOTTOM - Player Hand === */}
      <div className="flex-shrink-0 glass-dark border-t border-white/10 relative z-20">
        {phase === 'discard' ? (
          <div className="p-2">
            <div className="flex justify-center items-end gap-1 py-2">
              <AnimatePresence>
                {currentPlayer.hand.map((card, i) => (
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

      {/* Payment / Response modal */}
      {phase === 'respond' && pendingAction && <PaymentModal />}

      {/* Game Over */}
      {phase === 'game_over' && winnerId && <GameOverScreen />}
    </div>
  )
}
