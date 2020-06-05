<template>
  <div>
    <div class="d-flex align-items-center mb-5">
      <b-img :src="squadron.image.url"
             class="flex-grow-0 mr-3"
             fluid
             id="squadron-header-image"
             v-if="squadron.image" />
      <h1 class="flex-grow-1" data-cy="squadronBoardTitle">
        {{$t('squadronBoard.title', [squadron.name])}}
      </h1>
    </div>
    <p data-cy="squadronBoardingRate" v-if="hasBoardingRate">
      {{$t('squadronBoard.boardingRate', [boardingRate])}}
    </p>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'
  import { isNull } from 'lodash-es'
  import numeral from 'numeral'
  import { Squadron } from '@/types'

  @Component
  export default class Header extends Vue {
    @Prop({ type: Object, required: true }) squadron!: Squadron

    get boardingRate(): string {
      if (isNull(this.squadron.boardingRate)) return ''
      return numeral(this.squadron.boardingRate).format('0.00')
    }

    get hasBoardingRate(): boolean {
      return !isNull(this.squadron.boardingRate)
    }
  }
</script>

<style lang="scss">
  #squadron-header-image {
    max-height: 57px;
  }
</style>
