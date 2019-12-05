<template>
<div id="app" v-cloak v-if="!loading">
  <div class="container">
    <div  class="box">
      <div class="is-inline">
        <b-button tag="router-link" to="/" type="is-pulled-left is-rounded"><font-awesome-icon icon="long-arrow-alt-left" /> Back</b-button>
        <div class="has-text-centered">
          <h1 class="title is-capitalized is-3" >{{server.name}}</h1>
        </div>
      </div>
      <hr>
      <div class="centered">
        <b-taglist>
          <b-tag :type="serverStatusType">{{serverStatus}}</b-tag>
          <b-tag type="is-info" v-if="server.status === 'up'">{{server.players}} / {{server.players_max}} Players Online</b-tag>
          <b-tag type="is-info" v-if="server.started">Up for {{server.started | formatUptime}}</b-tag>
          <b-tooltip label="The type of server"
              position="is-top">
              <b-tag type="is-primary is-capitalized">{{server.type||'Unknown Type'}}</b-tag>
          </b-tooltip>


        </b-taglist>
      </div>
    </div>

    <div class="box">
      <h5 class="title is-5">Management</h5>
      <div class="buttons">
        <b-button type="is-large is-info"><font-awesome-icon icon="cogs" /> View Settings</b-button>
        <b-button type="is-large is-info"><font-awesome-icon icon="list" /> View Logs</b-button>
        <b-button type="is-large is-info"><font-awesome-icon icon="file-archive" /> View Backups</b-button>
      </div>
    </div>
    
  </div>
  <br>
  <div class="container">
    <div class="box">
      <h6 class="title is-6">server.properties</h6>
    </div>
  </div>
  <br>
  <div class="centered">
    <b-taglist>
        <b-tag><strong>ID: </strong>{{$route.params.sid}}</b-tag>
        <b-tag><strong>Creator: </strong>{{server.creator||'Unknown'}}</b-tag>
    </b-taglist>
  </div>
</div>
</template>

<script>
import Axios from 'axios'
export default {
  data() {
    return {
      server:{},
      loading:true
    }
  },
  computed: {
    serverStatus() {
      if(this.server.status === "up") return "Online";
      if(this.server.status === "down") return "Offline";
      if(this.server.status === "starting") return "Starting";
      return this.server.status;
    },
    serverStatusType() {
      if(this.server.status === "up") return "is-success";
      if(this.server.status === "down") return "is-danger";
      if(this.server.status === "starting") return "is-warning";
      return "";
    }
  },
  mounted() {
    this.fetchServer(this.$route.params.sid);
  },
  methods: {
    fetchServer(id) {
      this.loading = true;
      Axios.get(`${this.$apiURL}/server/${id}`).then(r => {
        this.server = r.data.server;
        this.loading = false;
      }).catch(err => {
        this.loading = false;
        this.$buefy.dialog.alert({
            title: 'Error',
            message: `<b>Something happened while fetching server information.</b><br>${err.message} `,
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

.centered {
  display: flex; 
  justify-content: center
}
[v-cloak] { display:none; }
</style>