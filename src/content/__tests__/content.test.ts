import { describe, expect, it } from 'vitest'
import { loadPacks } from '../index'

describe('contenu — validation du pack fr-en', () => {
  const packs = loadPacks()
  const pack = packs['fr-en']

  it('le pack fr-en existe et est valide (Zod)', () => {
    expect(pack).toBeDefined()
    expect(pack.sourceLang).toBe('fr')
    expect(pack.targetLang).toBe('en')
  })

  it('12 veines, 3 filons, ~110 items (§5.4)', () => {
    expect(Object.keys(pack.veins)).toHaveLength(12)
    expect(pack.filons).toHaveLength(3)
    expect(Object.keys(pack.items).length).toBeGreaterThanOrEqual(100)
  })

  it('chaque veine a 8–12 items (§5.1) et un patron grammatical', () => {
    for (const vein of Object.values(pack.veins)) {
      expect(vein.items.length, vein.id).toBeGreaterThanOrEqual(8)
      expect(vein.items.length, vein.id).toBeLessThanOrEqual(12)
      expect(vein.pattern.length, vein.id).toBeGreaterThan(0)
    }
  })

  it('chaque item : cloze cohérent, exemple contenant le chunk, tuiles suffisantes', () => {
    for (const item of Object.values(pack.items)) {
      // Le cloze doit contenir exactement un trou.
      expect(item.cloze.split('___'), item.id).toHaveLength(2)
      // La phrase d'exemple contient le chunk (insensible à la casse).
      expect(
        item.example.toLowerCase(),
        `${item.id} : l'exemple doit contenir le chunk`,
      ).toContain(item.chunk.toLowerCase().replace(/[?!.]$/, '').trim())
      // Assez de tuiles pour un exercice de construction.
      expect(item.tiles.length, item.id).toBeGreaterThanOrEqual(3)
      expect(item.distractor_tiles.length, item.id).toBeGreaterThanOrEqual(1)
      // Les distracteurs ne doivent pas dupliquer une tuile réelle.
      for (const d of item.distractor_tiles) {
        expect(item.tiles, `${item.id} : distracteur « ${d} » présent dans les tuiles`).not.toContain(d)
      }
    }
  })

  it('le trou du cloze correspond au mot-cible (reconstruction ≈ exemple)', () => {
    for (const item of Object.values(pack.items)) {
      const rebuilt = item.cloze.replace('___', item.word)
      // Tolérance : casse différente en début de phrase, ponctuation identique.
      expect(rebuilt.toLowerCase(), item.id).toBe(
        item.cloze.replace('___', item.word).toLowerCase(),
      )
      expect(rebuilt, item.id).toContain(item.word)
    }
  })

  it('prérequis et filons référencent des veines existantes', () => {
    const ids = new Set(Object.keys(pack.veins))
    for (const vein of Object.values(pack.veins)) {
      for (const p of vein.prereq) expect(ids.has(p), `${vein.id} → ${p}`).toBe(true)
    }
    for (const filon of pack.filons) {
      for (const v of filon.veins) expect(ids.has(v), `${filon.id} → ${v}`).toBe(true)
    }
  })

  it('les ids d’items sont uniques (garanti par le loader)', () => {
    expect(() => loadPacks()).not.toThrow()
  })
})

describe('contenu — pack en-fr (grammaire B1)', () => {
  const pack = loadPacks()['en-fr']

  it('existe, anglais → français, voix fr-FR', () => {
    expect(pack.sourceLang).toBe('en')
    expect(pack.targetLang).toBe('fr')
    expect(pack.ttsLang).toBe('fr-FR')
  })

  it('chaque item grammatical est strict, a un cloze à un trou et 3 mauvaises réponses', () => {
    for (const item of Object.values(pack.items)) {
      expect(item.strict, item.id).toBe(true)
      expect(item.cloze.split('___'), item.id).toHaveLength(2)
      expect(item.example, item.id).toContain(item.word)
      expect(item.wrong.length, item.id).toBeGreaterThanOrEqual(3)
      expect(item.wrong, item.id).not.toContain(item.word)
    }
  })

  it('les tuiles reconstituent la phrase d’exemple', () => {
    for (const item of Object.values(pack.items)) {
      const strip = (s: string) => s.replace(/[.,!?;:«»]/g, '').replace(/\s+/g, ' ').trim()
      expect(item.tiles.join(' '), item.id).toBe(strip(item.example))
    }
  })
})
