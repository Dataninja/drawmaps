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

    var icon = model.dimension()
        .title("Icon")
        .types(String)

    var label = model.dimension()
        .title("Label")
        .types(Number, String)
        .multiple(true);

    model.map(function(data) {
        return data.map(function(d) {
            return {
                lat: +lat(d),
                lng: +lng(d),
                icon: icon(d) || "map-marker",
                label: label(d)
            };
        });
    });

    var chart = raw.chart()
        .title("Markers")
        .description("Every point is a marker on a map. Based on <a href='http://fontawesome.io/icons/'>http://fontawesome.io/icons/</a>")
        .thumbnail("imgs/markersMap.png")
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

    var icons = chart.list()
        .title("Icon set")
        .description("Powered by http://fontawesome.io/")
        .values([
            "font-awesome"
        ])
        .defaultValue("font-awesome");

    var alignment = chart.list()
        .title("Icon alignment (x,y)")
        .values([
            "left top",
            "middle top",
            "right top",
            "left middle",
            "middle middle",
            "right middle",
            "left bottom",
            "middle bottom",
            "right bottom"
        ])
        .defaultValue("middle middle");

	var scale = chart.number()
		.title("Scale")
		.defaultValue(0.5);

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

        var alignX = alignment().split(' ')[0],
            alignY = alignment().split(' ')[1],
            sc = scale();

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
            .attr("class","markers");

        g2.selectAll("path")
            .data(data)
            .enter().append("path")
            .attr("d", function(d) {
                var marker = d.icon.toUpperCase().replace(/-/g,"_");
                switch ( icons() ) {
                    case "font-awesome":
                    default:
                        return fontawesome.markers[marker] || fontawesome.markers["map-marker"];
                        break;
                }
            })
            .attr("transform", function(d) {
                var ds = projection([d.lng,d.lat]),
                    b = this.getBBox() || {},
                    iconSizeX = b.width || 50,
                    iconSizeY = b.height || 50;
                return "translate(" +
                    (ds[0]-(alignX === 'left' ? 0 : iconSizeX / (alignX === 'middle' ? 2 : 1))*sc) +
                    "," +
                    (ds[1]+(alignY === 'bottom' ? 0 : iconSizeY / (alignY === 'middle' ? 2 : 1))*sc)+")" +
                    "scale("+sc+")";
            })
            .append("title")
            .text(function(d) { return d.label ? d.label.join(": ") : ""; });

    }

})();
