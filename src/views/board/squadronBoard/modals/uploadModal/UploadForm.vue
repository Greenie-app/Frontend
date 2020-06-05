<template>
  <b-form @submit.prevent="onSubmit" ref="form">
    <field-with-errors :errors="formErrors"
                       field="files"
                       label="uploadModal.placeholder"
                       multi
                       object="logfile"
                       placeholder=""
                       required
                       sr-only
                       type="file" />

    <b-button :disabled="busy" type="submit" variant="primary" data-cy="uploadSubmit">
      <b-spinner small v-if="busy" />
      {{$t('uploadModal.uploadButton')}}
    </b-button>
    <p class="text-danger" v-if="formError">{{formError}}</p>
  </b-form>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Action } from 'vuex-class'
  import { Result } from 'ts-results'
  import Bugsnag from '@bugsnag/js'
  import FormErrors from '@/mixins/FormErrors'
  import { Logfile } from '@/types'
  import { Errors } from '@/store/types'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'

  @Component({
    components: { FieldWithErrors }
  })
  export default class UploadForm extends mixins(FormErrors) {
    readonly $refs!: {
      form: HTMLFormElement;
    }

    busy = false

    @Action uploadLogfiles!: (args: { body: FormData }) => Promise<Result<Logfile, Errors>>

    async onSubmit(): Promise<void> {
      this.resetErrors()
      this.busy = true

      try {
        const result = await this.uploadLogfiles({ body: new FormData(this.$refs.form) })
        if (!result.ok) this.formErrors = result.val
      } catch (error) {
        this.formError = error.message
        Bugsnag.notify(error)
      } finally {
        this.busy = false
      }
    }
  }
</script>
