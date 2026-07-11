import { State } from 'ts-fsrs'
import type { ItemState } from './types'
import { reviveCard } from './scheduler'

export interface QueueEntry {
  id: string
  reason: 'learning' | 'review' | 'new'
}

/** Nombre d'items intercalés avant la re-présentation d'un item échoué (§3.4). */
export const RETRY_GAP = 2

/**
 * File de sélection (§3.4). Priorités :
 * 1. items Learning/Relearning dont le step est écoulé,
 * 2. items Review dus, les plus en retard d'abord,
 * 3. items New de la veine active, dans la limite de newBudget.
 */
export function buildQueue(
  items: Record<string, ItemState>,
  opts: {
    now?: Date
    /** Ids des items de la veine active (candidats New), dans l'ordre. */
    activeVeinItems?: string[]
    /** Items New restants autorisés aujourd'hui (new_per_day − déjà introduits). */
    newBudget?: number
  } = {},
): QueueEntry[] {
  const now = opts.now ?? new Date()
  const nowMs = now.getTime()

  const learning: { id: string; due: number }[] = []
  const review: { id: string; due: number }[] = []

  for (const [id, item] of Object.entries(items)) {
    const card = reviveCard(item.fsrs)
    const due = card.due.getTime()
    if (due > nowMs) continue
    if (card.state === State.Learning || card.state === State.Relearning) {
      learning.push({ id, due })
    } else if (card.state === State.Review) {
      review.push({ id, due })
    }
  }

  learning.sort((a, b) => a.due - b.due)
  // Les plus en retard d'abord = due le plus ancien d'abord.
  review.sort((a, b) => a.due - b.due)

  const queue: QueueEntry[] = [
    ...learning.map(({ id }) => ({ id, reason: 'learning' as const })),
    ...review.map(({ id }) => ({ id, reason: 'review' as const })),
  ]

  const budget = opts.newBudget ?? 0
  if (budget > 0 && opts.activeVeinItems) {
    let added = 0
    for (const id of opts.activeVeinItems) {
      if (added >= budget) break
      const item = items[id]
      if (item && reviveCard(item.fsrs).state === State.New) {
        queue.push({ id, reason: 'new' })
        added++
      }
    }
  }

  return queue
}

/**
 * Ré-insère un item échoué après RETRY_GAP autres items (jamais immédiatement,
 * §3.4) — utilisé pour la micro-file de session, pas pour la file FSRS.
 */
export function reinsertFailed(
  queue: QueueEntry[],
  entry: QueueEntry,
  gap: number = RETRY_GAP,
): QueueEntry[] {
  const rest = queue.filter((e) => e.id !== entry.id)
  const pos = Math.min(gap, rest.length)
  return [...rest.slice(0, pos), entry, ...rest.slice(pos)]
}
