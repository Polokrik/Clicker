import { useState } from 'react'
import { STR } from '../../i18n/strings'

const key = (id: string) => `forge-tip-${id}`

function seen(id: string): boolean {
  try {
    return localStorage.getItem(key(id)) === '1'
  } catch {
    return true
  }
}

/** Rouvre toutes les astuces (appelé depuis « Replay the tutorial »). */
export function resetTips(): void {
  try {
    for (const id of ['forge', 'rack', 'veins', 'workshop']) localStorage.removeItem(key(id))
  } catch {
    // sans stockage, rien à réinitialiser
  }
}

/** Bandeau d'aide affiché une seule fois à la première visite d'un écran. */
export function ScreenTip({ id, text }: { id: 'forge' | 'rack' | 'veins' | 'workshop'; text: string }) {
  const [open, setOpen] = useState(() => !seen(id))
  if (!open) return null
  return (
    <div className="screen-tip" role="note">
      <p>{text}</p>
      <button
        onClick={() => {
          try {
            localStorage.setItem(key(id), '1')
          } catch {
            // sans stockage, l'astuce reviendra au prochain lancement
          }
          setOpen(false)
        }}
      >
        {STR.tips.gotIt}
      </button>
    </div>
  )
}
