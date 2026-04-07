import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Card as CardType } from '../types/game'
import { getTotalValue, getPlayerTotalWealth } from '../utils/helpers'
import { getColorHex } from './Card'
import { ModalWrapper } from './ActionModal'
import { AlertTriangle, Landmark, MapPin } from 'lucide-react'

export default function PaymentModal() {
  const {
    pendingAction, respondingPlayerIndex, players,
    respondToAction,
  } = useGameStore()

  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([])
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])

  if (!pendingAction || respondingPlayerIndex === null) return null

  const respondingPlayer = players[respondingPlayerIndex]
  const sourcePlayer = players.find(p => p.id === pendingAction.sourcePlayerId)!
  const amountDue = pendingAction.amount || 0

  const hasJustSayNo = respondingPlayer.hand.some(c => c.actionType === 'just_say_no')
  const totalWealth = getPlayerTotalWealth(respondingPlayer)

  const selectedTotal = useMemo(() => {
    let total = 0
    for (const id of selectedBankIds) {
      const card = respondingPlayer.bank.find(c => c.id === id)
      if (card) total += card.value
    }
    for (const id of selectedPropertyIds) {
      for (const set of respondingPlayer.properties) {
        const card = set.cards.find(c => c.id === id)
        if (card) total += card.value
      }
    }
    return total
  }, [selectedBankIds, selectedPropertyIds, respondingPlayer])

  const canPay = selectedTotal >= amountDue || totalWealth <= selectedTotal

  const toggleBank = (id: string) => {
    setSelectedBankIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleProperty = (id: string) => {
    setSelectedPropertyIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handlePay = () => {
    respondToAction('pay', [...selectedBankIds, ...selectedPropertyIds])
    setSelectedBankIds([])
    setSelectedPropertyIds([])
  }

  const handleJustSayNo = () => {
    respondToAction('just_say_no')
  }

  const handlePayForDealBreaker = () => {
    respondToAction('pay')
  }

  const isDealBreaker = pendingAction.type === 'deal_breaker'

  return (
    <ModalWrapper onClose={() => {}}>
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
          style={{ background: 'linear-gradient(135deg, #FF5252, #FF1744)' }}>
          <AlertTriangle size={24} className="text-white" />
        </div>
        <h3 className="text-lg font-extrabold text-game-text">
          {isDealBreaker ? '\u{1F4A5} Deal Breaker!' : `Pay $${amountDue}M`}
        </h3>
        <p className="text-xs text-game-text-light font-semibold mt-1">
          {sourcePlayer.name} {
            pendingAction.type === 'debt_collector' ? 'is collecting a debt' :
            pendingAction.type === 'its_my_birthday' ? 'is celebrating a birthday \u{1F382}' :
            pendingAction.type === 'rent' ? `is charging rent for ${pendingAction.propertyColor}` :
            pendingAction.type === 'deal_breaker' ? `wants to steal your ${pendingAction.propertyColor} set` :
            'demands payment'
          }
        </p>
      </div>

      {/* Just Say No option */}
      {hasJustSayNo && (
        <motion.button
          className="w-full mb-4 p-3 rounded-xl border-3 border-danger flex items-center gap-3 hover:bg-danger/10 transition-colors"
          style={{ background: 'rgba(255,82,82,0.08)', boxShadow: '0 3px 0 #C62828' }}
          onClick={handleJustSayNo}
          whileTap={{ scale: 0.97, y: 2 }}
        >
          <span className="text-2xl">{'\u{1F6AB}'}</span>
          <div className="text-left">
            <div className="text-sm font-extrabold text-danger">Just Say No!</div>
            <div className="text-[9px] text-game-text-light font-semibold">Cancel this action entirely</div>
          </div>
        </motion.button>
      )}

      {isDealBreaker ? (
        <div>
          <p className="text-xs text-game-text-light font-semibold mb-4 text-center">
            Your complete {pendingAction.propertyColor} property set will be taken.
          </p>
          <button className="w-full btn-danger text-sm" onClick={handlePayForDealBreaker}>
            Accept
          </button>
        </div>
      ) : (
        <div>
          {/* Payment progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-game-text-light font-semibold">Selected</span>
              <span className={`font-extrabold ${selectedTotal >= amountDue ? 'text-success-dark' : 'text-accent-dark'}`}>
                ${selectedTotal}M / ${amountDue}M
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${selectedTotal >= amountDue ? 'bg-success' : 'bg-accent'}`}
                animate={{ width: `${Math.min(100, (selectedTotal / amountDue) * 100)}%` }}
                transition={{ type: 'spring' }}
              />
            </div>
            {totalWealth < amountDue && (
              <p className="text-[10px] text-danger font-semibold mt-1">
                Not enough to pay full amount. Select all you can.
              </p>
            )}
          </div>

          {/* Bank cards */}
          {respondingPlayer.bank.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-game-text-light font-bold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                <Landmark size={11} /> Bank
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {respondingPlayer.bank.map(card => {
                  const isSelected = selectedBankIds.includes(card.id)
                  return (
                    <button
                      key={card.id}
                      className={`
                        rounded-full px-3 py-1 text-xs font-extrabold border-2 transition-all
                        ${isSelected
                          ? 'bg-accent text-game-text border-accent-dark ring-2 ring-accent/30'
                          : 'bg-white text-game-text border-gray-200 hover:border-primary'
                        }
                      `}
                      style={{ boxShadow: isSelected ? '0 2px 0 #C6A800' : '0 2px 0 rgba(0,0,0,0.06)' }}
                      onClick={() => toggleBank(card.id)}
                    >
                      ${card.value}M
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Property cards */}
          {respondingPlayer.properties.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-game-text-light font-bold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                <MapPin size={11} /> Properties
              </div>
              <div className="space-y-1.5">
                {respondingPlayer.properties.map(set =>
                  set.cards.map(card => {
                    const isSelected = selectedPropertyIds.includes(card.id)
                    return (
                      <button
                        key={card.id}
                        className={`
                          w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs border-2 transition-all
                          ${isSelected
                            ? 'bg-accent/10 border-accent text-game-text ring-2 ring-accent/20'
                            : 'bg-white border-gray-200 text-game-text hover:border-primary'
                          }
                        `}
                        style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.06)' }}
                        onClick={() => toggleProperty(card.id)}
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-white"
                          style={{ backgroundColor: getColorHex(set.color), boxShadow: `0 1px 0 ${getColorHex(set.color)}60` }} />
                        <span className="font-bold">{card.name}</span>
                        <span className="ml-auto text-[10px] font-extrabold text-game-text-light">${card.value}M</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Pay button */}
          <motion.button
            className={`w-full py-3 rounded-btn font-extrabold text-sm transition-all ${
              canPay
                ? 'bg-success text-game-text'
                : 'bg-gray-200 text-game-text-light cursor-not-allowed'
            }`}
            style={canPay ? { boxShadow: '0 4px 0 #2E7D32' } : {}}
            disabled={!canPay}
            onClick={handlePay}
            whileTap={canPay ? { scale: 0.95, y: 2 } : undefined}
          >
            {canPay ? `Pay $${selectedTotal}M` : `Select $${amountDue}M worth of assets`}
          </motion.button>
        </div>
      )}
    </ModalWrapper>
  )
}
