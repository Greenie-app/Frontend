<template>
  <b-form @submit.prevent="onSubmit">
    <field-with-errors
      :errors="formErrors"
      autocomplete="current-password"
      field="current_password"
      klass="mb-2 mr-sm-2 mb-sm-0"
      label="changePassword.currentPasswordPlaceholder"
      object="squadron"
      required
      sr-only
      type="password"
      v-model="currentPassword" />

    <field-with-errors
      :errors="formErrors"
      autocomplete="current-password"
      field="new_password"
      klass="mb-2 mr-sm-2 mb-sm-0"
      label="changePassword.newPasswordPlaceholder"
      object="squadron"
      required
      sr-only
      type="password"
      v-model="newPassword" />

    <field-with-errors
      :errors="formErrors"
      autocomplete="current-password"
      field="password_confirmation"
      klass="mb-2 mr-sm-2 mb-sm-0"
      label="changePassword.confirmationPlaceholder"
      object="squadron"
      required
      sr-only
      type="password"
      v-model="passwordConfirmation" />

    <p class="text-danger" v-if="formError">{{formError}}</p>

    <b-button
      class="mb-2 mr-sm-2 mb-sm-0"
      data-cy="changePasswordSubmit"
      type="submit"
      variant="primary">
      {{$t('changePassword.button')}}
    </b-button>

    <p class="text-success" data-cy="changePasswordSuccess" v-if="success">
      {{$t('changePassword.success')}}
    </p>
  </b-form>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Result } from 'ts-results'
  import { Action } from 'vuex-class'
  import Bugsnag from '@bugsnag/js'
  import { isString } from 'lodash-es'
  import FormErrors from '@/mixins/FormErrors'
  import { Errors } from '@/store/types'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'

  @Component({
    components: { FieldWithErrors }
  })
  export default class Form extends mixins(FormErrors) {
    currentPassword = ''

    newPassword = ''

    passwordConfirmation = ''

    success = false

    @Action changePassword!: (args: {
      oldPassword: string;
      newPassword: string;
      confirmation: string;
    }) => Promise<Result<void, Errors>>

    async onSubmit(): Promise<void> {
      this.success = false
      this.resetErrors()

      try {
        const result = await this.changePassword({
          oldPassword: this.currentPassword,
          newPassword: this.newPassword,
          confirmation: this.passwordConfirmation
        })
        if (result.ok) {
          this.currentPassword = ''
          this.newPassword = ''
          this.passwordConfirmation = ''
          this.success = true
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
