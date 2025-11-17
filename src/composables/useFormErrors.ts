import { ref } from 'vue'
import type { Errors } from '@/stores/types'

/**
 * Composable for recording submission errors from the backend.
 */
export function useFormErrors() {
  /** Store error objects returned from the backend into this attribute. */
  const formErrors = ref<Errors | null>(null)

  /** Store plaintext errors into this attribute. */
  const formError = ref<string | null>(null)

  /** Call this method before submitting your form. */
  function resetErrors(): void {
    formErrors.value = null
    formError.value = null
  }

  return {
    formErrors,
    formError,
    resetErrors,
  }
}
