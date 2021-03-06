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
      <label># of visuals:</label><input type="text" v-model="numVisualsInput"  @change="updateNumVisuals" />
    </div>

    <div class="flex-row">
      <div class="flex-row-item" v-for="visual in projectData" :key="visual.id">
        <LineGraph :graphTitle="visual.graphTitle"
          :timeSeriesData="visual.timeSeriesData"
          :datetimeFormat="visual.datetimeFormat" 
          primaryColor="rgba(0,206,203,0.7)"
          secondaryColor="#F1F1F1"
          height=400
          width=700
          @removeClicked="handleRemove" />
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
                      'graphTitle': 'Test'+String(lastIndex+i+1),
                      'id': i,
                      'datetimeFormat': '%Y'
                  })
              }
          }
      }
  },
  methods: {
      /**
       * Creates an object for time series data suitable for the component.
       * Currently assumes one measurement per year. 
       * 
       * @param {Number} numDataPts The number of data points to use in the time series.
       */
      generateRandomTimeSeries: function (numDataPts) {
          var timeSeries = [];
          let datetimeStart = 2000; // Need to develop this.
          for (var i = 0; i < numDataPts; i++) {
              timeSeries.push({
                  value: Math.ceil(Math.random()*100000),
                  datetime: datetimeStart + i
              })
          }
          return timeSeries;
      },
      /**
       * Creates an object that corresponds to a random line graph visualization.
       * 
       * @param {Number} numDataPts The number of data points to use in the time series.
       * @param {Number} index The position of the visual in the dashboard.
       */
      generateRandomVisual: function (numDataPts, index) {
          var data =  [
              {
                  active: true,
                  animateDraw: true,
                  animateDrawDuration: 1000,
                  color: 'steelblue',
                  isBar: false,
                  name: 'Graph ' + index,
                  yAxis: 0,
                  measurements: this.generateRandomTimeSeries(numDataPts)
              }
          ]
          if (Math.random() < 0.5) {
              let randomYAxis = 0;
              if (Math.random() < 0.5) randomYAxis = 1;
              data.push(
                {
                  active: true,
                  animateDraw: true,
                  animateDrawDuration: 1000,
                  color: 'orange',
                  isBar: false,
                  name: 'Graph ' + index + 100,
                  yAxis: randomYAxis,
                  measurements: this.generateRandomTimeSeries(numDataPts)
              }
              )
          }
          return {
              graphTitle: 'Graph ' + index,
              id: Math.ceil(Math.random()*5000),
              timeSeriesData: data,
              datetimeFormat: '%Y'
          }
      },
      /**
       * An example of a handler for the remove button click event.
       *
       */
      handleRemove: function (graphTitle) {
          this.projectData = this.projectData.filter((d) => {
              return d.graphTitle != graphTitle
          })
          this.$set(this, 'projectData', this.projectData);
      },
      /**
       * Randomize the data in the dashboard.
       * See:
       * https://vuejs.org/2016/02/06/common-gotchas/#Why-isn%E2%80%99t-the-DOM-updating
       */
      randomizeData: function () {
          var newProjectData = []
          for (var i = 0; i < this.numVisuals; i++) {
              newProjectData.push(this.generateRandomVisual(20, i));
          }
          this.$set(this, 'projectData', newProjectData);
      },
      /**
       * Set the app data's number of visuals to match the
       * user input.
       */
      updateNumVisuals: function () {
          this.numVisuals = this.numVisualsInput;
      }
  }
}
</script>

<style>

.axis text {
    font-family: Avenir, Helvetica, Arial, sans-serif !important;
    font-size: 1.5em !important;
    font-weight: 500 !important;
}


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
  background-color: #575d5c;
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
  border: 4px solid;
	border-image: linear-gradient(45deg, rgb(0, 206, 203, 0.3), rgb(0, 172, 170, 0.3)) 1;
  flex: 0 0 40%;
  margin-bottom: 3%;
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

.line-graph {
  stroke-width: 3px;
}

.line-graph:hover {
  stroke-width: 6px
}

.list-item {
  display: inline-block;
  margin-right: 10px;
}
.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

</style>
