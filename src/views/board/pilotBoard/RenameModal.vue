<template>
  <b-modal :title="$t('pilotBoard.renameModal.title')" hide-footer id="rename-modal">
    <b-form @submit.prevent="onSubmit">
      <field-with-errors :errors="formErrors"
                         :interpolations="{oldName: pilot}"
                         field="name"
                         label="pilotBoard.renameModal.message"
                         object="pilot"
                         placeholder=""
                         required
                         v-model="newName" />

      <b-button data-cy="renameSubmit" :disabled="busy" type="submit" variant="primary">
        {{$t('pilotBoard.renameModal.submit')}}
      </b-button>

      <p class="text-danger" v-if="formError">{{formError}}</p>
    </b-form>
  </b-modal>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'
  import { Action } from 'vuex-class'
  import { Result } from 'ts-results'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'
  import FormErrors from '@/mixins/FormErrors'
  import { Errors } from '@/store/types'

  @Component({
    components: { FieldWithErrors }
  })
  export default class RenameModal extends mixins(FormErrors) {
    @Prop({ type: String, required: true }) pilot!: string

    @Action renamePilot!: (args: { oldName: string, newName: string }) =>
      Promise<Result<void, Errors>>

    newName = ''

    busy = false

    async onSubmit(): Promise<void> {
      this.busy = true
      try {
        const result = await this.renamePilot({ oldName: this.pilot, newName: this.newName })
        if (result.ok) {
          await this.$router.push({
            name: 'PilotBoard',
            params: { squadron: this.$route.params.squadron, pilot: this.newName }
          })
          this.$bvModal.hide('rename-modal')
        } else this.formErrors = result.val
      } catch (error) {
        this.formError = error.message
      } finally {
        this.busy = false
      }
    }
  }
</script>
