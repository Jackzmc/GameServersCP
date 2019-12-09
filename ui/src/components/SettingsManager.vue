<template>
<div id="app">
    <h6 class="title is-6">Control Panel Settings</h6>
    <b-field label="Server Tags">
        <b-taginput
            v-model="server.tags"
            ellipsis
            icon="tag"
            type="is-dark"
            placeholder="Add a tag">
        </b-taginput>
    </b-field>
    <span v-if="server.type == 'minecraft'">
        <b-field label="Server Type">
            <b-select v-model="server.jar" placeholder="Choose a server type">
                <option value="vanilla">Vanilla</option>
                <option value="spigot">Spigot</option>
                <option value="paper">Paper</option>
                <option value="sponge">Sponge</option>
                
            </b-select>
        </b-field>
    </span>
    <br>
    <b-button @click="saveField('general')" :disabled="changes.general.length == 0" type="is-primary" ><font-awesome-icon icon="save" /> Save Settings</b-button>
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
    <b-collapse :open="false" class="card" v-if="server.type == 'minecraft'">
        <div
            slot="trigger"
            slot-scope="props"
            class="card-header"
            role="button">
            <p class="card-header-title">
                server.properties
            </p>
            <a class="card-header-icon">
                <b-icon
                    :icon="props.open ? 'angle-down':'angle-up'">
                </b-icon>
            </a>
        </div>
        <div class="card-content">
            <div class="content">
                <b-table :data="server_properties" narrowed bordered striped class="is-marginless is-paddingless">
                    <template slot-scope="props" >
                        <b-table-column sortable field="key" label="Key" class="has-text-middle" width="300">
                            <strong>{{props.row.key}}</strong>
                        </b-table-column>
                        <b-table-column field="value" label="Value">
                            <span v-if="isChanged(props.row.key,'server_properties')" class="has-text-danger">{{getChangedValue(props.row.key,'server_properties')}}</span>
                            <span v-else>{{props.row.value}}</span>
                        </b-table-column>
                        <b-table-column label="Action" width="180">
                            <div class="buttons">
                            <b-button icon-left="pencil-alt" @click="editField(props.row.key,props.row.value,'server_properties')" type="is-danger">Edit</b-button>
                            <b-button v-if="isChanged(props.row.key,'server_properties')" @click="resetField(props.row.key,props.row.value,'server_properties')" type="is-warning">Reset</b-button>
                            </div>
                        </b-table-column>
                    </template>
                </b-table>
                <br>
                <b-button @click="saveField('server_properties')" :disabled="changes.server_properties.length == 0" type="is-primary" size="is-medium"><font-awesome-icon icon="save" /> Save</b-button>
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
            reachable:'unknown',
            server_properties:[],
            general:[],
            changes:{
                general:[],
                server_properties:[]
            }
        }
    },
    props: ['server'],
    mounted() {
        console.info("Loading config...",`${this.$apiURL}/server/${this.server._id}/config`) //eslint-disable-line no-console
        Axios.get(`${this.$apiURL}/server/${this.server._id}/config`,{json:true}).then((r) => {
            if(this.server.type == "minecraft") {
                this.server_properties = Object.keys(r.data.server_properties).map(v => { 
                    return {
                    key:v,value:r.data.server_properties[v]}
                })
            }
        }).catch(err => {
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
    methods:{
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
            this.$buefy.toast.open("Feature not Implemented for " + table)
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
</script>

<style scoped>
td {
    vertical-align: middle !important;
}
</style>