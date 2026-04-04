import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Card as CardType, Player } from '../types/game'
import { getTotalValue, getPlayerTotalWealth } from '../utils/helpers'
import { getColorHex } from './Card'
import { ModalWrapper } from './ActionModal'
import { AlertTriangle, Shield, DollarSign } from 'lucide-react'

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

  // Calculate total selected
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
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 mb-3"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <AlertTriangle size={28} className="text-red-400" />
        </motion.div>
        <h3 className="text-lg font-bold text-white">
          {isDealBreaker ? 'Deal Breaker!' : `Pay $${amountDue}M`}
        </h3>
        <p className="text-xs text-white/60 mt-1">
          {sourcePlayer.name} {
            pendingAction.type === 'debt_collector' ? 'is collecting a debt' :
            pendingAction.type === 'its_my_birthday' ? 'is celebrating a birthday' :
            pendingAction.type === 'rent' ? `is charging rent for ${pendingAction.propertyColor}` :
            pendingAction.type === 'deal_breaker' ? `wants to steal your ${pendingAction.propertyColor} set!` :
            'demands payment'
          }
        </p>
      </div>

      {/* Just Say No option */}
      {hasJustSayNo && (
        <motion.button
          className="w-full mb-4 p-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 border border-red-500 flex items-center gap-3 hover:from-red-600 hover:to-red-500 transition-all"
          onClick={handleJustSayNo}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shield size={20} className="text-white" />
          <div className="text-left">
            <div className="text-sm font-bold text-white">🚫 Just Say No!</div>
            <div className="text-[10px] text-red-200">Cancel this action entirely</div>
          </div>
        </motion.button>
      )}

      {isDealBreaker ? (
        /* Deal Breaker - just accept or say no */
        <div>
          <p className="text-xs text-white/70 mb-4 text-center">
            Your complete {pendingAction.propertyColor} property set will be taken.
          </p>
          <motion.button
            className="w-full btn-danger"
            onClick={handlePayForDealBreaker}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Accept
          </motion.button>
        </div>
      ) : (
        /* Payment selection */
        <div>
          {/* Payment progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Selected</span>
              <span className={`font-bold ${selectedTotal >= amountDue ? 'text-green-400' : 'text-yellow-400'}`}>
                ${selectedTotal}M / ${amountDue}M
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${selectedTotal >= amountDue ? 'bg-green-500' : 'bg-yellow-500'}`}
                animate={{ width: `${Math.min(100, (selectedTotal / amountDue) * 100)}%` }}
                transition={{ type: 'spring' }}
              />
            </div>
            {totalWealth < amountDue && (
              <p className="text-[10px] text-orange-400 mt-1">
                You don't have enough — select all you can to pay what you have.
              </p>
            )}
          </div>

          {/* Bank cards */}
          {respondingPlayer.bank.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] text-white/50 font-bold mb-1 flex items-center gap-1">
                <DollarSign size={10} /> BANK
              </div>
              <div className="flex gap-1 flex-wrap">
                {respondingPlayer.bank.map(card => {
                  const isSelected = selectedBankIds.includes(card.id)
                  return (
                    <motion.button
                      key={card.id}
                      className={`
                        rounded-lg px-2 py-1 text-xs font-bold border-2 transition-all
                        ${isSelected
                          ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg'
                          : 'bg-green-900/40 text-green-300 border-green-700/30 hover:border-green-500'
                        }
                      `}
                      onClick={() => toggleBank(card.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ${card.value}M
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Property cards */}
          {respondingPlayer.properties.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] text-white/50 font-bold mb-1">🏠 PROPERTIES</div>
              <div className="space-y-1">
                {respondingPlayer.properties.map(set =>
                  set.cards.map(card => {
                    const isSelected = selectedPropertyIds.includes(card.id)
                    return (
                      <motion.button
                        key={card.id}
                        className={`
                          w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs border-2 transition-all
                          ${isSelected
                            ? 'bg-yellow-400/20 border-yellow-400 text-yellow-200'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                          }
                        `}
                        onClick={() => toggleProperty(card.id)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: getColorHex(set.color) }}
                        />
                        <span className="font-semibold">{card.name}</span>
                        <span className="ml-auto text-[10px]">${card.value}M</span>
                      </motion.button>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Pay button */}
          <motion.button
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              canPay
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
            disabled={!canPay}
            onClick={handlePay}
            whileHover={canPay ? { scale: 1.02 } : undefined}
            whileTap={canPay ? { scale: 0.98 } : undefined}
          >
            {canPay ? `Pay $${selectedTotal}M` : `Select $${amountDue}M worth of assets`}
          </motion.button>
        </div>
      )}
    </ModalWrapper>
  )
}
