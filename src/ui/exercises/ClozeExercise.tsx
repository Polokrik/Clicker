import { useMemo } from 'react'
import { buildChoices } from '../../engine/exercise'
import { activePack } from '../../content'
import { STR } from '../../i18n/strings'
import type { ExerciseProps } from './types'

/** Tier 1 — Cloze : phrase EN à trou, 4 choix (§4). */
export function ClozeExercise({ item, onAnswer }: ExerciseProps) {
  const choices = useMemo(() => {
    // Distracteurs dédiés d'abord, complétés depuis le pool global.
    const pool = [
      ...item.distractor_tiles,
      ...Object.values(activePack.items)
        .filter((i) => i.id !== item.id)
        .map((i) => i.word),
    ]
    return buildChoices(item.word, pool, 3)
  }, [item.id, item.word, item.distractor_tiles])

  const [before, after] = item.cloze.split('___')

  return (
    <div className="exercise-card">
      <div className="exercise-prompt">{STR.exercises.clozePrompt}</div>
      <div className="exercise-question">
        {before}
        <span className="blank">____</span>
        {after}
      </div>
      <div className="exercise-hint">{item.example_translation}</div>
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
