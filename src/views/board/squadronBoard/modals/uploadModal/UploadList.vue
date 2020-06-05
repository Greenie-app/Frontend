<template>
  <div id="upload-list">
    <p class="text-danger" v-if="logfilesError">{{logfilesError.message}}</p>
    <p class="text-center" v-else-if="logfilesLoading">
      <b-spinner />
    </p>
    <upload :key="logfile.ID" :logfile="logfile" v-else v-for="logfile in logfiles" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Action, Getter } from 'vuex-class'
  import { Watch } from 'vue-property-decorator'
  import { isNull } from 'lodash-es'
  import Upload from '@/views/board/squadronBoard/modals/uploadModal/Upload.vue'
  import { Logfile, Squadron } from '@/types'

  @Component({
    components: { Upload }
  })
  export default class UploadList extends Vue {
    @Getter logfilesLoading!: boolean

    @Getter logfiles!: Logfile[] | null

    @Getter logfilesLoaded!: boolean

    @Getter logfilesError!: Error | null

    @Getter mySquadron!: Squadron

    @Action loadLogfiles!: () => Promise<void>

    @Action resetLogfiles!: () => void

    @Watch('mySquadron')
    onSquadronChanged(): void {
      if (isNull(this.mySquadron)) this.resetLogfiles()
      else this.loadLogfiles()
    }

    mounted(): void {
      this.onSquadronChanged()
    }
  }
</script>

<style lang="scss" scoped>
  #upload-list {
    max-height: 50vh;
    overflow-y: scroll;
  }
</style>
