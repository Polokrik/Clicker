import { useGame } from '../store/gameStore'
import { activePack } from '../content'
import { STR } from '../i18n/strings'

/** Modal « Pendant ton absence » (§2, boucle idle). */
export function WelcomeBackModal() {
  const { welcomeBack, dismissWelcomeBack } = useGame()
  if (!welcomeBack) return null

  const suggested = welcomeBack.suggestedVein
    ? activePack.veins[welcomeBack.suggestedVein]
    : null

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ textAlign: 'center' }}>
        <h2>{STR.welcome.title}</h2>
        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', color: 'var(--gold-300)' }}>
          +{Math.floor(welcomeBack.sparksEarned)} ✦
        </div>
        <p style={{ color: 'var(--steel-200)', fontSize: '0.85rem', marginBottom: 14 }}>
          {STR.welcome.earned}
        </p>
        {welcomeBack.dueCount > 0 && (
          <p style={{ marginBottom: 10 }}>
            🔥 <strong>{welcomeBack.dueCount}</strong> {STR.welcome.due}
          </p>
        )}
        {suggested && (
          <p style={{ fontSize: '0.85rem', color: 'var(--steel-200)', marginBottom: 16 }}>
            {STR.welcome.suggested} <strong>{suggested.name}</strong>
          </p>
        )}
        <button className="primary-btn" onClick={dismissWelcomeBack}>
          {welcomeBack.dueCount > 0 ? STR.welcome.goForge : STR.welcome.ok}
        </button>
      </div>
    </div>
  )
}
