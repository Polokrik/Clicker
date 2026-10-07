import { z } from 'zod'

/**
 * Défi asynchrone, sans serveur : tout tient dans un lien. Les deux joueurs tirent
 * les mêmes questions grâce à la graine (`seed`) ; le score de celui qui défie
 * voyage dans le lien. Aucun contrôle anti-triche : c'est un jeu entre amis.
 */
export const ChallengeSchema = z.object({
  v: z.literal(1),
  pack: z.string().min(1).max(20),
  /** 'mix' (tout le pack) ou l'id d'une veine. */
  scope: z.string().min(1).max(60),
  seed: z.number().int().min(0).max(2 ** 31),
  /** Nombre de questions. */
  n: z.number().int().min(3).max(20),
  name: z.string().max(20),
  score: z.number().int().min(0).max(3000),
  correct: z.number().int().min(0).max(20),
})
export type Challenge = z.infer<typeof ChallengeSchema>

/** PRNG déterministe (mulberry32). */
export function seededRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Mêmes ids, même ordre pour une graine donnée, quel que soit l'appareil. */
export function pickChallengeItems(itemIds: string[], seed: number, n: number): string[] {
  const rng = seededRng(seed)
  const ids = [...itemIds].sort()
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids.slice(0, Math.min(n, ids.length))
}

/** 100 par bonne réponse + jusqu'à 50 de bonus de vitesse (0 au-delà de 8 s). */
export function questionPoints(correct: boolean, elapsedMs: number): number {
  if (!correct) return 0
  const bonus = Math.max(0, Math.min(50, Math.round((8000 - elapsedMs) / 160)))
  return 100 + bonus
}

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): string {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function encodeChallenge(c: Challenge): string {
  return toBase64Url(JSON.stringify(c))
}

/** Décode et valide un lien ; null si invalide (jamais d'exception). */
export function decodeChallenge(payload: string): Challenge | null {
  try {
    const parsed = ChallengeSchema.safeParse(JSON.parse(fromBase64Url(payload)))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/** Extrait un défi du fragment d'URL (`#c=...`). */
export function challengeFromHash(hash: string): Challenge | null {
  const m = hash.match(/^#c=([A-Za-z0-9_-]+)$/)
  return m ? decodeChallenge(m[1]) : null
}
