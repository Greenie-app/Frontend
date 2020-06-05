<template>
  <b-form @submit.prevent="onSubmit" data-cy="passForm">
    <field-with-errors :errors="formErrors"
                       field="time"
                       label="passModal.fields.time"
                       object="pass"
                       placeholder=""
                       required
                       type="datetime"
                       v-model="pass.time" />

    <field-with-errors :errors="formErrors"
                       field="pilot"
                       label="passModal.fields.pilot"
                       list="pilot-list"
                       object="pass"
                       placeholder=""
                       required
                       v-model="pass.pilot" />

    <field-with-errors :errors="formErrors"
                       field="ship_name"
                       label="passModal.fields.shipName"
                       object="pass"
                       placeholder=""
                       v-model="pass.shipName" />

    <field-with-errors :errors="formErrors"
                       field="aircraft_type"
                       label="passModal.fields.aircraftType"
                       list="aircraft-type-list"
                       object="pass"
                       placeholder=""
                       v-model="pass.aircraftType" />

    <b-container class="px-0">
      <b-form-row>
        <field-with-errors :errors="formErrors"
                           class="col-12 col-sm-6"
                           field="grade"
                           label="passModal.fields.grade"
                           object="pass"
                           options="passModal.grades"
                           placeholder=""
                           required
                           type="select"
                           v-model="pass.grade" />

        <field-with-errors :errors="formErrors"
                           class="col-6 col-sm-3"
                           field="score"
                           label="passModal.fields.score"
                           max="5"
                           min="0"
                           object="pass"
                           placeholder=""
                           step="0.5"
                           type="spinbutton"
                           v-model="pass.score" />

        <field-with-errors :errors="formErrors"
                           :options="wireOptions"
                           class="col-6 col-sm-3"
                           field="wire"
                           label="passModal.fields.wire"
                           object="pass"
                           placeholder=""
                           type="select"
                           v-model="pass.wire" />
      </b-form-row>

      <field-with-errors :errors="formErrors"
                         :options="trapOptions"
                         field="trap"
                         label="passModal.fields.trap"
                         object="pass"
                         placeholder=""
                         type="select"
                         v-model="pass.trap" />

      <field-with-errors :errors="formErrors"
                         field="notes"
                         label="passModal.fields.notes"
                         object="pass"
                         placeholder=""
                         v-model="pass.notes" />
    </b-container>

    <b-button-toolbar justify>
      <b-button :disabled="busy" data-cy="savePassButton" type="submit" variant="primary">
        <b-spinner small v-if="busy" />
        <span v-else>{{$t(submitString)}}</span>
      </b-button>

      <b-button :disabled="busy"
                @click="$emit('delete')"
                data-cy="deletePassButton"
                v-if="isUpdate"
                variant="danger">
        {{$t('editPassModal.deleteButton')}}
      </b-button>
    </b-button-toolbar>

    <p class="text-danger mt-3 mb-0" v-if="formError">{{formError}}</p>

    <datalist id="aircraft-type-list">
      <option :key="type" v-for="type in aircraftTypes">{{type}}</option>
    </datalist>

    <datalist id="pilot-list">
      <option :key="pilot" v-for="pilot in pilotNames">{{pilot}}</option>
    </datalist>
  </b-form>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Prop, Watch } from 'vue-property-decorator'
  import { DateTime } from 'luxon'
  import { Getter } from 'vuex-class'
  import { isNil, times } from 'lodash-es'
  import { Errors } from '@/store/types'
  import FieldWithErrors from '@/components/FieldWithErrors.vue'
  import { Grade, Pass } from '@/types'

  type DraftPass = Partial<Pass>

  const aircraftTypes = ['FA-18C_hornet', 'F-14B', 'A-4E-C']
  const emptyPass: DraftPass = { time: DateTime.utc() }

  @Component({
    components: { FieldWithErrors }
  })
  export default class Form extends Vue {
    @Prop({ type: String, required: false }) formError!: string | null

    @Prop({ type: Object, required: false }) formErrors!: Errors | null

    @Prop({ type: Boolean, default: false }) busy!: boolean

    @Prop({ type: Object, default: () => emptyPass }) pass!: DraftPass

    @Prop({ type: String, required: true }) submitString!: string

    @Getter pilotNames!: string[]

    get aircraftTypes(): string[] {
      return aircraftTypes
    }

    get trapOptions(): { text: string, value: boolean | null }[] {
      return [
        { text: <string> this.$t('passModal.trap.null'), value: null },
        { text: <string> this.$t('passModal.trap.true'), value: true },
        { text: <string> this.$t('passModal.trap.false'), value: false }
      ]
    }

    get wireOptions(): { text: string, value: number | null }[] {
      return [
        { text: 'WO / B', value: null },
        ...times(4, n => ({ text: n.toString(), value: n }))
      ]
    }

    get isUpdate(): boolean {
      return !isNil(this.pass.ID)
    }

    @Watch('pass.grade')
    onGradeChanged(): void {
      switch (this.pass.grade) {
        case Grade.Cut:
          this.pass.score = 0.0
          this.pass.trap = true
          break
        case Grade.NoGrade:
          this.pass.score = 2.0
          this.pass.trap = true
          break
        case Grade.Bolter:
          this.pass.score = 2.5
          this.pass.wire = null
          this.pass.trap = false
          break
        case Grade.Fair:
          this.pass.score = 3.0
          this.pass.trap = true
          break
        case Grade.OK:
          this.pass.score = 4.0
          this.pass.trap = true
          break
        case Grade.Perfect:
          this.pass.score = 5.0
          this.pass.wire = 3
          this.pass.trap = true
          break
        case Grade.TechniqueWaveoff:
          this.pass.score = 1.0
          this.pass.wire = null
          this.pass.trap = false
          break
        default:
          this.pass.score = null
          this.pass.wire = null
          this.pass.trap = null
          break
      }
    }

    onSubmit(): void {
      this.$emit('submit', this.pass)
    }

    reset(): void {
      this.pass.grade = null
      this.pass.score = null
      this.pass.wire = null
      this.pass.time = DateTime.utc()
    }
  }
</script>
