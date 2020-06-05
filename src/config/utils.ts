import { isNull } from 'lodash-es'
import { Grade, Pass } from '@/types'

/**
 * Returns the Bootstrap variant to use for elements to associate them with a score.
 *
 * @param pass The pass whose score to style based on.
 * @return A value for the Bootstrap-Vue "variant" attribute.
 */

// eslint-disable-next-line import/prefer-default-export
export function variant(pass: Pass): string | null {
  if (isNull(pass.score) || pass.grade === Grade.Bolter) return null
  if (pass.score >= 4) return 'success'
  if (pass.score >= 2) return 'warning'
  return 'danger'
}
