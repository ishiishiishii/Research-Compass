import { createContext, useContext } from 'react'

type TutorialContextValue = {
  openTutorial: () => void
  appEnabled: boolean
}

export const TutorialContext = createContext<TutorialContextValue | null>(null)

export function useTutorialContext() {
  const ctx = useContext(TutorialContext)
  if (!ctx) throw new Error('useTutorialContext must be used within TutorialProvider')
  return ctx
}
