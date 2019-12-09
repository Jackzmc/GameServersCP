<template>
<div id="app">
  <div class="container">
      <b-table :data="servers" striped :loading="loading">
        <template slot-scope="props" >
          <b-table-column label="Access" width="40">
              <b-button tag="router-link" :to="'/server/' + props.row._id" type="is-info "><font-awesome-icon icon="arrow-circle-right" /></b-button>
          </b-table-column>
          <b-table-column field="name" label="Server Name" class="has-text-middle">
              <span class="is-capitalized">{{props.row.name}}</span>
          </b-table-column>

          <b-table-column field="players" label="Players" width="20">
              {{props.row.players}} / {{props.row.players_max}}
          </b-table-column>

          <b-table-column label="Action" width="160">
            <div class="buttons">
              <b-button @click="startServer(props.row._id)" type="is-success" :disabled="props.row.status == 'up'">Start</b-button>
              <b-button @click="stopServer(props.row._id)" type="is-danger" :disabled="props.row.status == 'down'">Stop</b-button>
            </div>
          </b-table-column>
          <b-table-column label="Status" field="uptime">
            Up {{props.row.started | formatUptime}}
          </b-table-column>
        </template>
        <template slot="empty">
            <section class="section">
                <div class="content has-text-grey has-text-centered">
                    <p>No servers found</p>
                </div>
            </section>
        </template>
        <template slot="footer">
            <b-field label="Enter ID or leave blank" horizontal>
              <b-input placeholder="Enter a custom id or leave blank..." v-model="new_id"  />
              <p class="control">
                <b-button @click="startNewCreation" type="is-primary">Create New Server</b-button>
              </p>
            </b-field>

          <!-- Your custom last row goes here -->
        </template>
      </b-table>
  </div>
</div>
</template>

<script>
import Axios from 'axios';
import UUID from 'uuid/v4';

export default {
  name: 'app',
  data() {
    return {
      servers:[],
      new_id:null,
      loading:true,
    }
  },
  components: {
  },
  mounted() {
    this.loadServers();
  },
  methods:{
    startNewCreation() {
      const uuid = UUID();
      this.$router.push({
        name:'create',
        params:{id:this.new_id||uuid}
      })
    },
    viewServer(id) {
      this.$router.push('/server/' + id)
    },
    startServer(id) {
      Axios.get(`${this.$apiURL}/server/${id}/start`,{json:true}).then(() => {
        this.$buefy.toast.open({
            message: `Started server ${id}`,
            type: 'is-success'
        })
      }).catch(err => {
        this.$buefy.dialog.alert({
            title: 'Error',
            message: `<b>Something happened while managing server status</b><br>${err.message} `,
            type: 'is-danger',
            hasIcon: true,
            icon: 'times-circle',
            iconPack: 'fa',
            ariaRole: 'alertdialog',
            ariaModal: true
        })
      })
    },
    stopServer(id) {
      Axios.get(`${this.$apiURL}/server/${id}/stop`,{json:true}).then(() => {
        this.$buefy.toast.open({
            message: `Stopped server ${id}`,
            type: 'is-success'
        })
      }).catch(err => {
        this.$buefy.dialog.alert({
            title: 'Error',
            message: `<b>Something happened while managing server status</b><br>${err.message} `,
            type: 'is-danger',
            hasIcon: true,
            icon: 'times-circle',
            iconPack: 'fa',
            ariaRole: 'alertdialog',
            ariaModal: true
        })
      })
    },
    loadServers() {
      this.loading = true;
      Axios.get(`${this.$apiURL}/server`,{json:true}).then((r) => {
        this.servers = r.data.servers;
        this.loading = false;

      }).catch(err => {
        this.loading = false;

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

<style scoped>
    td {
      vertical-align: middle;
    }
</style>