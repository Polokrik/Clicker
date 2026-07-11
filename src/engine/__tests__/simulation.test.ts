import { describe, expect, it } from 'vitest'
import { Rating, State } from 'ts-fsrs'
import { applyReview, heat, isDue, newItemState, retrievability } from '../scheduler'
import { buildQueue } from '../queue'
import type { ItemState, Tier } from '../types'

/**
 * Critère M1 de la roadmap : simuler 30 jours de reviews en tests unitaires.
 * Un joueur fictif révise chaque jour tout ce qui est dû (90 % de réussite,
 * déterministe) et introduit 10 nouveaux items/jour depuis un pool de 120.
 */
describe('simulation 30 jours (critère M1)', () => {
  it('la boucle FSRS complète tient sur 30 jours', () => {
    const start = new Date('2026-01-01T09:00:00Z')
    const items: Record<string, ItemState> = {}
    const pool = Array.from({ length: 120 }, (_, i) => `item_${i}`)
    let introduced = 0
    let reviewsDone = 0
    // Échec déterministe : 1 review sur 10 échoue.
    let reviewCounter = 0

    for (let day = 0; day < 30; day++) {
      const now = new Date(start.getTime() + day * 86_400_000)

      // Introduit jusqu'à 10 nouveaux items ce jour.
      for (let n = 0; n < 10 && introduced < pool.length; n++) {
        items[pool[introduced]] = newItemState(now)
        introduced++
      }

      // Session du jour : plusieurs passes tant que des items sont dus
      // (les steps Learning re-deviennent dus dans la même journée).
      for (let pass = 0; pass < 6; pass++) {
        const sessionTime = new Date(now.getTime() + pass * 15 * 60_000)
        const queue = buildQueue(items, {
          now: sessionTime,
          activeVeinItems: pool.slice(0, introduced),
          newBudget: pass === 0 ? 10 : 0,
        })
        if (queue.length === 0) break
        for (const entry of queue) {
          reviewCounter++
          const grade = reviewCounter % 10 === 0 ? Rating.Again : Rating.Good
          items[entry.id] = applyReview(items[entry.id], grade, sessionTime)
          reviewsDone++
        }
      }
    }

    const states = Object.values(items)
    expect(introduced).toBe(120)
    expect(reviewsDone).toBeGreaterThan(300)

    // Tous les items introduits ont été revus au moins une fois.
    for (const item of states) {
      expect(item.totalReps).toBeGreaterThan(0)
      expect(item.fsrs.state).not.toBe(State.New)
    }

    // Les intervalles s'allongent : une bonne part des items est en Review
    // avec une stability > 1 jour.
    const inReview = states.filter((i) => i.fsrs.state === State.Review)
    expect(inReview.length).toBeGreaterThan(states.length * 0.5)

    // Des tiers ont progressé (stability ≥ 1 → tier ≥ 1).
    const tier1plus = states.filter((i) => i.tier >= 1)
    expect(tier1plus.length).toBeGreaterThan(states.length * 0.5)

    // Le tier ne dépasse jamais 4 et les lapses sont comptés.
    const totalLapses = states.reduce((s, i) => s + i.lapses, 0)
    expect(totalLapses).toBeGreaterThan(0)
    for (const item of states) {
      expect(item.tier).toBeGreaterThanOrEqual(0)
      expect(item.tier).toBeLessThanOrEqual(4)
    }
  })

  it('le tier ne redescend jamais sur échec (§4)', () => {
    const now = new Date('2026-01-01T09:00:00Z')
    let item = newItemState(now)
    let t = now
    // Monte l'item en le réussissant plusieurs fois.
    for (let i = 0; i < 6; i++) {
      item = applyReview(item, Rating.Easy, t)
      t = new Date(item.fsrs.due.getTime() + 60_000)
    }
    const tierBefore = item.tier
    expect(tierBefore).toBeGreaterThanOrEqual(1)
    // Échec : le tier reste, la retrievability chute via l'état Relearning.
    item = applyReview(item, Rating.Again, t)
    expect(item.tier).toBe(tierBefore)
    expect(item.streak).toBe(0)
    expect(item.lapses).toBe(1)
  })

  it('la chaleur suit la courbe de l’oubli et respecte le plancher de 5 %', () => {
    const now = new Date('2026-01-01T09:00:00Z')
    let item = newItemState(now)
    expect(heat(item.fsrs, now)).toBe(0) // minerai jamais chauffé

    item = applyReview(item, Rating.Good, now)
    const h0 = heat(item.fsrs, now)
    const h30 = heat(item.fsrs, new Date(now.getTime() + 30 * 86_400_000))
    const h365 = heat(item.fsrs, new Date(now.getTime() + 365 * 86_400_000))
    expect(h0).toBeGreaterThan(90)
    expect(h30).toBeLessThan(h0)
    expect(h365).toBeGreaterThanOrEqual(5) // plancher visuel
  })

  it('re-forger un item dû restaure sa chaleur (§3.3)', () => {
    const now = new Date('2026-01-01T09:00:00Z')
    let item = applyReview(newItemState(now), Rating.Good, now)
    const later = new Date(item.fsrs.due.getTime() + 5 * 86_400_000)
    expect(isDue(item, later)).toBe(true)
    const cold = retrievability(item.fsrs, later)
    item = applyReview(item, Rating.Good, later)
    expect(retrievability(item.fsrs, later)).toBeGreaterThan(cold)
  })

  it('tierForStability via applyReview : franchissement des seuils', () => {
    // Vérifie qu'un item très stable atteint le tier 4 (seuil 30 j).
    const now = new Date('2026-01-01T09:00:00Z')
    let item = newItemState(now)
    let t = now
    for (let i = 0; i < 12 && item.tier < 4; i++) {
      item = applyReview(item, Rating.Easy, t)
      t = new Date(item.fsrs.due.getTime() + 60_000)
    }
    expect(item.tier).toBe(4 as Tier)
    expect(item.fsrs.stability).toBeGreaterThanOrEqual(30)
  })
})
