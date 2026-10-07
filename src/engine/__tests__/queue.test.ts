import { describe, expect, it } from 'vitest'
import { Rating } from 'ts-fsrs'
import { buildQueue, reinsertFailed, type QueueEntry } from '../queue'
import { applyReview, newItemState } from '../scheduler'
import type { ItemState } from '../types'

const NOW = new Date('2026-07-11T12:00:00Z')
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000)

/** Item Review dû il y a `overdueDays` jours : reviews Good espacées puis retard. */
function reviewItem(overdueDays: number): ItemState {
  let item = newItemState(daysAgo(60))
  // Good répétés jusqu'à l'état Review, en avançant le temps à chaque due.
  let t = daysAgo(60)
  for (let i = 0; i < 4; i++) {
    item = applyReview(item, Rating.Good, t)
    t = new Date(item.fsrs.due)
  }
  // Décale artificiellement la due dans le passé.
  return {
    ...item,
    fsrs: { ...item.fsrs, due: daysAgo(overdueDays) },
  }
}

function learningItem(dueOffsetMin: number): ItemState {
  const item = applyReview(newItemState(daysAgo(1)), Rating.Good, daysAgo(1))
  return {
    ...item,
    fsrs: { ...item.fsrs, due: new Date(NOW.getTime() + dueOffsetMin * 60_000) },
  }
}

describe('buildQueue — file de sélection (§3.4)', () => {
  it('priorité : learning dus > review dus > nouveaux', () => {
    const items: Record<string, ItemState> = {
      rev: reviewItem(1),
      learn: learningItem(-5),
      fresh: newItemState(NOW),
    }
    const q = buildQueue(items, {
      now: NOW,
      activeVeinItems: ['fresh'],
      newBudget: 10,
    })
    expect(q.map((e) => e.id)).toEqual(['learn', 'rev', 'fresh'])
    expect(q.map((e) => e.reason)).toEqual(['learning', 'review', 'new'])
  })

  it('les items Review les plus en retard passent en premier', () => {
    const items: Record<string, ItemState> = {
      late1: reviewItem(1),
      late7: reviewItem(7),
      late3: reviewItem(3),
    }
    const q = buildQueue(items, { now: NOW })
    expect(q.map((e) => e.id)).toEqual(['late7', 'late3', 'late1'])
  })

  it('ignore les items non dus', () => {
    const items: Record<string, ItemState> = {
      future: learningItem(+30),
    }
    expect(buildQueue(items, { now: NOW })).toEqual([])
  })

  it('respecte la limite new_per_day', () => {
    const items: Record<string, ItemState> = {
      a: newItemState(NOW),
      b: newItemState(NOW),
      c: newItemState(NOW),
    }
    const q = buildQueue(items, {
      now: NOW,
      activeVeinItems: ['a', 'b', 'c'],
      newBudget: 2,
    })
    expect(q).toHaveLength(2)
  })

  it('budget 0 → aucun nouvel item', () => {
    const items: Record<string, ItemState> = { a: newItemState(NOW) }
    const q = buildQueue(items, { now: NOW, activeVeinItems: ['a'], newBudget: 0 })
    expect(q).toEqual([])
  })
})

describe('reinsertFailed — re-présentation différée (§3.4)', () => {
  const entry = (id: string): QueueEntry => ({ id, reason: 'review' })

  it('ré-insère après 2 autres items, pas immédiatement', () => {
    const q = [entry('b'), entry('c'), entry('d')]
    const out = reinsertFailed(q, entry('a'))
    expect(out.map((e) => e.id)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('file courte : insère en fin', () => {
    const out = reinsertFailed([entry('b')], entry('a'))
    expect(out.map((e) => e.id)).toEqual(['b', 'a'])
  })

  it('file vide : l’item revient seul', () => {
    expect(reinsertFailed([], entry('a')).map((e) => e.id)).toEqual(['a'])
  })

  it('déduplique si l’item était déjà dans la file', () => {
    const q = [entry('b'), entry('a'), entry('c')]
    const out = reinsertFailed(q, entry('a'))
    expect(out.filter((e) => e.id === 'a')).toHaveLength(1)
  })
})

describe('pickExercise — repère l’erreur', () => {
  // Séquence de tirages : [pas de rétrogradation, tirage « spot » réussi].
  const seq = (values: number[]) => {
    let i = 0
    return () => values[i++ % values.length]
  }

  it('remplace un cloze par « spot » si l’item a des fautes types', async () => {
    const { pickExercise } = await import('../exercise')
    expect(pickExercise(1, seq([0.9, 0.1]), true)).toBe('spot')
  })

  it('ne propose jamais « spot » sans fautes types, ni quand le tirage échoue', async () => {
    const { pickExercise } = await import('../exercise')
    expect(pickExercise(1, seq([0.9, 0.1]), false)).toBe('cloze')
    expect(pickExercise(1, seq([0.9, 0.9]), true)).toBe('cloze')
  })
})
