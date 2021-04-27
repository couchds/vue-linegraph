<template>
  <div id="app">
    <div class="app-header">
      <div id="app-header-text">
        Vue Dashboard
      </div>
    </div>
    <div id="btn-examples">
      <h1>Actions</h1>
      <button class="demo-btn" @click="randomizeData">Randomize Data</button>
    </div>
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
  },
  methods: {
    /**
     * Randomize the data in the dashboard.
     */
    randomizeData: function () {
        console.log('to be implemented!');
    }
  }
}
</script>

<style>

html, body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.app-header {
  background-color: rgb(87, 87, 87);
  font-size: 2vw;
  text-align: left;
  margin-bottom: 20px;
  padding: 0;
  top: 0;
}

#app-header-text {
  color: white;
  font-weight: 500;
  margin-left: 5%;
}

.flex-row {
  display: flex;
  flex-wrap: wrap;
  align-items: left;
  justify-content: space-between;
  margin: 2%;
}

.flex-row > .flex-row-item {
  flex: 0 0 30%;
}


#btn-examples {
  margin-left: 5%;
  text-align: left;
  width: 30%;
}

#btn-examples > h1 {
  border-bottom: 2px solid steelblue;
}

.demo-btn {
  background-color: steelblue;
  border: 2px solid;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  font-size: 1.5em;
}

</style>
