import { FEEDBACK_EMAIL } from '../config'
import { activePackId } from '../content'
import { STR } from '../i18n/strings'

/**
 * Lien mailto de signalement. Le contexte technique (langue, version, appareil) est
 * ajouté sous le message ; `itemId` permet de signaler une carte précise (contrôle qualité du contenu).
 */
export function reportHref(itemId?: string): string {
  const ctx = [
    `pack: ${activePackId}`,
    `build: ${__BUILD__}`,
    itemId ? `item: ${itemId}` : null,
    `screen: ${window.innerWidth}x${window.innerHeight}`,
    `ua: ${navigator.userAgent}`,
  ]
    .filter(Boolean)
    .join('\n')
  const subject = `${STR.appName} — ${itemId ? STR.report.subjectItem : STR.report.subject}`
  const body = `${STR.report.body}\n\n\n---\n${ctx}\n`
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
