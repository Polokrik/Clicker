import { useState } from 'react'
import { matchTyped } from '../../engine/levenshtein'
import { STR, typePromptText } from '../../i18n/strings'
import type { ExerciseProps } from './types'

/** Tier 2 — Saisie clavier EN, tolérance typo Levenshtein ≤ 1 (§4). */
export function TypeExercise({ item, onAnswer }: ExerciseProps) {
  const [value, setValue] = useState('')
  const [before, after] = item.cloze.split('___')

  function submit() {
    if (!value.trim()) return
    const match = matchTyped(value, item.word, item.strict)
    onAnswer({ correct: match !== 'wrong', fuzzy: match === 'fuzzy' })
  }

  return (
    <div className="exercise-card">
      <div className="exercise-prompt">{typePromptText()}</div>
      <div className="exercise-question">« {item.translation} »</div>
      <div className="exercise-hint">
        {before}
        <span className="blank">____</span>
        {after}
      </div>
      <input
        className="type-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={STR.exercises.typePlaceholder}
        autoFocus
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      <button className="primary-btn" disabled={!value.trim()} onClick={submit}>
        {STR.exercises.validate}
      </button>
    </div>
  )
}
