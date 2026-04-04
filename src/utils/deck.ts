import { Card, PropertyColor } from '../types/game'

let cardIdCounter = 0
function makeId(): string {
  return `card_${++cardIdCounter}`
}

function moneyCard(value: number): Card {
  return { id: makeId(), type: 'money', name: `$${value}M`, value }
}

function propertyCard(name: string, color: PropertyColor, value: number): Card {
  return { id: makeId(), type: 'property', name, color, value }
}

function wildPropertyCard(name: string, colors: PropertyColor[], value: number): Card {
  return { id: makeId(), type: 'wild_property', name, colors, color: colors[0], value }
}

function wildMulticolorCard(): Card {
  return { id: makeId(), type: 'wild_multicolor', name: 'Wild Property', colors: [], value: 0 }
}

function actionCard(name: string, actionType: Card['actionType'], value: number): Card {
  return { id: makeId(), type: 'action', name, actionType, value }
}

function rentCard(colors: PropertyColor[], value: number): Card {
  const names = colors.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join('/')
  return {
    id: makeId(),
    type: 'rent',
    name: `Rent: ${names}`,
    actionType: undefined,
    rentColors: colors,
    value,
  }
}

export function createDeck(): Card[] {
  cardIdCounter = 0
  const cards: Card[] = []

  // === MONEY CARDS (20 total) ===
  for (let i = 0; i < 6; i++) cards.push(moneyCard(1))
  for (let i = 0; i < 5; i++) cards.push(moneyCard(2))
  for (let i = 0; i < 3; i++) cards.push(moneyCard(3))
  for (let i = 0; i < 3; i++) cards.push(moneyCard(4))
  for (let i = 0; i < 2; i++) cards.push(moneyCard(5))
  cards.push(moneyCard(10))

  // === PROPERTY CARDS (28 total) ===
  // Brown (2)
  cards.push(propertyCard('Mediterranean Ave', 'brown', 1))
  cards.push(propertyCard('Baltic Ave', 'brown', 1))

  // Teal / Light Blue - mapped to 'sky' (3)
  cards.push(propertyCard('Oriental Ave', 'sky', 1))
  cards.push(propertyCard('Vermont Ave', 'sky', 1))
  cards.push(propertyCard('Connecticut Ave', 'sky', 1))

  // Pink (3)
  cards.push(propertyCard('St. Charles Place', 'pink', 2))
  cards.push(propertyCard('States Ave', 'pink', 2))
  cards.push(propertyCard('Virginia Ave', 'pink', 2))

  // Orange (3)
  cards.push(propertyCard('St. James Place', 'orange', 2))
  cards.push(propertyCard('Tennessee Ave', 'orange', 2))
  cards.push(propertyCard('New York Ave', 'orange', 2))

  // Red (3)
  cards.push(propertyCard('Kentucky Ave', 'red', 3))
  cards.push(propertyCard('Indiana Ave', 'red', 3))
  cards.push(propertyCard('Illinois Ave', 'red', 3))

  // Yellow (3)
  cards.push(propertyCard('Atlantic Ave', 'yellow', 3))
  cards.push(propertyCard('Ventnor Ave', 'yellow', 3))
  cards.push(propertyCard('Marvin Gardens', 'yellow', 3))

  // Green (3)
  cards.push(propertyCard('Pacific Ave', 'green', 4))
  cards.push(propertyCard('N. Carolina Ave', 'green', 4))
  cards.push(propertyCard('Pennsylvania Ave', 'green', 4))

  // Blue (2)
  cards.push(propertyCard('Park Place', 'blue', 4))
  cards.push(propertyCard('Boardwalk', 'blue', 4))

  // Railroad (4)
  cards.push(propertyCard('Reading Railroad', 'railroad', 2))
  cards.push(propertyCard('Pennsylvania RR', 'railroad', 2))
  cards.push(propertyCard('B&O Railroad', 'railroad', 2))
  cards.push(propertyCard('Short Line RR', 'railroad', 2))

  // Utility (2)
  cards.push(propertyCard('Electric Company', 'utility', 2))
  cards.push(propertyCard('Water Works', 'utility', 2))

  // === WILD PROPERTY CARDS (11 total) ===
  cards.push(wildPropertyCard('Wild: Red/Yellow', ['red', 'yellow'], 3))
  cards.push(wildPropertyCard('Wild: Blue/Green', ['blue', 'green'], 4))
  cards.push(wildPropertyCard('Wild: Pink/Orange', ['pink', 'orange'], 2))
  cards.push(wildPropertyCard('Wild: Railroad/Green', ['railroad', 'green'], 4))
  cards.push(wildPropertyCard('Wild: Railroad/Sky', ['railroad', 'sky'], 4))
  cards.push(wildPropertyCard('Wild: Railroad/Utility', ['railroad', 'utility'], 2))
  cards.push(wildPropertyCard('Wild: Brown/Sky', ['brown', 'sky'], 1))
  cards.push(wildPropertyCard('Wild: Green/Railroad', ['green', 'railroad'], 4))
  cards.push(wildPropertyCard('Wild: Orange/Purple', ['orange', 'purple'], 2))

  // Multicolor wilds (2)
  cards.push(wildMulticolorCard())
  cards.push(wildMulticolorCard())

  // === ACTION CARDS (34 total) ===
  // Pass Go (10) - Draw 2 cards
  for (let i = 0; i < 10; i++) cards.push(actionCard('Pass Go', 'pass_go', 1))

  // Deal Breaker (2) - Steal a complete set
  for (let i = 0; i < 2; i++) cards.push(actionCard('Deal Breaker', 'deal_breaker', 5))

  // Sly Deal (3) - Steal a property
  for (let i = 0; i < 3; i++) cards.push(actionCard('Sly Deal', 'sly_deal', 3))

  // Forced Deal (4) - Swap a property
  for (let i = 0; i < 4; i++) cards.push(actionCard('Forced Deal', 'forced_deal', 3))

  // Debt Collector (3) - Charge $5M
  for (let i = 0; i < 3; i++) cards.push(actionCard('Debt Collector', 'debt_collector', 3))

  // It's My Birthday (3) - Everyone pays $2M
  for (let i = 0; i < 3; i++) cards.push(actionCard("It's My Birthday", 'its_my_birthday', 2))

  // Just Say No (3)
  for (let i = 0; i < 3; i++) cards.push(actionCard('Just Say No', 'just_say_no', 4))

  // House (3)
  for (let i = 0; i < 3; i++) cards.push(actionCard('House', 'house', 3))

  // Hotel (2)
  for (let i = 0; i < 2; i++) cards.push(actionCard('Hotel', 'hotel', 4))

  // Double The Rent (2)
  for (let i = 0; i < 2; i++) cards.push(actionCard('Double The Rent', 'double_the_rent', 1))

  // === RENT CARDS (13 total) ===
  for (let i = 0; i < 2; i++) cards.push(rentCard(['blue', 'green'], 1))
  for (let i = 0; i < 2; i++) cards.push(rentCard(['red', 'yellow'], 1))
  for (let i = 0; i < 2; i++) cards.push(rentCard(['pink', 'orange'], 1))
  for (let i = 0; i < 2; i++) cards.push(rentCard(['railroad', 'utility'], 1))
  for (let i = 0; i < 2; i++) cards.push(rentCard(['brown', 'sky'], 1))
  for (let i = 0; i < 3; i++) cards.push(rentCard(['blue', 'green', 'red', 'yellow', 'orange', 'pink', 'brown', 'sky', 'railroad', 'utility', 'purple', 'teal'], 3))

  return cards
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
