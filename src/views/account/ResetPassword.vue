<template>
  <must-be-unauthenticated>
    <narrow>
      <h3 class="my-4">{{$t('resetPassword.title')}}</h3>
      <b-form @submit.prevent="onSubmit">
        <field-with-errors
          :errors="formErrors"
          autocomplete="new-password"
          field="password"
          klass="mb-2 mr-sm-2 mb-sm-0"
          label="changePassword.newPasswordPlaceholder"
          object="squadron"
          required
          sr-only
          type="password"
          v-model="password" />

        <field-with-errors
          :errors="formErrors"
          autocomplete="new-password"
          field="password_confirmation"
          klass="mb-2 mr-sm-2 mb-sm-0"
          label="changePassword.confirmationPlaceholder"
          object="squadron"
          required
          sr-only
          type="password"
          v-model="passwordConfirmation" />

        <p class="text-danger" data-cy="resetPasswordError" v-if="formError">{{formError}}</p>

        <b-button
          class="mb-2 mr-sm-2 mb-sm-0"
          data-cy="resetPasswordSubmit"
          type="submit"
          variant="primary">
          {{$t('changePassword.button')}}
        </b-button>
      </b-form>
    </narrow>
  </must-be-unauthenticated>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Action } from 'vuex-class'
  import { Result } from 'ts-results'
  import Bugsnag from '@bugsnag/js'
  import { has, isString } from 'lodash-es'
  import MustBeUnauthenticated from '@/components/MustBeUnauthenticated.vue'
  import Narrow from '@/components/Narrow.vue'
  import FormErrors from '@/mixins/FormErrors'
  import { Errors } from '@/store/types'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'

  @Component({
    components: { FieldWithErrors, Narrow, MustBeUnauthenticated }
  })
  export default class ResetPassword extends mixins(FormErrors) {
    password = ''

    passwordConfirmation = ''

    @Action resetPassword!: (args: { password: string; confirmation: string; token: string }) =>
      Promise<Result<void, Errors>>

    private get token(): string {
      return this.$route.params.token
    }

    async onSubmit(): Promise<void> {
      this.resetErrors()

      try {
        const result = await this.resetPassword({
          password: this.password,
          confirmation: this.passwordConfirmation,
          token: this.token
        })
        if (result.ok) {
          await this.$bvModal.msgBoxOk(<string> this.$t('resetPassword.successMessage'))
          await this.$router.push({ name: 'Home' }).catch()
        } else if (has(result.val, 'reset_password_token')) {
          await this.$bvModal.msgBoxOk(<string> this.$t('resetPassword.badToken'))
          await this.$router.push({ name: 'Home' })
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
      }
    }
  }
</script>
