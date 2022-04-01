import Vue from 'vue'
import Component from 'vue-class-component'
import { isNull } from 'lodash-es'
import { Getter } from 'vuex-class'
import { Squadron } from '@/types'

/**
 * Adds the {@link isMySquadron} method to a component.
 */

@Component
export default class AuthCheck extends Vue {
  @Getter squadron!: Squadron | null

  @Getter mySquadron!: Squadron | null

  /**
   * @return Whether or not the currently-shown squadron is the same as the logged-in squadron.
   */
  get isMySquadron(): boolean {
    return !isNull(this.squadron) && !isNull(this.mySquadron)
      && this.squadron.ID === this.mySquadron.ID
  }
}
