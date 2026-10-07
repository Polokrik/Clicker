import { useMemo, useState } from 'react'
import { buildChoices } from '../../engine/exercise'
import { STR } from '../../i18n/strings'
import type { ExerciseProps } from './types'

/**
 * « Repère l'erreur » : la phrase est soit correcte, soit contient une faute type
 * (le trou du cloze rempli avec une mauvaise réponse). Si c'est une faute, il faut
 * aussi choisir la bonne forme.
 */
export function SpotExercise({ item, onAnswer }: ExerciseProps) {
  const { sentence, hasError } = useMemo(() => {
    const showError = Math.random() < 0.65
    if (!showError) return { sentence: item.example, hasError: false }
    const wrong = item.wrong[Math.floor(Math.random() * item.wrong.length)]
    return { sentence: item.cloze.replace('___', wrong), hasError: true }
  }, [item])
  const [step, setStep] = useState<'judge' | 'fix'>('judge')
  const choices = useMemo(
    () => buildChoices(item.word, item.wrong.length >= 3 ? item.wrong : [...item.wrong, ...item.distractor_tiles], 3),
    [item],
  )

  function judge(saysError: boolean) {
    if (saysError !== hasError) return onAnswer({ correct: false })
    if (!hasError) return onAnswer({ correct: true })
    setStep('fix')
  }

  const [before, after] = item.cloze.split('___')

  return (
    <div className="exercise-card">
      {step === 'judge' ? (
        <>
          <div className="exercise-prompt">{STR.exercises.spotPrompt}</div>
          <div className="exercise-question">{sentence}</div>
          <div className="exercise-hint">{item.translation}</div>
          <div className="choices two">
            <button onClick={() => judge(false)}>✓ {STR.exercises.spotCorrect}</button>
            <button onClick={() => judge(true)}>✗ {STR.exercises.spotMistake}</button>
          </div>
        </>
      ) : (
        <>
          <div className="exercise-prompt">{STR.exercises.spotFix}</div>
          <div className="exercise-question">
            {before}
            <span className="blank">____</span>
            {after}
          </div>
          <div className="choices">
            {choices.map((c) => (
              <button key={c} onClick={() => onAnswer({ correct: c === item.word })}>
                {c}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
