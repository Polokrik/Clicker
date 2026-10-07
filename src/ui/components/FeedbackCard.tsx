import { useEffect } from 'react'
import { Rating } from 'ts-fsrs'
import type { Item } from '../../content/schema'
import { STR } from '../../i18n/strings'
import { Miner } from './Miner'
import { Phonetic } from './Phonetic'
import { reportHref } from '../report'

export interface Feedback {
  grade: Rating
  sparks: number
  correct: boolean
  item: Item
}

/**
 * Feedback immédiat après une frappe (§2) : réussite → gain + note ;
 * échec → correction affichée, on repart d'un tap (le temps de lire).
 */
export function FeedbackCard({
  feedback,
  onContinue,
}: {
  feedback: Feedback
  onContinue: () => void
}) {
  const { correct, grade, sparks, item } = feedback

  // Réussite : avance automatiquement, l'échec attend un tap.
  useEffect(() => {
    if (!correct) return
    const timer = setTimeout(onContinue, 1400)
    return () => clearTimeout(timer)
  }, [correct, onContinue])

  if (correct) {
    return (
      <div className="feedback ok" onClick={onContinue}>
        <div className="feedback-miner">
          <Miner pose={grade === Rating.Easy ? 'cheer' : 'happy'} height={120} />
        </div>
        <h3>
          {grade === Rating.Easy
            ? STR.forge.fast
            : grade === Rating.Hard
              ? STR.forge.slow
              : STR.forge.correct}
        </h3>
        <div className="gain">+{sparks} ✦</div>
        {item.notes && <div className="note">{item.notes}</div>}
      </div>
    )
  }

  return (
    <div className="feedback ko">
      <div className="feedback-miner">
        <Miner pose="oops" height={110} />
      </div>
      <h3>{STR.forge.wrong}</h3>
      <div style={{ fontSize: '0.8rem', color: 'var(--steel-200)' }}>
        {STR.forge.answerWas}
      </div>
      <div className="correction">{item.chunk}</div>
      <Phonetic ipa={item.phonetic} />
      <div style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>{item.example}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--steel-200)', marginTop: 4 }}>
        {item.example_translation}
      </div>
      {item.notes && <div className="note">{item.notes}</div>}
      <button className="primary-btn" onClick={onContinue}>
        {STR.forge.continue}
      </button>
      <a className="report-link" href={reportHref(item.id)}>
        {STR.report.item}
      </a>
    </div>
  )
}
