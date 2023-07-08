<template>
  <b-form-group :class="formGroupClass" :data-cy="cypressGroupName">
    <label :class="{ 'sr-only': srOnly }" :for="id">{{$t(label, interpolations)}}</label>

    <b-form-file
      :class="[klass, { 'is-invalid': hasError }]"
      :id="id"
      :name="name"
      :placeholder="$t(placeholderOrLabel, interpolations)"
      :value="value"
      @input="$emit('input', $event)"
      v-bind="$attrs"
      v-if="type === 'file'" />

    <datetime
      :class="[klass, { 'is-invalid': hasError }]"
      :id="id"
      :name="name"
      :value="value"
      @input="$emit('input', $event)"
      v-bind="$attrs"
      v-else-if="type === 'datetime'" />

    <b-form-spinbutton
      :class="[klass, { 'is-invalid': hasError }]"
      :id="id"
      :name="name"
      :placeholder="$t(placeholderOrLabel, interpolations)"
      :value="value"
      @input="$emit('input', $event)"
      v-bind="$attrs"
      v-else-if="type === 'spinbutton'" />

    <b-select
      :class="[klass, { 'is-invalid': hasError }]"
      :id="id"
      :name="name"
      :options="optionList"
      :placeholder="$t(placeholderOrLabel, interpolations)"
      :value="value"
      @input="$emit('input', $event)"
      v-bind="$attrs"
      v-else-if="type === 'select'" />

    <b-form-input
      :class="[klass, { 'is-invalid': hasError }]"
      :id="id"
      :name="name"
      :placeholder="$t(placeholderOrLabel, interpolations)"
      :type="type"
      :value="value"
      @input="$emit('input', $event)"
      v-bind="$attrs"
      v-else />

    <div :key="index" class="invalid-feedback" v-for="(error, index) in fieldErrors">
      {{error}}
    </div>

    <slot />
  </b-form-group>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'
  import {
    has, isArray, isNull, isString
  } from 'lodash-es'
  import { Errors } from '@/store/types'
  import Datetime from '@/components/Datetime.vue'

  type SelectOption<T> = { text: string, value: T | null }

  /**
   * Reusable component that renders a form input and an associated errors (if any). Supported field
   * types are a normal HTML `INPUT` or `SELECT`, the Bootstrap-Vue `b-form-spinbutton` and
   * `b-form-file` inputs, and {@link Datetime}.
   */

  @Component({
    components: { Datetime },
    inheritAttrs: false
  })
  export default class FieldWithErrors extends Vue {
    /** If true, renders the label for screen readers only. */
    @Prop({ type: Boolean, default: false }) readonly srOnly!: boolean

    /**
     * The errors object binding. The containing vue should mix in {FormErrors} to create this
     * object.
     */
    @Prop({ type: Object }) readonly errors!: Errors | null

    /**
     * The input type (any valid value for `<input type>` or `select`, `spinbutton`, or `datetime`.
     */
    @Prop({ type: String, default: 'text' }) readonly type!: string

    /** The name of the property on the associated object model, for parameterization. */
    @Prop({ type: String, required: true }) readonly field!: string

    /** The name of the object, for parameterization. */
    @Prop({ type: String, required: true }) readonly object!: string

    /** A class attribute to apply to the form group. */
    @Prop({ type: String }) readonly formGroupClass!: string | null

    /** The value for the form element. */
    @Prop({}) readonly value!: unknown

    /** The label associated with a form element, as a Vue-I18n key. */
    @Prop({ type: String, required: true }) readonly label!: string

    /** The placeholder associated with a form element, as a Vue-I18n key. */
    @Prop({ type: String }) readonly placeholder!: string | null

    /** A class attribute to apply to the input. */
    @Prop({ type: String }) readonly klass!: string | null

    /** If true, the parameterized name of the input will have `[]` appended to it. */
    @Prop({ type: Boolean, default: false }) readonly multi!: boolean

    /** Options to use for the select if {@link input} is "select". */
    @Prop({ required: false }) readonly options!: string | SelectOption<unknown>

    /** Interpolations to use when resolving the Vue-i18n key to a translated string. */
    // eslint-disable-next-line vue/max-len
    @Prop({ required: false }) readonly interpolations!: unknown[] | Record<string, unknown> | undefined

    get hasError(): boolean {
      return !isNull(this.errors) && has(this.errors, this.field)
    }

    get fieldErrors(): string[] {
      if (!this.hasError) return []
      return this.errors![this.field]
    }

    get id(): string {
      return `${this.object}-${this.field}`
    }

    get cypressGroupName(): string {
      return `${this.id}-group`
    }

    get name(): string {
      const name = `${this.object}[${this.field}]`
      return this.multi ? `${name}[]` : name
    }

    get placeholderOrLabel(): string {
      return isNull(this.placeholder) ? this.label : this.placeholder
    }

    get optionList(): SelectOption<unknown>[] {
      if (this.type !== 'select') return []
      if (isNull(this.options)) return []

      if (isString(this.options)) return this.optionListFromI18n
      if (isArray(this.options)) return this.options
      throw new Error('Invalid value for :options')
    }

    private get optionListFromI18n(): SelectOption<string>[] {
      const i18nKey = <string> this.options

      const options = <Record<string, string>>(<unknown> this.$t(i18nKey))
      return Object.entries(options).map(([key, value]) => ({
        value: key === '' ? null : key,
        text: value
      }))
    }
  }
</script>
