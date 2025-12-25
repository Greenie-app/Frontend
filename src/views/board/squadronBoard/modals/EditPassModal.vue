<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="$t('editPassModal.title')"
    style="max-width: 600px"
  >
    <pass-form
      :busy="busy"
      :form-error="formError"
      :form-errors="formErrors"
      :pass="draftPass"
      @delete="onDelete"
      @submit="onSubmit"
      ref="formRef"
      submit-string="editPassModal.submitButton"
    />
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal } from 'naive-ui'
import { cloneDeep, isString } from 'lodash-es'
import { useFormErrors } from '@/composables/useFormErrors'
import { usePassesStore } from '@/stores/passes'
import { Pass } from '@/types'
import PassForm from '@/views/board/squadronBoard/modals/Form.vue'

interface Props {
  pass: Pass
}

const props = defineProps<Props>()
const showModal = defineModel<boolean>('show', { default: false })

const passesStore = usePassesStore()
const { formError, formErrors, resetErrors } = useFormErrors()

const formRef = ref<InstanceType<typeof PassForm> | null>(null)
const draftPass = ref<Pass>(cloneDeep(props.pass))
const busy = ref(false)

watch(
  () => showModal.value,
  (isOpen) => {
    if (isOpen) {
      draftPass.value = cloneDeep(props.pass)
      resetErrors()
    }
  },
)

async function onSubmit(pass: Partial<Pass>): Promise<void> {
  resetErrors()
  busy.value = true

  try {
    const result = await passesStore.updatePass({ pass: pass as Pass })
    if (result.ok) {
      showModal.value = false
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

async function onDelete(): Promise<void> {
  resetErrors()
  busy.value = true

  try {
    await passesStore.deletePass({ pass: props.pass })
    showModal.value = false
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
