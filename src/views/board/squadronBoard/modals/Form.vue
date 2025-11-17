<template>
  <n-form @submit.prevent="onSubmit" data-cy="passForm">
    <n-space vertical>
      <field-with-errors
        :errors="formErrors"
        field="time"
        label="passModal.fields.time"
        object="pass"
        placeholder=""
        required
        type="datetime"
        v-model="localPass.time"
      />

      <field-with-errors
        :errors="formErrors"
        field="pilot"
        label="passModal.fields.pilot"
        :options="pilotOptions"
        object="pass"
        placeholder=""
        required
        :show-options-on-focus="true"
        type="autocomplete"
        v-model="localPass.pilot"
      />

      <field-with-errors
        :errors="formErrors"
        field="ship_name"
        label="passModal.fields.shipName"
        object="pass"
        placeholder=""
        v-model="localPass.shipName"
      />

      <field-with-errors
        :errors="formErrors"
        field="aircraft_type"
        label="passModal.fields.aircraftType"
        object="pass"
        :options="aircraftTypeOptions"
        placeholder=""
        type="autocomplete"
        v-model="localPass.aircraftType"
      />

      <field-with-errors
        :errors="formErrors"
        field="grade"
        label="passModal.fields.grade"
        object="pass"
        :options="gradeOptions"
        placeholder=""
        required
        type="select"
        v-model="grade"
      />

      <n-space>
        <field-with-errors
          class="score-field"
          :errors="formErrors"
          field="score"
          label="passModal.fields.score"
          max="5"
          min="0"
          object="pass"
          placeholder=""
          step="0.5"
          type="spinbutton"
          v-model="score"
        />

        <field-with-errors
          v-if="showWire"
          class="wire-field"
          :errors="formErrors"
          :options="wireOptions"
          field="wire"
          label="passModal.fields.wire"
          object="pass"
          placeholder=""
          type="select"
          v-model="wire"
        />
      </n-space>

      <field-with-errors
        :errors="formErrors"
        :options="trapOptions"
        field="trap"
        label="passModal.fields.trap"
        object="pass"
        placeholder=""
        type="select"
        v-model="trap"
      />

      <field-with-errors
        :errors="formErrors"
        field="notes"
        label="passModal.fields.notes"
        object="pass"
        placeholder=""
        v-model="localPass.notes"
      />
    </n-space>

    <n-space vertical style="margin-top: 1rem">
      <n-space justify="space-between">
        <n-button :disabled="busy" data-cy="savePassButton" type="primary" attr-type="submit">
          <template v-if="busy">
            <n-spin size="small" />
          </template>
          <template v-else>
            {{ $t(submitString) }}
          </template>
        </n-button>

        <n-button
          v-if="isUpdate"
          :disabled="busy"
          @click="$emit('delete')"
          data-cy="deletePassButton"
          type="error"
        >
          {{ $t('editPassModal.deleteButton') }}
        </n-button>
      </n-space>

      <n-alert v-if="formError" type="error">
        {{ formError }}
      </n-alert>
    </n-space>
  </n-form>
</template>

<script setup lang="ts">
import { computed, watch, toRaw, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NForm, NSpace, NButton, NSpin, NAlert } from 'naive-ui'
import { DateTime } from 'luxon'
import { isNil, range } from 'lodash-es'
import { usePassesStore } from '@/stores/passes'
import FieldWithErrors from '@/components/FieldWithErrors.vue'
import { Grade, Pass } from '@/types'
import type { Errors } from '@/stores/types'

type DraftPass = Partial<Pass>

interface Props {
  formError?: string | null
  formErrors?: Errors | null
  busy?: boolean
  pass?: DraftPass
  submitString: string
}

const props = withDefaults(defineProps<Props>(), {
  formError: null,
  formErrors: null,
  busy: false,
  pass: () => ({ time: DateTime.utc(), pilot: '' }),
})

const emit = defineEmits<{
  submit: [pass: DraftPass]
  delete: []
}>()

const { t } = useI18n()
const passesStore = usePassesStore()

const aircraftTypeOptions = computed(() => [
  'F-14A',
  'F-14A-135-GR-Early',
  'F-14A-135-GR',
  'F-14B',
  'FA-18A',
  'FA-18C',
  'FA-18C_hornet',
  'Su-33',
  'E-2C',
  'S-3B',
  'S-3B Tanker',
])

const localPassData = ref<DraftPass>({ ...toRaw(props.pass) })

// Computed proxy to make v-model work with shallowRef
// Each property setter creates a new object to trigger reactivity
const localPass = computed({
  get: () => localPassData.value,
  set: (newValue) => {
    localPassData.value = newValue
  },
})

// Create individual computed properties for each field to handle updates properly
const grade = computed({
  get: () => localPassData.value.grade,
  set: (value) => {
    localPassData.value = { ...localPassData.value, grade: value }
  },
})

const score = computed({
  get: () => localPassData.value.score ?? null,
  set: (value) => {
    localPassData.value = { ...localPassData.value, score: value }
  },
})

const wire = computed({
  get: () => localPassData.value.wire ?? null,
  set: (value) => {
    localPassData.value = { ...localPassData.value, wire: value }
  },
})

const trap = computed({
  get: () => {
    const trapValue = localPassData.value.trap
    if (trapValue === null || trapValue === undefined) return 'null'
    return trapValue ? 'true' : 'false'
  },
  set: (value: string) => {
    let trapValue: boolean | null
    if (value === 'null') {
      trapValue = null
    } else {
      trapValue = value === 'true'
    }
    localPassData.value = { ...localPassData.value, trap: trapValue }
  },
})

const pilotNames = computed(() => passesStore.pilotNames)

const pilotOptions = computed(() => pilotNames.value)

const trapOptions = computed(() => [
  { label: t('passModal.trap.null'), value: 'null' },
  { label: t('passModal.trap.true'), value: 'true' },
  { label: t('passModal.trap.false'), value: 'false' },
])

const wireOptions = computed(() => [
  { label: '(none)', value: null },
  ...range(1, 5).map((n) => ({ label: n.toString(), value: n })),
])

const gradeOptions = computed(() => [
  { label: t('passModal.grades.cut'), value: Grade.Cut },
  { label: t('passModal.grades.no_grade'), value: Grade.NoGrade },
  { label: t('passModal.grades.bolter'), value: Grade.Bolter },
  { label: t('passModal.grades.fair'), value: Grade.Fair },
  { label: t('passModal.grades.ok'), value: Grade.OK },
  { label: t('passModal.grades.perfect'), value: Grade.Perfect },
  { label: t('passModal.grades.technique_waveoff'), value: Grade.TechniqueWaveoff },
  { label: t('passModal.grades.foul_deck_waveoff'), value: Grade.FoulDeckWaveoff },
  { label: t('passModal.grades.pattern_waveoff'), value: Grade.PatternWaveoff },
  { label: t('passModal.grades.own_waveoff'), value: Grade.OwnWaveoff },
])

const showWire = computed(() => {
  if (isNil(grade.value)) return false
  switch (grade.value) {
    case Grade.Bolter:
    case Grade.FoulDeckWaveoff:
    case Grade.TechniqueWaveoff:
    case Grade.PatternWaveoff:
    case Grade.OwnWaveoff:
      return false
    default:
      return true
  }
})

const isUpdate = computed(() => !isNil(localPassData.value.ID))

// Method to update score/trap/wire based on grade selection
// Called automatically by the grade watcher when user selects a grade
function onGradeChange(newGrade: Grade | null | undefined): void {
  // Get the base data
  const updated = { ...localPassData.value }

  switch (newGrade) {
    case Grade.Cut:
      updated.score = 0.0
      updated.trap = true
      break
    case Grade.NoGrade:
      updated.score = 2.0
      updated.trap = true
      break
    case Grade.Bolter:
      updated.score = 2.5
      updated.wire = null
      updated.trap = false
      break
    case Grade.Fair:
      updated.score = 3.0
      updated.trap = true
      break
    case Grade.OK:
      updated.score = 4.0
      updated.trap = true
      break
    case Grade.Perfect:
      updated.score = 5.0
      updated.wire = 3
      updated.trap = true
      break
    case Grade.TechniqueWaveoff:
      updated.score = 1.0
      updated.wire = null
      updated.trap = false
      break
    default:
      updated.score = null
      updated.wire = null
      updated.trap = null
      break
  }

  // Replace the entire object to trigger shallowRef
  localPassData.value = updated
}

// Watch for grade changes and auto-update other fields
watch(
  () => localPassData.value.grade,
  (newGrade, oldGrade) => {
    if (newGrade !== oldGrade) {
      onGradeChange(newGrade)
    }
  },
)

function onSubmit(): void {
  emit('submit', localPass.value)
}

function reset(): void {
  localPassData.value = {
    ...localPassData.value,
    grade: null,
    score: null,
    wire: null,
    time: DateTime.utc(),
  }
}

defineExpose({
  reset,
  onSubmit,
  // Expose for testing - expose the underlying ref so tests can modify it
  localPassData,
})
</script>

<style scoped>
.score-field {
  flex: 0 0 100px;
}

.wire-field {
  flex: 0 0 150px;
  min-width: 150px;
}
</style>
