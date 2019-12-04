<template>
<div id="app">
  <div class="container">
      <b-table :data="servers">
        <template slot-scope="props" >
          <b-table-column label="Access" width="40">
              <b-button @click="viewServer(props.row.id)" type="is-info"><font-awesome-icon icon="arrow-circle-right" /></b-button>
          </b-table-column>
          <b-table-column field="name" label="Server Name" >
              {{props.row.name}}
          </b-table-column>

          <b-table-column field="players" label="Players" width="20">
              {{props.row.players}} / {{props.row.players_max}}
          </b-table-column>

          <b-table-column label="Action" width="160">
            <div class="buttons">
              <b-button type="is-success" :disabled="props.row.status == 'up'">Start</b-button>
              <b-button type="is-danger" :disabled="props.row.status == 'down'">Stop</b-button>
            </div>
          </b-table-column>
          <b-table-column label="Status">
            Up 3 days
          </b-table-column>
        </template>
      </b-table>
  </div>
</div>
</template>

<script>
import Axios from 'axios';
export default {
  name: 'app',
  data() {
    return {
      servers:[]
    }
  },
  components: {
  },
  mounted() {
    this.loadServers();
  },
  methods:{
    viewServer(id) {
      this.$router.push('/server/' + id)
    },
    loadServers() {
      Axios.get('http://localhost:8107/api/server/list',{json:true}).then((r) => {
        this.servers = r.data.servers;
      }).catch(err => {
        this.$buefy.dialog.alert({
            title: 'Error',
            message: `<b>Something happened while fetching servers.</b><br>${err.message} `,
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
}
</script>