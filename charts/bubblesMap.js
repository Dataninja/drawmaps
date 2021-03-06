(function() {

    var model = raw.model();

    var lat = model.dimension()
        .title("Latitude")
        .types(Number)
        .required(1);

    var lng = model.dimension()
        .title("Longitude")
        .types(Number)
        .required(1);

    var size = model.dimension()
        .title("Size")
        .types(Number)

    var label = model.dimension()
        .title("Label")
        .types(Number, String)
        .multiple(true);

    model.map(function(data) {
        return data.map(function(d) {
            return {
                lat: +lat(d),
                lng: +lng(d),
                size: +size(d),
                label: label(d)
            };
        });
    });

    var chart = raw.chart()
        .title("Bubbles")
        .description("A bubble map is a type of map that displays three dimensions of data. Each entity with its triplet (v1, v2, v3) of associated data is plotted as a disk that expresses two of the v_i values through the disk's xy location and the third through its size. Based on <a href='https://bost.ocks.org/mike/bubble-map/'>https://bost.ocks.org/mike/bubble-map/</a>")
        .thumbnail("imgs/bubblesMap.png")
        .category("Map")
        .model(model);

	var width = chart.number()
		.title("Width")
		.fitToWidth(true);

	var height = chart.number()
		.title("Height")
		.defaultValue(750);

    var shape = chart.list()
        .title("Shapefile")
        .description("Powered by https://github.com/dataninja/geo-shapes")
        .values([
            "italy-regions",
            "italy-regions_w-autonomous-provinces",
            "italy-provinces",
            "italy-municipalities",
            "europe-nuts0",
            "europe-nuts1",
            "europe-nuts2",
            "europe-nuts3"
        ])
        .defaultValue("italy-regions");

	var minRadius = chart.number()
		.title("Min radius")
		.defaultValue(10);

	var maxRadius = chart.number()
		.title("Max radius")
		.defaultValue(30);

	var scale = chart.list()
		.title("Scale")
        .values([
            "sqrt",
            "linear",
            "log",
            "pow"
        ])
		.defaultValue("sqrt");

    var colors = chart.list()
        .title("Colors")
        .description("Powered by http://colorbrewer2.org")
        .values([
           "Blues",
           "Purples",
           "Greens",
           "Oranges",
           "Reds",
           "Greys"
        ])
        .defaultValue("Blues");

	var opacity = chart.number()
		.title("Opacity")
		.defaultValue(0.8);

	var strokeWidth = chart.number()
		.title("Stroke width")
		.defaultValue(1);

	var proj = chart.list()
		.title("Projection")
        .description("Powered by https://github.com/d3/d3-geo")
        .values([
            "mercator",
            "albers",
            //"albersUsa",
            "azimuthalEqualArea",
            "azimuthalEquidistant",
            "conicConformal",
            "conicEqualArea",
            "conicEquidistant",
            "equirectangular",
            "gnomonic",
            "orthographic",
            "stereographic",
            "transverseMercator",
            "airy",
            "aitoff",
            "armadillo",
            "august",
            "baker",
            "berghaus",
            "boggs",
            "bonne",
            "bottomley",
            "bromley",
            //"chamberlinAfrica",
            "collignon",
            "craig",
            "craster",
            "cylindricalEqualArea",
            "cylindricalStereographic",
            "eckert1",
            "eckert2",
            "eckert3",
            "eckert4",
            "eckert5",
            "eckert6",
            "eisenlohr",
            "fahey",
            //"foucault",
            //"gilbert",
            "gingery",
            "ginzburg4",
            "ginzburg5",
            "ginzburg6",
            "ginzburg8",
            "ginzburg9",
            "gringorten",
            "guyou",
            "hammer",
            "hammerRetroazimuthal",
            "healpix",
            "hill",
            "homolosine",
            "kavrayskiy7",
            "lagrange",
            "larrivee",
            "laskowski",
            "littrow",
            "loximuthal",
            "miller",
            "modifiedStereographic",
            //"modifiedStereographicGs48",
            //"modifiedStereographicGs50",
            //"modifiedStereographicMiller",
            //"modifiedStereographicLee",
            "mollweide",
            "mtFlatPolarParabolic",
            "mtFlatPolarQuartic",
            "mtFlatPolarSinusoidal",
            "naturalEarth",
            "nellHammer",
            "patterson",
            "polyconic",
            "rectangularPolyconic",
            "robinson",
            "satellite",
            "sinusoidal",
            "sinuMollweide",
            "times",
            "twoPointAzimuthal",
            //"twoPointAzimuthalUsa",
            "twoPointEquidistant",
            //"twoPointEquidistantUsa",
            "vanDerGrinten",
            "vanDerGrinten2",
            "vanDerGrinten3",
            "vanDerGrinten4",
            "wagner4",
            "wagner6",
            "wagner7",
            "wiechel",
            "winkel3",
            //"interruptedHomolosine",
            //"interruptedSinusoidal",
            //"interruptedBoggs",
            //"interruptedSinuMollweide",
            //"interruptedMollweide",
            //"interruptedMollweideHemispheres",
            //"polyhedral",
            //"polyhedralCollignon",
            //"polyhedralWaterman",
            //"quincuncial",
            //"gringortenQuincuncial",
            "peirceQuincuncial"
        ])
		.defaultValue("mercator");

    var cache = {
        key: null,
        value: null
    };

    chart.draw(function(selection, data) {

        if ( cache.key === shape() ) {
            draw(selection, data, cache.value);
        } else {
            d3.json("shapes/"+shape()+".topojson", function(err, res) {
                cache.key = shape();
                cache.value = res;
                draw(selection, data, res);
            });
        }
    });

    function draw(selection, data, map) {

        var projection = d3.geo[proj()]()
            .scale(1)
            .translate([0,0]);
            
        var path = d3.geo.path()
            .projection(projection);

        var bs = topojson.feature(map, map.objects.areas).features.map(function(el) { return path.bounds(el); }),
            le = d3.min(bs, function(el) { return el[0][0]; }),
            to = d3.min(bs, function(el) { return el[0][1]; }),
            ri = d3.max(bs, function(el) { return el[1][0]; }),
            bo = d3.max(bs, function(el) { return el[1][1]; }),
            b = [[le,to],[ri,bo]],
            s = .95 / Math.max((b[1][0] - b[0][0]) / width(), (b[1][1] - b[0][1]) / height()),
            t = [(width() - s * (b[1][0] + b[0][0])) / 2, (height() - s * (b[1][1] + b[0][1])) / 2];

        projection.scale(s).translate(t);
        path.projection(projection);

        var radiusScale = d3.scale[scale()]()
            .domain(d3.extent(data.map(function(d) { return d.size; })))
            .range([minRadius(),maxRadius()]);

		var svg = selection
			.attr("width", width())
			.attr("height", height());

        var g1 = svg
			.append("g")
            .attr("class", "areas")
            .style("fill","none");

        g1.selectAll("path")
            .data(topojson.feature(map, map.objects.areas).features)
            .enter().append("path")
            .attr("stroke", "#000")
            .attr("stroke-width", strokeWidth())
            .attr("d", path)
            .append("title")
            .text(function(d) { return d.properties.label; });

        var g2 = svg
            .append("g")
            .attr("class","bubbles")
            .style("fill-opacity",opacity());

        g2.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("r", function(d) { return radiusScale(d.size); })
            .attr("transform", function(d) { return "translate("+projection([d.lng,d.lat])+")"; })
            .attr("fill", colorbrewer[colors()][9][8])
            .append("title")
            .text(function(d) { return d.label ? d.label.join(": ") : ""; });

    }

})();
