import { useMemo, useRef, useState } from 'react'
import { activePack } from '../../content'
import { STR } from '../../i18n/strings'
import {
  encodeChallenge,
  pickChallengeItems,
  questionPoints,
  type Challenge,
} from '../../engine/challenge'
import { ExerciseView } from '../exercises/ExerciseView'
import type { ExerciseType } from '../../engine/types'
import { Miner } from '../components/Miner'

const NAME_KEY = 'forge-name'

function storedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

function rememberName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    // le nom n'est qu'un confort
  }
}

export type ChallengeStart =
  | { mode: 'create'; scope: string }
  | { mode: 'incoming'; challenge: Challenge }

/** Types servis en alternance (déterministe) ; « repère l'erreur » seulement si l'item a des fautes types. */
function typeFor(index: number, hasWrong: boolean): ExerciseType {
  const cycle: ExerciseType[] = hasWrong ? ['qcm', 'cloze', 'spot'] : ['qcm', 'cloze']
  return cycle[index % cycle.length]
}

function scopeLabel(scope: string): string {
  return scope === 'mix' ? STR.challenge.mix : (activePack.veins[scope]?.name ?? scope)
}

/** Défi asynchrone : mêmes questions pour les deux joueurs, score dans un lien. */
export function ChallengeScreen({
  start,
  onClose,
}: {
  start: ChallengeStart
  onClose: () => void
}) {
  const incoming = start.mode === 'incoming' ? start.challenge : null
  const scope = incoming ? incoming.scope : (start as { scope: string }).scope

  // Défi entrant : on rejoue exactement ses paramètres. Création : nouvelle graine.
  const [seed] = useState(() => incoming?.seed ?? Math.floor(Math.random() * 2 ** 31))
  const ids = useMemo(() => {
    const pool =
      scope === 'mix'
        ? Object.keys(activePack.items)
        : (activePack.veins[scope]?.items.map((i) => i.id) ?? [])
    return pickChallengeItems(pool, seed, incoming?.n ?? 10)
  }, [scope, seed, incoming])

  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [name, setName] = useState(storedName)
  const [index, setIndex] = useState(0)
  const [points, setPoints] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const shownAt = useRef(Date.now())
  const [copied, setCopied] = useState(false)

  const myName = (name.trim() || STR.challenge.defaultName).slice(0, 20)

  function begin() {
    rememberName(name.trim())
    shownAt.current = Date.now()
    setPhase('quiz')
  }

  function answer(correct: boolean) {
    const gained = questionPoints(correct, Date.now() - shownAt.current)
    const nextPoints = points + gained
    const nextCorrect = correctCount + (correct ? 1 : 0)
    setPoints(nextPoints)
    setCorrectCount(nextCorrect)
    if (index + 1 < ids.length) {
      shownAt.current = Date.now()
      setIndex(index + 1)
    } else {
      setPhase('result')
    }
  }

  const link = useMemo(() => {
    const payload = encodeChallenge({
      v: 1,
      pack: activePack.id,
      scope,
      seed,
      n: ids.length,
      name: myName,
      score: points,
      correct: correctCount,
    })
    return `${location.origin}${import.meta.env.BASE_URL}#c=${payload}`
  }, [scope, seed, ids.length, myName, points, correctCount])

  async function share() {
    const text = STR.challenge.shareText
      .replace('{score}', String(points))
      .replace('{scope}', scopeLabel(scope))
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: STR.appName, text, url: link })
        return
      } catch {
        // partage annulé : on retombe sur la copie
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${link}`)
      setCopied(true)
    } catch {
      // l'URL reste affichée, copiable à la main
    }
  }

  if (phase === 'intro') {
    return (
      <div className="screen">
        <div className="resting">
          <Miner pose="cheer" height={150} />
          <h2>{incoming ? `${incoming.name} ${STR.challenge.challengesYou}` : STR.challenge.title}</h2>
          <p>
            <strong>{scopeLabel(scope)}</strong> · {ids.length} {STR.challenge.questions}
            {incoming && (
              <>
                <br />
                {STR.challenge.toBeat} <strong>{incoming.score}</strong> ({incoming.correct}/{incoming.n})
              </>
            )}
          </p>
          <p className="muted">{STR.challenge.rules}</p>
          <input
            className="type-input"
            value={name}
            maxLength={20}
            placeholder={STR.challenge.namePlaceholder}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="primary-btn" style={{ marginTop: 12 }} disabled={ids.length < 3} onClick={begin}>
            {STR.challenge.go}
          </button>
          <button className="ghost-btn" style={{ marginTop: 10 }} onClick={onClose}>
            {STR.lesson.quit}
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'quiz') {
    const item = activePack.items[ids[index]]
    return (
      <div className="screen">
        <div className="lesson-header">
          <span className="phase">
            {index + 1} / {ids.length}
          </span>
          <span className="hud-sparks">{points}</span>
        </div>
        <div className="heatbar" aria-hidden style={{ marginBottom: 14 }}>
          <div
            style={{
              width: `${(index / ids.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--ember-600), var(--gold-300))',
            }}
          />
        </div>
        <ExerciseView
          key={`${item.id}-${index}`}
          exercise={typeFor(index, item.allowSpot && item.wrong.length > 0)}
          item={item}
          onAnswer={({ correct }) => answer(correct)}
        />
      </div>
    )
  }

  const verdict = incoming
    ? points > incoming.score
      ? STR.challenge.win
      : points === incoming.score
        ? STR.challenge.tie
        : STR.challenge.lose
    : null

  return (
    <div className="screen">
      <div className="resting">
        <Miner pose={verdict === STR.challenge.lose ? 'oops' : 'cheer'} height={150} />
        <h2>{verdict ?? STR.challenge.done}</h2>
        <div className="challenge-score">
          <div>
            <span>{myName}</span>
            <strong>{points}</strong>
            <small>
              {correctCount}/{ids.length}
            </small>
          </div>
          {incoming && (
            <div>
              <span>{incoming.name}</span>
              <strong>{incoming.score}</strong>
              <small>
                {incoming.correct}/{incoming.n}
              </small>
            </div>
          )}
        </div>
        <p className="muted">{incoming ? STR.challenge.sendBack : STR.challenge.sendFriend}</p>
        <button className="primary-btn" onClick={() => void share()}>
          {copied ? STR.challenge.copied : STR.challenge.share}
        </button>
        <input className="type-input" readOnly value={link} onFocus={(e) => e.target.select()} style={{ marginTop: 10 }} />
        <button className="ghost-btn" style={{ marginTop: 10 }} onClick={onClose}>
          {STR.placement.done}
        </button>
      </div>
    </div>
  )
}
