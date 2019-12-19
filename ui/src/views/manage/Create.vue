<template>
<div id="app" class="container">
    <h4 class="title is-4 has-text-centered">Create New Server</h4>
    <!-- <b-loading :active="loading" /> -->
    <form>
        <b-field label="Enter ID (optional)" message="Must be a unique, single alphanumeric combination. Leave blank for a random id">
            <b-input v-model="id" placeholder="csgo" pattern="^[A-Za-z0-9_-]+$" validation-message="Must be a unique, single alphanumeric combination. Leave blank for a random id" />
        </b-field>
        <b-field label="Enter Display Title" message="">
            <b-input v-model="title" placeholder="My CSGO Server" required />
        </b-field>
        <b-field label="Game Type">
            <b-field>
                <b-radio-button v-model="type" native-value="minecraft" required>
                    <span>Minecraft</span>
                </b-radio-button>

                <b-radio-button v-model="type" native-value="sourcegame" required>
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
        <b-field v-if="type === 'sourcegame'" label="Choose a game">
            <b-field>
                <b-autocomplete
                    rounded
                    :data="appids.filtered"
                    :custom-formatter="displayName"
                    open-on-focus
                    @select="selectAppids"
                    @input="filterAppids"
                    :loading="appids_loading"
                    placeholder="Choose a game">
                    <template slot="empty">No results found</template>
                </b-autocomplete>
            </b-field>
        </b-field>
        <div v-if="appid_anonymous_warn">
            <b-message type="is-warning" >
                *The selected appid does not have anonymous login supported. Please make sure you have a username and password setup on the control panel.
            </b-message>
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
            appids:{
                raw:[],
                filtered:[]
            },
            appids_loading:false,
            active_version:[],
            latest_version:null,
            title:null,
            type:null,
            version:null,
            jar:'paper',
            appid:"",
            appid_anonymous_warn:false
        }
    },
    watch:{
        type(newType) {
            if(newType === 'minecraft' && this.versions.vanilla.length === 0) {
                this.getVersions();
            }else if(newType === "sourcegame" && this.appids.raw.length === 0) {
                this.getAppIDs();
            }
        },
        jar(newJar) {
            this.version = null;
            this.active_version = this.versions[newJar]
        }
    },
    computed:{
        isDisabled() {
           if(!this.title) return true;
            if(this.type) {
                if(this.type == "sourcegame") {
                    return (!this.appid || this.appid === "" )
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
        displayName(v) {
            return `${v.name} (${v.appid}) ${v.anonymous === true?'':'*'}` 
        },
        selectAppids(app) {
            if(app) {
                this.appid = app.appid
                console.log(app) //eslint-disable-line
                if(app.anonymous !== true) {
                    this.appid_anonymous_warn = true
                }else{
                    this.appid_anonymous_warn = false
                }
            }else{
                this.appid = ""
            }
        },
        filterAppids(text) {
            if(text === "" || text == null) {
                this.appids.filtered = this.appids.raw;
                this.appid = ""
            }
            const search = text.replace(/\s(\(\d+)(\)\s?\*?)?/,'').trim().toLowerCase();
            console.log('search',search) //eslint-disable-line
            this.appids.filtered = this.appids.raw.filter(v => v.name.trim().toLowerCase().includes(search))
        },
        createServer() {
            Axios.post(`${this.$apiURL}/server/create`,{
                id:this.id,
                name:this.title,
                type:this.type,
                appid:this.appid,
                mc:{
                    version:this.version,
                    jar:this.jar,
                    memory:'512'
                }
            }).then((r) => {
                this.$buefy.snackbar.open({
                    message:'Successfully created server.',
                    type:'is-success',
                    position: 'is-top',
                    actionText: 'View',
                    onAction: () => {
                        this.$router.push(`/manage/server/${r.data.id}`)
                    }
                })
                //todo: redirect to server
            }).catch(err => {
                if(err.response && err.response.data.reason && err.response.data.reason === "ServerAlreadyExists") {
                    return this.$buefy.toast.open({
                        type:'is-danger',
                        message:`Could not create server: ${err.response.data.error}`
                    })
                }
                if(err.errors) {
                    err.errors.forEach(v => {
                        this.$buefy.toast.open({
                            type:'is-danger',
                            message:`${v.param}: ${v.message}`
                        })
                    })
                }
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
                this.appids.raw = r.data;
                this.appids.filtered = r.data;

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

