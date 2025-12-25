<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="$t('addPassModal.title')"
    style="max-width: 600px"
  >
    <pass-form
      :busy="busy"
      :form-error="formError"
      :form-errors="formErrors"
      @submit="onSubmit"
      ref="formRef"
      submit-string="addPassModal.submitButton"
    />
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NModal } from 'naive-ui'
import { isString } from 'lodash-es'
import { useFormErrors } from '@/composables/useFormErrors'
import { usePassesStore } from '@/stores/passes'
import PassForm from '@/views/board/squadronBoard/modals/Form.vue'
import { Pass } from '@/types'

const passesStore = usePassesStore()
const { formError, formErrors, resetErrors } = useFormErrors()

const showModal = defineModel<boolean>('show', { default: false })
const formRef = ref<InstanceType<typeof PassForm> | null>(null)
const busy = ref(false)

async function onSubmit(pass: Partial<Pass>): Promise<void> {
  resetErrors()
  busy.value = true

  try {
    const result = await passesStore.createPass({ pass: pass as Omit<Pass, 'ID'> })
    if (result.ok) {
      showModal.value = false
      formRef.value?.reset()
    } else {
      formErrors.value = result.val
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      formError.value = error.message
    } else if (isString(error)) {
      formError.value = error
    } else {
      throw error
    }
  } finally {
    busy.value = false
  }
}
</script>
