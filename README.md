# DRAWMaps by Dataninja

**DRAWMaps** is an experimental distribution of RAWGraphs developed by Dataninja in 2017 with GIS features and maps.

> **RAWGraphs** is an open web tool to create custom vector-based visualizations on top of the amazing [d3.js](https://github.com/mbostock/d3) library by [Mike Bostock](http://bost.ocks.org/mike/). It has been developed by [DensityDesign Research Lab](http://www.densitydesign.org/) ([Politecnico di Milano](http://www.polimi.it/)) and [Calibro](http://calib.ro/), and sustained through a corporate stewardship by [ContactLab](http://contactlab.com/it/).

Read more about RAWGraphs on the official website: https://rawgraphs.io/. Please consider to donate for the v2 development on Indiegogo: https://igg.me/at/rawgraphs2. Take a look to the original source code on the official Github repository: https://github.com/rawgraphs/raw.

> WARNING: this project is no longer maintained, it's here for historical reasons and to hopefully inspire the development of RAWGraphs v2.

## History

First public commit of RAWGraphs, formerly only RAW, is dated [June 19, 2012](https://github.com/rawgraphs/raw/commit/2e4e33d73517eaa06fb0e3bf526dcf043c4ce06e). Dataninja, at that time an informal group of passionates and professionals in data journalism, followed the project from the beginning.

In October 2013 a Github user asked for [geographic features for the first time](https://github.com/rawgraphs/raw/issues/42) on Github. A month later [Andrea Nelson Mauro](https://github.com/nelsonmau) also asked for a specific type of map on the official Google Group: "[Suggestion: Cartograms for RAW?](https://groups.google.com/d/msg/densitydesign-raw/-MIAUtSjkzk/ZJz03WhDvskJ)". His suggestion had no following because of architectural difficulties in cartography integration: "[RAW's] current architecture, based on single dataset, makes really difficult to create anything with cartography".

RAW changed name in RAWGraphs in 2017 when [Calibro and Contactlab joined Density Design](https://rawgraphs.io/news/contactlab-to-sponsor-raw-graphs/) to develop it further. At that time a plugins architecture has been adopted, so it became quite simple to develop new charts and integrate them within the application.

At that time Dataninja had become a company and we began to experiment with the new RAWGraphs to try to integrate also maps among others available charts, beyond architectural limits. Private fork is dated back to February 28, 2017 from [this commit](https://github.com/rawgraphs/raw/commit/ec759213f27da54c98988fc237dca11380527040).

## New geographic charts

Under some assumptions, we successfully developed seven new charts:

* bubbles map (continuous variables),
* cartogram  (continuous variables),
* choropleth  (continuous variables),
* markers map (geographic points),
* thematic map with patterns (continuous variables), textures and colors (cathegorical variables).

![geo charts](https://raw.githubusercontent.com/Dataninja/drawmaps/master/screenshots/geo-charts.png)

We also provided eight geographic shapes:
* Italian regions, also with autonomous provinces,
* Italian provinces,
* Italian municipalities,
* European NUTS (levels 0, 1, 2, and 3)

They are provided as-is as static files inside the application. These are the "second datasets" the application needs to draw maps, and cannot be provided by the user because of architectural limits mentioned before. User must provide a dataset with a column containing official ISTAT codes for Italian administrative shapes or official codes for European NUTS shapes. Only markers map needs no codes, but geographic coordinates.

Please note also these geographical shapes change over time and needs to be kept up to date. Maybe the best solution would be a third-party official API maintained by a public institution, but at the moment nothing like this exists. For these reasons we never released these features or proposed them as pull requests.

## How to use

User experience is the same as standard RAWGraphs. We removed all charts, but the geographic ones to focus attention on new features.
To start you can use the provided samples to play with continuous and cathegorical data, with thematic maps or geographic points.

## The source code

Source code of new charts is splitted in seven plugins in `charts/` folder:

* bubblesMap.js,
* cartogramMap.js,
* choroplethMap.js,
* markersMap.js,
* patternMap.js
* texturesMap.js,
* thematicMap.js.

They depends on six additional libraries:

* [topojson](https://github.com/topojson/topojson),
* [d3-geo](https://github.com/d3/d3-geo) and [d3-geo-projection](https://github.com/d3/d3-geo-projection),
* [colorbrewer](http://colorbrewer2.org/),
* [fontawesome](https://fontawesome.com/v4.7.0/),
* [geostats](https://github.com/simogeo/geostats),
* [textures](https://github.com/riccardoscalco/textures).

We forked and adapted also a script to perform calculations on cartograms: https://github.com/jenkin/topogram/tree/develop.

We provided eight geographic shapes in `shapes/` folder:

* europe-nuts0.topojson
* europe-nuts1.topojson
* europe-nuts2.topojson
* europe-nuts3.topojson
* italy-municipalities.topojson
* italy-provinces.topojson
* italy-regions.topojson
* italy-regions_w-autonomous-provinces.topojson

We also added several fields to customize map parameters:

* 4 numerical scales: sqrt, linear, log, and pow
* 6 color scales: blues, purples, greens, oranges, reds, greys
* 7 binning algorithms: jenks, equal interval, quantile, standard deviation, arithmetic and geometric progression, unique values
* 7 textures for continuous variables: circles and horizontal, diagonal, inverse diagonal, vertical, grid, and diamond lines
* 7 textures for cathegorical variables: squares, nylon, waves, woven, crosses, caps, hexagons
* opacity and stroke width
* dozens of geographic projections supported by d3-geo

The algorithm to scale and center the map inside the available canvas is quite interesting and simply reusable.

```
var projection = d3.geo[proj()]() # proj() is the projection chosen by the user
    .scale(1)
    .translate([0,0]);
    
var path = d3.geo.path()
    .projection(projection);

var bs = topojson # bs is an array with bounding boxes of all features in the chosen shape file (ie. Italian regions)
    .feature(map, map.objects.areas)
    .features
    .map(function(el) { return path.bounds(el); });
    
var le = d3.min(bs, function(el) { return el[0][0]; }), # the leftmost geo point
    to = d3.min(bs, function(el) { return el[0][1]; }), # the topmost one
    ri = d3.max(bs, function(el) { return el[1][0]; }), # the rightmost one
    bo = d3.max(bs, function(el) { return el[1][1]; }), # the lower one
    w = width(), # width of the canvas
    h = height(), # height of the canvas
    s = .95 / Math.max((ri - le) / w, (bo - to) / h), # map scaling factor to fit the canvas (with 5% of margins)
    t = [(w - s * (ri + le)) / 2, (h - s * (bo + to)) / 2]; # translation for map centering

projection
    .scale(s)
    .translate(t);

path
    .projection(projection);
```

And that's all!

## Maps in RAWGraphs v2?

Are there chances to see maps in the all new version of RAWGraphs? [Crowd-funding campaign](https://www.indiegogo.com/projects/rawgraphs-2-0-a-web-app-for-data-visualization#/) never mentions cartography features as planned or expected enhancements, and there are no maps among [proposed new charts](https://c1.iggcdn.com/indiegogo-media-prod-cld/image/upload/c_limit,w_695/v1570178707/cycbwpdi1zpgmekwztos.jpg).

Drawing maps requires two datasets: a data table and a geographic shape. Advanced GIS softwares require both of them to the user (ie. [Carto](https://carto.com/) or [QGIS](https://www.qgis.org/it/site/)). Other approaches require the user to provide a single shape file (ie. in [geojson](https://geojson.org/) format) with embedded data (ie. [RAWMaps](http://rawmaps.300000kms.net/) by 300000kms). The simpler solution adopted by DRAWMaps requires the user to choose a shape from a provided list, but also shifts the burden of management of these shapes to software maintainer (ie. as in [Datawrapper](https://www.datawrapper.de/)).

An official and standard API (ie. provided by Italian ISTAT or by Eurostat) that build and serve on runtime a geographic shape as a query result can solve the problem. In this scenario RAWGraphs could offer a simple graphical interface to this API and require the user to simply set his preferences (ie. select country, then administrative divisions).

It's quite unlikely that RAWGraphs will embrace this kind of solution without a third-party API with the abovementioned features. While waiting for such API, a suboptimal solution could shift the burden of shapes management to the community and RAWGraphs could support a community-driven gallery of public geographic shapes released under open licenses.

## License

DRAWMaps, in the same way as RAWGraphs, is provided under the Apache License 2.0.
