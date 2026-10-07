import { useRef, useState } from 'react'
import { useGame } from '../../store/gameStore'
import { UPGRADE_COSTS, type UpgradeId } from '../../engine/economy'
import { exportSave, resetSave } from '../../store/persist'
import { STR } from '../../i18n/strings'
import { activePack, activePackId, packs, switchPack } from '../../content'
import { ScreenTip } from '../components/ScreenTip'
import { reportHref } from '../report'

const UPGRADES: { id: UpgradeId; icon: string }[] = [
  { id: 'bellows', icon: '💨' },
  { id: 'anvil', icon: '🪨' },
  { id: 'chimney', icon: '🏭' },
]

/** L'Atelier : upgrades, alliages (teaser), sauvegarde, réglages (§7). */
export function WorkshopScreen({
  onReplayTutorial,
  onOpenPlacement,
  onStartChallenge,
}: {
  onReplayTutorial: () => void
  onOpenPlacement: () => void
  onStartChallenge: (scope: string) => void
}) {
  const { player, buyUpgrade, importSave, setNewPerDay } = useGame()
  const [confirmReset, setConfirmReset] = useState<'pack' | 'all' | null>(null)
  const [challengeScope, setChallengeScope] = useState('mix')
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
      <ScreenTip id="workshop" text={STR.tips.workshop} />
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

      {Object.keys(packs).length > 1 && (
        <section className="shop-section">
          <h2>{STR.workshop.language}</h2>
          <select
            className="type-input"
            value={activePackId}
            onChange={(e) => switchPack(e.target.value)}
          >
            {Object.values(packs).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </section>
      )}

      <section className="shop-section">
        <h2>{STR.challenge.section}</h2>
        <p className="muted" style={{ marginBottom: 10 }}>
          {STR.challenge.sectionHint}
        </p>
        <select
          className="type-input"
          value={challengeScope}
          onChange={(e) => setChallengeScope(e.target.value)}
          style={{ marginBottom: 10 }}
        >
          <option value="mix">{STR.challenge.mix}</option>
          {Object.values(activePack.veins).map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <button className="ghost-btn" onClick={() => onStartChallenge(challengeScope)}>
          {STR.challenge.create}
        </button>
      </section>

      <section className="shop-section">
        <h2>{STR.workshop.levelCheck}</h2>
        <button className="ghost-btn" onClick={onOpenPlacement}>
          {STR.placement.retake}
        </button>
      </section>

      <section className="shop-section">
        <h2>{STR.workshop.howTo}</h2>
        <button className="ghost-btn" onClick={onReplayTutorial}>
          {STR.workshop.replayTutorial}
        </button>
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

      <section className="shop-section">
        <h2>{STR.report.button}</h2>
        <a className="ghost-btn link-btn" href={reportHref()}>
          ✉ {STR.report.button}
        </a>
      </section>

      <section className="shop-section">
        <h2>{STR.workshop.reset}</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          <button className="ghost-btn danger" onClick={() => setConfirmReset('pack')}>
            {STR.workshop.resetPack}
          </button>
          <button className="ghost-btn danger" onClick={() => setConfirmReset('all')}>
            {STR.workshop.resetAll}
          </button>
        </div>
      </section>

      {confirmReset && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true">
          <div className="modal">
            <h2>{STR.workshop.resetConfirmTitle}</h2>
            <p className="muted" style={{ marginBottom: 16 }}>
              {confirmReset === 'pack' ? STR.workshop.resetPackBody : STR.workshop.resetAllBody}{' '}
              {STR.workshop.resetHint}
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              <button
                className="primary-btn danger"
                onClick={() => void resetSave(confirmReset === 'all', Object.keys(packs))}
              >
                {STR.workshop.resetConfirm}
              </button>
              <button className="ghost-btn" onClick={() => setConfirmReset(null)}>
                {STR.workshop.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
