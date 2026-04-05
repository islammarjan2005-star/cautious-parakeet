import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Card as CardType } from '../types/game'
import { getTotalValue, getPlayerTotalWealth } from '../utils/helpers'
import { getColorHex } from './Card'
import { ModalWrapper } from './ActionModal'
import { AlertTriangle, ShieldX, Landmark, MapPin } from 'lucide-react'

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
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-900/30 mb-3">
          <AlertTriangle size={22} className="text-red-400/80" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">
          {isDealBreaker ? 'Deal Breaker' : `Pay $${amountDue}M`}
        </h3>
        <p className="text-[11px] text-text-muted mt-1">
          {sourcePlayer.name} {
            pendingAction.type === 'debt_collector' ? 'is collecting a debt' :
            pendingAction.type === 'its_my_birthday' ? 'is celebrating a birthday' :
            pendingAction.type === 'rent' ? `is charging rent for ${pendingAction.propertyColor}` :
            pendingAction.type === 'deal_breaker' ? `wants to steal your ${pendingAction.propertyColor} set` :
            'demands payment'
          }
        </p>
      </div>

      {/* Just Say No option */}
      {hasJustSayNo && (
        <button
          className="w-full mb-4 p-2.5 rounded-lg bg-red-900/40 border border-red-800/40 flex items-center gap-3 hover:bg-red-900/50 transition-colors"
          onClick={handleJustSayNo}
        >
          <ShieldX size={16} className="text-red-300" />
          <div className="text-left">
            <div className="text-xs font-semibold text-red-200">Just Say No</div>
            <div className="text-[9px] text-red-300/60">Cancel this action entirely</div>
          </div>
        </button>
      )}

      {isDealBreaker ? (
        <div>
          <p className="text-[11px] text-text-muted mb-4 text-center">
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
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-text-muted">Selected</span>
              <span className={`font-medium ${selectedTotal >= amountDue ? 'text-[#7a9a7a]' : 'text-gold'}`}>
                ${selectedTotal}M / ${amountDue}M
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${selectedTotal >= amountDue ? 'bg-[#5a8a5a]' : 'bg-gold'}`}
                animate={{ width: `${Math.min(100, (selectedTotal / amountDue) * 100)}%` }}
                transition={{ type: 'spring' }}
              />
            </div>
            {totalWealth < amountDue && (
              <p className="text-[9px] text-gold/70 mt-1">
                Not enough to pay full amount. Select all you can.
              </p>
            )}
          </div>

          {/* Bank cards */}
          {respondingPlayer.bank.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] text-text-muted font-medium mb-1 flex items-center gap-1">
                <Landmark size={9} /> BANK
              </div>
              <div className="flex gap-1 flex-wrap">
                {respondingPlayer.bank.map(card => {
                  const isSelected = selectedBankIds.includes(card.id)
                  return (
                    <button
                      key={card.id}
                      className={`
                        rounded px-2 py-1 text-[11px] font-medium border transition-colors
                        ${isSelected
                          ? 'bg-gold/20 text-gold border-gold/40'
                          : 'bg-white/[0.04] text-text-muted border-white/[0.06] hover:border-white/[0.12]'
                        }
                      `}
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
              <div className="text-[10px] text-text-muted font-medium mb-1 flex items-center gap-1">
                <MapPin size={9} /> PROPERTIES
              </div>
              <div className="space-y-1">
                {respondingPlayer.properties.map(set =>
                  set.cards.map(card => {
                    const isSelected = selectedPropertyIds.includes(card.id)
                    return (
                      <button
                        key={card.id}
                        className={`
                          w-full flex items-center gap-2 rounded px-2 py-1.5 text-[11px] border transition-colors
                          ${isSelected
                            ? 'bg-gold/10 border-gold/30 text-gold'
                            : 'bg-white/[0.02] border-white/[0.06] text-text-muted hover:border-white/[0.12]'
                          }
                        `}
                        onClick={() => toggleProperty(card.id)}
                      >
                        <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: getColorHex(set.color) }} />
                        <span className="font-medium">{card.name}</span>
                        <span className="ml-auto text-[9px]">${card.value}M</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Pay button */}
          <button
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
              canPay
                ? 'bg-[#3a5a3a] text-[#c0d8c0] hover:bg-[#4a6a4a]'
                : 'bg-white/[0.04] text-text-muted/40 cursor-not-allowed'
            }`}
            disabled={!canPay}
            onClick={handlePay}
          >
            {canPay ? `Pay $${selectedTotal}M` : `Select $${amountDue}M worth of assets`}
          </button>
        </div>
      )}
    </ModalWrapper>
  )
}
