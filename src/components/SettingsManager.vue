<template>
<div id="app">
    <b-collapse :open="false" class="card">
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
                    :icon="props.open ? 'menu-down' : 'menu-up'">
                </b-icon>
            </a>
        </div>
        <div class="card-content">
            <div class="content">
                <b-table :data="server_properties">
                    <template slot-scope="props" >
                        <b-table-column field="key" label="Key" class="has-text-middle">
                            <strong>{{props.row.key}}</strong>
                        </b-table-column>
                        <b-table-column field="value" label="Value">
                            <span class="is-capitalized">{{props.row.value}}</span>
                        </b-table-column>
                        <b-table-column label="Action">
                            <b-button @click="editField(props.row.key,props.row.value,'server_properties')" type="is-danger">Edit</b-button>
                        </b-table-column>
                    </template>
                </b-table>
                <b-button @click="saveField('server_properties')" :disabled="changes.server_properties.length == 0" type="is-primary" size="is-medium"><font-awesome-icon icon="save" /> Save</b-button>
            </div>
        </div>
    </b-collapse>
</div>
</template>

<script>
import Axios from 'axios'
export default {
    data() {
        return {
            server_properties:[],
            changes:{
                server_properties:[]
            }
        }
    },
    props: ['server'],
    mounted() {
        console.info("Loading config...",`${this.$apiURL}/server/${this.server._id}/config`) //eslint-disable-line no-console
        Axios.get(`${this.$apiURL}/server/${this.server._id}/config`,{json:true}).then((r) => {
            this.server_properties = Object.keys(r.data.server_properties).map(v => { 
                return {
                key:v,value:r.data.server_properties[v]}
            })
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
        editField(key,value,table) {
            this.$buefy.dialog.prompt({
                message: `Enter new value for <b>${key}</b>`,
                inputAttrs: {
                    placeholder: '',
                    maxlength: 200,
                    value
                },
                trapFocus: true,
                onConfirm: (newValue) => {
                    this[table].find(v => v.key == key).value = newValue
                    this.changes[table].push({key,value:newValue})

                }
            })
        },
        saveField(table) {
            this.$buefy.toast.open("Feature not Implemented for " + table)
        }
    }
}
</script>

<style scoped>
td {
    vertical-align: middle !important;
}
</style>