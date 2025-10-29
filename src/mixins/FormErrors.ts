import Vue from "vue";
import Component from "vue-class-component";
import { Errors } from "@/stores/types";

/**
 * Adds attributes and methods for recording submission errors from the backend.
 */

@Component
export default class FormErrors extends Vue {
  /** Store error objects returned from the backend into this attribute. */
  formErrors: Errors | null = null;

  /** Store plaintext errors into this attribute. */
  formError: string | null = null;

  /** Call this method before submitting your form. */
  resetErrors(): void {
    this.formErrors = null;
    this.formError = null;
  }
}
