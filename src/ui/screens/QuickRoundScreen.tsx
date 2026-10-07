import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { activePack, activePackId } from '../../content'
import { useGame } from '../../store/gameStore'
import { STR } from '../../i18n/strings'
import { makeQuickCard, nextQuickItem, type QuickCard } from '../../engine/quickround'
import { Miner } from '../components/Miner'

const ROUND_MS = 60_000
const SWIPE_PX = 90
const BEST_KEY = `forge-quick-best-${activePackId}`

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0) || 0
  } catch {
    return 0
  }
}

function writeBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n))
  } catch {
    // le record n'est qu'un confort
  }
}

/** Manche rapide façon « swipe » : la forme correspond-elle au sens ? 60 s, un geste par carte. */
export function QuickRoundScreen({ onClose }: { onClose: () => void }) {
  const { player, addSparks } = useGame()
  const pool = useMemo(() => {
    const unlocked = player.unlockedVeins.flatMap((id) => activePack.veins[id]?.items ?? [])
    return unlocked.length >= 6 ? unlocked : Object.values(activePack.items)
  }, [player.unlockedVeins])
  const all = useMemo(() => Object.values(activePack.items), [])

  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro')
  const [card, setCard] = useState<QuickCard | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [missed, setMissed] = useState<QuickCard[]>([])
  const [timeLeft, setTimeLeft] = useState(ROUND_MS)
  const [best, setBest] = useState(readBest)
  const [isRecord, setIsRecord] = useState(false)
  const [flash, setFlash] = useState<'ok' | 'ko' | null>(null)
  const [dx, setDx] = useState(0)
  const dragStart = useRef<number | null>(null)
  const lastId = useRef<string | null>(null)
  const endsAt = useRef(0)
  const scoreRef = useRef(0)

  const draw = useCallback(() => {
    const item = nextQuickItem(pool, lastId.current)
    lastId.current = item.id
    setCard(makeQuickCard(item, all))
  }, [pool, all])

  function begin() {
    scoreRef.current = 0
    setScore(0)
    setStreak(0)
    setMissed([])
    endsAt.current = Date.now() + ROUND_MS
    setTimeLeft(ROUND_MS)
    draw()
    setPhase('play')
  }

  // Chrono : fin de manche à 0, récompense en étincelles et record.
  useEffect(() => {
    if (phase !== 'play') return
    const timer = setInterval(() => {
      const left = Math.max(0, endsAt.current - Date.now())
      setTimeLeft(left)
      if (left === 0) {
        clearInterval(timer)
        const final = scoreRef.current
        addSparks(final * 3)
        const record = final > readBest()
        if (record) writeBest(final)
        setIsRecord(record && final > 0)
        setBest(Math.max(final, readBest()))
        setPhase('result')
      }
    }, 100)
    return () => clearInterval(timer)
  }, [phase, addSparks])

  function answer(saysMatch: boolean) {
    if (!card || phase !== 'play') return
    const correct = saysMatch === card.match
    setFlash(correct ? 'ok' : 'ko')
    setTimeout(() => setFlash(null), 250)
    if (correct) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setStreak((s) => s + 1)
    } else {
      setStreak(0)
      setMissed((m) => (m.some((x) => x.itemId === card.itemId) ? m : [...m, card]))
    }
    setDx(0)
    draw()
  }

  // Clavier : ← faux, → vrai.
  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') answer(true)
      if (e.key === 'ArrowLeft') answer(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (phase === 'intro') {
    return (
      <div className="screen">
        <div className="resting">
          <Miner pose="idle" height={150} />
          <h2>{STR.quick.title}</h2>
          <p>{STR.quick.rules}</p>
          {best > 0 && <p className="muted">{STR.quick.best} {best}</p>}
          <button className="primary-btn" onClick={begin}>
            {STR.quick.go}
          </button>
          <button className="ghost-btn" style={{ marginTop: 10 }} onClick={onClose}>
            {STR.lesson.quit}
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="screen">
        <div className="resting">
          <Miner pose={score >= 10 ? 'cheer' : 'happy'} height={140} />
          <h2>{isRecord ? STR.quick.record : STR.quick.done}</h2>
          <div className="challenge-score">
            <div>
              <span>{STR.quick.score}</span>
              <strong>{score}</strong>
              <small>+{score * 3} ✦</small>
            </div>
            <div>
              <span>{STR.quick.bestShort}</span>
              <strong>{best}</strong>
            </div>
          </div>
          {missed.length > 0 && (
            <div style={{ width: '100%', textAlign: 'left' }}>
              <h3 className="quick-missed-title">{STR.quick.missed}</h3>
              <ul className="missed-list">
                {missed.slice(0, 6).map((m) => (
                  <li key={m.itemId}>
                    <strong>{m.answer}</strong> <span>{m.gloss}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className="primary-btn" style={{ marginTop: 16 }} onClick={begin}>
            {STR.quick.again}
          </button>
          <button className="ghost-btn" style={{ marginTop: 10 }} onClick={onClose}>
            {STR.placement.done}
          </button>
        </div>
      </div>
    )
  }

  const tilt = Math.max(-1, Math.min(1, dx / 140))
  return (
    <div className="screen quick">
      <div className="quick-hud">
        <span className="hud-sparks">{score}</span>
        {streak >= 3 && <span className="combo">×{streak}</span>}
        <button className="quit" onClick={onClose}>
          ✕ {STR.lesson.quit}
        </button>
      </div>
      <div className="heatbar" aria-hidden>
        <div
          style={{
            width: `${(timeLeft / ROUND_MS) * 100}%`,
            background: 'linear-gradient(90deg, var(--ember-600), var(--gold-300))',
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      {card && (
        <div
          key={`${card.itemId}-${score}-${missed.length}-${streak}`}
          className={`swipe-card${flash ? ` ${flash}` : ''}`}
          style={{
            transform: `translateX(${dx}px) rotate(${tilt * 8}deg)`,
            borderColor: tilt > 0.3 ? 'var(--success)' : tilt < -0.3 ? 'var(--danger)' : undefined,
            transition: dragStart.current === null ? 'transform 0.2s' : 'none',
          }}
          onPointerDown={(e) => {
            dragStart.current = e.clientX
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (dragStart.current !== null) setDx(e.clientX - dragStart.current)
          }}
          onPointerUp={() => {
            const moved = dx
            dragStart.current = null
            if (moved > SWIPE_PX) answer(true)
            else if (moved < -SWIPE_PX) answer(false)
            else setDx(0)
          }}
          onPointerCancel={() => {
            dragStart.current = null
            setDx(0)
          }}
        >
          <div className="swipe-gloss">{card.gloss}</div>
          <div className="swipe-form">{card.form}</div>
        </div>
      )}

      <div className="swipe-buttons">
        <button className="swipe-no" onClick={() => answer(false)} aria-label={STR.quick.no}>
          ✗ <span>{STR.quick.no}</span>
        </button>
        <button className="swipe-yes" onClick={() => answer(true)} aria-label={STR.quick.yes}>
          ✓ <span>{STR.quick.yes}</span>
        </button>
      </div>
      <p className="muted" style={{ textAlign: 'center' }}>
        {STR.quick.hint}
      </p>
    </div>
  )
}
