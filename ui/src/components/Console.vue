<template>
<div id="app">
    <h6 class="title is-6">Console</h6>
    <b-field>
        <b-input type="textarea" :loading="console_loading" readonly v-model="console" expanded custom-class="console" ref="console"></b-input>
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
            <b-button type="is-warning"  @click="updateServer" :disabled="server.status != 'down'">Update</b-button>
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
            if(this.input == null || this.input == "") return; //ignore if empty
            this.$options.socket.emit('command',this.input,(ach) => {
                //ach is server anowledgement 
                console.log(ach) //eslint-disable-line
                if(ach.error) {
                    this.$buefy.toast.open({
                        type:'is-danger',
                        message:`Could not send command: ${ach.error}`
                    })
                } 
            });
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
                this.$buefy.toast.open({
                    message:'Successfully started server',
                    type:'is-success'
                })
            }).catch((err) => {
                this.$buefy.toast.open({
                    message:'Failed to start server: ' + err.message,
                    type:'is-danger'
                })
            })
        },
        updateServer() {
            Axios.get(`${this.$apiURL}/server/${this.server._id}/update`,() => {
                this.$buefy.toast.open({
                    message:'Successfully updated server',
                    type:'is-success'
                })
            }).catch((err) => {
                const msg = (err.response  && err.response.data.error) ? err.response.data.error : ''
                this.$buefy.toast.open({
                    message:'Failed to update server. '+msg,
                    type:'is-danger'
                })
            })
        },
        stopServer() {
            Axios.get(`${this.$apiURL}/server/${this.server._id}/stop`,() => {
                this.$buefy.toast.open({
                    message:'Successfully stopped server',
                    type:'is-success'
                })
            }).catch(() => {
                this.$buefy.toast.open({
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
        const consoleRef = this.$refs['console'].$refs.textarea;
        socket.on('out',(m) => {
            this.console += (m)
            this.$nextTick(() => {
                consoleRef.scrollTop =  consoleRef.scrollHeight;
            });
            
        })
        socket.on('err',m => {
            this.console += ("[ERROR] "+m)
            this.$nextTick(() => {
                consoleRef.scrollTop =  consoleRef.scrollHeight;
            });
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