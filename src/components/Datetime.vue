<template>
  <n-space>
    <n-date-picker
      v-model:value="dateTimestamp"
      :id="dateID"
      :name="dateName"
      type="date"
      v-bind="$attrs"
    />
    <n-time-picker v-model:value="timeTimestamp" :id="timeID" :name="timeName" v-bind="$attrs" />
  </n-space>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { NSpace, NDatePicker, NTimePicker } from 'naive-ui'
import { DateTime } from 'luxon'
import { isNull } from 'lodash-es'

const internalDateFormat = "yyyy'-'MM'-'dd"
const internalTimeFormat = "HH':'mm':'ss"

/**
 * Reusable component that combines a date picker and time picker to make a
 * date+time control.
 *
 * This component pairs a `modelValue` binding and an `update:modelValue` event,
 * allowing it to be used with `v-model`.
 */

interface Props {
  /** The value to pre-set the datetime to. */
  modelValue?: DateTime | null
  /** The form element name. */
  name: string
  /** The element ID. */
  id: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: DateTime | null]
}>()

const dateValue = ref<string | null>(null)
const timeValue = ref<string | null>(null)

// Naive UI uses timestamps in milliseconds
const dateTimestamp = computed({
  get: () => {
    if (!dateValue.value) return null
    return DateTime.fromFormat(dateValue.value, internalDateFormat, { zone: 'utc' }).toMillis()
  },
  set: (value: number | null) => {
    if (value === null) {
      dateValue.value = null
    } else {
      dateValue.value = DateTime.fromMillis(value, { zone: 'utc' }).toFormat(internalDateFormat)
    }
  },
})

const timeTimestamp = computed({
  get: () => {
    if (!timeValue.value) return null
    return DateTime.fromFormat(timeValue.value, internalTimeFormat, { zone: 'utc' }).toMillis()
  },
  set: (value: number | null) => {
    if (value === null) {
      timeValue.value = null
    } else {
      timeValue.value = DateTime.fromMillis(value, { zone: 'utc' }).toFormat(internalTimeFormat)
    }
  },
})

const datetimeTextValue = computed(() =>
  isNull(props.modelValue) ? null : `${dateValue.value} ${timeValue.value}`,
)

const datetimeValue = computed(() => {
  if (isNull(props.modelValue)) return null
  return DateTime.fromFormat(
    datetimeTextValue.value!,
    `${internalDateFormat} ${internalTimeFormat}`,
    {
      zone: 'utc',
    },
  )
})

const dateName = computed(() => `${props.name}[date]`)
const dateID = computed(() => `${props.id}-date`)
const timeName = computed(() => `${props.name}[time]`)
const timeID = computed(() => `${props.id}-time`)

watch(
  () => props.modelValue,
  () => {
    if (isNull(props.modelValue)) {
      dateValue.value = null
      timeValue.value = null
    } else {
      dateValue.value = props.modelValue.setZone('utc').toFormat(internalDateFormat)
      timeValue.value = props.modelValue.setZone('utc').toFormat(internalTimeFormat)
    }
  },
)

watch([dateValue, timeValue], () => {
  emit('update:modelValue', datetimeValue.value)
})

onMounted(() => {
  if (!isNull(props.modelValue)) {
    dateValue.value = props.modelValue.setZone('utc').toFormat(internalDateFormat)
    timeValue.value = props.modelValue.setZone('utc').toFormat(internalTimeFormat)
  }
})

// Expose for testing
defineExpose({
  dateValue,
  timeValue,
  datetimeValue,
})
</script>
