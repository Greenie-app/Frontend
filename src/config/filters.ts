import numeral from 'numeral'

/**
 * Formats a number as a pass score.
 *
 * @param score The number to render.
 * @return The rendered number.
 */
export function scoreFilter(score: number): string {
  return numeral(score).format('0.0')
}
