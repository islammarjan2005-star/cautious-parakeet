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
  ArrowDown, Hand, ScrollText,
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
  const [showLog, setShowLog] = useState(false)

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
    <div className="h-screen game-bg flex flex-col overflow-hidden">

      {/* === TOP BAR === */}
      <div className="flex-shrink-0 chrome-panel flex items-center justify-between px-4 py-2.5 relative z-10" style={{ borderRadius: 0 }}>
        {/* Left: Title */}
        <div className="flex items-center gap-1.5">
          <span className="text-base font-display text-white drop-shadow">MONOPOLY</span>
          <span className="text-sm font-display text-accent drop-shadow">DEAL</span>
        </div>

        {/* Center: Turn indicator pill */}
        <div>
          {phase === 'action' || phase === 'draw' ? (
            <div className="bg-success text-game-text font-extrabold text-[11px] px-3 py-1 rounded-full"
              style={{ boxShadow: '0 2px 0 #2E7D32' }}>
              YOUR TURN
            </div>
          ) : phase === 'discard' ? (
            <div className="bg-danger text-white font-extrabold text-[11px] px-3 py-1 rounded-full"
              style={{ boxShadow: '0 2px 0 #C62828' }}>
              DISCARD
            </div>
          ) : phase === 'respond' ? (
            <div className="bg-accent text-game-text font-extrabold text-[11px] px-3 py-1 rounded-full"
              style={{ boxShadow: '0 2px 0 #C6A800' }}>
              RESPOND
            </div>
          ) : (
            <div className="bg-white/20 text-white font-extrabold text-[11px] px-3 py-1 rounded-full">
              Turn {turnNumber}
            </div>
          )}
        </div>

        {/* Right: Log toggle + card count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
            <Layers size={13} />
            <span>{drawPile.length}</span>
          </div>
          <button
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setShowLog(prev => !prev)}
          >
            <ScrollText size={16} className="text-white/80" />
          </button>
        </div>
      </div>

      {/* === OPPONENTS STRIP === */}
      <div className="flex-shrink-0 flex gap-2 px-3 py-2 overflow-x-auto scrollbar-thin">
        {opponents.map((opp) => {
          const realIndex = players.indexOf(opp)
          return (
            <div key={opp.id} className="inline-flex flex-shrink-0">
              <OpponentArea
                player={opp}
                index={realIndex}
              />
            </div>
          )
        })}
      </div>

      {/* === PLAYER ZONE === */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {/* Player info bar */}
        <div className="chrome-panel px-3 py-2 flex items-center gap-3" style={{ borderRadius: '8px' }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg border-3 flex-shrink-0"
            style={{
              backgroundColor: `${playerColor}25`,
              borderColor: playerColor,
              boxShadow: `0 3px 0 ${playerColor}60`,
            }}
          >
            {currentPlayer.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{currentPlayer.name}</div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <span>${bankTotal}M</span>
              <span className="flex items-center gap-0.5">
                <CreditCard size={10} />{currentPlayer.hand.length}
              </span>
            </div>
          </div>
          {/* Complete sets tracker */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
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
        </div>

        {/* Property bands */}
        <div>
          <div className="text-xs text-white/70 font-bold uppercase tracking-wider mb-1">Properties</div>
          <PropertyArea player={currentPlayer} isCurrentPlayer />
        </div>

        {/* Bank display */}
        <div>
          <div className="text-xs text-white/70 font-bold uppercase tracking-wider mb-1">Bank</div>
          <BankArea cards={currentPlayer.bank} />
        </div>
      </div>

      {/* === ACTION ZONE === */}
      <div className="flex-shrink-0 chrome-panel flex items-center justify-between px-4 py-2" style={{ borderRadius: 0 }}>
        {/* Draw pile (left) */}
        <div className="text-center flex-shrink-0">
          <div className="relative">
            {[2, 1, 0].map(i => (
              <div
                key={i}
                className="absolute"
                style={{ top: -i * 1.5, left: -i * 0.5, zIndex: i }}
              >
                <Card card={{ id: 'deck', type: 'money', name: '', value: 0 }} size="sm" faceDown />
              </div>
            ))}
            <div className="opacity-0">
              <Card card={{ id: 'deck', type: 'money', name: '', value: 0 }} size="sm" faceDown />
            </div>
          </div>
          <div className="text-[10px] text-white/60 font-bold mt-1">
            Draw ({drawPile.length})
          </div>
        </div>

        {/* Phase indicator / action count (center) */}
        <div className="text-center min-w-[140px]">
          <AnimatePresence mode="wait">
            {phase === 'draw' && (
              <motion.button
                key="draw"
                className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 mx-auto"
                onClick={drawCards}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.92, y: 2 }}
                whileHover={{ scale: 1.05 }}
              >
                <ArrowDown size={16} strokeWidth={3} />
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
                <p className="text-[10px] text-white/60 font-bold uppercase mb-1">
                  Play up to 3 cards
                </p>
                <div className="flex items-center gap-1.5 justify-center mb-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold transition-all
                        ${i < actionsPlayedThisTurn
                          ? 'bg-accent border-accent-dark text-game-text'
                          : 'bg-white/20 border-white/40 text-white/60'
                        }
                      `}
                      style={i < actionsPlayedThisTurn ? { boxShadow: '0 2px 0 #C6A800' } : {}}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <motion.button
                  className="btn-secondary text-xs flex items-center gap-1 mx-auto px-3 py-1.5"
                  onClick={endTurn}
                  whileTap={{ scale: 0.92 }}
                >
                  <SkipForward size={12} />
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
                <Hand size={20} className="mx-auto text-white mb-1" />
                <p className="text-xs text-white font-bold">Tap cards to discard</p>
                <p className="text-[10px] text-white/60 font-semibold">
                  {currentPlayer.hand.length} / 7 cards
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Discard pile (right) */}
        <div className="text-center flex-shrink-0">
          <div className="w-16 h-[88px] rounded-card border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5">
            {discardPile.length > 0 ? (
              <Card card={discardPile[discardPile.length - 1]} size="sm" showValue />
            ) : (
              <span className="text-[10px] text-white/30 font-bold">Discard</span>
            )}
          </div>
          <div className="text-[10px] text-white/60 font-bold mt-1">
            Discard ({discardPile.length})
          </div>
        </div>
      </div>

      {/* === PLAYER HAND === */}
      <div className="flex-shrink-0 chrome-panel relative z-20" style={{ borderRadius: 0 }}>
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

      {/* === GAME LOG OVERLAY === */}
      <AnimatePresence>
        {showLog && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLog(false)}
            />
            {/* Slide-out panel from right */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-72 z-40 chrome-panel overflow-y-auto"
              style={{ borderRadius: 0 }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-bold text-white">Game Log</span>
                <button
                  className="text-white/60 hover:text-white text-xs font-bold"
                  onClick={() => setShowLog(false)}
                >
                  Close
                </button>
              </div>
              <div className="p-3">
                <GameLog isOpen={showLog} onClose={() => setShowLog(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
