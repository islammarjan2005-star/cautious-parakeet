import { create } from 'zustand'
import {
  Card, GamePhase, GameState, Player, PropertyColor, PropertySet,
  PendingAction, GameLogEntry, PROPERTY_SET_SIZES, RENT_AMOUNTS,
  getPlayerInitials,
} from '../types/game'
import { createDeck, shuffleDeck } from '../utils/deck'
import {
  addPropertyToPlayer, removePropertyFromPlayer, isSetComplete,
  hasWon, calculateRent, countCompleteSets,
} from '../utils/helpers'

interface GameStore extends GameState {
  // Setup
  initGame: (playerNames: string[]) => void

  // Turn flow
  startTurn: () => void
  drawCards: () => void
  endTurn: () => void

  // Card actions
  playCardToBank: (cardId: string) => void
  playCardAsProperty: (cardId: string, color: PropertyColor) => void
  playActionCard: (cardId: string, targetPlayerId?: string, extraData?: any) => void
  playRentCard: (cardId: string, color: PropertyColor, doubleCardId?: string) => void
  discardCard: (cardId: string) => void
  movePropertyColor: (cardId: string, newColor: PropertyColor) => void

  // Response flow
  respondToAction: (response: 'pay' | 'just_say_no', paymentCardIds?: string[]) => void
  resolveAction: () => void

  // Helpers
  addLog: (playerId: string, message: string) => void
  getCurrentPlayer: () => Player
  getPlayer: (id: string) => Player | undefined
  reshuffleDeck: () => void

  // UI State
  selectedCard: Card | null
  setSelectedCard: (card: Card | null) => void
  showActionModal: string | null
  setShowActionModal: (modal: string | null) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  phase: 'setup',
  players: [],
  currentPlayerIndex: 0,
  drawPile: [],
  discardPile: [],
  actionsPlayedThisTurn: 0,
  maxActionsPerTurn: 3,
  pendingAction: null,
  respondingPlayerIndex: null,
  winnerId: null,
  turnNumber: 0,
  lastPlayedCard: null,
  log: [],
  selectedCard: null,
  showActionModal: null,

  setSelectedCard: (card) => set({ selectedCard: card }),
  setShowActionModal: (modal) => set({ showActionModal: modal }),

  addLog: (playerId: string, message: string) => {
    set(state => ({
      log: [...state.log.slice(-50), { timestamp: Date.now(), playerId, message }],
    }))
  },

  getCurrentPlayer: () => {
    const state = get()
    return state.players[state.currentPlayerIndex]
  },

  getPlayer: (id: string) => {
    return get().players.find(p => p.id === id)
  },

  reshuffleDeck: () => {
    set(state => {
      if (state.drawPile.length > 0) return state
      const newDraw = shuffleDeck([...state.discardPile])
      return { drawPile: newDraw, discardPile: [] }
    })
  },

  initGame: (playerNames: string[]) => {
    const deck = shuffleDeck(createDeck())
    const players: Player[] = playerNames.map((name, i) => ({
      id: `player_${i}`,
      name,
      avatar: getPlayerInitials(name),
      hand: [],
      bank: [],
      properties: [],
      isAI: false,
    }))

    // Deal 5 cards to each player
    let drawPile = [...deck]
    for (const player of players) {
      player.hand = drawPile.splice(0, 5)
    }

    set({
      phase: 'draw',
      players,
      currentPlayerIndex: 0,
      drawPile,
      discardPile: [],
      actionsPlayedThisTurn: 0,
      pendingAction: null,
      respondingPlayerIndex: null,
      winnerId: null,
      turnNumber: 1,
      lastPlayedCard: null,
      log: [{ timestamp: Date.now(), playerId: 'system', message: 'Game started!' }],
      selectedCard: null,
      showActionModal: null,
    })
  },

  startTurn: () => {
    set({ phase: 'draw', actionsPlayedThisTurn: 0, selectedCard: null })
  },

  drawCards: () => {
    set(state => {
      let drawPile = [...state.drawPile]
      const players = state.players.map(p => ({ ...p }))
      const player = players[state.currentPlayerIndex]

      // If deck is empty, reshuffle
      if (drawPile.length < 2) {
        drawPile = [...drawPile, ...shuffleDeck([...state.discardPile])]
      }

      const drawn = drawPile.splice(0, 2)
      player.hand = [...player.hand, ...drawn]

      // If player has no cards after drawing (shouldn't happen with 2 draw), handle it
      return {
        players,
        drawPile,
        discardPile: drawPile.length === 0 && state.discardPile.length > 0 ? [] : state.discardPile,
        phase: 'action' as GamePhase,
        log: [...state.log, {
          timestamp: Date.now(),
          playerId: player.id,
          message: `${player.name} drew 2 cards`,
        }],
      }
    })
  },

  endTurn: () => {
    set(state => {
      const player = state.players[state.currentPlayerIndex]

      // Check if player needs to discard (hand > 7)
      if (player.hand.length > 7) {
        return { phase: 'discard' as GamePhase }
      }

      // Move to next player
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
      return {
        currentPlayerIndex: nextIndex,
        phase: 'draw' as GamePhase,
        actionsPlayedThisTurn: 0,
        turnNumber: state.turnNumber + 1,
        selectedCard: null,
        lastPlayedCard: null,
        log: [...state.log, {
          timestamp: Date.now(),
          playerId: player.id,
          message: `${player.name} ended their turn`,
        }],
      }
    })
  },

  playCardToBank: (cardId: string) => {
    set(state => {
      const players = state.players.map(p => ({ ...p }))
      const player = players[state.currentPlayerIndex]
      const cardIndex = player.hand.findIndex(c => c.id === cardId)
      if (cardIndex === -1) return state

      const card = player.hand[cardIndex]
      player.hand = player.hand.filter(c => c.id !== cardId)
      player.bank = [...player.bank, card]

      return {
        players,
        actionsPlayedThisTurn: state.actionsPlayedThisTurn + 1,
        lastPlayedCard: card,
        log: [...state.log, {
          timestamp: Date.now(),
          playerId: player.id,
          message: `${player.name} banked ${card.name} ($${card.value}M)`,
        }],
      }
    })
  },

  playCardAsProperty: (cardId: string, color: PropertyColor) => {
    set(state => {
      const players = state.players.map(p => ({ ...p, properties: p.properties.map(ps => ({ ...ps, cards: [...ps.cards] })) }))
      const player = players[state.currentPlayerIndex]
      const cardIndex = player.hand.findIndex(c => c.id === cardId)
      if (cardIndex === -1) return state

      const card = player.hand[cardIndex]
      player.hand = player.hand.filter(c => c.id !== cardId)

      const updatedPlayer = addPropertyToPlayer(player, card, color)
      players[state.currentPlayerIndex] = updatedPlayer

      // Check win condition
      const won = hasWon(updatedPlayer)

      return {
        players,
        actionsPlayedThisTurn: state.actionsPlayedThisTurn + 1,
        lastPlayedCard: card,
        phase: won ? 'game_over' as GamePhase : state.phase,
        winnerId: won ? player.id : null,
        log: [...state.log, {
          timestamp: Date.now(),
          playerId: player.id,
          message: `${player.name} played ${card.name} as ${color} property`,
        }],
      }
    })
  },

  playActionCard: (cardId: string, targetPlayerId?: string, extraData?: any) => {
    set(state => {
      const players = state.players.map(p => ({ ...p, properties: p.properties.map(ps => ({ ...ps, cards: [...ps.cards] })) }))
      const player = players[state.currentPlayerIndex]
      const cardIndex = player.hand.findIndex(c => c.id === cardId)
      if (cardIndex === -1) return state

      const card = player.hand[cardIndex]
      player.hand = player.hand.filter(c => c.id !== cardId)

      let newState: Partial<GameStore> = {
        players,
        actionsPlayedThisTurn: state.actionsPlayedThisTurn + 1,
        lastPlayedCard: card,
        discardPile: [...state.discardPile, card],
      }

      switch (card.actionType) {
        case 'pass_go': {
          // Draw 2 cards
          let drawPile = [...state.drawPile]
          if (drawPile.length < 2) {
            drawPile = [...drawPile, ...shuffleDeck([...state.discardPile])]
            newState.discardPile = []
          }
          const drawn = drawPile.splice(0, 2)
          player.hand = [...player.hand, ...drawn]
          newState.drawPile = drawPile
          newState.log = [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} played Pass Go and drew 2 cards`,
          }]
          break
        }

        case 'debt_collector': {
          if (!targetPlayerId) return state
          const targetIdx = players.findIndex(p => p.id === targetPlayerId)
          newState.pendingAction = {
            type: 'debt_collector',
            sourcePlayerId: player.id,
            targetPlayerIds: [targetPlayerId],
            amount: 5,
            card,
          }
          newState.respondingPlayerIndex = targetIdx
          newState.phase = 'respond' as GamePhase
          newState.log = [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} played Debt Collector on ${players[targetIdx].name} ($5M)`,
          }]
          break
        }

        case 'its_my_birthday': {
          const targetIds = players.filter(p => p.id !== player.id).map(p => p.id)
          const firstTargetIdx = players.findIndex(p => p.id === targetIds[0])
          newState.pendingAction = {
            type: 'its_my_birthday',
            sourcePlayerId: player.id,
            targetPlayerIds: targetIds,
            amount: 2,
            card,
          }
          newState.respondingPlayerIndex = firstTargetIdx
          newState.phase = 'respond' as GamePhase
          newState.log = [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} played It's My Birthday! Everyone pays $2M`,
          }]
          break
        }

        case 'sly_deal': {
          if (!targetPlayerId || !extraData?.targetCardId) return state
          const targetIdx = players.findIndex(p => p.id === targetPlayerId)
          const target = players[targetIdx]

          // Find the card to steal
          const result = removePropertyFromPlayer(target, extraData.targetCardId)
          if (!result.card || !result.color) return state

          // Check that we're not stealing from a complete set
          const targetSet = target.properties.find(ps =>
            ps.cards.some(c => c.id === extraData.targetCardId)
          )
          if (targetSet && isSetComplete(targetSet)) return state

          players[targetIdx] = result.player
          const updatedPlayer = addPropertyToPlayer(player, result.card, result.color)
          players[state.currentPlayerIndex] = updatedPlayer

          const won = hasWon(updatedPlayer)
          newState.players = players
          newState.phase = won ? 'game_over' as GamePhase : state.phase
          newState.winnerId = won ? player.id : null
          newState.log = [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} used Sly Deal to steal ${result.card.name} from ${target.name}`,
          }]
          break
        }

        case 'forced_deal': {
          if (!targetPlayerId || !extraData?.targetCardId || !extraData?.sourceCardId) return state
          const targetIdx = players.findIndex(p => p.id === targetPlayerId)
          const target = players[targetIdx]

          // Remove card from target
          const targetResult = removePropertyFromPlayer(target, extraData.targetCardId)
          if (!targetResult.card || !targetResult.color) return state

          // Check that we're not stealing from a complete set
          const tSet = target.properties.find(ps =>
            ps.cards.some(c => c.id === extraData.targetCardId)
          )
          if (tSet && isSetComplete(tSet)) return state

          // Remove card from current player
          const sourceResult = removePropertyFromPlayer(player, extraData.sourceCardId)
          if (!sourceResult.card || !sourceResult.color) return state

          // Swap
          const updatedTarget = addPropertyToPlayer(targetResult.player, sourceResult.card, sourceResult.color)
          const updatedSource = addPropertyToPlayer(sourceResult.player, targetResult.card, targetResult.color)
          players[targetIdx] = updatedTarget
          players[state.currentPlayerIndex] = updatedSource

          const won = hasWon(updatedSource)
          newState.players = players
          newState.phase = won ? 'game_over' as GamePhase : state.phase
          newState.winnerId = won ? player.id : null
          newState.log = [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} forced a deal with ${target.name}`,
          }]
          break
        }

        case 'deal_breaker': {
          if (!targetPlayerId || !extraData?.targetColor) return state
          const targetIdx = players.findIndex(p => p.id === targetPlayerId)
          newState.pendingAction = {
            type: 'deal_breaker',
            sourcePlayerId: player.id,
            targetPlayerIds: [targetPlayerId],
            card,
            propertyColor: extraData.targetColor,
          }
          newState.respondingPlayerIndex = targetIdx
          newState.phase = 'respond' as GamePhase
          newState.log = [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} played Deal Breaker on ${players[targetIdx].name}'s ${extraData.targetColor} set!`,
          }]
          break
        }

        case 'house': {
          if (!extraData?.targetColor) return state
          const setIdx = player.properties.findIndex(ps => ps.color === extraData.targetColor && isSetComplete(ps) && !ps.hasHouse)
          if (setIdx === -1) return state
          player.properties = player.properties.map((ps, i) =>
            i === setIdx ? { ...ps, hasHouse: true } : ps
          )
          // Remove from discard since house stays on property
          newState.discardPile = state.discardPile
          newState.log = [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} added a House to their ${extraData.targetColor} set`,
          }]
          break
        }

        case 'hotel': {
          if (!extraData?.targetColor) return state
          const setIdx = player.properties.findIndex(ps => ps.color === extraData.targetColor && isSetComplete(ps) && ps.hasHouse && !ps.hasHotel)
          if (setIdx === -1) return state
          player.properties = player.properties.map((ps, i) =>
            i === setIdx ? { ...ps, hasHotel: true } : ps
          )
          newState.discardPile = state.discardPile
          newState.log = [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} added a Hotel to their ${extraData.targetColor} set`,
          }]
          break
        }

        default:
          newState.log = [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} played ${card.name}`,
          }]
      }

      return newState as GameState
    })
  },

  playRentCard: (cardId: string, color: PropertyColor, doubleCardId?: string) => {
    set(state => {
      const players = state.players.map(p => ({ ...p, properties: p.properties.map(ps => ({ ...ps, cards: [...ps.cards] })) }))
      const player = players[state.currentPlayerIndex]

      // Remove rent card from hand
      const card = player.hand.find(c => c.id === cardId)
      if (!card) return state
      player.hand = player.hand.filter(c => c.id !== cardId)

      let actionsUsed = 1
      let doubled = false

      // Remove double card if present
      if (doubleCardId) {
        const doubleCard = player.hand.find(c => c.id === doubleCardId)
        if (doubleCard) {
          player.hand = player.hand.filter(c => c.id !== doubleCardId)
          actionsUsed = 2
          doubled = true
        }
      }

      // Calculate rent
      const propertySet = player.properties.find(ps => ps.color === color)
      if (!propertySet || propertySet.cards.length === 0) return state

      let rent = calculateRent(color, propertySet.cards.length, propertySet.hasHouse, propertySet.hasHotel)
      if (doubled) rent *= 2

      const isWildRent = card.rentColors && card.rentColors.length > 5
      const targetIds = isWildRent
        ? [players[(state.currentPlayerIndex + 1) % players.length].id] // Wild rent = choose 1 target (simplified for now)
        : players.filter(p => p.id !== player.id).map(p => p.id)

      const firstTargetIdx = players.findIndex(p => p.id === targetIds[0])

      return {
        players,
        actionsPlayedThisTurn: state.actionsPlayedThisTurn + actionsUsed,
        discardPile: [...state.discardPile, card],
        pendingAction: {
          type: 'rent',
          sourcePlayerId: player.id,
          targetPlayerIds: targetIds,
          amount: rent,
          card,
          doubledRent: doubled,
          propertyColor: color,
        },
        respondingPlayerIndex: firstTargetIdx,
        phase: 'respond' as GamePhase,
        lastPlayedCard: card,
        log: [...state.log, {
          timestamp: Date.now(),
          playerId: player.id,
          message: `${player.name} charged $${rent}M rent for ${color}${doubled ? ' (DOUBLED!)' : ''}`,
        }],
      }
    })
  },

  respondToAction: (response: 'pay' | 'just_say_no', paymentCardIds?: string[]) => {
    set(state => {
      if (!state.pendingAction || state.respondingPlayerIndex === null) return state

      const players = state.players.map(p => ({ ...p, properties: p.properties.map(ps => ({ ...ps, cards: [...ps.cards] })) }))
      const respondingPlayer = players[state.respondingPlayerIndex]
      const sourcePlayer = players.find(p => p.id === state.pendingAction!.sourcePlayerId)!
      const sourceIdx = players.indexOf(sourcePlayer)

      if (response === 'just_say_no') {
        // Check if player has Just Say No
        const jsnIndex = respondingPlayer.hand.findIndex(c => c.actionType === 'just_say_no')
        if (jsnIndex === -1) return state

        const jsnCard = respondingPlayer.hand[jsnIndex]
        respondingPlayer.hand = respondingPlayer.hand.filter((_, i) => i !== jsnIndex)

        // Move to next target or end
        const remainingTargets = state.pendingAction.targetPlayerIds.filter(id => id !== respondingPlayer.id)
        if (remainingTargets.length === 0) {
          return {
            players,
            pendingAction: null,
            respondingPlayerIndex: null,
            phase: 'action' as GamePhase,
            discardPile: [...state.discardPile, jsnCard],
            log: [...state.log, {
              timestamp: Date.now(),
              playerId: respondingPlayer.id,
              message: `${respondingPlayer.name} played Just Say No!`,
            }],
          }
        }

        const nextTargetIdx = players.findIndex(p => p.id === remainingTargets[0])
        return {
          players,
          pendingAction: { ...state.pendingAction, targetPlayerIds: remainingTargets },
          respondingPlayerIndex: nextTargetIdx,
          discardPile: [...state.discardPile, jsnCard],
          log: [...state.log, {
            timestamp: Date.now(),
            playerId: respondingPlayer.id,
            message: `${respondingPlayer.name} played Just Say No!`,
          }],
        }
      }

      // PAY response
      if (response === 'pay') {
        const action = state.pendingAction

        if (action.type === 'deal_breaker' && action.propertyColor) {
          // Steal entire set
          const setIdx = respondingPlayer.properties.findIndex(ps => ps.color === action.propertyColor)
          if (setIdx !== -1) {
            const stolenSet = respondingPlayer.properties[setIdx]
            respondingPlayer.properties = respondingPlayer.properties.filter((_, i) => i !== setIdx)

            // Add to source player
            let updatedSource = sourcePlayer
            for (const card of stolenSet.cards) {
              updatedSource = addPropertyToPlayer(updatedSource, card, action.propertyColor!)
            }
            // Transfer house/hotel status
            const newSetIdx = updatedSource.properties.findIndex(ps => ps.color === action.propertyColor)
            if (newSetIdx !== -1) {
              updatedSource.properties[newSetIdx] = {
                ...updatedSource.properties[newSetIdx],
                hasHouse: stolenSet.hasHouse,
                hasHotel: stolenSet.hasHotel,
              }
            }
            players[sourceIdx] = updatedSource

            const won = hasWon(updatedSource)
            const remainingTargets = action.targetPlayerIds.filter(id => id !== respondingPlayer.id)

            return {
              players,
              pendingAction: remainingTargets.length > 0
                ? { ...action, targetPlayerIds: remainingTargets }
                : null,
              respondingPlayerIndex: remainingTargets.length > 0
                ? players.findIndex(p => p.id === remainingTargets[0])
                : null,
              phase: won
                ? 'game_over' as GamePhase
                : remainingTargets.length > 0 ? state.phase : 'action' as GamePhase,
              winnerId: won ? sourcePlayer.id : null,
              log: [...state.log, {
                timestamp: Date.now(),
                playerId: respondingPlayer.id,
                message: `${respondingPlayer.name}'s ${action.propertyColor} set was stolen!`,
              }],
            }
          }
        }

        // Money payment (rent, debt collector, birthday)
        if (action.amount && paymentCardIds) {
          let totalPaid = 0
          const paidCards: Card[] = []

          // Take from bank first
          for (const cid of paymentCardIds) {
            const bankIdx = respondingPlayer.bank.findIndex(c => c.id === cid)
            if (bankIdx !== -1) {
              paidCards.push(respondingPlayer.bank[bankIdx])
              totalPaid += respondingPlayer.bank[bankIdx].value
              respondingPlayer.bank = respondingPlayer.bank.filter(c => c.id !== cid)
            } else {
              // Check properties
              const result = removePropertyFromPlayer(respondingPlayer, cid)
              if (result.card) {
                paidCards.push(result.card)
                totalPaid += result.card.value
                respondingPlayer.properties = result.player.properties
              }
            }
          }

          // Add paid cards to source player's bank
          sourcePlayer.bank = [...sourcePlayer.bank, ...paidCards]

          const remainingTargets = action.targetPlayerIds.filter(id => id !== respondingPlayer.id)
          const nextTargetIdx = remainingTargets.length > 0
            ? players.findIndex(p => p.id === remainingTargets[0])
            : null

          return {
            players,
            pendingAction: remainingTargets.length > 0
              ? { ...action, targetPlayerIds: remainingTargets }
              : null,
            respondingPlayerIndex: nextTargetIdx,
            phase: remainingTargets.length > 0 ? state.phase : 'action' as GamePhase,
            log: [...state.log, {
              timestamp: Date.now(),
              playerId: respondingPlayer.id,
              message: `${respondingPlayer.name} paid $${totalPaid}M`,
            }],
          }
        }
      }

      return state
    })
  },

  resolveAction: () => {
    set({ pendingAction: null, respondingPlayerIndex: null, phase: 'action' })
  },

  discardCard: (cardId: string) => {
    set(state => {
      const players = state.players.map(p => ({ ...p }))
      const player = players[state.currentPlayerIndex]
      const card = player.hand.find(c => c.id === cardId)
      if (!card) return state

      player.hand = player.hand.filter(c => c.id !== cardId)

      // If still over 7, stay in discard phase
      if (player.hand.length > 7) {
        return {
          players,
          discardPile: [...state.discardPile, card],
          log: [...state.log, {
            timestamp: Date.now(),
            playerId: player.id,
            message: `${player.name} discarded ${card.name}`,
          }],
        }
      }

      // Move to next player
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
      return {
        players,
        discardPile: [...state.discardPile, card],
        currentPlayerIndex: nextIndex,
        phase: 'draw' as GamePhase,
        actionsPlayedThisTurn: 0,
        turnNumber: state.turnNumber + 1,
        log: [...state.log, {
          timestamp: Date.now(),
          playerId: player.id,
          message: `${player.name} discarded ${card.name} and ended their turn`,
        }],
      }
    })
  },

  movePropertyColor: (cardId: string, newColor: PropertyColor) => {
    set(state => {
      const players = state.players.map(p => ({ ...p, properties: p.properties.map(ps => ({ ...ps, cards: [...ps.cards] })) }))
      const player = players[state.currentPlayerIndex]

      const result = removePropertyFromPlayer(player, cardId)
      if (!result.card) return state

      const updated = addPropertyToPlayer(result.player, result.card, newColor)
      players[state.currentPlayerIndex] = updated

      const won = hasWon(updated)
      return {
        players,
        phase: won ? 'game_over' as GamePhase : state.phase,
        winnerId: won ? player.id : null,
      }
    })
  },
}))
