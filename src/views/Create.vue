<template>
<div id="app" class="container">
    <h4 class="title is-4 has-text-centered">Create New Server</h4>
    <form>
        <b-field label="Enter ID" message="Must be a unique, single alphanumeric combination">
            <b-input v-model="id"/>
        </b-field>
        <b-field label="Enter Display Title" message="">
            <b-input v-model="title"/>
        </b-field>
    </form>

</div>
</template>

<script>
export default {
    data() {
        return {
            title:null,
            type:null
        }
    },
    props:['id']
}
</script>

