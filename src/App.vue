<template>
  <div id="app">
    <LineGraph />
    <LineGraph :graphTitle="'test2'"/>
  </div>
</template>

<script>
import LineGraph from './components/LineGraph.vue'

export default {
  name: 'App',
  components: {
    LineGraph
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
