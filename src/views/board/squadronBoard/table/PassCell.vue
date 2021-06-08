<template>
  <b-td :class="[aircraftTypeClass, {unscored: isUnscored, 'cursor-pointer': isMySquadron}]"
        :variant="cellVariant"
        @click="onClick"
        data-cy="passCell">
    <p class="text-center my-0 small">{{pass.time | date}}</p>
    <p class="text-center my-0">
      <strong data-cy="passCellScore">{{pass.score | score}}</strong>
      <small class="ml-2" data-cy="passCellGrade" v-if="pass.grade">
        <span :class="{underline: isPerfect}">{{grade}}</span>{{wireIfAny}}
      </small>
    </p>

    <edit-pass-modal :id="modalID" :pass="pass" />
  </b-td>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'
  import { isNull } from 'lodash-es'
  import { DateTime } from 'luxon'
  import { Getter } from 'vuex-class'
  import { Grade, Pass, Squadron } from '@/types'
  import EditPassModal from '@/views/board/squadronBoard/modals/EditPassModal.vue'
  import { variant } from '@/config/utils'
  import AuthCheck from '@/mixins/AuthCheck'

  @Component({
    components: { EditPassModal },
    filters: {
      date(date: DateTime): string {
        return date.toLocaleString({ month: '2-digit', day: '2-digit' })
      }
    }
  })
  export default class PassCell extends mixins(AuthCheck) {
    @Prop({ type: Object, required: true }) pass!: Pass

    @Getter squadron!: Squadron | null

    @Getter mySquadron!: Squadron | null

    get cellVariant(): string | null {
      return variant(this.pass)
    }

    get isUnscored(): boolean {
      return isNull(this.cellVariant)
    }

    get aircraftTypeClass(): string | null {
      if (this.pass.aircraftType === 'FA-18C_hornet') return 'f18'
      if (this.pass.aircraftType === 'F-14B') return 'f14'
      if (this.pass.aircraftType === 'A-4E-C') return 'a4'
      return null
    }

    get grade(): string {
      if (isNull(this.pass.grade)) return ''

      const translated = <string> this.$t(`pass.grade.${this.pass.grade}`)
      const matches = translated.match(/^_(.+)_$/)
      if (matches) return matches[1]
      return translated
    }

    get isPerfect(): boolean {
      return !isNull(this.pass.grade) && this.pass.grade === Grade.Perfect
    }

    get wireIfAny(): string {
      return isNull(this.pass.wire) ? '' : `-${this.pass.wire}`
    }

    get modalID(): string {
      return `edit-pass-modal-${this.pass.ID}`
    }

    onClick(): void {
      if (this.isMySquadron) this.$bvModal.show(this.modalID)
    }
  }
</script>

<style lang="scss" scoped>
  td {
    background-blend-mode: overlay;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
    width: 100px;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .f18 {
    background-image: url("../../../../assets/images/f18.png");
  }

  .f14 {
    background-image: url("../../../../assets/images/f14.png");
  }

  .unscored {
    background-color: #454d55;
    color: #fff;
  }

  .underline {
    text-decoration: underline;
  }
</style>
