<template>
<div id="app" class="container">
    <h4 class="title is-4 has-text-centered">Create New Server</h4>
    <!-- <b-loading :active="loading" /> -->
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
                <b-radio-button v-for="(name,key) in $options.JARS" :key="key" v-model="jar" :native-value="key" :disabled="!name">
                    <span class="is-capitalized">{{key}}</span>
                </b-radio-button>
            </b-field>
        </b-field>
        <b-field v-if="type == 'minecraft'" label="Version">
            <b-field>
                <b-select v-model="version" placeholder="Choose a version" :loading="loading">
                    <option :value="latest_version">Latest ({{latest_version}})</option>
                    <option v-for="(version) in active_version" :key="version.id" :value="version.id">{{version.id}}</option>
                </b-select>
            </b-field>
        </b-field>
        <!-- <div v-if="type == 'sourcegame'">
            <b-field  label="Server AppID" message="Make sure the appID is a dedicated server, not the game client.">
                <b-input type="number" v-model="appid" placeholder="222860" />
            </b-field>
            <a href="https://developer.valvesoftware.com/wiki/Dedicated_Servers_List">Click here to view official list of dedicated server appids</a>
            <br>
        </div> -->
        <b-field v-if="type == 'sourcegame'" label="Choose a game" :message="(appids.length==0)?'No supported games for this os.':''">
            <b-field>
                <b-select :disabled="appids.length == 0" v-model="appid" placeholder="Choose a game" :loading="appids_loading">
                    <option v-for="(game) in appids" :key="game.appid" :value="game.appid">{{game.name}} ({{game.appid}})</option>
                </b-select>
            </b-field>
        </b-field>
        <b-field>
            <b-button @click="createServer" :disabled="isDisabled" type="is-primary" size="is-large">Create Server</b-button>
        </b-field>
    </form>

</div>
</template>

<script>
import Axios from 'axios'
export default {
    JARS: {vanilla:true,spigot:false,paper:true,sponge:false},
    data() {
        return {
            loading:false,
            versions:{
                spigot:[],
                vanilla:[],
                paper:[],
                sponge:[]
            },
            appids:[],
            appids_loading:false,
            active_version:[],
            latest_version:null,
            title:null,
            type:null,
            version:null,
            jar:'paper',
            appid:null
        }
    },
    watch:{
        type(newType) {
            if(newType === 'minecraft' && this.versions.vanilla.length === 0) {
                this.getVersions();
            }else if(newType === "sourcegame" && this.appids.length === 0) {
                this.getAppIDs();
            }
        },
        jar(newJar) {
            this.active_version = this.versions[newJar]
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

        },
        getVersions() {
            this.loading = true;
            Axios.get(`${this.$apiURL}/versions`).then(r => {
                this.versions = r.data;
                this.latest_version = r.data.latest.release;
                this.loading = false;

                this.active_version = this.versions[this.jar]
                this.version = this.latest_version;
            }).catch(err => {
                this.loading = false;
                this.$buefy.dialog.alert({
                    title: 'Error',
                    message: `<b>Could not fetch the latest versions at this time.</b><br>${err.message} `,
                    type: 'is-danger',
                    hasIcon: true,
                    icon: 'times-circle',
                    iconPack: 'fa',
                    ariaRole: 'alertdialog',
                    ariaModal: true
                })
            })
        },
        getAppIDs() {
            this.appids_loading = true
            Axios.get(`${this.$apiURL}/appids`).then(r => {
                this.appids = r.data;

                this.appids_loading = false;
            }).catch(err => {
                this.appids_loading = false;
                this.$buefy.dialog.alert({
                    title: 'Error',
                    message: `<b>Could not fetch the latest versions at this time.</b><br>${err.message} `,
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
