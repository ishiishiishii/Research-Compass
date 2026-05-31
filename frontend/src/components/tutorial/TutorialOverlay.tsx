import { useState } from 'react'
import { TUTORIAL_STEPS } from '../../lib/tutorial'
import { TutorialVisual } from './TutorialVisual'

type TutorialOverlayProps = {
  allowSkip: boolean
  onComplete: () => void
  onSkip: () => void
  onClose?: () => void
}

export function TutorialOverlay({
  allowSkip,
  onComplete,
  onSkip,
  onClose,
}: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0)

  const step = TUTORIAL_STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === TUTORIAL_STEPS.length - 1

  function goNext() {
    if (isLast) {
      onComplete()
      return
    }
    setStepIndex((i) => i + 1)
  }

  function goBack() {
    if (!isFirst) setStepIndex((i) => i - 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
      >
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-600">
              チュートリアル {stepIndex + 1} / {TUTORIAL_STEPS.length}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                閉じる
              </button>
            )}
          </div>
          <h2 id="tutorial-title" className="mt-2 text-xl font-semibold text-slate-900">
            {step.title}
          </h2>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TutorialVisual stepId={step.id} />
          <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {allowSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                スキップ
              </button>
            )}
            {!isFirst && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                戻る
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {isLast ? 'はじめる' : '次へ'}
          </button>
        </div>
      </div>
    </div>
  )
}
