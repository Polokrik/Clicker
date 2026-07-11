import { Rating } from 'ts-fsrs'
import type { ItemState, Tier } from './types'
import { TIER_MULT } from './types'
import { retrievability } from './scheduler'

export const STRIKE_BASE = 4
export const COMBO_CAP = 20
export const EASY_BONUS = 1.5
export const OFFLINE_CAP_BASE_H = 8
export const CHIMNEY_HOURS_PER_LEVEL = 4

/** comboMult = 1 + min(combo, 20) × 0.1 (§6.1). */
export function comboMult(combo: number): number {
  return 1 + Math.min(combo, COMBO_CAP) * 0.1
}

/**
 * Gain d'étincelles par frappe réussie (§6.1) :
 * base(4) × tierMult × (1 + bellows × 0.25) × comboMult, ×1.5 si Easy.
 */
export function strikeGain(opts: {
  tier: Tier
  bellows: number
  combo: number
  grade: Rating
}): number {
  if (opts.grade === Rating.Again) return 0
  let gain =
    STRIKE_BASE *
    TIER_MULT[opts.tier] *
    (1 + opts.bellows * 0.25) *
    comboMult(opts.combo)
  if (opts.grade === Rating.Easy) gain *= EASY_BONUS
  return Math.round(gain)
}

/**
 * Revenu passif (§6.2) :
 * rate/s = Σ items tier≥3 : retrievability × tierMult × 0.1 × (1 + anvil × 0.25)
 */
export function passiveRate(
  items: Record<string, ItemState>,
  anvil: number,
  now: Date = new Date(),
): number {
  let rate = 0
  for (const item of Object.values(items)) {
    if (item.tier < 3) continue
    rate +=
      retrievability(item.fsrs, now) *
      TIER_MULT[item.tier] *
      0.1 *
      (1 + anvil * 0.25)
  }
  return rate
}

/** Plafond hors-ligne en millisecondes (8 h de base, +4 h/niveau de cheminée). */
export function offlineCapMs(chimney: number): number {
  return (OFFLINE_CAP_BASE_H + chimney * CHIMNEY_HOURS_PER_LEVEL) * 3_600_000
}

/**
 * Étincelles passives accumulées entre lastSeen et now, plafonnées.
 * Le taux est évalué à l'instant du retour : la retrievability a déjà décru
 * pendant l'absence, donc le refroidissement pénalise naturellement le rendement.
 */
export function offlineEarnings(
  items: Record<string, ItemState>,
  upgrades: { anvil: number; chimney: number },
  lastSeen: number,
  now: Date = new Date(),
): number {
  const elapsed = Math.max(0, now.getTime() - lastSeen)
  const capped = Math.min(elapsed, offlineCapMs(upgrades.chimney))
  return Math.floor(passiveRate(items, upgrades.anvil, now) * (capped / 1000))
}

/** Coûts d'upgrades (§6.4) — coût du niveau n+1 quand on possède n niveaux. */
export const UPGRADE_COSTS = {
  bellows: (owned: number) => Math.round(50 * Math.pow(2.2, owned)),
  anvil: (owned: number) => Math.round(120 * Math.pow(2.5, owned)),
  chimney: (owned: number) => Math.round(400 * Math.pow(3, owned)),
} as const

export type UpgradeId = keyof typeof UPGRADE_COSTS
