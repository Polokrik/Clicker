import { useCallback, useState } from 'react'
import { useGame, VEIN_COMPLETE_BONUS } from '../../store/gameStore'
import { activePack } from '../../content'
import { speak, ttsAvailable } from '../../audio/tts'
import { STR } from '../../i18n/strings'
import { ExerciseView } from '../exercises/ExerciseView'
import type { ExerciseResult } from '../exercises/types'
import { FeedbackCard, type Feedback } from '../components/FeedbackCard'
import { SparkBurst } from '../components/SparkBurst'

/**
 * Une veine en 3 phases (§5.1) : Prospection (input, sans test) →
 * Extraction (drill QCM puis cloze) → Versement (file FSRS globale).
 */
export function LessonScreen() {
  const { lesson, prospectGo, beginExtraction, answerDrill, quitLesson, servedAt } =
    useGame()
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [burst, setBurst] = useState(0)
  const [done, setDone] = useState(false)

  const vein = lesson ? activePack.veins[lesson.veinId] : null

  const handleAnswer = useCallback(
    (result: ExerciseResult) => {
      if (!lesson || !vein) return
      const entry = lesson.drillQueue[0]
      const item = activePack.items[entry.itemId]
      const elapsedMs = Date.now() - servedAt
      const { grade, sparks, lessonDone } = answerDrill({ ...result, elapsedMs })
      if (result.correct) setBurst((b) => b + 1)
      setFeedback({ grade, sparks, correct: result.correct, item })
      if (lessonDone) setDone(true)
    },
    [lesson, vein, servedAt, answerDrill],
  )

  // Écran de fin de veine (le store a déjà vidé `lesson`).
  if (done) {
    return (
      <div className="screen">
        <div className="resting">
          <h2>⛏ {STR.lesson.done}</h2>
          <p>{STR.lesson.doneHint}</p>
          <div className="feedback ok" style={{ marginBottom: 16 }}>
            <div className="gain">
              +{VEIN_COMPLETE_BONUS} ✦ · {STR.lesson.bonus}
            </div>
          </div>
          <button className="primary-btn" onClick={() => setDone(false)}>
            {STR.forge.continue}
          </button>
        </div>
      </div>
    )
  }

  if (!lesson || !vein) return null

  if (lesson.phase === 'prospect') {
    const item = vein.items[lesson.index]
    const last = lesson.index === vein.items.length - 1
    return (
      <div className="screen">
        <div className="lesson-header">
          <span className="phase">
            ⛏ {vein.name} — {STR.lesson.prospect}
          </span>
          <button className="quit" onClick={quitLesson}>
            ✕ {STR.lesson.quit}
          </button>
        </div>

        <div className="pattern-banner">
          <div className="p-title">{STR.lesson.grammarNote}</div>
          <div className="p-pattern">{vein.pattern}</div>
          <div className="p-note">{vein.pattern_note}</div>
        </div>

        <div className="prospect-card">
          <div className="chunk">{item.chunk}</div>
          <div className="translation">{item.translation}</div>
          {ttsAvailable() && (
            <button className="listen-btn" onClick={() => speak(item.example)}>
              🔊 {STR.exercises.listen}
            </button>
          )}
          <div className="example">{item.example}</div>
          <div className="example-fr">{item.example_translation}</div>
          {item.notes && <div className="notes">{item.notes}</div>}
        </div>

        <div className="lesson-nav">
          <button
            className="ghost-btn"
            disabled={lesson.index === 0}
            onClick={() => prospectGo(-1)}
          >
            ← {STR.lesson.prev}
          </button>
          {last ? (
            <button className="primary-btn" onClick={beginExtraction}>
              🔥 {STR.lesson.startDrill}
            </button>
          ) : (
            <button className="primary-btn" onClick={() => prospectGo(1)}>
              {STR.lesson.next} →
            </button>
          )}
        </div>
        <div className="lesson-progress">
          {STR.lesson.card} {lesson.index + 1} {STR.lesson.of} {vein.items.length}
        </div>
      </div>
    )
  }

  // Phase extraction
  const entry = lesson.drillQueue[0]
  const item = entry ? activePack.items[entry.itemId] : null
  const total = vein.items.length * 2
  const remaining = lesson.drillQueue.length

  return (
    <div className="screen">
      <SparkBurst trigger={burst} />
      <div className="lesson-header">
        <span className="phase">
          🔥 {vein.name} — {STR.lesson.extract}
        </span>
        <button className="quit" onClick={quitLesson}>
          ✕ {STR.lesson.quit}
        </button>
      </div>

      {feedback ? (
        <FeedbackCard feedback={feedback} onContinue={() => setFeedback(null)} />
      ) : item && entry ? (
        <ExerciseView
          key={`${entry.itemId}-${entry.exercise}-${servedAt}`}
          exercise={entry.exercise}
          item={item}
          onAnswer={handleAnswer}
        />
      ) : null}

      <div className="lesson-progress">
        {Math.max(0, total - remaining)} / {total}
      </div>
    </div>
  )
}
