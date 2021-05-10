<template>
    <div class="graph-settings">
        <h3>Graph Settings</h3>
        <div v-for="ts in timeSeriesData" :key="ts.name">
            <h4>{{ ts.name }}</h4>
            <input type="checkbox" :id="'checkbox-'+htmlCompatible(ts.name)" v-model="ts.active" />
            <select :id="'select-'+htmlCompatible(ts.name)" v-model="ts.yAxis">
                <option :value="0">0</option>
                <option :value="1">1</option>
            </select>
        </div>
    </div>
</template>

<script>
export default {
    name: 'GraphSettings',
    props: {
        timeSeriesData: {
            type: Array,
            default: () => { return [] }
        }
    },
    methods: {
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