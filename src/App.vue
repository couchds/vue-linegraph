<template>
  <div id="app">
    <div class="flex-row">
      <div class="flex-row-item" :graphTitle="'test1'">
        <LineGraph />
      </div>
      <div class="flex-row-item">
        <LineGraph :graphTitle="'test2'"/>
      </div>
      <div class="flex-row-item">
        <LineGraph :graphTitle="'test3'"/>
      </div>
      <div class="flex-row-item">
        <LineGraph :graphTitle="'test4'"/>
      </div>
    </div>
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

.flex-row {
    display: flex;
    flex-wrap: wrap;
    align-items: left;
    justify-content: left;
}

.flex-row > .flex-row-item {
    flex: 0 0 30%;
}
</style>
