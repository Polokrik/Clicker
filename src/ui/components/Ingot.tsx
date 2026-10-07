import { art } from '../art'

/**
 * Lingot illustré. La chaleur pilote la couleur : froid = acier désaturé et
 * assombri, chaud = or/braise éclatant avec une lueur (§3.3, §7).
 */
export function Ingot({
  heat,
  height = 34,
  label,
}: {
  heat: number
  height?: number
  label?: string
}) {
  const t = Math.max(0, Math.min(100, heat)) / 100
  const glow = t > 0.5 ? ` drop-shadow(0 0 ${6 + t * 12}px rgb(255 140 50 / ${0.25 + t * 0.4}))` : ''
  return (
    <span className="ingot" style={{ height, width: height }}>
      <img
        src={art('ingot.webp')}
        alt=""
        draggable={false}
        style={{ filter: `grayscale(${1 - t}) brightness(${0.6 + t * 0.4})${glow}` }}
      />
      {label && <span className="ingot-label">{label}</span>}
    </span>
  )
}
