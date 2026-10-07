import { PackSchema, VeinSchema, type Pack, type Vein } from './schema'

/**
 * Chargement statique des packs de contenu (§8) : chaque pack est un dossier
 * `packs/<id>/` avec un `pack.json` (manifeste) et `veins/*.json` (une veine
 * par fichier). Tout est validé par Zod au chargement — une erreur de contenu
 * casse au démarrage, pas en pleine partie.
 */

const manifestModules = import.meta.glob('./packs/*/pack.json', {
  eager: true,
  import: 'default',
})
const veinModules = import.meta.glob('./packs/*/veins/*.json', {
  eager: true,
  import: 'default',
})

function packIdFromPath(path: string): string {
  const match = path.match(/packs\/([^/]+)\//)
  if (!match) throw new Error(`Chemin de pack invalide : ${path}`)
  return match[1]
}

export function loadPacks(): Record<string, Pack> {
  const packs: Record<string, Pack> = {}

  for (const [path, raw] of Object.entries(manifestModules)) {
    const manifest = PackSchema.parse(raw)
    packs[packIdFromPath(path)] = { ...manifest, veins: {}, items: {} }
  }

  for (const [path, raw] of Object.entries(veinModules)) {
    const packId = packIdFromPath(path)
    const pack = packs[packId]
    if (!pack) throw new Error(`Veine sans pack : ${path}`)
    const vein: Vein = VeinSchema.parse(raw)
    pack.veins[vein.id] = vein
    for (const item of vein.items) {
      if (pack.items[item.id]) {
        throw new Error(`Item dupliqué « ${item.id} » dans le pack ${packId}`)
      }
      pack.items[item.id] = { ...item, vein: vein.id }
    }
  }

  // Cohérence : toutes les veines des filons existent, prérequis connus.
  for (const pack of Object.values(packs)) {
    for (const filon of pack.filons) {
      for (const veinId of filon.veins) {
        if (!pack.veins[veinId]) {
          throw new Error(`Filon ${filon.id} : veine inconnue « ${veinId} »`)
        }
      }
    }
    for (const vein of Object.values(pack.veins)) {
      for (const p of vein.prereq) {
        if (!pack.veins[p]) {
          throw new Error(`Veine ${vein.id} : prérequis inconnu « ${p} »`)
        }
      }
    }
  }

  return packs
}

export const packs = loadPacks()

/** Pack proposé au premier lancement. */
export const DEFAULT_PACK_ID = 'en-fr'
const PACK_KEY = 'forge-pack'

function storedPackId(): string | null {
  try {
    return localStorage.getItem(PACK_KEY)
  } catch {
    return null
  }
}

const startId = storedPackId()
export const activePackId: string =
  startId && packs[startId] ? startId : packs[DEFAULT_PACK_ID] ? DEFAULT_PACK_ID : Object.keys(packs)[0]
export const activePack: Pack = packs[activePackId]

/** Vrai au tout premier lancement (aucun choix mémorisé) : l'app propose alors la langue. */
export function needsLanguageChoice(): boolean {
  try {
    return localStorage.getItem(PACK_KEY) === null
  } catch {
    return false // stockage indisponible : inutile de redemander à chaque lancement
  }
}

/** Mémorise le pack choisi puis recharge (état et textes liés au pack). */
export function choosePack(id: string): void {
  if (!packs[id]) return
  try {
    localStorage.setItem(PACK_KEY, id)
  } catch {
    // stockage indisponible : le choix ne survivra pas au rechargement
  }
  location.reload()
}

/** Change de pack depuis les réglages. */
export function switchPack(id: string): void {
  if (id !== activePackId) choosePack(id)
}
