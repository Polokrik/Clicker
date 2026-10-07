import { useCallback, useEffect, useState } from 'react'
import { useGame } from '../../store/gameStore'
import { activePack } from '../../content'
import { heat } from '../../engine/scheduler'
import { STR } from '../../i18n/strings'
import { ExerciseView } from '../exercises/ExerciseView'
import type { ExerciseResult } from '../exercises/types'
import { FeedbackCard, type Feedback } from '../components/FeedbackCard'
import { SparkBurst } from '../components/SparkBurst'
import { Ingot } from '../components/Ingot'

/** Écran principal : la Frappe (§2, boucle courte). */
export function ForgeScreen({ onOpenVeins }: { onOpenVeins: () => void }) {
  const { queue, exercise, servedAt, combo, player, answerForge, refreshQueue, startLesson } =
    useGame()
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [burst, setBurst] = useState(0)

  // Tout premier lancement : aucun lingot, aucune veine terminée → un seul tap pour démarrer.
  const firstVein =
    Object.keys(player.items).length === 0 && player.completedVeins.length === 0
      ? (player.unlockedVeins.map((id) => activePack.veins[id]).find(Boolean) ?? null)
      : null

  const head = queue[0]
  const item = head ? activePack.items[head.id] : null
  const itemState = head ? player.items[head.id] : null

  // Forge au repos : re-vérifie régulièrement si des items redeviennent dus.
  useEffect(() => {
    if (head || feedback) return
    const interval = setInterval(refreshQueue, 15_000)
    return () => clearInterval(interval)
  }, [head, feedback, refreshQueue])

  const handleAnswer = useCallback(
    (result: ExerciseResult) => {
      if (!item) return
      const elapsedMs = Date.now() - servedAt
      const { grade, sparks } = answerForge({ ...result, elapsedMs })
      if (result.correct) setBurst((b) => b + 1)
      setFeedback({ grade, sparks, correct: result.correct, item })
    },
    [item, servedAt, answerForge],
  )

  return (
    <div className="screen">
      <SparkBurst trigger={burst} />
      {item && itemState && (
        <div className="forge-status">
          <span>{STR.tierNames[itemState.tier]}</span>
          <div className="heatbar">
            <div
              style={{
                width: `${heat(itemState.fsrs)}%`,
                background: 'linear-gradient(90deg, var(--ember-600), var(--gold-300))',
              }}
            />
          </div>
          <span className="combo">{combo > 1 ? `×${combo} ${STR.forge.combo}` : ''}</span>
        </div>
      )}

      {feedback ? (
        <FeedbackCard feedback={feedback} onContinue={() => setFeedback(null)} />
      ) : item && exercise ? (
        <ExerciseView
          key={`${item.id}-${servedAt}`}
          exercise={exercise}
          item={item}
          onAnswer={handleAnswer}
        />
      ) : (
        <div className="resting">
          <Ingot heat={8} height={44} />
          {firstVein ? (
            <>
              <h2 style={{ marginTop: 18 }}>{STR.forge.firstTitle}</h2>
              <p>{STR.forge.firstHint}</p>
              <button className="primary-btn" onClick={() => startLesson(firstVein.id)}>
                {STR.forge.firstVein}
              </button>
              <p style={{ marginTop: 14 }}>{firstVein.name}</p>
            </>
          ) : (
            <>
              <h2 style={{ marginTop: 18 }}>{STR.forge.resting}</h2>
              <p>{STR.forge.restingHint}</p>
              <button className="primary-btn" onClick={onOpenVeins}>
                {STR.forge.openVein}
              </button>
              <p style={{ marginTop: 14 }}>{STR.forge.close}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
