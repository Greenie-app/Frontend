<template>
  <b-form @submit.prevent="onSubmit" ref="form">
    <field-with-errors
      :errors="formErrors"
      field="name"
      label="home.signUp.fields.name"
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
      field="email"
      label="home.signUp.fields.email"
      object="squadron"
      placeholder=""
      required
      type="email"
      v-model="squadron.email" />

    <p class="text-danger" v-if="formError">{{formError}}</p>

    <b-button-toolbar justify>
      <b-button data-cy="editSquadronSubmit" type="submit" variant="primary">
        {{$t('editSquadron.submitButton')}}
      </b-button>
      <b-button
        class="text-danger"
        data-cy="deleteSquadronButton"
        v-b-modal.confirm-delete
        variant="link">
        {{$t('editSquadron.deleteButton')}}
      </b-button>
    </b-button-toolbar>

    <delete-modal />
  </b-form>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Action, Getter } from 'vuex-class'
  import { Result } from 'ts-results'
  import { Watch } from 'vue-property-decorator'
  import Bugsnag from '@bugsnag/js'
  import { isString } from 'lodash-es'
  import { Errors } from '@/store/types'
  import { Squadron } from '@/types'
  import { SquadronJSONUp, squadronToJSON } from '@/store/coding'
  import FormErrors from '@/mixins/FormErrors'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'
  import DeleteModal from '@/views/squadron/editSquadron/DeleteModal.vue'

  @Component({
    components: { DeleteModal, FieldWithErrors }
  })
  export default class Form extends mixins(FormErrors) {
    readonly $refs!: {
      form: HTMLFormElement;
    }

    squadron: Partial<SquadronJSONUp> = {}

    @Getter mySquadron!: Squadron

    @Action updateMySquadron!: (args: { body: FormData }) =>
      Promise<Result<Squadron, Errors>>

    @Action loadSquadron!: (args: { username: string | null }) => Promise<void>

    async onSubmit(): Promise<void> {
      this.resetErrors()

      try {
        const result = await this.updateMySquadron({ body: new FormData(this.$refs.form) })
        if (result.ok) {
          await this.$router.push({
            name: 'SquadronBoard',
            params: { squadron: result.val.username }
          })
          await this.loadSquadron({ username: result.val.username })
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

    @Watch('mySquadron')
    onSquadronChanged(): void {
      this.squadron = squadronToJSON(this.mySquadron)
    }

    mounted(): void {
      this.onSquadronChanged()
    }
  }
</script>
