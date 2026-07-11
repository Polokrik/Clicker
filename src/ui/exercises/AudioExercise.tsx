import { useEffect, useState } from 'react'
import { matchTyped } from '../../engine/levenshtein'
import { speak, ttsAvailable } from '../../audio/tts'
import { STR } from '../../i18n/strings'
import type { ExerciseProps } from './types'

/**
 * Tier 4 — Audio : le TTS lit la phrase EN, le joueur saisit le chunk
 * manquant (§4). Fallback sans voix : la phrase complète est affichée
 * avec une icône barrée (§7).
 */
export function AudioExercise({ item, onAnswer }: ExerciseProps) {
  const [value, setValue] = useState('')
  const tts = ttsAvailable()
  const [before, after] = item.cloze.split('___')

  useEffect(() => {
    if (tts) speak(item.example)
  }, [item.id, item.example, tts])

  function submit() {
    if (!value.trim()) return
    const match = matchTyped(value, item.word)
    onAnswer({ correct: match !== 'wrong', fuzzy: match === 'fuzzy' })
  }

  return (
    <div className="exercise-card">
      <div className="exercise-prompt">{STR.exercises.audioPrompt}</div>
      {tts ? (
        <button className="listen-btn" onClick={() => speak(item.example)}>
          🔊 {STR.exercises.listen}
        </button>
      ) : (
        <div className="tts-off">🔇 {STR.exercises.noTts}</div>
      )}
      <div className="exercise-question">
        {tts ? (
          <>
            {before}
            <span className="blank">____</span>
            {after}
          </>
        ) : (
          // Sans TTS, l'exercice se rabat sur la saisie avec phrase visible.
          <>
            {before}
            <span className="blank">____</span>
            {after}
            <div className="exercise-hint" style={{ marginTop: 8 }}>
              {item.example_translation}
            </div>
          </>
        )}
      </div>
      <input
        className="type-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={STR.exercises.typePlaceholder}
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
