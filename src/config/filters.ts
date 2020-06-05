import Vue from 'vue'
import numeral from 'numeral'

/**
 * Vue filter that renders a number as a pass score.
 *
 * @param score The number to render.
 * @return The rendered number.
 */
Vue.filter('score', (score: number): string => numeral(score).format('0.0'))
