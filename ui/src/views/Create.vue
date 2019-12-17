<template>
<div id="app" class="container">
    <h4 class="title is-4 has-text-centered">Create New Server</h4>
    <form>
        <b-field label="Enter ID (optional)" message="Must be a unique, single alphanumeric combination. Leave blank for a random UUID">
            <b-input v-model="id" placeholder="csgo" />
        </b-field>
        <b-field label="Enter Display Title" message="">
            <b-input v-model="title" placeholder="My CSGO Server" required />
        </b-field>
        <b-field label="Game Type">
            <b-field>
                <b-radio-button v-model="type" native-value="minecraft">
                    <span>Minecraft</span>
                </b-radio-button>

                <b-radio-button v-model="type" native-value="sourcegame">
                    <span>Source Game</span>
                </b-radio-button>
            </b-field>
        </b-field>
        <b-field v-if="type == 'minecraft'" label="Server Type">
            <b-field >
                <b-radio-button v-for="(name,index) in $options.JARS" :key="name" v-model="jar" :native-value="index">
                    <span class="is-capitalized">{{name}}</span>
                </b-radio-button>
            </b-field>
        </b-field>
        <b-field v-if="type == 'minecraft'" label="Version">
            <b-field>
                <b-select v-model="version" placeholder="Choose a version">
                    <option value="latest">Latest</option>
                    <option v-for="(name) in versions" :key="name" :value="name">{{name}}</option>
                </b-select>
            </b-field>
        </b-field>
        <div v-if="type == 'sourcegame'">
            <b-field  label="Server AppID" message="Make sure the appID is a dedicated server, not the game client.">
                <b-input type="number" v-model="appid" placeholder="222860" />
            </b-field>
            <a href="https://developer.valvesoftware.com/wiki/Dedicated_Servers_List">Click here to view official list of dedicated server appids</a>
            <br>
        </div>
        <br>
        <b-field>
            <b-button @click="createServer" :disabled="isDisabled" type="is-primary" size="is-large">Create Server</b-button>
        </b-field>
    </form>

</div>
</template>

<script>
import Axios from 'axios'
export default {
    JARS: ['vanilla','spigot','sponge','paper'],
    data() {
        return {
            versions:[],
            title:null,
            type:'',
            version:"latest",
            jar:0,
            appid:null
        }
    },
    computed:{
        isDisabled() {
            if(this.type) {
                if(this.type == "sourcegame") {
                    return !(this.appid)
                }else if(this.type == 'minecraft') {
                    return (this.version == null)
                }
                return false;
            }else{
                return true;
            }
        }
    },
    methods:{
        createServer() {
            Axios.post(`${this.$apiURL}/server/create`,{

            }).then(() => {
                this.$buefy.toast.open({
                    message:'Successfully created server',
                    type:'is-sucess'
                })
                //todo: redirect to server
            }).catch(err => {
                this.$buefy.dialog.alert({
                    title: 'Error',
                    message: `<b>Failed to create a server: </b><br>${err.message} `,
                    type: 'is-danger',
                    hasIcon: true,
                    icon: 'times-circle',
                    iconPack: 'fa',
                    ariaRole: 'alertdialog',
                    ariaModal: true
                })
            })

        }
    },
    props:['id']
}
</script>

