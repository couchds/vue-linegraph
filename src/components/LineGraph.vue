<template>
    <div class="vue-line-graph">
        <div class="graph-header">
            <div class="graph-header-item line-graph-btns" v-if="showOptions">
                <div :id="'customize-btn-'+graphTitleId" aria-describedby="tooltip" class="customize-btn" @click="handleCustomizeClicked">Customize</div>
                <div :id="'tooltip-'+graphTitleId" class="tooltip" role="tooltip" v-show="customizeActive">
                    <GraphSettings :timeSeriesData="timeSeriesData" />
                    <div id="arrow" data-popper-arrow></div>
                </div>
            </div>
            <div class="graph-header-item">
                <h1>{{ graphTitle }}</h1>
            </div>
            <div class="graph-header-item">
                <GraphLegend :legendId="'legend-'+graphTitleId"
                    :legendMap="legendMap"
                />
            </div>
        </div>
        <div class="line-graph-container" :id="graphTitleId">
        </div>
    </div>
</template>

<script>

import * as d3 from "d3";
import { createPopper } from '@popperjs/core';
import GraphLegend from './GraphLegend.vue';
import GraphSettings from './GraphSettings.vue';

export default {
    name: 'LineGraph',
    components: {
        GraphLegend,
        GraphSettings
    },
    /**
     * Props are immutable within the component itself,
     * they're set by the parent component.
     */
    props: {
        /* The data to visualize. This is an array of objects, where each
         * object has the keys 'isBar', 'measurements', and 'name'.
        */
        timeSeriesData: {
            type: Array,
            default: () => {
                return [{
                    active: true,
                    animateDraw: true,
                    animateDrawDuration: 1000,
                    color: 'steelblue',
                    criticalValues: [120, 350],
                    isBar: false,
                    name: 'Test Data',
                    referenceRange: [150, 300],
                    yAxis: 0,
                    measurements: [
                        {
                            datetime: '2015-01-02',
                            value: 50
                        },
                        {
                            datetime: '2015-02-02',
                            value: 150
                        },
                        {
                            datetime: '2015-03-02',
                            value: 200
                        },
                        {
                            datetime: '2015-04-02',
                            value: 130
                        },
                        {
                            datetime: '2015-05-02',
                            value: 240
                        },
                        {
                            datetime: '2015-06-02',
                            value: 380
                        },
                        {
                            datetime: '2015-07-02',
                            value: 420
                        }
                    ]
                },
                {
                    active: true,
                    animateDraw: false,
                    animateDrawDuration: null,
                    color: 'red',
                    criticalValues: null,
                    isBar: true,
                    name: 'Test Data 2',
                    referenceRange: [40, 140],
                    timespanValue: 360,
                    timespanUnits: 'h', // for hours
                    yAxis: 1,
                    measurements: [
                        {
                            datetime: '2015-01-01',
                            value: 60
                        },
                        {
                            datetime: '2015-02-01',
                            value: 120
                        },
                        {
                            datetime: '2015-03-01',
                            value: 170
                        },
                        {
                            datetime: '2015-04-01',
                            value: 160
                        },
                        {
                            datetime: '2015-05-01',
                            value: 150
                        },
                        {
                            datetime: '2015-06-01',
                            value: 140
                        },
                        {
                            datetime: '2015-07-01',
                            value: 100
                        }
                    ]
                }
                ]
            }
        },
        /**
         * The format that both series have their datetimes in.
         * In the future, we might want to move this to the series itself
         * (what if each series has its own DT format?)
         */
        datetimeFormat: {
            type: String,
            default: '%Y-%m-%d'
        },
        /**
         * Graph title, which should be unique among a set of graphs.
         * If it is not unique, then the SVG selector is bugged because it selects
         * by ID.
         */
        graphTitle: {
            type: String,
            default : 'My Line Graph'
        },
        /**
         * An ID unique to this graph among a set of graphs.
         * This is the key that Vue uses when dynamically rendering with v-for.
         */
        id: {
            type: Number,
            default: 1
        },
        height: {
            type: Number,
            default: 300
        },
        width: {
            type: Number,
            default: 600
        },
        // Margins
        marginBottom: {
            type: Number,
            default: 30
        },
        marginTop: {
            type: Number,
            default: 30
        },
        marginLeft: {
            type: Number,
            default: 60
        },
        marginRight: {
            type: Number,
            default: 60
        },
        /**
         * Should we give the user options to customize visualization?
         */
        showOptions: {
            type: Boolean,
            default: true
        },
        strokeWidth: {
            type: Number,
            default: 1.5
        }
    },
    computed: {
        adjustedHeight: function () {
            return this.height - this.marginTop - this.marginBottom;
        },
        adjustedWidth: function () {
            return this.width - this.marginLeft - this.marginRight;
        },
        activeTimeSeries: function () {
            return this.timeSeriesData.filter((d) => {
                return d.active === true
            });
        }
    },
    watch: {
        activeTimeSeries: function () {
            this.createLegendMap();
            d3.select('#'+this.graphTitleId).select('svg').selectAll("*").remove();
            this.createGraph(false);
            //this.createGraph();
        }
    },
    data: function () {
        return {
            /**
             * The time series that the visualization is currently
             * focusing on.
            */
            criticalValues: null,
            focusedTimeSeries: null,
            chart: null,
            chartHeader: null,
            clipPathId: null,
            clipPath: null,
            /**
             * Should we show the popover form to customize the
             * visualization?
            */
            customizeActive: false,
            defs: null,
            graphTitleId: this.htmlCompatible(this.graphTitle),
            legendMap: null,
            minDatetime: null, // this will be used to calculate bar width.
            seriesPaths: {},
            svg: null,
            xAxis: null,
            xAxisGroup: null,
            y0Axis: null,
            y1Axis: null,
            y0AxisGroup: null,
            y1AxisGroup: null,
            xScale: null,
            y0Scale: null,
            y1Scale: null
        }
    },
    mounted: function () {
        this.createPopover();
        this.graphTitleId = this.htmlCompatible(this.graphTitle);
        this.createLegendMap();
        this.createGraph();
        /*this.createLegendMap();
        this.createSVG();
        this.createChart();
        this.drawCoordinateAxes();
        this.createXScale();
        this.drawXAxis();

        
        const drawingQueue = this.createDrawingQueue();
        // refactor
        let Y0 = this.getDataByScale(0);
        if (Y0.length > 0) {
            this.createYScale(Y0, 0);
            this.drawYAxis(0);
        }
        let Y1 = this.getDataByScale(1);
        if (Y1.length > 0) {
            this.createYScale(Y1, 1);
            this.drawYAxis(1);
        }
        for (var i = 0; i < drawingQueue.length; i++) this.createTimeSeries(drawingQueue[i]);*/
    },
    methods: {
        /**
         * Animate a path being drawn using a transition.
         * 
         * @param {Selection} path The path that is drawn.
         * @param {Object} data The time series that we use the options from.
         */
        animatePathDraw: function (path, data) {
            const totalLength = path.node().getTotalLength();
            path
              .attr("stroke-dasharray", totalLength + " " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
              .duration(data.animateDrawDuration)
              .ease(d3.easeLinear)
              .attr("stroke-dashoffset", 0);
        },
        /**
         * Returns the width of a single bar in a chart.
         */
        calculateBarWidth: function (series) {
            const DTStop = new Date(this.minDatetime);
            DTStop.setHours(DTStop.getHours() + (series.timespanValue));
            return this.xScale(DTStop);
        },
        /**
         * Create the g element for the chart that we will contain the visualization.
         */
        createChart: function () {
            let self = this;
            //this.chart = this.svg.append("g").attr("transform", `translate(${this.marginLeft},0)`);
            // Add a clipPath: everything out of this area won't be drawn.
    
            this.defs = this.svg.append("defs");
            this.clipPathId = 'clip-' + this.graphTitleId;
            this.clipPath = this.defs.append("clipPath")
                .attr("id", this.clipPathId)
                .append("rect")
                .attr("x", "0")
                .attr("y", "0")
                .attr("width", this.adjustedWidth )
                .attr("height", this.adjustedHeight );
            this.chart = this.svg.append("g").attr("transform", `translate(${this.marginLeft},0)`);
            this.clippedChart = this.chart.append("g").attr("clip-path", "url(#"+this.clipPathId+")");
            this.chartVisuals = this.clippedChart.append("g").attr("class", "chart-visuals");
            this.referenceRanges = this.chartVisuals.append("g").attr("id", "reference-ranges");
            this.svg.call(d3.zoom()
                .scaleExtent([0.9, 3])
                .on("zoom", self.updateChart));
        },
        /**
         * Performs all of the steps required to create the SVG for the visualization.
         */
        createGraph: function (initial=true) {
            this.createSVG(initial);
            this.createChart();
            this.drawCoordinateAxes();
            this.createXScale();
            this.drawXAxis();
            const drawingQueue = this.createDrawingQueue(); // the order in which the series are drawn
            let Y0 = this.getDataByScale(0);
            let Y0Active = Y0.filter((d) => {
                return d.active === true;
            });
            if (Y0Active.length > 0) {
                this.createYScale(Y0, 0);
                this.drawYAxis(0);
            }
            let Y1 = this.getDataByScale(1);
            let Y1Active = Y1.filter((d) => {
                return d.active === true;
            });
            if (Y1Active.length > 0) {
                this.createYScale(Y1, 1);
                this.drawYAxis(1);
            }
            for (var i = 0; i < drawingQueue.length; i++) this.createTimeSeries(drawingQueue[i]);
        },
        /**
         * Draws the x and y coordinate axes.
         */
        drawCoordinateAxes: function () {
            this.chartVisuals.append("g")
                .attr("class", "x-coordinate")
                .append("line")
                .attr("x1", -10000)
                .attr("x2", 10000)
                .attr("y1", this.adjustedHeight)
                .attr("y2", this.adjustedHeight)
                .attr("stroke", "black");
        },
        updateChart: function (event) {
            let self = this;
            this.chartVisuals.attr("transform", event.transform);
            this.xAxisGroup.call(self.xAxis.scale(event.transform.rescaleX(self.xScale)));
            if (this.y0AxisGroup) {
                this.y0AxisGroup.call(self.y0Axis.scale(event.transform.rescaleY(self.y0Scale)));
            }
            if (this.y1AxisGroup) {
                this.y1AxisGroup.call(self.y1Axis.scale(event.transform.rescaleY(self.y1Scale)));
            }
        },
        /**
         * Create queue which has the order that time series should be drawn.
         * This ensures that bars are drawn before lines, so that lines appear
         * on top of the bars.
         */
        createDrawingQueue: function () {
            let drawingQueue = [];
            const Y = this.getDataByScale(0);
            const Y1 = this.getDataByScale(1);
            let YCombined = Y.concat(Y1);
            for (var i = 0; i < YCombined.length; i++) {
                if (YCombined[i]["isBar"] === true && YCombined[i]["active"] === true) drawingQueue.push(Y.concat(Y1)[i]["name"]);
            }
            for (i = 0; i < YCombined.length; i++) {
                if (YCombined[i]["isBar"] === false && YCombined[i]["active"] === true) drawingQueue.push(Y.concat(Y1)[i]["name"]);
            }
            return drawingQueue;
        },
        /**
         * Create a map from time series name to its color, which is used
         * in the Legend component.
         */
        createLegendMap: function () {
            let newLegendMap = {};
            const Y = this.getDataByScale(0);
            const Y1 = this.getDataByScale(1);
            let activeTimeSeries = Y.concat(Y1).filter((d) => {
                return d.active === true;
            })
            for (var i = 0; i < activeTimeSeries.length; i++) {
                newLegendMap[activeTimeSeries[i]["name"]] = activeTimeSeries[i]["color"];
            }
            console.log(newLegendMap);
            this.$set(this, 'legendMap', newLegendMap);
        },
        /**
         * Create a time series from its name.
         * 
         * @param {String} name The name of the time series.
         */
        createTimeSeries: function (name) {
            const Y = this.getDataByScale(0);
            const Y1 = this.getDataByScale(1);
            let timeSeries = Y.concat(Y1).find(d => d.name === name);
            if (timeSeries === undefined) return;
            // Refactor this?
            if (timeSeries["isBar"] === true) this.drawBars(timeSeries);
            if (timeSeries["isBar"] === false) this.drawLine(timeSeries);
            if (timeSeries["criticalValues"]) this.drawCriticalValues(timeSeries);
        },
        /**
         * Draw the bars for a time series represented as a bar graph.
         * 
         * @param {Object} series The time series.
         */
        drawBars: function (series) {
            var barWidth = this.calculateBarWidth(series);
            let self = this;
            let yScale = this.getYScale(series.yAxis);
            var parse = d3.timeParse(this.datetimeFormat);
            this.chartVisuals.selectAll(".bar")
                .data(series.measurements)
                .enter()
                .append("rect")
                    .attr("class", "bar")
                    .attr("fill", function () { return series.color; })
                    .attr("fill-opacity", "30%")
                    .attr("x", function(d) { return self.xScale(parse(d.datetime)); })
                    .attr("y", function(d) { return yScale(d.value); })
                    .attr("width", barWidth)
                    .attr("height", function(d) { 
                        return self.adjustedHeight - yScale(d.value); 
                    });
        },
        /**
         * Create the y0 or y1 axis in D3, depending on which number we pass as parameter.
         * 
         * @param {0|1} axis Represents either the y0 or y1 axis.
         */
        drawYAxis: function (axis) {
            //var timeSeries = this.getDataByScale(axis);
            let timeSeries = this.timeSeriesData.filter((d) => {
                return d.yAxis === axis;
            });
            // Use the D3 axis function that corresponds to y0 (left) or y1 (right) axis.
            /*let axisFn = {
                0: d3.axisLeft,
                1: d3.axisRight
            }[axis];*/
            // Horizontally translate by 0 if we are using the y0 axis and translate by
            // the adjusted width if we are using the y1 axis.
            let xCoord = {
                0: 0,
                1: this.adjustedWidth
            }[axis];
            let yScale = this.getYScale(axis);
            if (axis === 0) {
                this.y0Axis = d3.axisLeft(yScale).tickFormat(d3.format("~s"));
                this.y0AxisGroup = this.chart
                    .append("g")
                    .attr("class", "y-axis")
                    .attr("color", function(){
                        return timeSeries[0]["color"];
                    })
                    .attr("font-size", "20px")
                    .attr("transform", `translate(${xCoord}, 0)`)
                    .call(this.y0Axis);
            }
            if (axis === 1) {
                this.y1Axis = d3.axisRight(yScale).tickFormat(d3.format("~s"));
                this.y1AxisGroup = this.chart
                    .append("g")
                    .attr("class", "y-axis")
                    .attr("color", function(){
                        return timeSeries[0]["color"];
                    })
                    .attr("font-size", "20px")
                    .attr("transform", `translate(${xCoord}, 0)`)
                    .call(this.y1Axis)
            }
        },
        /**
         * Create scale for first Y axis, on the left-hand side of the graph.
         * 
         * @param {Array[Object]} data All of the time series.
         * @param {0|1} axis Represents either the y0 or y1 axis.
         */
        createYScale: function (data, axis) {
            // Find the maximum value among all time series.
            const allMeasurements = data.map(d => d.measurements);
            const max = d3.max(allMeasurements,  function (d) { return d3.max(d, function (d) { return d.value }); });
            const scale = d3.scaleLinear()
              .range([this.adjustedHeight, 0])
              .domain([0, max*1.02]); // Expand the domain by 2% to add some room at top.
            if (axis === 0) {
                this.y0Scale = scale;
            } else {
                this.y1Scale = scale;
            }
        },
        drawXAxis: function () {
            this.xAxis = d3.axisBottom(this.xScale).ticks(10);
            this.xAxisGroup = this.chart
              .append("g")
              .attr("class", "x-axis")
              .attr("transform", `translate(0,${this.adjustedHeight})`)
              .call(this.xAxis);
            //this.xAxisGroup
            //  .call(d3.axisBottom(this.xScale).ticks(10));
        },
        /** 
         * Create X scale that maps datetime to coordinate.
         * For the min / max of the domain we look at both time series within a graph
         * if applicable.
         */
        createXScale: function () {
            var min, max, searchArg;
            let self = this;
            //Y0 is an array of objects
            let Y0TimeSeries = this.getDataByScale(0);
            let Y1TimeSeries = this.getDataByScale(1);
            // If we have a second time series we consider it along with the first.
            if (Y1TimeSeries) {
                searchArg = (Y0TimeSeries.map(d => d.measurements)).concat(Y1TimeSeries.map(d => d.measurements));
            } else {
                searchArg = Y0TimeSeries.map(d => d.measurements);
            }
            var parse = d3.timeParse(this.datetimeFormat);
            // Get min of min of each time series, and same for max.
            min = d3.min(searchArg, function (d) { return d3.min(d, function (d) { return parse(d.datetime) }); });
            max = d3.max(searchArg, function (d) { return d3.max(d, function (d) { return parse(d.datetime) }); });

            if (this.timeSeriesHasBarGraph(Y0TimeSeries) || this.timeSeriesHasBarGraph(Y1TimeSeries)) {
                max.setHours(max.getHours() + (24*15)); // TODO: get the specific time to extend this by.
            }
            this.xScale = d3.scaleTime()
              .range([0, self.adjustedWidth])
              .domain([min, max]);
            this.minDatetime = min;
        },
        createPopover: function () {
            const popcorn = document.querySelector('#'+'customize-btn-'+this.graphTitleId);
            const tooltip = document.querySelector('#'+'tooltip-'+this.graphTitleId);
            createPopper(popcorn, tooltip, {
                placement: 'right',
            });
        },
        /*
         * Creates the svg container element for the entire component.
        */
        createSVG: function (initial) {
            d3.select('#'+this.graphTitleId).select('svg').selectAll("*").remove();
            if (initial) {
                this.svg = d3.select('#'+this.graphTitleId).append('svg')
                    .attr("viewBox", `0 0 ` + this.width + ` ` + this.height); // we setup with viewBox to add responsiveness.
            }
        },
        drawLine: function (data) {
            let self = this;
            let yScale = this.getYScale(data.yAxis);
            var parse = d3.timeParse(this.datetimeFormat);
            // Line constructor 
            const line = d3
              .line()
              //.x(dataPoint => self.xScale(dataPoint.datetime))
              .x(dataPoint => self.xScale(parse(dataPoint.datetime)))
              .y(dataPoint => yScale(dataPoint.value));
            this.seriesPaths[data.name] = this.chartVisuals.append("path")
              .datum(data.measurements)
              .style("fill", "none")
              .on("click", function () {
                  self.setFocusedSeries(data);
              })
              .attr("class", "line-graph " + this.htmlCompatible(data.name))
              .attr("stroke", data.color)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-width", this.strokeWidth)
              .attr("cursor", "pointer")
              .attr("d", line);
            if (data.animateDraw) this.animatePathDraw(this.seriesPaths[data.name], data);
        },
        /**
         * Draw a reference range in D3 using rectangle.
         * 
         * @param {Object} series The time series that we are
         * creating the reference range for.
         */
        drawReferenceRange: function (series) {
            d3.select(".reference-range-"+this.graphTitleId).remove(); // remove existing reference range.
            let yScale = this.getYScale(series.yAxis);
            let yVal1 = yScale(series.referenceRange[0]);
            let yVal2 = yScale(series.referenceRange[1]);
            var rectData = [{x1: -10000, x2: 10000, y1: yVal2, y2: yVal1}];
            this.chart.select('#reference-ranges').selectAll('foo')
                .data(rectData)
                .enter()
                .append('rect')
                .attr("id", "reference-range-"+this.focusedTimeSeries)
                .attr("class", "reference-range-"+this.graphTitleId)
                .attr("x", d=> d.x1)
                .attr("y", d=> d.y1)
                .attr("width", d=> d.x2 - d.x1)
                .attr("height", d=> d.y2 - d.y1)
                .attr("fill", series.color)
                .attr("opacity", 0.15);
        },
        /**
         * Draw the critical values in D3 using circles for each one.
         * 
         * @param {Object} series The time series that we are
         * creating the reference range for.
         */
        drawCriticalValues: function (series) {
            let yScale = this.getYScale(series.yAxis);
            let criticalValues = series.measurements.filter((d) => {
                    return (d.value <= series.criticalValues[0]) || (d.value >= series.criticalValues[1]);
            });
            var parse = d3.timeParse(this.datetimeFormat);
            this.criticalValues = this.chartVisuals.selectAll("circle")
                .data(criticalValues)
                .enter()
                .append("circle")
                .attr("class", "critical-value-"+this.graphTitleId)
                .attr("fill", series.color)
                .attr("stroke", series.color)
                .attr("r", 5)
                .attr("cx", d => this.xScale(parse(d.datetime)))
                .attr("cy", d => yScale(d.value));

        },
        /**
         * Get all time series data that are using the given scale (either y0 or y1).
         * 
         * @param {0|1} axis Represents either y0 or y1 axis.
         */
        getDataByScale: function (axis) {
            return this.timeSeriesData.filter((d) => {
                return d.yAxis === axis;
            });
        },
        /**
         * Get the Y scaling function for the given time series.
         */
        getYScale: function (seriesNumber) {
            return {
                0: this.y0Scale,
                1: this.y1Scale
            }[seriesNumber];
        },
        handleCustomizeClicked: function () {
            this.customizeActive = !this.customizeActive;
        },
        /**
         * For a given time series, set if it is active or not; i.e. if
         * it is shown to the user or not.
         */
        setActive: function (seriesName, value) {
            let selectedTimeSeries = this.timeSeriesData.filter((d) => {
                return d.name === seriesName
            })[0];
            selectedTimeSeries.active = value;
            if (value === false) {
                d3.select("#"+this.graphTitleId).select('.'+this.htmlCompatible(seriesName)).attr("display", "none");
            } else {
                d3.select("#"+this.graphTitleId).select('.'+this.htmlCompatible(seriesName)).attr("display", "block");
            }
        },
        /**
         * Set a time series that we are focusing on within the visualization.
         * This will highlight this specific series.
         */
        setFocusedSeries: function (data) {
            this.focusedimeSeries = data;
            this.drawReferenceRange(data);
        },
        /**
         * Check if 
         */
        timeSeriesHasBarGraph(timeSeries) {
            return timeSeries.filter((d) => {
                return d.isBar === true;
            }).length > 0;
        },
        /**
         * Convert string to format compatible as an HTML id or class.
         * Credit to https://stackoverflow.com/questions/10619126/make-sure-string-is-a-valid-css-id-name
         * 
         * @param {String} string The string we want to convert. 
         */
        htmlCompatible: function (string) {
            return string.replace(/(^-\d-|^\d|^-\d|^--)/,'a$1').replace(/[\W]/g, '-');
        }
    }
}
</script>

<style scoped>
.graph-header {
    align-content: center;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
}
.graph-header > .graph-header-item {
  flex: 0 0 5%;
  width: 100%;
}

.vue-line-graph {
    width: 100%;
}


.line-graph-btns > button  {
  background-color: steelblue;
  border: 2px solid;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  font-size: 1.2em;
}

.tooltip {
    background-color: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 13px;
  }

#arrow,
#arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
}

.tooltip[data-popper-placement^='top'] > #arrow {
  bottom: -4px;
}

.tooltip[data-popper-placement^='bottom'] > #arrow {
  top: -4px;
}

.tooltip[data-popper-placement^='left'] > #arrow {
  right: -4px;
}

.tooltip[data-popper-placement^='right'] > #arrow {
  left: -4px;
}

.customize-btn {
    background-color: #4682B4;
    border-radius: 8px;
    cursor: pointer;
    color: white;
    font-weight: bold;
    padding: 4px;
}

</style>