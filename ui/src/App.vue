<template>
  <div id="app">
    <div id="nav">
      <div id="logo"><h3 class="title is-3 is-inline">GameServer CP</h3></div>
      <div class="nav-element">
        <router-link to="/manage/dashboard">Dashboard</router-link>
        <router-link to="/manage/create">Create New Server</router-link>
      </div>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  computed: {

  }  
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
}

#nav {
  padding: 30px;
  display: inline-block;
}

#nav a {
  padding-right:30px;
  font-weight: bold;
  /*color: #2c3e50;*/
  display: inline;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

</style>
