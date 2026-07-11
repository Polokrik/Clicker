/**
 * Lingot en clip-path dont la couleur HSL projette la chaleur (§3.3, §7) :
 * 0 % = acier froid bleuté, 100 % = braise éclatante.
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
  const hue = 220 - t * 185 // 220 (acier) → 35 (braise)
  const sat = 15 + t * 75
  const light = 22 + t * 38
  const glow = t > 0.5 ? `0 0 ${8 + t * 14}px hsl(${hue} ${sat}% ${light}% / 0.55)` : 'none'
  return (
    <div
      className="ingot"
      style={{
        height,
        background: `linear-gradient(180deg,
          hsl(${hue} ${sat}% ${Math.min(72, light + 12)}%),
          hsl(${hue} ${sat}% ${light}%))`,
        boxShadow: glow,
      }}
    >
      {label && (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: t > 0.45 ? '#1a0d05' : '#9aa5b5' }}>
          {label}
        </span>
      )}
    </div>
  )
}
