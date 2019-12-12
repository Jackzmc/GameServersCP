<template>
<div id="app">
    <h6 class="title is-6">Console</h6>
    <b-field>
        <b-input type="textarea" :loading="loading" readonly v-model="console" expanded custom-class="console"></b-input>
    </b-field>
    <b-field>
        <b-input :disabled="loading" placeholder="Enter a command here" icon="caret-right" v-model="input" expanded v-on:keyup.enter="sendCommand" />
    </b-field>
    <span v-if="loading">Waiting for server...</span>
    <hr>
    <div>
        <p :class="statusClass">Server is currently {{status}}</p>
        <br>
        <div class="buttons">
            <b-button type="is-success" :disabled="server.status != 'down'">Start</b-button>
            <b-button type="is-danger"  :disabled="server.status != 'up'">Stop</b-button>
        </div>
    </div>
</div>
</template>

<script>
import Axios from 'axios'
export default {
    data() {
        return {
            loading: true,
            console:``,
            input:null
        }
    },
    props:{
        server:{}
    },
    methods: {
        sendCommand() {
            Axios.post(`${this.$apiURL}/server/${this.server._id}/command`,(r) => {
                this.$buefy.toast.open({
                    type:'is-success',
                    message:JSON.stringify(r.data)
                })
            }).catch(err => {
                this.$buefy.toast.open({
                    type:'is-danger',
                    message:'Server returned ' + err.message
                })
            })
        }
    },
    computed: {
        statusClass() {
            switch(this.server.status) {
                case "up":
                    return "has-text-success";
                case "down":
                    return "has-text-danger";
                case "starting":
                    return "has-text-warning";
                default:
                    return "";
            }
        },
        status() {
            switch(this.server.status) {
                case "up":
                    return "online";
                case "down":
                    return "offline";
                case "starting":
                    return "starting";
                default:
                    return this.server.status;
            }
        }
    },
    mounted() {
        
    }
}
</script>

<style>
.console {
    background-color: black;
    color: white;
    height: 500px;
}
</style>