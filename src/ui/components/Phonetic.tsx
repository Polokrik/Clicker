/** Prononciation (API) d'un chunk, entre barres obliques. Rien si la carte n'en a pas. */
export function Phonetic({ ipa }: { ipa?: string }) {
  if (!ipa) return null
  return (
    <div className="phonetic" lang="und" aria-label="pronunciation">
      /{ipa}/
    </div>
  )
}
