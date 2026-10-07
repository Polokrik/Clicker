import { useMemo } from 'react'
import { buildChoices } from '../../engine/exercise'
import { activePack } from '../../content'
import { STR } from '../../i18n/strings'
import type { ExerciseProps } from './types'

/** Tier 0 — QCM reconnaissance FR→EN, 4 choix (§4). */
export function QcmExercise({ item, onAnswer }: ExerciseProps) {
  const choices = useMemo(() => {
    if (item.wrong.length >= 3) return buildChoices(item.word, item.wrong, 3)
    const pool = Object.values(activePack.items)
      .filter((i) => i.id !== item.id)
      .map((i) => i.word)
    return buildChoices(item.word, pool, 3)
  }, [item.id, item.word, item.wrong])

  return (
    <div className="exercise-card">
      <div className="exercise-prompt">{STR.exercises.qcmPrompt}</div>
      <div className="exercise-question">« {item.translation} »</div>
      <div className="choices">
        {choices.map((choice) => (
          <button key={choice} onClick={() => onAnswer({ correct: choice === item.word })}>
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}
