// Define variables for our tile layers
var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

// Adding layers to baseMap
var baseMaps = {
    Light: light,
    Dark: dark
  };
  
// Create map object and set default layers
var myMap = L.map("map", {
    center: [38.500000, -98.000000],
    zoom: 4,
    layers: [light]
  });

let geojson_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
L.control.layers(baseMaps).addTo(myMap);

function setcolors(depth){ // the color of th circle is determined by the depth of the earthquake "feature.geometry.coordinates[2]"
    var circleColor = "#00FF00";
    if (depth > 90) {
        circleColor = "#FF0000";
    }
    else if (depth > 70) {
        circleColor = "#eb5e34";
    }
    else if (depth > 50) {
        circleColor = "#eb9f34";
    }
    else if (depth > 30) {
        circleColor = "#ebd334";
    }   
    else if (depth > 10) {
        circleColor = "#e2eb34";
    }
    return circleColor;
} 

d3.json(geojson_url).then(data => {
    console.log(data);
    L.geoJSON(data, { // allows to process all the data points without having to loop throughout all the values in a loop
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                fillOpacity: 0.75,
                radius: feature.properties.mag*3,
                fillColor: setcolors(feature.geometry.coordinates[2]),
                color: "black",
                weight: 1
            });
        },
        onEachFeature: function(feature, layer) { //binding popup
            layer.bindPopup(`<div style="background-color:${setcolors(feature.geometry.coordinates[2])};">${feature.properties.place}
            <br>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}<br>${new Date(feature.properties.time)}</div>`);
        }
    }).addTo(myMap) 
    // End of L.geoJSON() function

        // Adding legend div
        var legend = L.control({ position: "bottomright" });
        legend.onAdd = function() {
            var div = L.DomUtil.create("div", "info legend");
            var limits = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
            var colors = ["#00FF00", "#e2eb34", "#ebd334", "#eb9f34", "#eb5e34", "#FF0000"];
            var labels = [];

        limits.forEach(function(limit, index) {
            labels.push("<p><div class=\"color\" style=\"background-color: " + colors[index] + "\"> </div> <span>" + limit +  "</span> </p>");
        });
        div.innerHTML += labels.join(""); // joining all the tags into one single string 
        return div;
    };
    legend.addTo(myMap); // adding legend to the map
}); // End reading geoJson