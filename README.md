# linegraph
This is a Vue component for line graph data visualizations. In the future it will be extended to bar graphs as well.

As a simple example, the following Vue.js section:
```
<div class="flex-row">
    <div class="flex-row-item" >
        <LineGraph :graphTitle="'Example 1'" />
    </div>
    <div class="flex-row-item" >
        <LineGraph :graphTitle="'Example 2'" />
    </div>
    <div class="flex-row-item" >
        <LineGraph :graphTitle="'Example 3'" />
    </div>
</div>
```

Will result in this:
![alt text](images/example-1.png "Example 1")


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
