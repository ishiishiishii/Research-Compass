import { useCallback, useState } from 'react'
import {
  isTutorialFinished,
  markTutorialDone,
  markTutorialSkipped,
} from '../lib/tutorial'

export type TutorialMode = 'closed' | 'initial' | 'manual'

export function useTutorial(userId: string | undefined) {
  const [manualOpen, setManualOpen] = useState(false)
  const [initialDismissed, setInitialDismissed] = useState(false)

  const finished = userId ? isTutorialFinished(userId) : true
  const showInitial = Boolean(userId && !finished && !initialDismissed)

  const mode: TutorialMode = manualOpen ? 'manual' : showInitial ? 'initial' : 'closed'

  const openTutorial = useCallback(() => setManualOpen(true), [])

  const completeTutorial = useCallback(() => {
    if (userId) markTutorialDone(userId)
    setManualOpen(false)
    setInitialDismissed(true)
  }, [userId])

  const skipTutorial = useCallback(() => {
    if (userId) markTutorialSkipped(userId)
    setManualOpen(false)
    setInitialDismissed(true)
  }, [userId])

  const closeTutorial = useCallback(() => setManualOpen(false), [])

  const appEnabled = finished || initialDismissed

  return {
    mode,
    isOverlayOpen: mode !== 'closed',
    isInitialTutorial: mode === 'initial',
    appEnabled,
    openTutorial,
    completeTutorial,
    skipTutorial,
    closeTutorial,
  }
}
