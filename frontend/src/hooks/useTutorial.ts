import { useCallback, useState } from 'react'
import {
  isTutorialFinished,
  markTutorialDone,
  markTutorialSkipped,
} from '../lib/tutorial'

export type TutorialMode = 'closed' | 'initial' | 'manual'

export function useTutorial(userId: string | undefined) {
  const [manualOpen, setManualOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const finished = !userId || isTutorialFinished(userId)
  void refreshKey

  const showInitial = Boolean(userId && !finished)
  const mode: TutorialMode = manualOpen ? 'manual' : showInitial ? 'initial' : 'closed'

  const openTutorial = useCallback(() => setManualOpen(true), [])

  const bumpFinished = useCallback(() => setRefreshKey((k) => k + 1), [])

  const completeTutorial = useCallback(() => {
    if (userId) markTutorialDone(userId)
    setManualOpen(false)
    bumpFinished()
  }, [userId, bumpFinished])

  const skipTutorial = useCallback(() => {
    if (userId) markTutorialSkipped(userId)
    setManualOpen(false)
    bumpFinished()
  }, [userId, bumpFinished])

  const closeTutorial = useCallback(() => setManualOpen(false), [])

  const appEnabled = finished

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
