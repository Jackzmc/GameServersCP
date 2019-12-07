<template>
<div id="app">
<h6 class="title is-6">Backups</h6>
<article class="message is-warning">
  <div class="message-body">
   <strong>Notice</strong>
   This component is not fully implemented.
  </div>
</article>
<b-table :data="backups">
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
        <b-button icon-left="download">Download</b-button>
        <b-button icon-left="search">Inspect</b-button>
        <b-button icon-left="trash" type="is-danger">Delete</b-button>
      </div>
    </b-table-column>
  </template>
</b-table>
</div>
</template>

<script>
import Axios from 'axios';
export default {
  data() {
    return {
      backups:[]
    }
  },
  props:['server'],
  mounted() {
    Axios.get(`${this.$apiURL}/server/${this.server._id}/backups`,{json:true}).then((r) => {
        this.backups = r.data;
    }).catch(err => {
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
  }
}
</script>