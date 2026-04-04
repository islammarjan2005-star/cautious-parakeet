import { Card, Player, PropertyColor, PropertySet, PROPERTY_SET_SIZES, RENT_AMOUNTS } from '../types/game'

export function getPropertySetForColor(player: Player, color: PropertyColor): PropertySet | undefined {
  return player.properties.find(ps => ps.color === color)
}

export function isSetComplete(set: PropertySet): boolean {
  const required = PROPERTY_SET_SIZES[set.color]
  return set.cards.length >= required
}

export function countCompleteSets(player: Player): number {
  return player.properties.filter(ps => isSetComplete(ps)).length
}

export function hasWon(player: Player): boolean {
  return countCompleteSets(player) >= 3
}

export function calculateRent(color: PropertyColor, propertyCount: number, hasHouse: boolean, hasHotel: boolean): number {
  const rents = RENT_AMOUNTS[color]
  const idx = Math.min(propertyCount - 1, rents.length - 1)
  let rent = rents[idx] || 0
  if (hasHouse) rent += 3
  if (hasHotel) rent += 4
  return rent
}

export function getTotalValue(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + c.value, 0)
}

export function getPlayerTotalWealth(player: Player): number {
  const bankValue = getTotalValue(player.bank)
  const propertyValue = player.properties.reduce((sum, ps) => {
    return sum + getTotalValue(ps.cards) + (ps.hasHouse ? 3 : 0) + (ps.hasHotel ? 4 : 0)
  }, 0)
  return bankValue + propertyValue
}

export function getAllPropertyCards(player: Player): Card[] {
  return player.properties.flatMap(ps => ps.cards)
}

export function canPlayCard(card: Card, player: Player, actionsPlayed: number): boolean {
  if (actionsPlayed >= 3) return false

  if (card.type === 'action' && card.actionType === 'house') {
    return player.properties.some(ps => isSetComplete(ps) && !ps.hasHouse)
  }
  if (card.type === 'action' && card.actionType === 'hotel') {
    return player.properties.some(ps => isSetComplete(ps) && ps.hasHouse && !ps.hasHotel)
  }
  if (card.type === 'action' && card.actionType === 'double_the_rent') {
    return false // Can only be played alongside rent
  }

  return true
}

export function addPropertyToPlayer(player: Player, card: Card, color: PropertyColor): Player {
  const updatedProperties = [...player.properties]
  let existingSet = updatedProperties.find(ps => ps.color === color)

  if (!existingSet) {
    existingSet = { color, cards: [], isComplete: false, hasHouse: false, hasHotel: false }
    updatedProperties.push(existingSet)
  }

  const setIndex = updatedProperties.indexOf(existingSet)
  const updatedSet = {
    ...existingSet,
    cards: [...existingSet.cards, card],
  }
  updatedSet.isComplete = updatedSet.cards.length >= PROPERTY_SET_SIZES[color]
  updatedProperties[setIndex] = updatedSet

  return { ...player, properties: updatedProperties }
}

export function removePropertyFromPlayer(player: Player, cardId: string): { player: Player; card: Card | null; color: PropertyColor | null } {
  let removedCard: Card | null = null
  let removedColor: PropertyColor | null = null

  const updatedProperties = player.properties.map(ps => {
    const cardIndex = ps.cards.findIndex(c => c.id === cardId)
    if (cardIndex !== -1) {
      removedCard = ps.cards[cardIndex]
      removedColor = ps.color
      const newCards = ps.cards.filter(c => c.id !== cardId)
      return {
        ...ps,
        cards: newCards,
        isComplete: newCards.length >= PROPERTY_SET_SIZES[ps.color],
        hasHouse: newCards.length < PROPERTY_SET_SIZES[ps.color] ? false : ps.hasHouse,
        hasHotel: newCards.length < PROPERTY_SET_SIZES[ps.color] ? false : ps.hasHotel,
      }
    }
    return ps
  }).filter(ps => ps.cards.length > 0)

  return { player: { ...player, properties: updatedProperties }, card: removedCard, color: removedColor }
}

export function findCardInHand(player: Player, cardId: string): Card | undefined {
  return player.hand.find(c => c.id === cardId)
}

export function getAvailableColors(card: Card): PropertyColor[] {
  if (card.type === 'wild_multicolor') {
    return Object.keys(PROPERTY_SET_SIZES) as PropertyColor[]
  }
  if (card.type === 'wild_property' && card.colors) {
    return card.colors
  }
  if (card.color) return [card.color]
  return []
}
