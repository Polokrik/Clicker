import { useRef } from 'react'
import { useGame } from '../../store/gameStore'
import { UPGRADE_COSTS, type UpgradeId } from '../../engine/economy'
import { exportSave } from '../../store/persist'
import { STR } from '../../i18n/strings'

const UPGRADES: { id: UpgradeId; icon: string }[] = [
  { id: 'bellows', icon: '💨' },
  { id: 'anvil', icon: '🪨' },
  { id: 'chimney', icon: '🏭' },
]

/** L'Atelier : upgrades, alliages (teaser), sauvegarde, réglages (§7). */
export function WorkshopScreen() {
  const { player, buyUpgrade, importSave, setNewPerDay } = useGame()
  const fileInput = useRef<HTMLInputElement>(null)

  const retention =
    player.stats.reviewsTotal > 0
      ? Math.round((player.stats.reviewsCorrect / player.stats.reviewsTotal) * 100)
      : null

  function download() {
    const blob = new Blob([exportSave(player)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `forge-des-mots-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function onImportFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importSave(String(reader.result))
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Import impossible')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="screen">
      <section className="shop-section">
        <h2>{STR.workshop.upgrades}</h2>
        {UPGRADES.map(({ id, icon }) => {
          const level = player.upgrades[id]
          const cost = UPGRADE_COSTS[id](level)
          const info = STR.workshop[id]
          return (
            <div key={id} className="upgrade-row">
              <div className="info">
                <h3>
                  {icon} {info.name}{' '}
                  <span className="lvl">
                    {STR.workshop.level} {level}
                  </span>
                </h3>
                <p>{info.desc}</p>
              </div>
              <button
                className="buy-btn"
                disabled={player.sparks < cost}
                onClick={() => buyUpgrade(id)}
              >
                {cost.toLocaleString('fr-FR')} ✦
              </button>
            </div>
          )
        })}
      </section>

      <section className="shop-section">
        <h2>{STR.workshop.alloys}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--steel-200)', lineHeight: 1.5 }}>
          ⚗️ {STR.workshop.alloysSoon}
        </p>
      </section>

      <section className="shop-section">
        <h2>{STR.workshop.stats}</h2>
        {retention !== null && (
          <div className="settings-row">
            <span>{STR.workshop.retention}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-300)' }}>
              {retention} % · {player.stats.reviewsTotal} {STR.workshop.reviews}
            </span>
          </div>
        )}
        <div className="settings-row">
          <span>{STR.workshop.newPerDay}</span>
          <input
            type="number"
            min={0}
            max={50}
            value={player.settings.newPerDay}
            onChange={(e) => setNewPerDay(Number(e.target.value))}
          />
        </div>
      </section>

      <section className="shop-section">
        <h2>{STR.workshop.save}</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="ghost-btn" onClick={download}>
            {STR.workshop.exportSave}
          </button>
          <button className="ghost-btn" onClick={() => fileInput.current?.click()}>
            {STR.workshop.importSave}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImportFile(f)
              e.target.value = ''
            }}
          />
        </div>
      </section>
    </div>
  )
}
