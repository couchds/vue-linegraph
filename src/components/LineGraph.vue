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
        // The data to visualize. This is an array of objects, where each
        // object has the keys 'isBar', 'measurements', and 'name'.
        data: {
            type: Array,
            default: () => {
                return [{
                    animateDraw: true,
                    name: 'Test Data',
                    isBar: false,
                    yAxis: 0,
                    color: 'steelblue',
                    values: [
                        {
                            year: 2000,
                            popularity: 50
                        },
                        {
                            year: 2001,
                            popularity: 150
                        },
                        {
                            year: 2002,
                            popularity: 200
                        },
                        {
                            year: 2003,
                            popularity: 130
                        },
                        {
                            year: 2004,
                            popularity: 240
                        },
                        {
                            year: 2005,
                            popularity: 380
                        },
                        {
                            year: 2006,
                            popularity: 420
                        }
                    ]
                },
                {
                    animateDraw: false,
                    name: 'Test Data 2',
                    isBar: false,
                    yAxis: 1,
                    color: 'red',
                    values: [
                        {
                            year: 2000,
                            popularity: 30
                        },
                        {
                            year: 2001,
                            popularity: 120
                        },
                        {
                            year: 2002,
                            popularity: 170
                        },
                        {
                            year: 2003,
                            popularity: 160
                        },
                        {
                            year: 2004,
                            popularity: 150
                        },
                        {
                            year: 2005,
                            popularity: 140
                        },
                        {
                            year: 2006,
                            popularity: 100
                        }
                    ]
                }
                ]
            }
        },
        // Graph title, which should be unique among a set of graphs.
        graphTitle: {
            type: String,
            default : 'My Line Graph'
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
            default: 50
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
            graphTitleId: this.graphTitle.replaceAll(' ', '-'),
            svg: null,
            xScale: null,
            yScale: null
        }
    },
    mounted: function () {
        this.createSVG();
        this.createChart();
        this.createXScale();
        let Y0 = this.getDataByScale(0);
        let Y1 = this.getDataByScale(1);
        this.createXAxis(Y0.values);
        this.createYScale(Y0.values);
        this.createYAxis(Y0.values, 0);
        this.createYAxis(Y1.values, 1);
        this.createLine(Y0);
        this.createLine(Y1);
    },
    methods: {
        createChart: function () {
            this.chart = this.svg.append("g").attr("transform", `translate(${this.marginLeft},0)`);
        },
        createYAxis: function (data, dataNumber) {
            let axisFn = {
                0: d3.axisLeft,
                1: d3.axisRight
            }[dataNumber];
            let xCoord = {
                0: 0,
                1: this.adjustedWidth
            }[dataNumber];
            this.chart
                .append("g")
                .attr("transform", `translate(${xCoord}, 0)`)
                .call(axisFn(this.yScale));
        },
        /**
         * Create scale for first Y axis, on the left-hand side of the graph.
         */
        createYScale: function (data) {
            let self = this;
            this.yScale = d3.scaleLinear()
              .range([self.adjustedHeight, 0])
              .domain([0, d3.max(data, d => d.popularity)]);
        },
        createXAxis: function (data) {
            this.chart
              .append("g")
              .attr("transform", `translate(0,${this.adjustedHeight})`)
              .call(d3.axisBottom(this.xScale).ticks(data.length));
        },
        createXScale: function () {
            let self = this;
            let Y0Data = this.getDataByScale(0).values;
            this.xScale = d3.scaleLinear()
              .range([0, self.adjustedWidth])
              .domain(d3.extent(Y0Data, d => d.year));
        },
        createSVG: function () {
            console.log(this.graphTitleId);
            this.svg = d3.select('#'+this.graphTitleId).append('svg')
              .attr("viewBox", `0 0 ` + this.width + ` ` + this.height); // we setup with viewBox to add responsiveness.
            console.log(this.svg);
        },
        createLine: function (data) {
            let self = this;
            const line = d3
              .line()
              .x(dataPoint => self.xScale(dataPoint.year))
              .y(dataPoint => self.yScale(dataPoint.popularity));
            const path = this.chart.append("path")
              .datum(data.values)
              .style("fill", "none")
              .attr("stroke", data.color)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-width", this.strokeWidth)
              .attr("d", line);
            if (data.animateDraw) this.animatePathDraw(path);
        },
        animatePathDraw: function (path) {
            const totalLength = path.node().getTotalLength();
            path
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(1500)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
        },
        getDataByScale: function (axisNumber) {
            return this.data.filter((d) => {
                return d.yAxis === axisNumber;
            })[0];
        }
    }
}
</script>

<style scoped>
.line-graph-container {
    border-style: solid;
    border-color: green;
    margin-top: 40px;
    width: 30%;
}
</style>