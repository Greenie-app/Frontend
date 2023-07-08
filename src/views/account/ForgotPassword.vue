<template>
  <must-be-unauthenticated>
    <narrow>
      <h3 class="my-5">{{$t('forgotPassword.title')}}</h3>
      <p>{{$t('forgotPassword.text')}}</p>

      <b-form @submit.prevent="onSubmit" class="d-flex">
        <field-with-errors
          :errors="formErrors"
          field="email"
          form-group-class="flex-grow-1"
          label="forgotPassword.placeholder"
          object="squadron"
          required
          sr-only
          v-model="email" />
        <div class="ml-3">
          <b-button data-cy="forgotPasswordSubmit" type="submit" variant="primary">
            {{$t('forgotPassword.submitButton')}}
          </b-button>
        </div>
      </b-form>

      <p class="text-success" data-cy="forgotPasswordSuccess" v-if="success">
        {{$t('forgotPassword.success')}}
      </p>
      <p class="text-danger" data-cy="forgotPasswordError" v-if="formError">{{formError}}</p>
    </narrow>
  </must-be-unauthenticated>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Action } from 'vuex-class'
  import { Result } from 'ts-results'
  import Bugsnag from '@bugsnag/js'
  import { isString } from 'lodash-es'
  import MustBeUnauthenticated from '@/components/MustBeUnauthenticated.vue'
  import { Errors } from '@/store/types'
  import FormErrors from '@/mixins/FormErrors'
  import Narrow from '@/components/Narrow.vue'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'

  @Component({
    components: { FieldWithErrors, Narrow, MustBeUnauthenticated }
  })
  export default class ForgotPassword extends mixins(FormErrors) {
    @Action forgotPassword!: (args: { email: string }) => Promise<Result<void, Errors>>

    email = ''

    success = false

    async onSubmit(): Promise<void> {
      this.success = false
      this.resetErrors()

      try {
        const result = await this.forgotPassword({ email: this.email })
        if (result.ok) this.success = true
        else {
          this.formErrors = result.val
        }
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
      }
    }
  }
</script>
