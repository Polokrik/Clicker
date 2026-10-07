import { useMemo, useState } from 'react'
import { useGame } from '../../store/gameStore'
import { activePack } from '../../content'
import { STR } from '../../i18n/strings'
import { estimateLevel, type Cefr } from '../../engine/mastery'
import { QcmExercise } from '../exercises/QcmExercise'

interface Question {
  itemId: string
  veinId: string
}

/** 2 questions par règle (1 si le pack en compte beaucoup), mélangées. */
function buildQuestions(rng: () => number = Math.random): Question[] {
  const veins = Object.values(activePack.veins)
  const perVein = veins.length <= 8 ? 2 : 1
  const questions: Question[] = []
  for (const vein of veins) {
    const ids = [...vein.items.map((i) => i.id)].sort(() => rng() - 0.5).slice(0, perVein)
    for (const itemId of ids) questions.push({ itemId, veinId: vein.id })
  }
  return questions.sort(() => rng() - 0.5)
}

type Phase = 'intro' | 'quiz' | 'result'

/** Test de niveau : détecte les erreurs types par règle, sans toucher à la mémoire FSRS. */
export function PlacementScreen({ onClose }: { onClose: () => void }) {
  const { player, finishPlacement, startLesson } = useGame()
  const [phase, setPhase] = useState<Phase>('intro')
  const [questions] = useState(buildQuestions)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])

  const results = useMemo(() => {
    const r: Record<string, { correct: number; total: number }> = {}
    questions.forEach((q, i) => {
      if (answers[i] === undefined) return
      const cur = (r[q.veinId] ??= { correct: 0, total: 0 })
      cur.total++
      if (answers[i]) cur.correct++
    })
    return r
  }, [questions, answers])

  function answer(correct: boolean) {
    const next = [...answers, correct]
    setAnswers(next)
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      return
    }
    // Dernier tour : on calcule à partir de `next` (le state n'est pas encore à jour).
    const finalResults: Record<string, { correct: number; total: number }> = {}
    questions.forEach((q, i) => {
      const cur = (finalResults[q.veinId] ??= { correct: 0, total: 0 })
      cur.total++
      if (next[i]) cur.correct++
    })
    const cefr = Object.fromEntries(
      Object.values(activePack.veins).map((v) => [v.id, v.cefr]),
    ) as Record<string, Cefr>
    finishPlacement({
      date: Date.now(),
      results: finalResults,
      level: estimateLevel(finalResults, cefr),
      missed: questions.filter((_, i) => !next[i]).map((q) => q.itemId),
    })
    setPhase('result')
  }

  if (phase === 'intro') {
    return (
      <div className="screen">
        <div className="resting">
          <h2>{STR.placement.introTitle}</h2>
          <p>{STR.placement.introBody}</p>
          <button className="primary-btn" onClick={() => setPhase('quiz')}>
            {STR.placement.start}
          </button>
          <button className="ghost-btn" style={{ marginTop: 10 }} onClick={onClose}>
            {STR.lesson.quit}
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'quiz') {
    const q = questions[index]
    const item = activePack.items[q.itemId]
    return (
      <div className="screen">
        <div className="lesson-header">
          <span className="phase">
            {STR.placement.question} {index + 1} {STR.placement.of} {questions.length}
          </span>
          <button className="quit" onClick={onClose}>
            ✕ {STR.lesson.quit}
          </button>
        </div>
        <div className="heatbar" aria-hidden style={{ marginBottom: 14 }}>
          <div
            style={{
              width: `${(index / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--ember-600), var(--gold-300))',
            }}
          />
        </div>
        <QcmExercise key={q.itemId} item={item} onAnswer={({ correct }) => answer(correct)} />
      </div>
    )
  }

  const placement = player.placement
  const rows = Object.entries(placement?.results ?? results)
    .map(([id, r]) => ({ vein: activePack.veins[id], pct: Math.round((100 * r.correct) / r.total) }))
    .filter((r) => r.vein)
    .sort((a, b) => a.pct - b.pct)
  const weakest = rows.find((r) => r.pct < 50)?.vein
  const missed = (placement?.missed ?? []).map((id) => activePack.items[id]).filter(Boolean).slice(0, 8)

  return (
    <div className="screen">
      <div className="shop-section">
        <h2>{STR.placement.resultTitle}</h2>
        <div className="placement-level">
          <span>{STR.placement.level}</span>
          <strong className={placement?.level ? '' : 'none'}>
            {placement?.level ?? STR.placement.levelNone}
          </strong>
        </div>
        <p className="muted">{STR.placement.levelNote}</p>
      </div>

      <div className="shop-section">
        <h2>{STR.placement.rules}</h2>
        {rows.map(({ vein, pct }) => (
          <div key={vein.id} className="rule-row">
            <div className="rule-head">
              <span>{vein.name}</span>
              <span className={pct < 50 ? 'weak' : ''}>{pct} %</span>
            </div>
            <div className="heatbar">
              <div
                style={{
                  width: `${pct}%`,
                  background: pct < 50 ? 'var(--ember-500)' : pct < 100 ? 'var(--gold-300)' : 'var(--success)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {missed.length > 0 && (
        <div className="shop-section">
          <h2>{STR.placement.missed}</h2>
          <ul className="missed-list">
            {missed.map((m) => (
              <li key={m.id}>
                <strong>{m.chunk}</strong> <span>{m.translation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {weakest && (
        <button
          className="primary-btn"
          onClick={() => {
            startLesson(weakest.id)
            onClose()
          }}
        >
          {STR.placement.startWeak}
          {weakest.name}
        </button>
      )}
      <button className="ghost-btn" style={{ marginTop: 10, width: '100%' }} onClick={onClose}>
        {STR.placement.done}
      </button>
    </div>
  )
}
