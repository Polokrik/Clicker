import { useMemo, useState } from 'react'
import { shuffleTiles } from '../../engine/exercise'
import { STR } from '../../i18n/strings'
import type { ExerciseProps } from './types'

interface PoolTile {
  index: number
  text: string
}

/** Tier 3 — Construction : remettre les tuiles de la phrase dans l'ordre (§4). */
export function TilesExercise({ item, onAnswer }: ExerciseProps) {
  const pool = useMemo<PoolTile[]>(
    () =>
      shuffleTiles(item.tiles, item.distractor_tiles).map((text, index) => ({
        index,
        text,
      })),
    [item.tiles, item.distractor_tiles],
  )
  const [placed, setPlaced] = useState<PoolTile[]>([])

  const placedIndexes = new Set(placed.map((t) => t.index))
  const complete = placed.length === item.tiles.length

  function submit() {
    const correct =
      placed.length === item.tiles.length &&
      placed.every((t, i) => t.text === item.tiles[i])
    onAnswer({ correct })
  }

  return (
    <div className="exercise-card">
      <div className="exercise-prompt">{STR.exercises.tilesPrompt}</div>
      <div className="exercise-question">« {item.example_translation} »</div>
      <div className="tile-zone">
        {placed.map((tile) => (
          <button
            key={tile.index}
            className="tile placed"
            onClick={() => setPlaced(placed.filter((t) => t.index !== tile.index))}
          >
            {tile.text}
          </button>
        ))}
      </div>
      <div className="tile-pool">
        {pool.map((tile) => (
          <button
            key={tile.index}
            className="tile"
            disabled={placedIndexes.has(tile.index)}
            onClick={() => setPlaced([...placed, tile])}
          >
            {tile.text}
          </button>
        ))}
      </div>
      <button className="primary-btn" disabled={!complete} onClick={submit}>
        {STR.exercises.validate}
      </button>
    </div>
  )
}
