<template>
<b-table :data="tableData" striped>
    <template slot-scope="props" >
        <b-table-column label="Name">
            <b>{{props.row.name}}</b>
        </b-table-column>
        <b-table-column label="Value">
            <span v-html="props.row.value" />
        </b-table-column>
    </template>
</b-table>
</template>

<script>
export default {
    props:['server'],
    computed:{
        tableData() {
            let obj = {
                created: this.$options.filters.formatDateSimple(this.server.created),
                starter: this.server.starter,
                'IP': `${this.server.ip||'0.0.0.0'}:${this.server.port}`,
                tags: this.server.tags.join(", ")
            }
            if(this.server.type === 'sourcegame') {
                obj = Object.assign(obj,{
                    appid: `${this.server.appid} <a href='https://store.steampowered.com/app/${this.server.appid}'>[Steam]</a> <a href='https://steamdb.info/app/${this.server.appid}'>[SteamDB]</a>`
                })
            }else if(this.server.type === 'minecraft') {
                obj = Object.assign(obj,{
                    'Jar Type': this.server.mc.jar,
                    version: this.server.mc.version,
                    'Max Memory': this.server.mc.memory,
                })
            }
            return Object.keys(obj).filter(v => obj[v]).map(v => {return {name:capitalize(v),value:obj[v]}})
        }
    }
}
function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}
</script>