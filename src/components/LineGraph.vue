<template>
    <div class="line-graph-container" :id="graphTitleId">
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
                    'name': 'Test Data',
                    'isBar': false,
                    'yAxis': 0,
                    'values': [
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
                }]
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
            default: 500
        },
        // Margins
        marginBottom: {
            type: Number,
            default: 0
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
            graphTitleId: this.graphTitle.replaceAll(' ', '-')
        }
    },
    created: function () {
        this.createSVG();
    },
    methods: {
        createYScale: function () {
            d3.scaleLinear()
            .range([this.height, 0])
            .domain([])
        },
        createSVG: function () {
            d3.select('#'+this.graphTitleId).append('svg')
              .attr("viewBox", `0 0 ` + this.width + ` ` + this.height); // we setup with viewBox to add responsiveness.
        }
    }
}
</script>

<style scoped>
.line-graph-container {
    border-style: solid;
    border-color: green;
}
</style>