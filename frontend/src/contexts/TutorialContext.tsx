import { type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTutorial } from '../hooks/useTutorial'
import { TutorialContext } from '../hooks/useTutorialContext'
import { TutorialOverlay } from '../components/tutorial/TutorialOverlay'

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const tutorial = useTutorial(user?.id)

  return (
    <TutorialContext.Provider
      value={{ openTutorial: tutorial.openTutorial, appEnabled: tutorial.appEnabled }}
    >
      {tutorial.isOverlayOpen && (
        <TutorialOverlay
          allowSkip={tutorial.isInitialTutorial}
          onComplete={tutorial.completeTutorial}
          onSkip={tutorial.skipTutorial}
          onClose={tutorial.isInitialTutorial ? undefined : tutorial.closeTutorial}
        />
      )}
      <div
        className={
          tutorial.isInitialTutorial
            ? 'pointer-events-none select-none opacity-40 blur-[1px]'
            : undefined
        }
        aria-hidden={tutorial.isInitialTutorial}
      >
        {children}
      </div>
    </TutorialContext.Provider>
  )
}
