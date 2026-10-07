import { art } from '../art'

export type MinerPose = 'idle' | 'happy' | 'oops' | 'cheer'

/**
 * Le mineur, mascotte du jeu. Une image par pose ; l'animation (respiration,
 * rebond, secousse) est en CSS et coupée par prefers-reduced-motion.
 */
export function Miner({ pose = 'idle', height = 200 }: { pose?: MinerPose; height?: number }) {
  return (
    <img
      key={pose}
      className={`miner miner-${pose}`}
      src={art(`miner_${pose}.webp`)}
      alt=""
      height={height}
      width={Math.round(height * (2 / 3))}
      draggable={false}
    />
  )
}
