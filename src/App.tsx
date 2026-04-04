import { AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import SetupScreen from './components/SetupScreen'
import GameBoard from './components/GameBoard'

export default function App() {
  const phase = useGameStore(s => s.phase)

  return (
    <AnimatePresence mode="wait">
      {phase === 'setup' ? (
        <SetupScreen key="setup" />
      ) : (
        <GameBoard key="game" />
      )}
    </AnimatePresence>
  )
}
