import LineGraph from "./LineGraph.vue";

function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component("v-linegraph", LineGraph);
}

const plugin = {
  install
};

let GlobalVue = null;
if (typeof window !== "undefined") {
  GlobalVue = window.Vue;
} else if (typeof global !== "undefined") {
  GlobalVue = global.vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

LineGraph.install = install;

export default LineGraph;
