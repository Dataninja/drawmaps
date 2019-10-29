(function() {

    var model = raw.model();

    var area = model.dimension()
        .title("Area")
        .types(Number, String)
        .required(1);

    var size = model.dimension()
        .title("Size")
        .types(Number);

    model.map(function(data) {
        var shapes = {};
        data.forEach(function(d) {
            shapes[area(d)] = +size(d);
        });
        return shapes;
    });

    var chart = raw.chart()
        .title("Pattern Map")
        .description("A pattern map is a thematic map in which regions are patterned in proportion to the measurement of the statistical variable being displayed on the map.<br/>Based on <a href=\"http://riccardoscalco.github.io\">http://riccardoscalco.github.io</a>")
        .thumbnail("imgs/patternMap.png")
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

	var minSize = chart.number()
		.title("Min size")
		.defaultValue(1);

	var maxSize = chart.number()
		.title("Max size")
		.defaultValue(12);

    var scale = chart.list()
        .title("Scale")
        .values([
            "sqrt",
            "linear",
            "log",
            "pow"
        ])
        .defaultValue("linear");

    var texture = chart.list()
        .title("Texture")
        .values([
            "lines",
            "circles"
        ])
        .defaultValue("lines");

    var orientation = chart.list()
        .title("Orientation")
        .values([
            "horizontal",
            "diagonal",
            "inverse diagonal",
            "vertical",
            "grid",
            "diamond"
        ])
        .defaultValue("diagonal");

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

        var sizeScale = d3.scale[scale()]()
            .domain(d3.extent(Object.values(data)))
            .range([minSize(),maxSize()]);

		var svg = selection
			.attr("width", width())
			.attr("height", height());

        var tx = texture(),
            or1, or2;

        switch (orientation()) {
            case "inverse diagonal":
                or1 = "6/8";
                break;
            case "grid":
                or1 = "vertical";
                or2 = "horizontal";
                break;
            case "diamond":
                or1 = "2/8";
                or2 = "6/8";
                break;
            default:
                or1 = orientation();
                break;
        }

        var g = svg
			.append("g")
            .attr("class", "areas")
            .style("fill","none");

        g.selectAll("path")
            .data(topojson.feature(map, map.objects.areas).features)
            .enter().append("path")
            .attr("stroke", "#fff")
            .attr("stroke-width", strokeWidth())
            .attr("fill", function(d) {
                var t = textures[tx]()
                    .strokeWidth(1)
                    .size(sizeScale(d.properties.value = data[d.properties.id]));
                if (t.orientation) {
                    if (or2) {
                        t.orientation(or1,or2);
                    } else {
                        t.orientation(or1);
                    }
                }
                svg.call(t);
                return t.url();
            })
            .attr("d", path)
            .append("title")
            .text(function(d) { return d.properties.label + ": " + d.properties.value; });

    }

})();
