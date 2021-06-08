<template>
  <b-input-group>
    <b-form-datepicker :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                       :id="dateID"
                       :name="dateName"
                       v-bind="$attrs"
                       v-model="dateValue" />

    <b-form-timepicker :hour12="false"
                       :id="timeID"
                       :name="timeName"
                       v-bind="$attrs"
                       v-model="timeValue" />
  </b-input-group>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { DateTime } from 'luxon'
  import { Prop, Watch } from 'vue-property-decorator'
  import { isNull } from 'lodash-es'

  const internalDateFormat = "yyyy'-'MM'-'dd"
  const internalTimeFormat = "HH':'mm':'ss"

  /**
   * Reusable component that combines a `b-form-datepicker` and `b-form-timepicker` to make a
   * date+time control. Not sure why this isn't a part of Bootstrap-Vue in the first place??
   *
   * This component pairs a `value` binding and an `input` event, allowing it to be used with
   * `v-model`.
   */

  @Component({
    inheritAttrs: false
  })
  export default class Datetime extends Vue {
    /** The value to pre-set the datetime to. */
    @Prop({ type: Object, required: false }) value!: DateTime | null

    /** The form element name. */
    @Prop({ type: String, required: true }) name!: string

    /** The element ID. */
    @Prop({ type: String, required: true }) id!: string

    dateValue: string | null = null

    timeValue: string | null = null

    get datetimeTextValue(): string | null {
      return isNull(this.value) ? null : `${this.dateValue} ${this.timeValue}`
    }

    get datetimeValue(): DateTime | null {
      if (isNull(this.value)) return null
      return DateTime.fromFormat(this.datetimeTextValue!, `${internalDateFormat} ${internalTimeFormat}`, {
        zone: 'utc'
      })
    }

    get dateName(): string {
      return `${this.name}[date]`
    }

    get dateID(): string {
      return `${this.id}-date`
    }

    get timeName(): string {
      return `${this.name}[time]`
    }

    get timeID(): string {
      return `${this.id}-time`
    }

    @Watch('value')
    onExternalValueChanged(): void {
      if (isNull(this.value)) {
        this.dateValue = null
        this.timeValue = null
      } else {
        this.dateValue = this.value.setZone('utc').toFormat(internalDateFormat)
        this.timeValue = this.value.setZone('utc').toFormat(internalTimeFormat)
      }
    }

    @Watch('dateValue')
    @Watch('timeValue')
    onInternalValueChanged(): void {
      this.$emit('input', this.datetimeValue)
    }

    mounted(): void {
      this.onExternalValueChanged()
    }
  }
</script>
