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
export default {
    JARS: ['vanilla','spigot','sponge','paper'],
    data() {
        return {
            title:null,
            type:'',
            jar:0,
            appid:null
        }
    },
    computed:{
        isDisabled() {
            if(this.type) {
                if(this.type == "sourcegame") {
                    return !(this.appid)
                }
                return false;
            }else{
                return true;
            }
        }
    },
    methods:{
        createServer() {
            this.$buefy.toast.open({
                message:'Not implemented',
                type:'is-danger'
            })
        }
    },
    props:['id']
}
</script>

