<template>
    <div class="line-graph-container" :id="graphTitleId">
        <h1>{{ graphTitle }}</h1>
    </div>
</template>

<script>

import * as d3 from "d3";

export default {
    name: 'LineGraph',
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
                    active: false,
                    animateDraw: false,
                    animateDrawDuration: null,
                    color: 'red',
                    criticalValues: null,
                    isBar: false,
                    name: 'Test Data 2',
                    referenceRange: [40, 140],
                    yAxis: 1,
                    measurements: [
                        {
                            datetime: '2015-01-02',
                            value: 30
                        },
                        {
                            datetime: '2015-02-02',
                            value: 120
                        },
                        {
                            datetime: '2015-03-02',
                            value: 170
                        },
                        {
                            datetime: '2015-04-02',
                            value: 160
                        },
                        {
                            datetime: '2015-05-02',
                            value: 150
                        },
                        {
                            datetime: '2015-06-02',
                            value: 140
                        },
                        {
                            datetime: '2015-07-02',
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
        }
    },
    data: function () {
        return {
            /**
             * The time series that the visualization is currently
             * focusing on.
            */
            focusedTimeSeries: null,
            chart: null,
            chartHeader: null,
            graphTitleId: this.htmlCompatible(this.graphTitle),
            svg: null,
            xScale: null,
            y0Scale: null,
            y1Scale: null
        }
    },
    mounted: function () {
        this.graphTitleId = this.htmlCompatible(this.graphTitle);
        this.createSVG();
        this.createChart();
        this.createXScale();
        this.createXAxis();

        this.createTimeSeries(0);
        this.createTimeSeries(1);

        this.setActive('Test Data 2', false); // testing 

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
         * Create the g element for the chart that we will contain the visualization.
         */
        createChart: function () {
            this.chart = this.svg.append("g").attr("transform", `translate(${this.marginLeft},0)`);
            this.chart.append("g").attr("id", "reference-ranges")
        },
        /**
         * Create y0 or y1 axis and draw its time series.
         * 
         * @param {0|1} axis Represents either the y0 or y1 axis.
         */
        createTimeSeries: function (axis) {
            const Y = this.getDataByScale(axis);
            if (!Y) return;
            this.createYScale(Y, axis);
            this.createYAxis(axis);
            for (var i = 0; i < Y.length; i++) {
                this.createLine(Y[i]);
                console.log(Y[i]);
                if (Y[i]['criticalValues']) this.drawCriticalValues(Y[i]);
            }
        },
        /**
         * Create the y0 or y1 axis in D3, depending on which number we pass as parameter.
         * 
         * @param {0|1} axis Represents either the y0 or y1 axis.
         */
        createYAxis: function (axis) {
            let timeSeries = this.getDataByScale(axis);
            // Use the D3 axis function that corresponds to y0 (left) or y1 (right) axis.
            let axisFn = {
                0: d3.axisLeft,
                1: d3.axisRight
            }[axis];
            // Horizontally translate by 0 if we are using the y0 axis and translate by
            // the adjusted width if we are using the y1 axis.
            let xCoord = {
                0: 0,
                1: this.adjustedWidth
            }[axis];
            let yScale = this.getYScale(axis);
            // Pass our y scaling function to the D3 axis function to draw the y axis.
            this.chart
                .append("g")
                .attr("class", "y-axis")
                .attr("color", function(){
                    return timeSeries[0]["color"];
                })
                .attr("font-size", "20px")
                .attr("transform", `translate(${xCoord}, 0)`)
                .call(axisFn(yScale)
                    .tickFormat(d3.format("~s")) // Translates for instance, 100000 -> 100K
                )
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
        createXAxis: function () {
            this.chart
              .append("g")
              .attr("class", "x-axis")
              .attr("transform", `translate(0,${this.adjustedHeight})`)
              .call(d3.axisBottom(this.xScale).ticks(10));
              //.call(d3.axisBottom(this.xScale).ticks(data.length));
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
            this.xScale = d3.scaleTime()
              .range([0, self.adjustedWidth])
              .domain([min, max]);
        },
        /*
         * Creates the svg container element for the entire component.
        */
        createSVG: function () {
            d3.select('#'+this.graphTitleId).select('svg').selectAll("*").remove();
            this.svg = d3.select('#'+this.graphTitleId).append('svg')
              .attr("viewBox", `0 0 ` + this.width + ` ` + this.height); // we setup with viewBox to add responsiveness.
            console.log(this.svg);
        },
        createLine: function (data) {
            let self = this;
            let yScale = this.getYScale(data.yAxis);
            var parse = d3.timeParse(this.datetimeFormat);
            // Line constructor 
            const line = d3
              .line()
              //.x(dataPoint => self.xScale(dataPoint.datetime))
              .x(dataPoint => self.xScale(parse(dataPoint.datetime)))
              .y(dataPoint => yScale(dataPoint.value));
            const path = this.chart.append("path")
              .datum(data.measurements)
              .style("fill", "none")
              .on("click", function () {
                  self.setActiveSeries(data);
              })
              .attr("class", "line-graph " + data.name)
              .attr("stroke", data.color)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-width", this.strokeWidth)
              .attr("d", line);
            if (data.animateDraw) this.animatePathDraw(path, data);
        },
        /**
         * Draw a reference range in D3 using rectangle.
         * 
         * @param {Object} series The time series that we are
         * creating the reference range for.
         */
        drawReferenceRange: function (series) {
            d3.select(".reference-range").remove(); // remove existing reference range.
            let yScale = this.getYScale(series.yAxis);
            let yVal1 = yScale(series.referenceRange[0]);
            let yVal2 = yScale(series.referenceRange[1]);
            var rectData = [{x1: 0, x2: this.adjustedWidth, y1: yVal2, y2: yVal1}];
            this.chart.select('#reference-ranges').selectAll('foo')
                .data(rectData)
                .enter()
                .append('rect')
                .attr("id", "reference-range-"+this.focusedTimeSeries)
                .attr("class", "reference-range")
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
            let yVal1 = yScale(series.criticalValues[0]);
            let yVal2 = yScale(series.criticalValues[1]);
            let criticalValues = series.measurements.filter((d) => {
                    return d.value <= yVal1 || d.value <= yVal2;
            });
            var parse = d3.timeParse(this.datetimeFormat);
            this.chart.selectAll("circle")
                .data(criticalValues)
                .enter()
                .append("circle")
                .attr("class", "critical-value")
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
        /**
         * For a given time series, set if it is active or not; i.e. if
         * it is shown to the user or not.
         */
        setActive: function (seriesName, value) {
            let selectedTimeSeries = this.timeSeriesData.filter((d) => {
                return d.name === seriesName
            })[0];
            selectedTimeSeries.active = value;
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
         * Convert string to format compatible as an HTML id or class.
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
</style>