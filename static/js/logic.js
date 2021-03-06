// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + "Time: " + new Date(feature.properties.time) +
            "</p><p>" + "Magnitude: " + (feature.properties.mag));
    }

    function markerSize(magnitude) {
        console.log(magnitude)
        return magnitude * 10000;
    }

    function markerColor(magnitude) {
        if (magnitude > 5) {
            return "rgb(242, 24, 31)"
        }
        else if (magnitude > 4) {
            return "rgb(237, 91, 0)"
        }
        else if (magnitude > 3) {
            return "rgb(218, 136, 0)"
        }
        else if (magnitude > 2) {
            return "rgb(186, 174, 0)"
        }
        else if (magnitude > 1) {
            return "rgb(138, 206, 0)"
        }
        else {
            return "rgb(19, 235, 45)"
        }
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (earthquakeData, latlng) {
            return L.circle(latlng, {
                radius: markerSize(earthquakeData.properties.mag),
                color: markerColor(earthquakeData.properties.mag)
            });
        },
        onEachFeature: onEachFeature
    });
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "?? <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> ?? <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery ?? <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });
    // var earthquakeLayer = L.layerGroup(earthquakeMarker);
    var newLayer = new L.LayerGroup();
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap
    };
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };
    // Create our map, giving it the lightmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [lightmap, earthquakes, newLayer]
    });
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    /*Legend specific*/
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (){
        var div = L.DomUtil.create('div', 'info legend');
        var grades = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
        var colors = [
            'rgb(19, 235, 45)',
            'rgb(138, 206, 0)',
            'rgb(186, 174, 0)',
            'rgb(218, 136, 0)',
            'rgb(237, 91, 0)',
            'rgb(242, 24, 31)'
            ];
        var labels = [];
        // loop through our density intervals and generate a label with a colored square for each interval
        grades.forEach(function(grade, index){
            labels.push("<div class = 'row'><li style=\"background-color: " + colors[index] +  "; width: 20px"+ "; height: 15px" + "\"></li>" + "<li>" + grade + "</li></div>");
        })
      
        div.innerHTML += "<ul>" + labels.join("") +"</ul>";
        return div;
    };

    legend.addTo(myMap);
};