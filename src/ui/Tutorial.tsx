import { useEffect, useState } from 'react'
import { STR } from '../i18n/strings'
import { Ingot } from './components/Ingot'
import { resetTips } from './components/ScreenTip'
import { Miner, type MinerPose } from './components/Miner'

const SEEN_KEY = 'forge-tutorial-v1'

export function tutorialSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return true // stockage indisponible : ne pas réafficher à chaque lancement
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // sans stockage, le tutoriel reste accessible depuis l'Atelier
  }
}

/** Visuel de chaque étape : l'objet dont on parle, pas une illustration décorative. */
function StepVisual({ step }: { step: number }) {
  if (step === 3) {
    return (
      <div className="tuto-heat" aria-hidden>
        <div className="heatbar">
          <div style={{ width: '82%', background: 'linear-gradient(90deg, var(--ember-600), var(--gold-300))' }} />
        </div>
        <div className="heatbar">
          <div style={{ width: '24%', background: 'linear-gradient(90deg, var(--ember-600), var(--gold-300))' }} />
        </div>
      </div>
    )
  }
  if (step === 4) return <div className="tuto-sparks" aria-hidden>✦ 120</div>
  if (step === 0) return <Ingot heat={85} height={96} />
  const pose: MinerPose = step === 2 ? 'happy' : 'idle'
  return <Miner pose={pose} height={140} />
}

export function Tutorial({ onClose }: { onClose: () => void }) {
  // Revoir le tutoriel rouvre aussi les astuces de chaque écran.
  useEffect(resetTips, [])
  const [step, setStep] = useState(0)
  const steps = STR.tutorial.steps
  const last = step === steps.length - 1

  function close() {
    markSeen()
    onClose()
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="tuto-title">
      <div className="modal tuto">
        <StepVisual step={step} />
        <h2 id="tuto-title">{steps[step].title}</h2>
        <p>{steps[step].body}</p>
        <div className="tuto-dots" aria-hidden>
          {steps.map((_, i) => (
            <span key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>
        <button className="primary-btn" onClick={last ? close : () => setStep(step + 1)}>
          {last ? STR.tutorial.start : STR.tutorial.next}
        </button>
        {!last && (
          <button className="ghost-btn tuto-skip" onClick={close}>
            {STR.tutorial.skip}
          </button>
        )}
      </div>
    </div>
  )
}
