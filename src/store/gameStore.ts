import { create } from 'zustand'
import { Rating, State } from 'ts-fsrs'
import type { AnswerOutcome, ExerciseType, PlayerState } from '../engine/types'
import { gradeAnswer } from '../engine/grading'
import {
  applyReview,
  isDue,
  newItemState,
  reviveCard,
} from '../engine/scheduler'
import { buildQueue, reinsertFailed, type QueueEntry } from '../engine/queue'
import {
  offlineEarnings,
  passiveRate,
  strikeGain,
  UPGRADE_COSTS,
  type UpgradeId,
} from '../engine/economy'
import { pickExercise } from '../engine/exercise'
import { activePack } from '../content'
import { loadSave, parseImportedSave, persistSave } from './persist'

/** Bonus d'étincelles à la fin d'une veine (extraction complète, §5.1). */
export const VEIN_COMPLETE_BONUS = 150
/** Réussites requises par item pendant l'extraction (§5.1). */
export const EXTRACTION_SUCCESSES = 2

export interface WelcomeBack {
  sparksEarned: number
  dueCount: number
  suggestedVein: string | null
  awayMs: number
}

interface DrillEntry {
  itemId: string
  exercise: 'qcm' | 'cloze'
}

export interface LessonState {
  veinId: string
  phase: 'prospect' | 'extract'
  /** Index de la carte de prospection affichée. */
  index: number
  drillQueue: DrillEntry[]
  /** Réussites par item pendant l'extraction. */
  successes: Record<string, number>
}

interface GameState {
  player: PlayerState
  loaded: boolean
  welcomeBack: WelcomeBack | null
  /** File de forge courante + exercice servi pour l'item de tête. */
  queue: QueueEntry[]
  exercise: ExerciseType | null
  servedAt: number
  combo: number
  lesson: LessonState | null

  init: () => Promise<void>
  dismissWelcomeBack: () => void
  refreshQueue: () => void
  answerForge: (outcome: Omit<AnswerOutcome, 'exercise' | 'streak'>) => {
    grade: Rating
    sparks: number
  }
  startLesson: (veinId: string) => void
  prospectGo: (delta: number) => void
  beginExtraction: () => void
  answerDrill: (outcome: Omit<AnswerOutcome, 'exercise' | 'streak'>) => {
    grade: Rating
    sparks: number
    lessonDone: boolean
  }
  quitLesson: () => void
  unlockVein: (veinId: string) => boolean
  buyUpgrade: (id: UpgradeId) => boolean
  tickPassive: (seconds: number) => void
  importSave: (json: string) => void
  setNewPerDay: (n: number) => void
}

function freshPlayer(): PlayerState {
  return {
    sparks: 0,
    upgrades: { bellows: 0, anvil: 0, chimney: 0 },
    unlockedVeins: Object.values(activePack.veins)
      .filter((v) => v.unlock_cost === 0 && v.prereq.length === 0)
      .map((v) => v.id),
    completedVeins: [],
    items: {},
    alloys: [],
    settings: { newPerDay: 10 },
    lastSeen: Date.now(),
    newIntroducedToday: { date: todayKey(), count: 0 },
    stats: { reviewsTotal: 0, reviewsCorrect: 0, sessionStart: Date.now() },
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Budget de nouveaux items restant aujourd'hui. */
function newBudget(player: PlayerState): number {
  const today = todayKey()
  const used = player.newIntroducedToday.date === today ? player.newIntroducedToday.count : 0
  return Math.max(0, player.settings.newPerDay - used)
}

/** Items New candidats : veines débloquées mais pas encore complétées. */
function activeVeinItemIds(player: PlayerState): string[] {
  const ids: string[] = []
  for (const veinId of player.unlockedVeins) {
    if (player.completedVeins.includes(veinId)) continue
    const vein = activePack.veins[veinId]
    if (vein) ids.push(...vein.items.map((i) => i.id).filter((id) => player.items[id]))
  }
  return ids
}

function countDue(player: PlayerState, now = new Date()): number {
  return Object.values(player.items).filter((i) => isDue(i, now)).length
}

/** Veine suggérée : première veine débloquée non complétée, sinon null. */
function suggestVein(player: PlayerState): string | null {
  for (const filon of activePack.filons) {
    for (const veinId of filon.veins) {
      if (player.unlockedVeins.includes(veinId) && !player.completedVeins.includes(veinId)) {
        return veinId
      }
    }
  }
  return null
}

export const useGame = create<GameState>((set, get) => {
  /** Applique une review au niveau joueur et persiste. */
  function review(
    itemId: string,
    outcome: Omit<AnswerOutcome, 'exercise' | 'streak'>,
    exercise: ExerciseType,
  ): { grade: Rating; sparks: number; player: PlayerState } {
    const { player, combo } = get()
    const item = player.items[itemId]
    const grade = gradeAnswer({ ...outcome, exercise, streak: item.streak })
    const next = applyReview(item, grade as 1 | 2 | 3 | 4)
    const wasNew = reviveCard(item.fsrs).state === State.New
    const gained = strikeGain({
      tier: item.tier,
      bellows: player.upgrades.bellows,
      combo,
      grade,
    })
    const today = todayKey()
    const introduced =
      player.newIntroducedToday.date === today ? player.newIntroducedToday.count : 0
    const updated: PlayerState = {
      ...player,
      sparks: player.sparks + gained,
      items: { ...player.items, [itemId]: next },
      lastSeen: Date.now(),
      newIntroducedToday: {
        date: today,
        count: introduced + (wasNew ? 1 : 0),
      },
      stats: {
        ...player.stats,
        reviewsTotal: player.stats.reviewsTotal + 1,
        reviewsCorrect: player.stats.reviewsCorrect + (outcome.correct ? 1 : 0),
      },
    }
    void persistSave(updated)
    return { grade, sparks: gained, player: updated }
  }

  return {
    player: freshPlayer(),
    loaded: false,
    welcomeBack: null,
    queue: [],
    exercise: null,
    servedAt: 0,
    combo: 0,
    lesson: null,

    init: async () => {
      const saved = await loadSave()
      let player = saved ?? freshPlayer()
      let welcomeBack: WelcomeBack | null = null

      if (saved) {
        const awayMs = Date.now() - saved.lastSeen
        // Synthèse « Pendant ton absence » à partir de 5 minutes d'absence.
        if (awayMs > 5 * 60_000) {
          const earned = offlineEarnings(
            saved.items,
            saved.upgrades,
            saved.lastSeen,
          )
          player = { ...saved, sparks: saved.sparks + earned, lastSeen: Date.now() }
          welcomeBack = {
            sparksEarned: earned,
            dueCount: countDue(player),
            suggestedVein: suggestVein(player),
            awayMs,
          }
        }
      }

      const queue = buildQueue(player.items, {
        activeVeinItems: activeVeinItemIds(player),
        newBudget: newBudget(player),
      })
      const head = queue[0]
      const exercise = head ? pickExercise(player.items[head.id].tier) : null
      set({ player, loaded: true, welcomeBack, queue, exercise, servedAt: Date.now() })
      void persistSave(player)
    },

    dismissWelcomeBack: () => set({ welcomeBack: null }),

    refreshQueue: () => {
      const { player } = get()
      const queue = buildQueue(player.items, {
        activeVeinItems: activeVeinItemIds(player),
        newBudget: newBudget(player),
      })
      const head = queue[0]
      set({
        queue,
        exercise: head ? pickExercise(player.items[head.id].tier) : null,
        servedAt: Date.now(),
      })
    },

    answerForge: (outcome) => {
      const { queue, exercise, combo } = get()
      const head = queue[0]
      if (!head || !exercise) return { grade: Rating.Good, sparks: 0 }

      const { grade, sparks, player: updated } = review(head.id, outcome, exercise)
      const failed = grade === Rating.Again

      // Échec → l'item revient après 2 autres ; réussite → il sort de la file.
      let nextQueue = failed
        ? reinsertFailed(queue.slice(1), head)
        : queue.slice(1)

      // Si la file est vide, tente une reconstruction (des steps Learning
      // peuvent être redevenus dus pendant la session).
      if (nextQueue.length === 0) {
        nextQueue = buildQueue(updated.items, {
          activeVeinItems: activeVeinItemIds(updated),
          newBudget: newBudget(updated),
        })
      }

      const nextHead = nextQueue[0]
      set({
        player: updated,
        combo: failed ? 0 : combo + 1,
        queue: nextQueue,
        exercise: nextHead ? pickExercise(updated.items[nextHead.id].tier) : null,
        servedAt: Date.now(),
      })
      return { grade, sparks }
    },

    startLesson: (veinId) => {
      const { player } = get()
      const vein = activePack.veins[veinId]
      if (!vein || !player.unlockedVeins.includes(veinId)) return

      // Prospection : crée les ItemStates manquants (état New).
      const items = { ...player.items }
      for (const item of vein.items) {
        if (!items[item.id]) items[item.id] = newItemState()
      }
      const updated = { ...player, items }
      set({
        player: updated,
        lesson: { veinId, phase: 'prospect', index: 0, drillQueue: [], successes: {} },
      })
      void persistSave(updated)
    },

    prospectGo: (delta) => {
      const { lesson } = get()
      if (!lesson) return
      const vein = activePack.veins[lesson.veinId]
      const index = Math.max(0, Math.min(vein.items.length - 1, lesson.index + delta))
      set({ lesson: { ...lesson, index } })
    },

    beginExtraction: () => {
      const { lesson } = get()
      if (!lesson) return
      const vein = activePack.veins[lesson.veinId]
      // Drill : chaque item doit réussir 1 QCM puis 1 cloze (§5.1).
      const drillQueue: DrillEntry[] = [
        ...vein.items.map((i) => ({ itemId: i.id, exercise: 'qcm' as const })),
        ...vein.items.map((i) => ({ itemId: i.id, exercise: 'cloze' as const })),
      ]
      set({
        lesson: { ...lesson, phase: 'extract', drillQueue, successes: {} },
        servedAt: Date.now(),
      })
    },

    answerDrill: (outcome) => {
      const { lesson, combo } = get()
      if (!lesson || lesson.drillQueue.length === 0) {
        return { grade: Rating.Good, sparks: 0, lessonDone: false }
      }
      const entry = lesson.drillQueue[0]
      const { grade, sparks, player: updated } = review(
        entry.itemId,
        outcome,
        entry.exercise,
      )
      const failed = grade === Rating.Again

      let drillQueue: DrillEntry[]
      const successes = { ...lesson.successes }
      if (failed) {
        // Ré-insertion après 2 autres exercices, même type.
        const rest = lesson.drillQueue.slice(1)
        const pos = Math.min(2, rest.length)
        drillQueue = [...rest.slice(0, pos), entry, ...rest.slice(pos)]
      } else {
        successes[entry.itemId] = (successes[entry.itemId] ?? 0) + 1
        drillQueue = lesson.drillQueue.slice(1)
      }

      const lessonDone = drillQueue.length === 0
      let player = updated
      if (lessonDone) {
        // Versement : la veine est complétée, bonus, items dans la file globale.
        player = {
          ...updated,
          sparks: updated.sparks + VEIN_COMPLETE_BONUS,
          completedVeins: [...updated.completedVeins, lesson.veinId],
        }
        void persistSave(player)
      }

      set({
        player,
        combo: failed ? 0 : combo + 1,
        lesson: lessonDone ? null : { ...lesson, drillQueue, successes },
        servedAt: Date.now(),
      })
      if (lessonDone) get().refreshQueue()
      return { grade, sparks, lessonDone }
    },

    quitLesson: () => {
      set({ lesson: null })
      get().refreshQueue()
    },

    unlockVein: (veinId) => {
      const { player } = get()
      const vein = activePack.veins[veinId]
      if (!vein) return false
      if (player.unlockedVeins.includes(veinId)) return false
      if (player.sparks < vein.unlock_cost) return false
      if (!vein.prereq.every((p) => player.completedVeins.includes(p))) return false
      const updated = {
        ...player,
        sparks: player.sparks - vein.unlock_cost,
        unlockedVeins: [...player.unlockedVeins, veinId],
      }
      set({ player: updated })
      void persistSave(updated)
      return true
    },

    buyUpgrade: (id) => {
      const { player } = get()
      const cost = UPGRADE_COSTS[id](player.upgrades[id])
      if (player.sparks < cost) return false
      const updated = {
        ...player,
        sparks: player.sparks - cost,
        upgrades: { ...player.upgrades, [id]: player.upgrades[id] + 1 },
      }
      set({ player: updated })
      void persistSave(updated)
      return true
    },

    tickPassive: (seconds) => {
      const { player } = get()
      const rate = passiveRate(player.items, player.upgrades.anvil)
      if (rate <= 0) {
        // Rien à gagner, mais on garde lastSeen à jour.
        const updated = { ...player, lastSeen: Date.now() }
        set({ player: updated })
        return
      }
      const updated = {
        ...player,
        sparks: player.sparks + rate * seconds,
        lastSeen: Date.now(),
      }
      set({ player: updated })
      void persistSave(updated)
    },

    importSave: (json) => {
      const player = parseImportedSave(json)
      set({ player, welcomeBack: null, lesson: null })
      void persistSave(player)
      get().refreshQueue()
    },

    setNewPerDay: (n) => {
      const { player } = get()
      const updated = {
        ...player,
        settings: { ...player.settings, newPerDay: Math.max(0, Math.min(50, n)) },
      }
      set({ player: updated })
      void persistSave(updated)
    },
  }
})

export { activePack, newBudget, countDue, suggestVein }
