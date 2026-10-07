import { State } from 'ts-fsrs'
import type { ItemState } from './types'
import { isDue, reviveCard } from './scheduler'

/**
 * Statut d'urgence d'un item. La « chaleur » (rétrievabilité) vaut 100 % juste
 * après n'importe quelle révision, réussie ou non : elle ne dit donc pas où
 * travailler. Le statut, lui, tient compte de l'échéance et de la solidité.
 */
export type ItemStatus = 'due' | 'new' | 'shaky' | 'solid'

export function itemStatus(item: ItemState, now: Date = new Date()): ItemStatus {
  // Introduit dans une leçon mais jamais frappé : rien à évaluer encore.
  if (reviveCard(item.fsrs).state === State.New) return 'new'
  // Un item raté (série à 0 après au moins une frappe) compte comme à re-forger tout de suite :
  // son rappel revient dans quelques minutes, c'est là qu'il faut travailler.
  if (isDue(item, now) || (item.streak === 0 && item.totalReps > 0)) return 'due'
  const card = reviveCard(item.fsrs)
  // Fragile : encore en apprentissage, pas encore « forgé » (stabilité < 3 j) ou raté récemment.
  if (card.state !== State.Review || item.tier < 2) return 'shaky'
  return 'solid'
}

export interface VeinMastery {
  total: number
  solid: number
  shaky: number
  due: number
  unseen: number
  /** 0–100 : solide = 1, fragile ou dû = ½, jamais vu = 0. */
  pct: number
}

export function veinMastery(
  itemIds: string[],
  items: Record<string, ItemState>,
  now: Date = new Date(),
): VeinMastery {
  const m: VeinMastery = { total: itemIds.length, solid: 0, shaky: 0, due: 0, unseen: 0, pct: 0 }
  for (const id of itemIds) {
    const state = items[id]
    if (!state) m.unseen++
    else {
      const st = itemStatus(state, now)
      if (st === 'new') m.unseen++
      else m[st]++
    }
  }
  m.pct = m.total === 0 ? 0 : Math.round((100 * (m.solid + 0.5 * (m.shaky + m.due))) / m.total)
  return m
}

/** Ordre d'urgence pour trier : dû d'abord, puis fragile, puis solide. */
export const STATUS_RANK: Record<ItemStatus, number> = { due: 0, new: 1, shaky: 2, solid: 3 }

/* ── Test de niveau ─────────────────────────────────────────────────────── */

export interface PlacementScore {
  correct: number
  total: number
}

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2'] as const
export type Cefr = (typeof CEFR_ORDER)[number]

/**
 * Niveau estimé : on monte les niveaux CECR tant que la moyenne des règles de
 * ce niveau reste ≥ 60 %. Indicatif — peu de questions par règle.
 * Retourne null si même le plus bas niveau testé n'est pas atteint.
 */
export function estimateLevel(
  results: Record<string, PlacementScore>,
  veinCefr: Record<string, Cefr>,
): Cefr | null {
  let reached: Cefr | null = null
  for (const level of CEFR_ORDER) {
    const ids = Object.keys(results).filter((id) => veinCefr[id] === level && results[id].total > 0)
    if (ids.length === 0) continue
    const correct = ids.reduce((s, id) => s + results[id].correct, 0)
    const total = ids.reduce((s, id) => s + results[id].total, 0)
    if (correct / total >= 0.6) reached = level
    else break
  }
  return reached
}

/** Règles faibles (< 50 %), de la plus faible à la moins faible. */
export function weakVeins(results: Record<string, PlacementScore>): string[] {
  return Object.entries(results)
    .filter(([, r]) => r.total > 0 && r.correct / r.total < 0.5)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
    .map(([id]) => id)
}
