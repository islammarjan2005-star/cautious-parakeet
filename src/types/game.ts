// ============================================================
// MONOPOLY DEAL - Complete Type Definitions
// ============================================================

export type PropertyColor =
  | 'red' | 'blue' | 'green' | 'yellow' | 'orange'
  | 'purple' | 'brown' | 'teal' | 'pink' | 'sky'
  | 'railroad' | 'utility'

export type CardType = 'money' | 'property' | 'action' | 'rent' | 'wild_property' | 'wild_multicolor'

export type ActionType =
  | 'pass_go' | 'deal_breaker' | 'sly_deal' | 'forced_deal'
  | 'debt_collector' | 'its_my_birthday' | 'just_say_no'
  | 'house' | 'hotel' | 'double_the_rent'

export interface Card {
  id: string
  type: CardType
  name: string
  value: number // Money value of the card
  actionType?: ActionType
  color?: PropertyColor
  colors?: PropertyColor[] // For wild property cards
  rentValues?: number[] // For rent cards, which colors they apply to
  rentColors?: PropertyColor[]
}

export interface PropertySet {
  color: PropertyColor
  cards: Card[]
  isComplete: boolean
  hasHouse: boolean
  hasHotel: boolean
}

export interface Player {
  id: string
  name: string
  avatar: string
  hand: Card[]
  bank: Card[]
  properties: PropertySet[]
  isAI: boolean
}

export type GamePhase =
  | 'setup'       // Game lobby
  | 'playing'     // Main gameplay
  | 'draw'        // Player draws cards
  | 'action'      // Player plays cards (up to 3 per turn)
  | 'respond'     // Another player must respond (e.g., Just Say No, pay rent)
  | 'discard'     // Player must discard down to 7 cards
  | 'game_over'   // Someone won

export interface PendingAction {
  type: ActionType | 'rent'
  sourcePlayerId: string
  targetPlayerIds: string[]
  amount?: number
  card: Card
  doubledRent?: boolean
  propertyColor?: PropertyColor
  // For forced deal / sly deal
  sourcePropertyCard?: Card
  targetPropertyCard?: Card
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  currentPlayerIndex: number
  drawPile: Card[]
  discardPile: Card[]
  actionsPlayedThisTurn: number
  maxActionsPerTurn: number
  pendingAction: PendingAction | null
  respondingPlayerIndex: number | null
  winnerId: string | null
  turnNumber: number
  lastPlayedCard: Card | null
  log: GameLogEntry[]
}

export interface GameLogEntry {
  timestamp: number
  playerId: string
  message: string
  cardId?: string
}

// Property set requirements
export const PROPERTY_SET_SIZES: Record<PropertyColor, number> = {
  brown: 2,
  teal: 2,
  utility: 2,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  blue: 2,
  purple: 3,
  sky: 3,
  railroad: 4,
}

// Rent amounts per property color based on set size
export const RENT_AMOUNTS: Record<PropertyColor, number[]> = {
  brown:    [1, 2],
  teal:     [1, 2],
  utility:  [1, 2],
  pink:     [1, 2, 4],
  orange:   [1, 3, 5],
  red:      [2, 3, 6],
  yellow:   [2, 4, 6],
  green:    [2, 4, 7],
  blue:     [3, 8],
  purple:   [1, 2, 4],
  sky:      [1, 2, 3],
  railroad: [1, 2, 3, 4],
}

export const COLOR_DISPLAY_NAMES: Record<PropertyColor, string> = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  yellow: 'Yellow',
  orange: 'Orange',
  purple: 'Purple',
  brown: 'Brown',
  teal: 'Teal',
  pink: 'Pink',
  sky: 'Light Blue',
  railroad: 'Railroad',
  utility: 'Utility',
}

export const PROPERTY_NAMES: Record<PropertyColor, string[]> = {
  brown:    ['Mediterranean Ave', 'Baltic Ave'],
  teal:     ['Oriental Ave', 'Vermont Ave', 'Connecticut Ave'],
  pink:     ['St. Charles Place', 'States Ave', 'Virginia Ave'],
  orange:   ['St. James Place', 'Tennessee Ave', 'New York Ave'],
  red:      ['Kentucky Ave', 'Indiana Ave', 'Illinois Ave'],
  yellow:   ['Atlantic Ave', 'Ventnor Ave', 'Marvin Gardens'],
  green:    ['Pacific Ave', 'N. Carolina Ave', 'Pennsylvania Ave'],
  blue:     ['Park Place', 'Boardwalk'],
  purple:   ['Pacific Ave', 'N. Carolina Ave', 'Pennsylvania Ave'],
  sky:      ['Oriental Ave', 'Vermont Ave', 'Connecticut Ave'],
  railroad: ['Reading RR', 'Pennsylvania RR', 'B&O RR', 'Short Line RR'],
  utility:  ['Electric Company', 'Water Works'],
}

export function getPlayerInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export const PLAYER_AVATARS = ['\u{1F98A}', '\u{1F438}', '\u{1F981}', '\u{1F419}', '\u{1F984}']

export const PLAYER_COLORS = [
  '#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0',
]
