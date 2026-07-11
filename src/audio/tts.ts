import { activePack } from '../content'

/**
 * TTS via Web Speech API (§7). Fallback silencieux : `ttsAvailable()` permet
 * à l'UI d'afficher une icône barrée si aucune voix n'est disponible.
 */

let cachedVoice: SpeechSynthesisVoice | null | undefined

function findVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  const voices = speechSynthesis.getVoices()
  const lang = activePack.ttsLang.toLowerCase()
  const base = lang.slice(0, 2)
  return (
    voices.find((v) => v.lang.toLowerCase() === lang) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ??
    null
  )
}

export function ttsAvailable(): boolean {
  if (typeof speechSynthesis === 'undefined') return false
  if (cachedVoice === undefined) cachedVoice = findVoice()
  return cachedVoice !== null
}

/** Les voix arrivent parfois en asynchrone : re-résout quand la liste change. */
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = findVoice()
  })
}

export function speak(text: string, rate = 0.95): boolean {
  if (!ttsAvailable() || !cachedVoice) return false
  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = cachedVoice
  utterance.lang = cachedVoice.lang
  utterance.rate = rate
  speechSynthesis.speak(utterance)
  return true
}

export function stopSpeaking(): void {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}
