import { useEffect, useState } from 'react'

interface Spark {
  id: number
  dx: number
  dy: number
  left: number
}

/** Jaillissement d'étincelles sur réussite. `trigger` change → nouvelle salve. */
export function SparkBurst({ trigger }: { trigger: number }) {
  const [sparks, setSparks] = useState<Spark[]>([])

  useEffect(() => {
    if (trigger === 0) return
    const burst = Array.from({ length: 10 }, (_, i) => ({
      id: trigger * 100 + i,
      dx: (Math.random() - 0.5) * 160,
      dy: -40 - Math.random() * 110,
      left: 40 + Math.random() * 20,
    }))
    setSparks(burst)
    const timer = setTimeout(() => setSparks([]), 750)
    return () => clearTimeout(timer)
  }, [trigger])

  return (
    <div className="spark-layer" aria-hidden>
      {sparks.map((s) => (
        <span
          key={s.id}
          className="spark"
          style={{
            left: `${s.left}%`,
            top: 0,
            ['--dx' as string]: `${s.dx}px`,
            ['--dy' as string]: `${s.dy}px`,
          }}
        />
      ))}
    </div>
  )
}
