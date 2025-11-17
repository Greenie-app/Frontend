<template>
  <n-form @submit.prevent="onSubmit" ref="formRef">
    <n-space vertical :size="24">
      <field-with-errors
        :errors="formErrors"
        field="name"
        label="home.signUp.fields.name"
        maxlength="100"
        object="squadron"
        placeholder=""
        required
        v-model="squadron.name"
      />

      <n-form-item
        :label="$t('home.signUp.fields.image')"
        :validation-status="imageHasError ? 'error' : undefined"
        :feedback="imageFieldErrors.join(', ')"
        :show-feedback="imageHasError"
      >
        <n-upload
          v-model:file-list="imageFiles"
          :max="1"
          accept="image/*"
          :input-props="{ id: 'squadron-image' }"
        >
          <n-button>{{ $t('home.signUp.selectImage') }}</n-button>
        </n-upload>
      </n-form-item>

      <field-with-errors
        :errors="formErrors"
        field="username"
        label="home.signUp.fields.username"
        maxlength="20"
        object="squadron"
        placeholder=""
        required
        autocomplete="username"
        v-model="squadron.username"
      >
        <n-text depth="3" tag="p">{{ $t('home.signUp.help') }}</n-text>
      </field-with-errors>

      <field-with-errors
        :errors="formErrors"
        field="email"
        label="home.signUp.fields.email"
        object="squadron"
        placeholder=""
        required
        type="email"
        autocomplete="email"
        v-model="squadron.email"
      />

      <field-with-errors
        :errors="formErrors"
        field="password"
        label="home.signUp.fields.password"
        object="squadron"
        placeholder=""
        required
        type="password"
        autocomplete="new-password"
        v-model="squadron.password"
      />

      <field-with-errors
        :errors="formErrors"
        field="password_confirmation"
        label="home.signUp.fields.passwordConfirmation"
        object="squadron"
        placeholder=""
        required
        type="password"
        autocomplete="new-password"
        v-model="squadron.password_confirmation"
      />
    </n-space>

    <n-space vertical style="margin-top: 1rem">
      <n-alert v-if="formError" type="error">
        {{ formError }}
      </n-alert>

      <n-button data-cy="signUpSubmit" type="primary" attr-type="submit">
        {{ $t('home.signUp.submitButton') }}
      </n-button>
    </n-space>
  </n-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  type FormInst,
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NSpace,
  NText,
  NUpload,
  type UploadFileInfo,
} from 'naive-ui'
import slugify from 'slugify'
import { has, isNull, isString, isUndefined } from 'lodash-es'
import { useAccountStore } from '@/stores/account'
import type { SquadronJSONUp } from '@/stores/coding'
import { useFormErrors } from '@/composables/useFormErrors'
import FieldWithErrors from '@/components/FieldWithErrors.vue'

const formRef = ref<FormInst>()
const squadron = ref<Partial<SquadronJSONUp>>({
  name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
})
const imageFiles = ref<UploadFileInfo[]>([])
const accountStore = useAccountStore()
const { formErrors, formError, resetErrors } = useFormErrors()

const imageHasError = computed(() => !isNull(formErrors.value) && has(formErrors.value, 'image'))
const imageFieldErrors = computed((): string[] => {
  if (!imageHasError.value) return []
  return formErrors.value!['image'] || []
})

async function onSubmit(): Promise<void> {
  resetErrors()

  try {
    const formData = new FormData()
    formData.append('squadron[name]', squadron.value.name || '')
    formData.append('squadron[username]', squadron.value.username || '')
    formData.append('squadron[email]', squadron.value.email || '')
    formData.append('squadron[password]', squadron.value.password || '')
    formData.append('squadron[password_confirmation]', squadron.value.password_confirmation || '')

    // Get the uploaded file from imageFiles
    const uploadedFile = imageFiles.value[0]?.file
    if (uploadedFile) {
      formData.append('squadron[image]', uploadedFile)
    }

    const result = await accountStore.signUp({ body: formData })
    if (result.ok) {
      // await router.push({
      //   name: 'SquadronBoard',
      //   params: { squadron: result.val.username }
      // })
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
  }
}

watch(
  () => squadron.value.name,
  (newName) => {
    if (!isUndefined(newName) && newName !== '') {
      squadron.value.username = slugify(newName).toLowerCase()
    }
  },
)
</script>
