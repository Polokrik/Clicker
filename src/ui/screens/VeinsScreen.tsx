import { useGame } from '../../store/gameStore'
import { activePack } from '../../content'
import { STR } from '../../i18n/strings'
import { ScreenTip } from '../components/ScreenTip'
import { weakVeins } from '../../engine/mastery'

/** Les Filons : carte des veines, arbre de progression (§7). */
export function VeinsScreen() {
  const { player, unlockVein, startLesson } = useGame()
  const weak = new Set(player.placement ? weakVeins(player.placement.results) : [])

  return (
    <div className="screen">
      <ScreenTip id="veins" text={STR.tips.veins} />
      {activePack.filons.map((filon) => (
        <section key={filon.id} className="filon">
          <h2>{filon.name}</h2>
          <p>{filon.description}</p>
          {filon.veins.map((veinId) => {
            const vein = activePack.veins[veinId]
            const unlocked = player.unlockedVeins.includes(veinId)
            const completed = player.completedVeins.includes(veinId)
            const prereqOk = vein.prereq.every((p) =>
              player.completedVeins.includes(p),
            )
            const canPay = player.sparks >= vein.unlock_cost

            return (
              <div key={veinId} className={`vein-card${unlocked ? '' : ' locked'}`}>
                <h3>
                  {vein.name}
                  {weak.has(veinId) && <span className="weak-badge">{STR.veins.weak}</span>}
                </h3>
                <div className="pattern">
                  {STR.veins.pattern}{STR.colon} {vein.pattern}
                </div>
                <div className="meta">
                  <span>{vein.cefr}</span>
                  <span>
                    {vein.items.length} {STR.veins.items}
                  </span>
                </div>
                <div className="actions">
                  {completed ? (
                    <span className="vein-done">✓ {STR.veins.completed}</span>
                  ) : unlocked ? (
                    <button className="vein-btn" onClick={() => startLesson(veinId)}>
                      ⛏ {STR.veins.start}
                    </button>
                  ) : !prereqOk ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--steel-400)' }}>
                      🔒 {STR.veins.needPrereq}{' '}
                      {vein.prereq
                        .filter((p) => !player.completedVeins.includes(p))
                        .map((p) => activePack.veins[p]?.name ?? p)
                        .join(', ')}
                    </span>
                  ) : (
                    <>
                      <button
                        className="vein-btn"
                        disabled={!canPay}
                        onClick={() => unlockVein(veinId)}
                      >
                        {STR.veins.unlock}
                      </button>
                      <span className="cost">{vein.unlock_cost} ✦</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
