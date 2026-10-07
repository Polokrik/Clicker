import { useMemo, useState } from 'react'
import { useGame } from '../../store/gameStore'
import { activePack } from '../../content'
import { heat, reviveCard } from '../../engine/scheduler'
import { itemStatus, STATUS_RANK, veinMastery, type ItemStatus } from '../../engine/mastery'
import { speak, ttsAvailable } from '../../audio/tts'
import { STR, UI_LANG } from '../../i18n/strings'
import { Ingot } from '../components/Ingot'
import { ScreenTip } from '../components/ScreenTip'

/** Le Râtelier : la mémoire, règle par règle, avec l'urgence de chaque lingot. */
export function RackScreen() {
  const { player } = useGame()
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const rules = useMemo(() => {
    const now = new Date()
    return Object.values(activePack.veins)
      .map((vein) => {
        const ids = vein.items.map((i) => i.id)
        const entries = ids
          .filter((id) => player.items[id])
          .map((id) => ({
            id,
            state: player.items[id],
            item: activePack.items[id],
            heat: heat(player.items[id].fsrs, now),
            status: itemStatus(player.items[id], now),
          }))
          .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.heat - b.heat)
        return { vein, entries, mastery: veinMastery(ids, player.items, now) }
      })
      .filter((r) => r.entries.length > 0)
      // Règles les plus urgentes d'abord : dû, puis fragile, puis maîtrise croissante.
      .sort(
        (a, b) =>
          b.mastery.due - a.mastery.due ||
          b.mastery.shaky - a.mastery.shaky ||
          a.mastery.pct - b.mastery.pct,
      )
  }, [player.items])

  const totals = rules.reduce(
    (t, r) => ({
      due: t.due + r.mastery.due,
      shaky: t.shaky + r.mastery.shaky,
      solid: t.solid + r.mastery.solid,
    }),
    { due: 0, shaky: 0, solid: 0 },
  )
  const sel = selected
    ? (rules.flatMap((r) => r.entries).find((e) => e.id === selected) ?? null)
    : null

  return (
    <div className="screen">
      <ScreenTip id="rack" text={STR.tips.rack} />
      <div className="shop-section">
        <h2>{STR.rack.title}</h2>
        {rules.length > 0 && (
          <>
            <div className="status-summary">
              {(['due', 'shaky', 'solid'] as ItemStatus[]).map((st) => (
                <span key={st} className={`status-chip ${st}`}>
                  {totals[st]} {STR.rack.status[st]}
                </span>
              ))}
            </div>
            <p className="muted">{STR.rack.statusHint}</p>
          </>
        )}
      </div>

      {rules.length === 0 ? (
        <p style={{ color: 'var(--steel-200)' }}>{STR.rack.empty}</p>
      ) : (
        rules.map(({ vein, entries, mastery }) => {
          // Les règles qui ont du travail urgent sont ouvertes d'office.
          const isOpen = open[vein.id] ?? mastery.due + mastery.shaky > 0
          return (
            <section key={vein.id} className="rule">
              <button
                className="rule-toggle"
                aria-expanded={isOpen}
                onClick={() => setOpen({ ...open, [vein.id]: !isOpen })}
              >
                <div className="rule-head">
                  <span className="rule-name">{vein.name}</span>
                  <span>
                    {mastery.pct} % {STR.rack.mastery}
                  </span>
                </div>
                <div className="rule-pattern">{vein.pattern}</div>
                <div className="stack-bar" aria-hidden>
                  <span className="solid" style={{ flexGrow: mastery.solid }} />
                  <span className="shaky" style={{ flexGrow: mastery.shaky }} />
                  <span className="due" style={{ flexGrow: mastery.due }} />
                  <span className="unseen" style={{ flexGrow: mastery.unseen }} />
                </div>
                <div className="rule-counts">
                  {mastery.due > 0 && <span className="due">{mastery.due} {STR.rack.status.due}</span>}
                  {mastery.shaky > 0 && <span className="shaky">{mastery.shaky} {STR.rack.status.shaky}</span>}
                  {mastery.solid > 0 && <span className="solid">{mastery.solid} {STR.rack.status.solid}</span>}
                  {mastery.unseen > 0 && <span>{mastery.unseen} {STR.rack.unseen}</span>}
                </div>
              </button>
              {isOpen && (
                <div className="rack-grid">
                  {entries.map((e) => (
                    <button
                      key={e.id}
                      className={`rack-cell ${e.status}`}
                      onClick={() => setSelected(e.id)}
                    >
                      <span className={`status-dot ${e.status}`} aria-hidden />
                      <Ingot heat={e.heat} height={30} />
                      <div className="word">{e.item.word}</div>
                      <div className="cell-status">{STR.rack.status[e.status]}</div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )
        })
      )}

      {sel && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className={`status-chip ${sel.status}`}>{STR.rack.status[sel.status]}</span>
            <div className="chunk" style={{ marginTop: 14 }}>
              {sel.item.chunk}
              {ttsAvailable() && (
                <button onClick={() => speak(sel.item.example)} style={{ marginLeft: 8 }}>
                  🔊
                </button>
              )}
            </div>
            <div className="translation">{sel.item.translation}</div>
            <div className="example">{sel.item.example}</div>
            <div className="example-fr">{sel.item.example_translation}</div>
            {sel.item.notes && <div className="note">{sel.item.notes}</div>}
            <div className="stat-row">
              <span>{STR.rack.stats.tier}</span>
              <span>{STR.tierNames[sel.state.tier]}</span>
            </div>
            <div className="stat-row">
              <span>{STR.rack.memoryNow}</span>
              <span>{Math.round(sel.heat)} %</span>
            </div>
            <div className="stat-row">
              <span>{STR.rack.stats.reps}</span>
              <span>{sel.state.totalReps}</span>
            </div>
            <div className="stat-row">
              <span>{STR.rack.stats.lapses}</span>
              <span>{sel.state.lapses}</span>
            </div>
            <div className="stat-row">
              <span>{STR.rack.stats.due}</span>
              <span>
                {sel.status === 'due'
                  ? STR.rack.now
                  : new Date(reviveCard(sel.state.fsrs).due).toLocaleDateString(UI_LANG, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
              </span>
            </div>
            <p className="muted" style={{ marginTop: 10 }}>
              {STR.rack.memoryHint}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
