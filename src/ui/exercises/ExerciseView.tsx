import type { ExerciseType } from '../../engine/types'
import type { ExerciseProps } from './types'
import { QcmExercise } from './QcmExercise'
import { ClozeExercise } from './ClozeExercise'
import { TypeExercise } from './TypeExercise'
import { TilesExercise } from './TilesExercise'
import { AudioExercise } from './AudioExercise'

/** Route vers le composant d'exercice du type demandé. */
export function ExerciseView({
  exercise,
  ...props
}: ExerciseProps & { exercise: ExerciseType }) {
  switch (exercise) {
    case 'qcm':
      return <QcmExercise {...props} />
    case 'cloze':
      return <ClozeExercise {...props} />
    case 'type':
      return <TypeExercise {...props} />
    case 'tiles':
      return <TilesExercise {...props} />
    case 'audio':
      return <AudioExercise {...props} />
  }
}
