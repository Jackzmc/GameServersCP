<template>
<div id="app">
<h6 class="title is-6">Logs</h6>
<div class="columns">
    <b-loading :active="viewer.loading" :is-full-page="false" />
    <div class="column is-6">
    <b-button @click="getLogs" type="is-info" icon-left="sync" expanded>Refresh</b-button>
    <b-table :data="logs" :loading="list_loading">
        <template slot-scope="props" >
            <b-table-column field="name" label="Name">
            {{props.row.name}}
            </b-table-column>
            <b-table-column field="created" label="Created" class="has-text-middle" width="100">
                {{props.row.created | formatDateSimple}}
            </b-table-column>
            <b-table-column field="size" label="Size" class="has-text-middle" width="100">
                {{props.row.size | humanizeSize}}
            </b-table-column>
            <b-table-column  label="Action" class="has-text-middle" width="350">
            <div class="buttons">
                <b-button @click="fetchLog(props.row.name)" icon-left="eye" type="is-primary">View</b-button>
                <b-button @click="downloadLog(props.row.name)" icon-left="download">Download</b-button>
                <b-button @click="deleteLog(props.row.name)" icon-left="trash" type="is-danger"></b-button>
            </div>
            </b-table-column>
        </template>
    </b-table>
    </div>
    <div class="column is-6">
        <div class="is-inline">
            <b-button @click="jumpUp" :disabled="viewer.lines.length == 0" class="is-pulled-left" type="is-primary is-rounded" icon-left="angle-up">Jump to top</b-button>
            <b-button @click="jumpDown" :disabled="viewer.lines.length == 0" class="is-pulled-right" type="is-primary is-rounded" icon-left="angle-down">Jump to bottom</b-button>
            <div class="has-text-centered">
                <span v-if="viewer.lines.length == 0">Please choose a log on the left</span>
            </div>
        </div>
        <br><br>

        <lined-textarea 
            id="viewer"
            :disabled="viewer.lines.length == 0 || viewer.loading"
            :nowrap="false"
            v-model="text"
        ></lined-textarea>
        <br>
    </div>
</div>
</div>
</template>

<script>
import Axios from 'axios';
import LinedTextArea from '@/components/LinedTextArea'
export default {
    data() {
        return {
            viewer:{
                lines:[],
                loading:false
            },
            list_loading: true,
            logs:[]
        }
    },
    computed: {
        text() {
            return this.viewer.lines.join("\n")
        }
    },
    components:{
        'lined-textarea': LinedTextArea,
    },
    props:{
        server:{}
    },
    mounted() {
        this.getLogs();
    },
    methods:{
        getLogs() {
            this.list_loading = true;
            Axios.get(`${this.$apiURL}/server/${this.server._id}/logs`,{json:true}).then((r) => {
                this.logs = r.data;
                this.list_loading = false;
            }).catch(err => {
                this.list_loading = false;
                this.$buefy.dialog.alert({
                    title: 'Error',
                    message: `<b>Something happened while fetching logs.</b><br>${err.message} `,
                    type: 'is-danger',
                    hasIcon: true,
                    icon: 'times-circle',
                    iconPack: 'fa',
                    ariaRole: 'alertdialog',
                    ariaModal: true
                })
            })
        },
        jumpUp() {
            const el = document.getElementById("viewer");
            el.scrollTop = 0
        },
        jumpDown() {
            const el = document.getElementById("viewer");
            el.scrollTop = el.scrollHeight
        },
        deleteLogConfirmed(name) { //eslint-disable-line no-unused-vars
            this.$buefy.toast.open({
                message:'Sorry, feature not implemented.',
                type:'is-danger'
            })
        },
        deleteLog(name) {
            this.$buefy.dialog.confirm({
                title: 'Delete Log',
                message: `Are you sure you want to delete <b>${name}</b>?`,
                confirmText: 'Delete Log',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => this.deleteLogConfirmed(name)
            })
        },
        downloadLog(name) {
            window.open(`${this.$apiURL}/server/${this.server._id}/logs/${name}?download=1`)
        },
        fetchLog(name) {
            this.viewer.loading = true;
            Axios.get(`${this.$apiURL}/server/${this.server._id}/logs/${name}`,{json:true}).then((r) => {
                this.viewer.lines = r.data;
                this.viewer.loading = false;
            }).catch(err => {
                this.viewer.loading = false;
                this.$buefy.dialog.alert({
                    title: 'Error',
                    message: `<b>Something happened while fetching the log file.</b><br>${err.message} `,
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