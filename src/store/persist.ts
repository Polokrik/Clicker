import { del, get, set } from 'idb-keyval'
import type { PlayerState } from '../engine/types'
import { activePackId } from '../content'

/**
 * Persistance IndexedDB via idb-keyval (§8). localStorage est proscrit pour
 * l'état de jeu. La sauvegarde est un simple snapshot JSON-compatible ;
 * les Card ts-fsrs sont revivifiées à la lecture (reviveCard).
 */

// Une sauvegarde par pack. fr-en garde l'ancienne clé : les parties existantes survivent.
const SAVE_KEY = activePackId === 'fr-en' ? 'forge-save-v1' : `forge-save-v1:${activePackId}`
export const SAVE_VERSION = 1

interface SaveFile {
  version: number
  savedAt: number
  player: PlayerState
}

export async function loadSave(): Promise<PlayerState | null> {
  try {
    const raw = await get<SaveFile>(SAVE_KEY)
    if (!raw || raw.version !== SAVE_VERSION) return null
    return raw.player
  } catch {
    return null
  }
}

let saveChain: Promise<void> = Promise.resolve()
// Pendant une réinitialisation, plus aucune écriture (un tick pourrait ressusciter la sauvegarde).
let frozen = false

/** Sauvegarde sérialisée (les appels s'enchaînent, pas d'écriture concurrente). */
export function persistSave(player: PlayerState): Promise<void> {
  if (frozen) return saveChain
  saveChain = saveChain.then(() =>
    set(SAVE_KEY, {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      player: JSON.parse(JSON.stringify(player)) as PlayerState,
    }).catch((e) => console.error('Sauvegarde impossible :', e)),
  )
  return saveChain
}

/** Export JSON de la sauvegarde (téléchargement côté UI). */
export function exportSave(player: PlayerState): string {
  const file: SaveFile = {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    player,
  }
  return JSON.stringify(file, null, 2)
}

/** Import JSON — valide la version et la présence des champs de base. */
export function parseImportedSave(json: string): PlayerState {
  const file = JSON.parse(json) as SaveFile
  if (file.version !== SAVE_VERSION) {
    throw new Error(`Version de sauvegarde inconnue : ${file.version}`)
  }
  const p = file.player
  if (
    typeof p?.sparks !== 'number' ||
    typeof p?.items !== 'object' ||
    !Array.isArray(p?.unlockedVeins)
  ) {
    throw new Error('Fichier de sauvegarde invalide')
  }
  return p
}

/**
 * Efface la sauvegarde du pack actif. `everything` efface aussi toutes les
 * autres langues, le choix de langue, le tutoriel et les astuces : l'app
 * repart comme au tout premier lancement.
 */
export async function resetSave(everything: boolean, allPackIds: string[]): Promise<void> {
  frozen = true
  await saveChain
  const keys = everything
    ? ['forge-save-v1', ...allPackIds.map((id) => `forge-save-v1:${id}`)]
    : [SAVE_KEY]
  await Promise.all(keys.map((k) => del(k).catch(() => undefined)))
  if (everything) {
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith('forge-')) localStorage.removeItem(k)
      }
    } catch {
      // stockage indisponible : rien d'autre à effacer
    }
  }
  location.reload()
}
