<template>
  <b-modal :id="id" :title="$t('editPassModal.title')" hide-footer>
    <pass-form :busy="busy"
               :form-error="formError"
               :form-errors="formErrors"
               :pass="draftPass"
               @delete="onDelete"
               @submit="onSubmit"
               ref="form"
               submit-string="editPassModal.submitButton" />
  </b-modal>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Prop, Watch } from 'vue-property-decorator'
  import { Action } from 'vuex-class'
  import { Result } from 'ts-results'
  import { cloneDeep, isString } from 'lodash-es'
  import Bugsnag from '@bugsnag/js'
  import { Pass } from '@/types'
  import FormErrors from '@/mixins/FormErrors'
  import { Errors } from '@/store/types'
  import PassForm from '@/views/board/squadronBoard/modals/Form.vue'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'

  @Component({
    components: { PassForm, FieldWithErrors }
  })
  export default class EditPassModal extends mixins(FormErrors) {
    readonly $refs!: {
      form: PassForm
    }

    @Prop({ type: Object, required: true }) pass!: Pass

    @Prop({ type: String, required: true }) id!: string

    draftPass: Partial<Pass> = {}

    @Action updatePass!: (args: { pass: Pass }) => Promise<Result<Pass, Errors>>

    @Action deletePass!: (args: { pass: Pass }) => Promise<Pass>

    busy = false

    mounted(): void {
      this.passChanged()
    }

    @Watch('pass.ID')
    passChanged(): void {
      this.draftPass = cloneDeep(this.pass)
    }

    async onSubmit(pass: Pass): Promise<void> {
      this.resetErrors()
      this.busy = true

      try {
        const result = await this.updatePass({ pass })
        if (result.ok) {
          this.$bvModal.hide(this.id)
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

    async onDelete(): Promise<void> {
      this.resetErrors()
      this.busy = true

      try {
        await this.deletePass({ pass: this.pass })
        this.$bvModal.hide(this.id)
      } catch (error: unknown) {
        if (error instanceof Error) this.formError = error.message
        else if (isString(error)) this.formError = error
        else throw error
      } finally {
        this.busy = false
      }
    }
  }
</script>
