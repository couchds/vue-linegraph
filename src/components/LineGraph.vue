<template>
    <div class="line-graph-container" :id="graphTitleId">
        <h1>{{ graphTitle }}</h1>
    </div>
</template>

<script>

import * as d3 from "d3";

export default {
    name: 'LineGraph',
    props: {
        /* The data to visualize. This is an array of objects, where each
         * object has the keys 'isBar', 'measurements', and 'name'.
        */
        timeSeriesData: {
            type: Array,
            default: () => {
                return [{
                    animateDraw: true,
                    animateDrawDuration: 1000,
                    color: 'steelblue',
                    isBar: false,
                    name: 'Test Data',
                    yAxis: 0,
                    measurements: [
                        {
                            datetime: 2000,
                            value: 50
                        },
                        {
                            datetime: 2001,
                            value: 150
                        },
                        {
                            datetime: 2002,
                            value: 200
                        },
                        {
                            datetime: 2003,
                            value: 130
                        },
                        {
                            datetime: 2004,
                            value: 240
                        },
                        {
                            datetime: 2005,
                            value: 380
                        },
                        {
                            datetime: 2006,
                            value: 420
                        }
                    ]
                },
                {
                    animateDraw: false,
                    animateDrawDuration: null,
                    color: 'red',
                    isBar: false,
                    name: 'Test Data 2',
                    yAxis: 1,
                    measurements: [
                        {
                            datetime: 2000,
                            value: 30
                        },
                        {
                            datetime: 2001,
                            value: 120
                        },
                        {
                            datetime: 2002,
                            value: 170
                        },
                        {
                            datetime: 2003,
                            value: 160
                        },
                        {
                            datetime: 2004,
                            value: 150
                        },
                        {
                            datetime: 2005,
                            value: 140
                        },
                        {
                            datetime: 2006,
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
            default: '%Y'
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
            default: 20
        },
        marginTop: {
            type: Number,
            default: 0
        },
        marginLeft: {
            type: Number,
            default: 30
        },
        marginRight: {
            type: Number,
            default: 40
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
            chart: null,
            chartHeader: null,
            graphTitleId: this.graphTitle.replaceAll(' ', '-'),
            svg: null,
            xScale: null,
            y0Scale: null,
            y1Scale: null
        }
    },
    mounted: function () {
        this.createSVG();
        this.createChart();
        this.createXScale();
        let Y0 = this.getDataByScale(0);
        if (Y0) {
            this.createY0Scale(Y0.measurements);
            this.createYAxis(0);
            this.createLine(Y0);
        }
        this.createXAxis(Y0.measurements); // TODO: use Y0 and Y1 measurements!

        let Y1 = this.getDataByScale(1);
        if (Y1) {
            this.createY1Scale(Y1.measurements);
            this.createYAxis(1);
            this.createLine(Y1);
        }
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
        },
        /**
         * Create the y0 or y1 axis in D3, depending on which number we pass as parameter.
         * 
         * @param {0|1} axis Represents either the y0 or y1 axis.
         */
        createYAxis: function (axis) {
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
                .attr("transform", `translate(${xCoord}, 0)`)
                .call(axisFn(yScale));
        },
        /**
         * Create scale for first Y axis, on the left-hand side of the graph.
         */
        createY0Scale: function (data) {
            let self = this;
            this.y0Scale = d3.scaleLinear()
              .range([self.adjustedHeight, 0])
              .domain([0, d3.max(data, d => d.value)]);
        },
        createY1Scale: function (data) {
            let self = this;
            this.y1Scale = d3.scaleLinear()
              .range([self.adjustedHeight, 0])
              .domain([0, d3.max(data, d => d.value)]);
        },
        createXAxis: function () {
            this.chart
              .append("g")
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
            let Y0 = this.getDataByScale(0);
            let Y1 = this.getDataByScale(1);
            // If we have a second time series we consider it along with the first.
            if (Y1) {
                searchArg = [Y0.measurements, Y1.measurements];
            } else {
                searchArg = [Y0.measurements];
            }
            const parse = d3.timeParse(this.datetimeFormat);
            // Get min of min of each time series, and same for max.
            min = d3.min(searchArg, function (d) { return d3.min(d, function (d) { return parse(d.datetime) }); });
            max = d3.max(searchArg,  function (d) { return d3.max(d, function (d) { return parse(d.datetime) }); });
            this.xScale = d3.scaleTime()
              .range([0, self.adjustedWidth])
              .domain([min, max]);
        },
        createSVG: function () {
            d3.select('#'+this.graphTitleId).select('svg').selectAll("*").remove();
            this.svg = d3.select('#'+this.graphTitleId).append('svg')
              .attr("viewBox", `0 0 ` + this.width + ` ` + this.height); // we setup with viewBox to add responsiveness.
            console.log(this.svg);
        },
        createLine: function (data) {
            let self = this;
            let yScale = this.getYScale(data.yAxis);
            const parse = d3.timeParse(this.datetimeFormat);
            // Line constructor 
            const line = d3
              .line()
              //.x(dataPoint => self.xScale(dataPoint.datetime))
              .x(dataPoint => self.xScale(parse(dataPoint.datetime)))
              .y(dataPoint => yScale(dataPoint.value));
            const path = this.chart.append("path")
              .datum(data.measurements)
              .style("fill", "none")
              .attr("stroke", data.color)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-width", this.strokeWidth)
              .attr("d", line);
            if (data.animateDraw) this.animatePathDraw(path, data);
        },
        getDataByScale: function (axisNumber) {
            return this.timeSeriesData.filter((d) => {
                return d.yAxis === axisNumber;
            })[0];
        },
        /**
         * Get the Y scaling function for the given time series.
         */
        getYScale: function (seriesNumber) {
            return {
                0: this.y0Scale,
                1: this.y1Scale
            }[seriesNumber];
        }
    }
}
</script>

<style scoped>
</style>