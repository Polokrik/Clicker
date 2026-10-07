import { packs, choosePack } from '../content'
import { Miner } from './components/Miner'

/** Ce que dit un locuteur de chaque langue source, dans sa propre langue. */
const I_SPEAK: Record<string, string> = {
  en: 'I speak English',
  fr: 'Je parle français',
  hi: 'मैं हिन्दी बोलता हूँ',
}

/**
 * Premier lancement : choix de la langue. Bilingue volontairement (l'interface
 * n'est pas encore dans la bonne langue). La langue du navigateur passe en premier.
 */
export function LanguagePicker() {
  const browser = (typeof navigator !== 'undefined' ? navigator.language : 'en').slice(0, 2)
  const options = Object.values(packs).sort(
    (a, b) => Number(b.sourceLang === browser) - Number(a.sourceLang === browser),
  )

  return (
    <div className="app">
      <div className="screen lang-picker">
        <Miner pose="idle" height={150} />
        <h1>Word Forge</h1>
        <p className="lang-title">Choose your language · Choisis ta langue</p>
        <div className="lang-options">
          {options.map((pack) => (
            <button key={pack.id} className="lang-option" onClick={() => choosePack(pack.id)}>
              <span className="lang-pair">
                {pack.sourceLang.toUpperCase()} → {pack.targetLang.toUpperCase()}
              </span>
              <span className="lang-name">{pack.name}</span>
              <span className="lang-sub">{I_SPEAK[pack.sourceLang] ?? pack.sourceLang}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
