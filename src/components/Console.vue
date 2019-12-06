<template>
<div id="app">
    <h6 class="title is-6">Console</h6>
    <b-field>
        <b-input type="textarea" :loading="loading" readonly v-model="console" expanded custom-class="console"></b-input>
    </b-field>
    <b-field>
        <b-input :disabled="loading" placeholder="Enter a command here" icon="caret-right" v-model="input" expanded />
    </b-field>
    <span v-if="loading">Waiting for server...</span>
</div>
</template>

<script>
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