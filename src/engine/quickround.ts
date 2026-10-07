import type { Item } from '../content/schema'

export interface QuickCard {
  itemId: string
  /** Sens affiché (langue source). */
  gloss: string
  /** Forme proposée (langue cible) : la bonne ou une fausse. */
  form: string
  /** Vrai si `form` correspond bien à `gloss`. */
  match: boolean
  /** La bonne forme, pour la correction. */
  answer: string
}

/**
 * Carte « vrai / faux » : la forme proposée correspond-elle au sens ?
 * Fausse = une mauvaise réponse type de l'item (genre, accord, préposition…) ou,
 * à défaut, la forme d'un autre item. Pure et testable (rng injectable).
 */
export function makeQuickCard(
  item: Item,
  others: Item[],
  rng: () => number = Math.random,
): QuickCard {
  const base = { itemId: item.id, gloss: item.translation, answer: item.word }
  if (rng() < 0.5) return { ...base, form: item.word, match: true }
  if (item.wrong.length > 0) {
    const form = item.wrong[Math.floor(rng() * item.wrong.length)]
    return { ...base, form, match: false }
  }
  const pool = others.filter((o) => o.word !== item.word)
  if (pool.length === 0) return { ...base, form: item.word, match: true }
  return { ...base, form: pool[Math.floor(rng() * pool.length)].word, match: false }
}

/** Tirage sans répétition immédiate. */
export function nextQuickItem(pool: Item[], previousId: string | null, rng: () => number = Math.random): Item {
  const candidates = pool.length > 1 ? pool.filter((i) => i.id !== previousId) : pool
  return candidates[Math.floor(rng() * candidates.length)]
}
