<template>
    <div :id="legendId" class="graph-legend">
    </div>
</template>

<script>
import * as d3 from "d3";
export default {
    props: {
        legendId: {
            type: String,
            default: 'Legend'
        },
        legendMap: {
            type: Object
        },
        height: {
            type: Number,
            default: 1300
        },
        width: {
            type: Number,
            default: 1600
        }
    },
    data: function () {
        return {
            legendMapData: this.legendMap,
            svg: null
        }
    },
    mounted: function () {
        this.createSVG();
        if (this.legendMap) this.createLegend();
    },
    watch: {
        legendMap: function () {
            d3.select('#'+this.legendId).select('svg').selectAll("*").remove();
            this.createLegend();
        }
    },
    methods: {
        createSVG: function () {
            d3.select('#'+this.legendId).select('svg').selectAll("*").remove();
            this.svg = d3.select('#'+this.legendId).append('svg')
              .attr("width", 90)
              .attr("height", 100);
        },
        createLegend: function () {
            let keys = [];
            let colors = [];
            for (const [key, color] of Object.entries(this.legendMap)) {
                keys.push(key);
                colors.push(color);
            }
            console.log(this.legendMap);
            var color = d3.scaleOrdinal()
                .domain(keys)
                .range(colors);
            this.svg.selectAll("dots")
                .data(keys)
                .enter()
                .append("circle")
                .attr("cx", 10)
                .attr("cy", function(d,i){ return 50 + i*15})
                .attr("r", 5)
                .style("fill", function(d){ return color(d)});
            this.svg.selectAll("mylabels")
                .data(keys)
                .enter()
                .append("text")
                    .attr("x", 20)
                    .attr("y", function(d,i){ return 50 + i*15})
                    .attr("font-size", "0.8em")
                    .style("fill", function(d){ return color(d)})
                    .text(function(d){ return d})
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle")
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