import { useMemo, useState } from 'react'
import { useGame } from '../../store/gameStore'
import { activePack } from '../../content'
import { heat, isDue, reviveCard } from '../../engine/scheduler'
import { speak, ttsAvailable } from '../../audio/tts'
import { STR } from '../../i18n/strings'
import { Ingot } from '../components/Ingot'

/** Le Râtelier : grille de tous les items, chaleur en temps réel (§7). */
export function RackScreen() {
  const { player } = useGame()
  const [selected, setSelected] = useState<string | null>(null)

  const entries = useMemo(() => {
    const now = new Date()
    return Object.entries(player.items)
      .map(([id, state]) => ({
        id,
        state,
        item: activePack.items[id],
        heat: heat(state.fsrs, now),
        due: isDue(state, now),
      }))
      .filter((e) => e.item)
      .sort((a, b) => Number(b.due) - Number(a.due) || a.heat - b.heat)
  }, [player.items])

  const dueCount = entries.filter((e) => e.due).length
  const sel = selected
    ? entries.find((e) => e.id === selected) ?? null
    : null

  return (
    <div className="screen">
      <div className="shop-section">
        <h2>{STR.rack.title}</h2>
        {entries.length > 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--steel-200)', marginTop: 4 }}>
            {dueCount > 0
              ? `${dueCount} ${STR.rack.due} — ${STR.rack.sortDueFirst}`
              : STR.rack.sortDueFirst}
          </p>
        )}
      </div>

      {entries.length === 0 ? (
        <p style={{ color: 'var(--steel-200)' }}>{STR.rack.empty}</p>
      ) : (
        <div className="rack-grid">
          {entries.map((e) => (
            <button key={e.id} className="rack-cell" onClick={() => setSelected(e.id)}>
              {e.due && <span className="due-badge">{STR.rack.dueBadge}</span>}
              <Ingot heat={e.heat} height={26} />
              <div className="word">{e.item.word}</div>
            </button>
          ))}
        </div>
      )}

      {sel && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <Ingot heat={sel.heat} height={40} label={`${Math.round(sel.heat)} %`} />
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
            <div className="stat-row">
              <span>{STR.rack.stats.tier}</span>
              <span>{STR.tierNames[sel.state.tier]}</span>
            </div>
            <div className="stat-row">
              <span>{STR.forge.heat}</span>
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
                {sel.due
                  ? STR.rack.now
                  : new Date(reviveCard(sel.state.fsrs).due).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
