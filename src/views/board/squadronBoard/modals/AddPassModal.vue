<template>
  <b-modal :title="$t('addPassModal.title')" hide-footer id="add-pass-modal">
    <pass-form
      :busy="busy"
      :form-error="formError"
      :form-errors="formErrors"
      @submit="onSubmit"
      ref="form"
      submit-string="addPassModal.submitButton" />
  </b-modal>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Result } from 'ts-results'
  import { Action } from 'vuex-class'
  import Bugsnag from '@bugsnag/js'
  import { isString } from 'lodash-es'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'
  import FormErrors from '@/mixins/FormErrors'
  import { Errors } from '@/store/types'
  import PassForm from '@/views/board/squadronBoard/modals/Form.vue'
  import { Pass } from '@/types'

  @Component({
    components: { PassForm, FieldWithErrors }
  })
  export default class AddPassModal extends mixins(FormErrors) {
    readonly $refs!: {
      form: PassForm
    }

    @Action createPass!: (args: { pass: Omit<Pass, 'ID'> }) => Promise<Result<Pass, Errors>>

    busy = false

    async onSubmit(pass: Omit<Pass, 'ID'>): Promise<void> {
      this.resetErrors()
      this.busy = true

      try {
        const result = await this.createPass({ pass: (<Pass>pass) })
        if (result.ok) {
          this.$bvModal.hide('add-pass-modal')
          this.$refs.form.reset()
        } else this.formErrors = result.val
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.formError = error.message
          Bugsnag.notify(error)
        } else if (isString(error)) {
          this.formError = error
          Bugsnag.notify(error)
        } else {
          throw error
        }
      } finally {
        this.busy = false
      }
    }
  }
</script>
