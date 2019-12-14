<template>
<div id="app">
    <h6 class="title is-6">Console</h6>
    <b-field>
        <b-input type="textarea" :loading="console_loading" readonly v-model="console" expanded custom-class="console"></b-input>
    </b-field>
    <b-field>
        <b-input :disabled="!socket.connected" placeholder="Enter a command here" icon="caret-right" v-model="input" expanded @keyup.enter.native="sendCommand" />
    </b-field>
    <span v-if="!socket.connected">Waiting for server...</span>
    <hr>
    <div>
        <p :class="statusClass">Server is currently {{status}}</p>
        <br>
        <div class="buttons">
            <b-button type="is-success" @click="startServer" :disabled="server.status != 'down'">Start</b-button>
            <b-button type="is-danger"  @click="stopServer" :disabled="server.status != 'up'">Stop</b-button>
        </div>
    </div>
</div>
</template>

<script>
import Axios from 'axios'
import io from 'socket.io-client';

export default {
    socket:null,
    data() {
        return {
            console_loading: true,
            console:``,
            input:null,
            io:null,
            socket:{
                connected:false
            }
        }
    },
    props:{
        server:{}
    },
    methods: {
        sendCommand() {
            this.$options.socket.emit('command',this.input);
            this.input = null
            // Axios.post(`${this.$apiURL}/server/${this.server._id}/command`,(r) => {
            //     this.$buefy.toast.open({
            //         type:'is-success',
            //         message:JSON.stringify(r.data)
            //     })
            // }).catch(err => {
            //     this.$buefy.toast.open({
            //         type:'is-danger',
            //         message:'Server returned ' + err.message
            //     })
            // })
        },
        startServer() {
            Axios.get(`${this.$apiURL}/server/${this.server._id}/start`,() => {
                this.$buefy.toast({
                    message:'Successfully started server',
                    type:'is-success'
                })
            }).catch(() => {
                this.$buefy.toast({
                    message:'Failed to start server',
                    type:'is-danger'
                })
            })
        },
        stopServer() {
            Axios.get(`${this.$apiURL}/server/${this.server._id}/stop`,() => {
                this.$buefy.toast({
                    message:'Successfully stopped server',
                    type:'is-success'
                })
            }).catch(() => {
                this.$buefy.toast({
                    message:'Failed to stop server',
                    type:'is-danger'
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
        const socket = io(this.$socketURL);
        this.$options.socket = socket;
        socket.on('connect',() => {
            socket.emit('init',this.server._id)
            this.socket.connected = true;
        })
        socket.on('disconnect',() => {
            this.socket.connected = false;
        })
        socket.on('out',(m) => {
            this.console += (m)
        })
        socket.on('err',m => {
            this.console += ("[ERROR] "+m)
        })
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