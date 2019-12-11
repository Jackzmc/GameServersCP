<template>
<div id="app">
    <h6 class="title is-6">Control Panel Settings</h6>
    <b-field label="Server Tags">
        <b-taginput
            v-model="changes.settings.tags"
            ellipsis
            icon="tag"
            type="is-dark"
            placeholder="Add a tag">
        </b-taginput>
    </b-field>
    <span v-if="server.type == 'minecraft'">
        <b-field label="Server Type">
            <b-input disabled v-model="server.jar" />
        </b-field>
    </span>
    <br>
    <div class="buttons">
        <b-button @click="saveField('settings')" :disabled="!hasSettingsChanged" type="is-primary" ><font-awesome-icon icon="save" /> Save Settings</b-button>
        <b-button type="is-info" icon-left="sync" @click="loadConfig" :loading="refreshing">Refresh</b-button>
    </div>
    <hr>
    <div>
    <strong>Portforward Status: </strong>
    <span v-if="server.ip != null">
        <span v-if="reachable == 'unknown'">
            <a @click="checkPFStatus()" >Check status</a>
        </span>
        <span v-if="reachable != 'unknown'">
            <span v-if="reachable == 'error'" class="has-text-danger">Error ocurred while checking status.</span>
            <span v-else-if="reachable == 'checking'">Checking...</span>
            <span v-else-if="reachable == true" class="has-text-success">Port is reachable</span>
            <span v-else-if="!reachable" class="has-text-danger">Port is reachable</span>
        </span>
    </span>
    <span v-else class="has-text-danger">
        No IP has been set.
    </span>
    </div><br>
    <b-collapse :open="false" class="card" v-for="(config,key) in configurations" :key="key" >
        <div
            slot="trigger"
            slot-scope="props"
            class="card-header"
            role="button">
            <p class="card-header-title">
                {{key.replace('_','.')}}
            </p>
            <a class="card-header-icon">
                <b-icon
                    :icon="props.open ? 'angle-down':'angle-up'">
                </b-icon>
            </a>
        </div>
        <div class="card-content">
            <div class="content">
                <b-table :data="configurations[key]" narrowed class="is-marginless is-paddingless">
                    <template slot-scope="props" >
                        <b-table-column sortable field="key" label="Key" class="has-text-middle" width="300">
                            <strong>{{props.row.key}}</strong>
                        </b-table-column>
                        <b-table-column field="value" label="Value">
                            <span v-if="isChanged(props.row.key,key)" class="has-text-danger">{{getChangedValue(props.row.key,key)}}</span>
                            <span v-else>{{props.row.value}}</span>
                        </b-table-column>
                        <b-table-column label="Action" width="180">
                            <div class="buttons">
                            <b-button icon-left="pencil-alt" @click="editField(props.row.key,props.row.value,key)" type="is-danger">Edit</b-button>
                            <b-button v-if="isChanged(props.row.key,key)" @click="resetField(props.row.key,props.row.value,key)" type="is-warning">Reset</b-button>
                            </div>
                        </b-table-column>
                    </template>
                </b-table>
                <br>
                <b-button @click="saveField(key)" :disabled="changes[key].length == 0" type="is-primary" size="is-medium"><font-awesome-icon icon="save" /> Save</b-button>
            </div>
        </div>
    </b-collapse>
    <!-- <b-modal :active="true" :width="200">
        <div class="box">
            <h5 class="title is-5">Editing <b>setting-name</b></h5>
            <b-checkbox>Enable</b-checkbox>
        </div>
    </b-modal> -->
</div>
</template>
<script>
import Axios from 'axios'
export default {
    data() {
        return {
            refreshing:false,
            reachable:'unknown',
            configurations:{},
            server_properties:[],
            settings:{},
            changes:{
                settings:{},
                server_properties:[]
            }
        }
    },
    computed:{
        hasSettingsChanged() {
            if(!areArraysEqual(this.changes.settings.tags,this.settings.tags)) return true;
            return false;
        }
    },
    props: ['server'],
    mounted() {
        //generate list of settings
        this.settings = {
            tags:this.server.tags
        }
        //create copy to compare to original
        this.changes.settings = JSON.parse(JSON.stringify(this.settings))
        this.loadConfig();
    },
    methods:{
        loadConfig() {
            this.refreshing = true;
            Axios.get(`${this.$apiURL}/server/${this.server._id}/config`,{json:true}).then((r) => {
                this.refreshing = false;
                for(const key in r.data) {
                    this.configurations[key] = Object.keys(r.data[key]).map(v => {
                        return {
                            key:v,
                            value:r.data[key][v]
                        }
                    })
                }

            }).catch(err => {
                this.refreshing = false
                this.$buefy.dialog.alert({
                    title: 'Error',
                    message: `<b>Something happened while fetching server configuration.</b><br>${err.message} `,
                    type: 'is-danger',
                    hasIcon: true,
                    icon: 'times-circle',
                    iconPack: 'fa',
                    ariaRole: 'alertdialog',
                    ariaModal: true
                })
            })
        },
        isChanged(key,table) {
            return this.changes[table].find(v => v.key == key) != undefined
        },
        getChangedValue(key,table) {
            return this.changes[table].find(v => v.key == key).value;
        },
        resetField(key,value,table) {
            const index_changes = this.changes[table].findIndex(v => v.key == key);
            this.changes[table].splice(index_changes,1)
        },
        editField(key,value,table) {

            this.$buefy.dialog.prompt({
                message: `Enter new value for <b>${key}</b>`,
                inputAttrs: {
                    placeholder: '',
                    maxlength: 200,
                    value
                },
                confirmText:"Change",
                trapFocus: true,
                onConfirm: (newValue) => {
                    //this[table].find(v => v.key == key).value = newValue
                    this.changes[table].push({key,value:newValue,previous:value})

                }
            })
        },
        saveField(table) {
            switch(table) {
                case "settings": {
                    Axios.patch(`${this.$apiURL}/server/${this.server._id}/tags`,{tags:this.changes.settings.tags}).then(() => {
                        //if successful, change original to new
                        this.settings.tags = [...this.changes.settings.tags]
                        this.$buefy.toast.open({
                            message: 'Saved your settings successfully.',
                            type: 'is-success'
                        })
                    }).catch(() => {
                        this.$buefy.toast.open({
                            message: 'Could not save the settings at this time.',
                            type: 'is-danger'
                        })
                    })
                    break;
                }
                default:
                    this.$buefy.toast.open("Feature not Implemented for " + table)
            }
        },
        checkPFStatus() {
            this.reachable = "checking";
            Axios.get(`${this.$apiURL}/server/${this.server._id}/portcheck`,{json:true}).then((r) => {
                this.reachable = r.data.reachable
            }).catch(() => {
                this.$buefy.toast.open({
                    message: 'Failed to check portforward status',
                    type: 'is-danger'
                })
            })
        }
    }
}
function areArraysEqual(arr1,arr2) {
    console.log(arr1.length,arr2.length) //eslint-disable-line no-console
    if(arr1.length != arr2.length) return false;
    for(let i=0;i<arr1.length;i++) {
        if(arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
</script>

<style scoped>
td {
    vertical-align: middle !important;
}
.card-content {
    padding: 1em;
}
</style>