<template>
<div id="app">
<h6 class="title is-6">Backups</h6>
<div class="buttons">
  <b-button :loading="new_backup_loading" @click="startBackup" type="is-primary" icon-left="file-archive">Start backup</b-button>
  <b-button @click="getBackups" type="is-info" icon-left="sync" :loading="backups_loading">Refresh</b-button>
</div>

<b-table :data="backups" :loading="backups_loading">
  <template slot-scope="props" >
    <b-table-column label="Name">
      {{props.row.name}}
    </b-table-column>
    <b-table-column field="created" label="Created" class="has-text-middle" width="180">
        {{props.row.created | formatDate}}
    </b-table-column>
    <b-table-column field="size" label="File Size" class="has-text-middle" width="100">
        {{props.row.size | humanizeSize}}
    </b-table-column>
    <b-table-column  label="Action" class="has-text-middle" width="350">
      <div class="buttons">
        <b-button :loading="inspect.loading" @click="inspectBackup(props.row.name)" icon-left="search" type="is-primary">Inspect</b-button>
        <b-button @click="downloadBackup(props.row.name)" icon-left="download">Download</b-button>
        <b-button @click="deleteBackup(props.row.name)" icon-left="trash" type="is-danger">Delete</b-button>
      </div>
    </b-table-column>
  </template>
  <template slot="empty">
    <section class="section">
        <div class="content has-text-grey has-text-centered">
            <p>No backups were found</p>
        </div>
    </section>
  </template>
</b-table>
<b-modal :active.sync="inspect.active">
  <div class="box">
    <h4 class="title is-4">Inspecting {{inspect.file}}</h4>
    <b-table :data="inspect.files">
      <template slot-scope="props">
        <b-table-column field="name" label="Name">
          {{props.row.name}}
        </b-table-column>
        <b-table-column field="type" label="Type" class="has-text-middle">
            {{props.row.type}}
        </b-table-column>
        <b-table-column field="size" label="File Size" class="has-text-middle" width="100">
            {{props.row.size | humanizeSize}}
        </b-table-column>
      </template>
      <template slot="empty">
        <section class="section">
            <div class="content has-text-grey has-text-centered">
                <p>No files were found</p>
            </div>
        </section>
      </template>
    </b-table>
  </div>
</b-modal>
</div>
</template>

<script>
import Axios from 'axios';
export default {
  data() {
    return {
      inspect:{
        loading:false,
        active:false,
        file:null,
        files:[]
      },
      new_backup_loading:false,
      backups_loading:true,
      backups:[]
    }
  },
  props:['server'],
  mounted() {
    this.getBackups();
  },
  methods: {
    startBackup() {
      this.new_backup_loading = true;
      Axios.get(`${this.$apiURL}/server/${this.server._id}/backups/start`,{json:true}).then((r) => {
          this.new_backup_loading = false
          this.backups = r.data;
      }).catch(err => {
          this.new_backup_loading = false
          this.$buefy.dialog.alert({
              title: 'Error',
              message: `<b>Something happened while starting a new backup. </b><br>${err.message} `,
              type: 'is-danger',
              hasIcon: true,
              icon: 'times-circle',
              iconPack: 'fa',
              ariaRole: 'alertdialog',
              ariaModal: true
          })
      })
    },
    getBackups() {
      this.backups_loading = true
      Axios.get(`${this.$apiURL}/server/${this.server._id}/backups`,{json:true}).then((r) => {
          this.backups_loading = false
          this.backups = r.data;
      }).catch(err => {
          this.backups_loading = false
          this.$buefy.dialog.alert({
              title: 'Error',
              message: `<b>Something happened while fetching backups.</b><br>${err.message} `,
              type: 'is-danger',
              hasIcon: true,
              icon: 'times-circle',
              iconPack: 'fa',
              ariaRole: 'alertdialog',
              ariaModal: true
          })
      })
    },
    deleteBackupConfirm(name) { //eslint-disable-line no-unused-vars
        this.$buefy.toast.open({
            message:'Sorry, feature not implemented.',
            type:'is-danger'
        })
    },
    deleteBackup(name) {
      this.$buefy.dialog.confirm({
          title: 'Delete Backup',
          message: `Are you sure you want to delete <b>${name}</b>?`,
          confirmText: 'Delete Backup',
          type: 'is-danger',
          hasIcon: true,
          onConfirm: () => this.deleteBackupConfirm(name)
      })
    },
    inspectBackup(name) { //eslint-disable-line no-unused-vars 
      this.inspect.loading = true;
      Axios.get(`${this.$apiURL}/server/${this.server._id}/backups/${name}`,{json:true}).then(r => {
          this.inspect.loading = false;
          this.inspect.files = r.data;
          this.inspect.file = name;
          this.inspect.active = true;
      }).catch(err => {
        this.inspect.loading = false;
        this.$buefy.dialog.alert({
            title: 'Error',
            message: `<b>Something happened while fetching the log file.</b><br>${err.message} `,
            type: 'is-danger',
            hasIcon: true,
            icon: 'times-circle',
            iconPack: 'fa',
            ariaRole: 'alertdialog',
            ariaModal: true
        })
      })
    },
    downloadBackup(name) { //eslint-disable-line no-unused-vars
      window.open(`${this.$apiURL}/server/${this.server._id}/backups/${name}?download=1`)
    }
  }
}
</script>