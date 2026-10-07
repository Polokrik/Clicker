import { z } from 'zod'

/**
 * Schémas de contenu (§5). Généralisation multilingue : les champs `fr` /
 * `example_fr` de la spec deviennent `translation` / `example_translation`,
 * la langue étant portée par le pack (sourceLang → targetLang). Ajouter une
 * langue = déposer un nouveau dossier de pack JSON, zéro changement de code.
 */

export const ItemSchema = z.object({
  id: z.string().min(1),
  /** Le chunk complet appris (collocation / expression). */
  chunk: z.string().min(1),
  /** Le mot-cible saisi au clavier (tier 2) et proposé en QCM. */
  word: z.string().min(1),
  /** Traduction du mot/chunk en langue source (fr pour le pack fr-en). */
  translation: z.string().min(1),
  /** Phrase d'exemple en langue cible, contient le chunk. */
  example: z.string().min(1),
  example_translation: z.string().min(1),
  /** Phrase à trou : `___` remplace le mot-cible. */
  cloze: z.string().includes('___'),
  /** Tuiles pour la reconstruction (tier 3) — reconstitue une phrase avec le chunk. */
  tiles: z.array(z.string().min(1)).min(3),
  distractor_tiles: z.array(z.string().min(1)).min(1),
  /** Note pédagogique courte, en langue source. */
  notes: z.string().default(''),
  tags: z.array(z.string()).default([]),
  /** Mauvaises réponses plausibles (QCM/cloze) ; si ≥ 3, elles remplacent le tirage au hasard. */
  wrong: z.array(z.string().min(1)).default([]),
  /** Saisie exacte exigée (pas de tolérance typo) — pour la grammaire (vais/vas). */
  strict: z.boolean().default(false),
  /** Faux pour les items dont les « mauvaises réponses » sont du français valide (faux amis, depuis/pendant…) : pas de « repère l'erreur ». */
  allowSpot: z.boolean().default(true),
  /** Prononciation (API) du chunk, affichée sur les cartes. */
  phonetic: z.string().optional(),
})

export const VeinSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Patron grammatical explicite de la veine (§5.4). */
  pattern: z.string().min(1),
  /** 2 phrases max, en langue source. */
  pattern_note: z.string().min(1),
  cefr: z.enum(['A1', 'A2', 'B1', 'B2']),
  unlock_cost: z.number().int().min(0),
  prereq: z.array(z.string()).default([]),
  items: z.array(ItemSchema).min(3),
})

export const FilonSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  /** Ordre = arbre de progression du filon. */
  veins: z.array(z.string()).min(1),
})

export const PackSchema = z.object({
  id: z.string().min(1),
  /** Langue du joueur (UI des traductions). */
  sourceLang: z.string().min(2),
  /** Langue apprise. */
  targetLang: z.string().min(2),
  /** Locale BCP-47 préférée pour le TTS. */
  ttsLang: z.string().min(2),
  name: z.string().min(1),
  filons: z.array(FilonSchema).min(1),
})

export type Item = z.infer<typeof ItemSchema>
export type Vein = z.infer<typeof VeinSchema>
export type Filon = z.infer<typeof FilonSchema>
export type PackManifest = z.infer<typeof PackSchema>

export interface Pack extends PackManifest {
  veins: Record<string, Vein>
  items: Record<string, Item & { vein: string }>
}
