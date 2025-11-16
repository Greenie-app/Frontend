<!-- eslint-disable vue/no-deprecated-filter -->
<template>
  <n-space v-if="$slots.default" vertical class="field-with-errors-wrapper">
    <n-form-item
      :class="formGroupClass"
      :data-cy="cypressGroupName"
      :label="srOnly ? undefined : $t(label, interpolations)"
      :validation-status="hasError ? 'error' : undefined"
      :feedback="fieldErrors.join(', ')"
      :show-feedback="hasError"
    >
      <!-- Use plain input in Cypress environment for file uploads -->
      <input
        v-if="type === 'file' && isCypress"
        :id="id"
        :name="name"
        :class="klass"
        type="file"
        v-bind="$attrs"
      />

      <n-upload
        v-else-if="type === 'file'"
        :class="klass"
        :name="name"
        v-model:value="internalValue"
        v-bind="$attrs"
        :input-props="{ id }"
        :default-upload="defaultUploadButton"
      >
        <slot />
      </n-upload>

      <datetime
        v-else-if="type === 'datetime'"
        :class="klass"
        :id="id"
        :name="name"
        v-model="internalValue as DateTime"
        v-bind="$attrs"
      />

      <n-input-number
        v-else-if="type === 'spinbutton' || type === 'number'"
        :class="klass"
        :id="id"
        :name="name"
        :placeholder="$t(placeholderOrLabel, interpolations)"
        v-model:value="internalValue as number"
        v-bind="$attrs"
      />

      <n-select
        v-else-if="type === 'select'"
        :class="klass"
        :id="id"
        :name="name"
        :options="optionList"
        :placeholder="$t(placeholderOrLabel, interpolations)"
        v-model:value="internalValue as string | number"
        v-bind="$attrs"
      />

      <n-auto-complete
        v-else-if="type === 'autocomplete'"
        :class="klass"
        :id="id"
        :name="name"
        :options="optionList"
        :placeholder="$t(placeholderOrLabel, interpolations)"
        :show-on-focus="true"
        v-model:value="internalValue as string"
        v-bind="$attrs"
      />

      <n-input
        v-else
        :class="klass"
        :id="id"
        :name="name"
        :placeholder="$t(placeholderOrLabel, interpolations)"
        :type="type as 'text' | 'password' | 'textarea'"
        v-model:value="internalValue as string"
        v-bind="$attrs"
      />
    </n-form-item>

    <div class="field-help-text">
      <slot />
    </div>
  </n-space>

  <n-form-item
    v-else
    :class="formGroupClass"
    :data-cy="cypressGroupName"
    :label="srOnly ? undefined : $t(label, interpolations)"
    :validation-status="hasError ? 'error' : undefined"
    :feedback="fieldErrors.join(', ')"
    :show-feedback="hasError"
  >
    <!-- Use plain input in Cypress environment for file uploads -->
    <input
      v-if="type === 'file' && isCypress"
      :id="id"
      :name="name"
      :class="klass"
      type="file"
      v-bind="$attrs"
    />

    <n-upload
      v-else-if="type === 'file'"
      :class="klass"
      :name="name"
      v-model:value="internalValue"
      v-bind="$attrs"
      :input-props="{ id }"
      :default-upload="defaultUploadButton"
    >
      <slot />
    </n-upload>

    <datetime
      v-else-if="type === 'datetime'"
      :class="klass"
      :id="id"
      :name="name"
      v-model="internalValue as DateTime"
      v-bind="$attrs"
    />

    <n-input-number
      v-else-if="type === 'spinbutton' || type === 'number'"
      :class="klass"
      :id="id"
      :name="name"
      :placeholder="$t(placeholderOrLabel, interpolations)"
      v-model:value="internalValue as number"
      v-bind="$attrs"
    />

    <n-select
      v-else-if="type === 'select'"
      :class="klass"
      :id="id"
      :name="name"
      :options="optionList"
      :placeholder="$t(placeholderOrLabel, interpolations)"
      v-model:value="internalValue as string | number"
      v-bind="$attrs"
    />

    <n-auto-complete
      v-else-if="type === 'autocomplete'"
      :class="klass"
      :id="id"
      :name="name"
      :options="optionList"
      :placeholder="$t(placeholderOrLabel, interpolations)"
      v-model:value="internalValue as string"
      v-bind="$attrs"
    />

    <n-input
      v-else
      :class="klass"
      :id="id"
      :name="name"
      :placeholder="$t(placeholderOrLabel, interpolations)"
      :type="type as 'text' | 'password' | 'textarea'"
      v-model:value="internalValue as string"
      v-bind="$attrs"
    />
  </n-form-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  NAutoComplete,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NUpload,
  type SelectOption,
} from "naive-ui";
import { has, isArray, isNull, isString } from "lodash-es";
import { useI18n } from "vue-i18n";
import type { DateTime } from "luxon";
import type { Errors } from "@/stores/types";
import Datetime from "@/components/Datetime.vue";

/**
 * Reusable component that renders a form input and an associated errors (if any). Supported field
 * types are a normal HTML `INPUT` or `SELECT`, Naive UI `n-input-number` and
 * `n-upload` inputs, and {@link Datetime}.
 */

interface Props {
  /** If true, renders the label for screen readers only. */
  srOnly?: boolean;
  /**
   * The errors object binding. The containing component should use useFormErrors() to create this
   * object.
   */
  errors?: Errors | null;
  /**
   * The input type (any valid value for `<input type>` or `select`, `spinbutton`, `number`, or `datetime`.
   */
  type?: string;
  /** The name of the property on the associated object model, for parameterization. */
  field: string;
  /** The name of the object, for parameterization. */
  object: string;
  /** A class attribute to apply to the form group. */
  formGroupClass?: string | null;
  /** The value for the form element. */
  modelValue?: string | number | DateTime | null | File[] | unknown;
  /** The label associated with a form element, as a Vue-I18n key. */
  label: string;
  /** The placeholder associated with a form element, as a Vue-I18n key. */
  placeholder?: string | null;
  /** A class attribute to apply to the input. */
  klass?: string | null;
  /** If true, the parameterized name of the input will have `[]` appended to it. */
  multi?: boolean;
  /** Options to use for the select if type is "select". */
  options?: string | SelectOption[];
  /** Interpolations to use when resolving the Vue-i18n key to a translated string. */
  interpolations?: Record<string, unknown> | undefined;
  /** If true, shows the default upload button for file inputs. */
  defaultUploadButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  srOnly: false,
  errors: null,
  type: "text",
  formGroupClass: null,
  modelValue: undefined,
  placeholder: null,
  klass: null,
  multi: false,
  options: undefined,
  interpolations: undefined,
  defaultUploadButton: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: unknown];
}>();

const { t } = useI18n();

// Detect if running in Cypress - check multiple ways
const isCypress = computed(() => {
  // Check environment variable
  const envCypress = import.meta.env?.CYPRESS === "true" || import.meta.env?.CYPRESS === true;

  // Check window object
  const windowCypress =
    typeof window !== "undefined" &&
    (!!(window as any).Cypress || !!(window as any).parent?.Cypress);

  return envCypress || windowCypress;
});

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const hasError = computed(() => !isNull(props.errors) && has(props.errors, props.field));

const fieldErrors = computed((): string[] => {
  if (!hasError.value) return [];
  return props.errors![props.field] || [];
});

const id = computed(() => `${props.object}-${props.field}`);

const cypressGroupName = computed(() => `${id.value}-group`);

const name = computed(() => {
  const n = `${props.object}[${props.field}]`;
  return props.multi ? `${n}[]` : n;
});

const placeholderOrLabel = computed(() =>
  isNull(props.placeholder) ? props.label : props.placeholder,
);

const optionList = computed((): SelectOption[] | string[] => {
  if (props.type !== "select" && props.type !== "autocomplete") return [];
  if (isNull(props.options) || props.options === undefined) return [];

  if (isString(props.options)) {
    return optionListFromI18n.value;
  }
  if (isArray(props.options)) {
    // For autocomplete, if it's an array of strings, return as-is
    if (props.type === "autocomplete" && props.options.every((opt) => typeof opt === "string")) {
      return props.options as string[];
    }
    // Convert from old format {text, value} to Naive UI format {label, value}
    return props.options.map(
      (opt: any): SelectOption => ({
        label: opt.text || opt.label,
        value: opt.value,
      }),
    );
  }
  throw new Error("Invalid value for :options");
});

const optionListFromI18n = computed((): SelectOption[] => {
  const i18nKey = props.options as string;
  const options = t(i18nKey);

  if (typeof options !== "object" || options === null) {
    throw new Error(`i18n key "${i18nKey}" did not resolve to an object`);
  }

  return Object.entries(options as Record<string, string>).map(
    ([key, value]): SelectOption => ({
      value: key || "",
      label: value,
    }),
  );
});
</script>

<style scoped>
.field-help-text {
  display: block;
  margin-bottom: 1rem;
}

.field-help-text :deep(p) {
  margin: 0;
}
</style>
