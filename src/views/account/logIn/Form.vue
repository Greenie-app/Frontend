<template>
  <b-form @submit.prevent="onSubmit">
    <b-form-group>
      <label class="sr-only" for="login-field">{{$t('logIn.usernamePlaceholder')}}</label>
      <b-input
        :placeholder="$t('logIn.usernamePlaceholder')"
        autocomplete="username"
        id="login-field"
        v-model="username" />
    </b-form-group>

    <b-form-group><label class="sr-only" for="password-field">
                    {{$t('logIn.passwordPlaceholder')}}
                  </label>
      <b-input
        :placeholder="$t('logIn.passwordPlaceholder')"
        autocomplete="current-password"
        id="password-field"
        type="password"
        v-model="password" />
    </b-form-group>

    <b-form-group>
      <div class="form-check custom-control custom-checkbox">
        <input
          class="form-check-input custom-control-input"
          id="remember-me"
          type="checkbox"
          v-model="rememberMe">
        <label class="form-check-label custom-control-label" for="remember-me">
          {{$t('logIn.rememberMe')}}
        </label>
      </div>
    </b-form-group>

    <b-button-toolbar justify>
      <b-button data-cy="loginSubmitButton" type="submit" variant="primary">
        {{$t('logIn.logInButton')}}
      </b-button>
      <b-button :to="{ name: 'ForgotPassword' }" data-cy="forgotPasswordLink" variant="link">
        {{$t('logIn.forgotPassword')}}
      </b-button>
    </b-button-toolbar>

    <p class="text-danger" data-cy="loginError" v-if="loginError">{{loginError}}</p>
  </b-form>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Action } from 'vuex-class'
  import { Result } from 'ts-results'
  import Bugsnag from '@bugsnag/js'
  import { isString } from 'lodash-es'

  @Component
  export default class Form extends Vue {
    username = ''

    password = ''

    rememberMe = false

    loginError: string | null = null

    @Action logIn!: (args: { username: string; password: string; rememberMe: boolean }) =>
      Promise<Result<void, string>>

    async onSubmit(): Promise<void> {
      this.loginError = null
      try {
        const result = await this.logIn({
          username: this.username,
          password: this.password,
          rememberMe: this.rememberMe
        })
        if (!result.ok) this.loginError = result.val
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.loginError = error.message
          Bugsnag.notify(error)
        } else if (isString(error)) {
          this.loginError = error
          Bugsnag.notify(error)
        } else {
          throw error
        }
      }
    }
  }
</script>
