<template>
  <b-form @submit.prevent="onSubmit" ref="form">
    <field-with-errors
      :errors="formErrors"
      field="name"
      label="home.signUp.fields.name"
      maxlength="100"
      object="squadron"
      placeholder=""
      required
      v-model="squadron.name" />

    <field-with-errors
      :errors="formErrors"
      field="image"
      label="home.signUp.fields.image"
      object="squadron"
      placeholder=""
      type="file"
      v-model="squadron.image" />

    <field-with-errors
      :errors="formErrors"
      field="username"
      label="home.signUp.fields.username"
      maxlength="20"
      object="squadron"
      placeholder=""
      required
      v-model="squadron.username">
      <p class="small">{{$t('home.signUp.help')}}</p>
    </field-with-errors>

    <field-with-errors
      :errors="formErrors"
      field="email"
      label="home.signUp.fields.email"
      object="squadron"
      placeholder=""
      required
      type="email"
      v-model="squadron.email" />

    <field-with-errors
      :errors="formErrors"
      field="password"
      label="home.signUp.fields.password"
      object="squadron"
      placeholder=""
      required
      type="password"
      v-model="squadron.password" />

    <field-with-errors
      :errors="formErrors"
      field="password_confirmation"
      label="home.signUp.fields.passwordConfirmation"
      object="squadron"
      placeholder=""
      required
      type="password"
      v-model="squadron.password_confirmation" />

    <p class="text-danger" v-if="formError">{{formError}}</p>

    <b-button data-cy="signUpSubmit" type="submit" variant="primary">
      {{$t('home.signUp.submitButton')}}
    </b-button>
  </b-form>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Action } from 'vuex-class'
  import { Result } from 'ts-results'
  import { Watch } from 'vue-property-decorator'
  import slugify from 'slugify'
  import { isString, isUndefined } from 'lodash-es'
  import Bugsnag from '@bugsnag/js'
  import { SquadronJSONUp } from '@/store/coding'
  import { Errors } from '@/store/types'
  import FormErrors from '@/mixins/FormErrors'
  import { Squadron } from '@/types'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'

  @Component({
    components: { FieldWithErrors }
  })
  export default class SignUp extends mixins(FormErrors) {
    readonly $refs!: {
      form: HTMLFormElement
    }

    squadron: Partial<SquadronJSONUp> = {}

    @Action signUp!: (args: { body: FormData }) => Promise<Result<Squadron, Errors>>

    async onSubmit(): Promise<void> {
      this.resetErrors()

      try {
        const result = await this.signUp({ body: new FormData(this.$refs.form) })
        if (result.ok) {
          // await this.$router.push({
          //   name: 'SquadronBoard',
          //   params: { squadron: result.val.username }
          // })
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

    @Watch('squadron.name')
    onNameChanged(): void {
      if (!isUndefined(this.squadron.name)) {
        this.squadron.username = slugify(this.squadron.name).toLowerCase()
      }
    }
  }
</script>
