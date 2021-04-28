<template>
  <div id="app">
    <div class="app-header">
      <div id="app-header-text">
        Vue Dashboard
      </div>
    </div>
    <div id="btn-examples">
      <h1>Actions</h1>
      <button class="demo-btn" @click="randomizeData">Randomize Data</button><br />
      <label># of visuals:</label><input type="text" v-model="numVisualsInput" @change="updateNumVisuals" />
    </div>
    <div class="flex-row">
      <div class="flex-row-item" v-for="visual in projectData" :key="visual.graphTitle">
        <LineGraph :graphTitle="visual.graphTitle"/>
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
  data: function () {
      return {
          numVisuals: 5,
          numVisualsInput: 5,
          projectData: []
      }
  },
  created: function () {
      for (var i = 0; i < this.numVisuals; i++) {
          this.projectData.push({
              'graphTitle': 'Test'+(i+1)
          });
      }
  },
  watch: {
      /**
       * How to handle a new number of visuals provided:
       * If the new number is less than the existing number (e.g user changes from 5 -> 3)
       * then we slice array to the new number
       * 
       * If the new number is greater than the existing number, we need to
       * add more visuals.
       */
      numVisuals: function (newValue, oldValue) {
          // need to remove visuals.
          if (newValue < oldValue) {
              this.projectData = this.projectData.slice(0, newValue);
          } else {
              // new visual indices start at current last index
              // e.g. if the last visual is 'Visual6' then the first new visual is 'Visual7'
              let lastIndex = this.projectData.length;
              for (var i = 0; i < newValue-oldValue; i++) {
                  this.projectData.push({
                      'graphTitle': 'Test'+String(lastIndex+i+1)
                  })
              }
          }
      }
  },
  methods: {
      /**
       * Randomize the data in the dashboard.
       */
      randomizeData: function () {
          console.log('to be implemented!');
      },
      updateNumVisuals: function () {
          this.numVisuals = this.numVisualsInput;
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
  justify-content: space-evenly;
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

#btn-examples > label {
  font-size: 1.2em;
}

#btn-examples > input {
  font-size: 1.2em;
}

.demo-btn {
  background-color: steelblue;
  border: 2px solid;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  font-size: 1.5em;
  margin-bottom: 12px;
}

</style>
