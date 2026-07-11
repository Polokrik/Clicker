/** Distance de Levenshtein classique (insertions, suppressions, substitutions). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let prev = new Array<number>(b.length + 1)
  let curr = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[b.length]
}

/** Normalisation avant comparaison : casse, espaces, apostrophes typographiques. */
export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
}

export type TypeMatch = 'exact' | 'fuzzy' | 'wrong'

/**
 * Évaluation d'une saisie clavier (§4, tier 2) :
 * exact → réussite normale ; distance ≤ 1 → réussite « Hard » ; sinon échec.
 */
export function matchTyped(input: string, expected: string): TypeMatch {
  const a = normalizeAnswer(input)
  const b = normalizeAnswer(expected)
  if (a === b) return 'exact'
  if (levenshtein(a, b) <= 1) return 'fuzzy'
  return 'wrong'
}
