// 1. Get data set

let geojson_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(geojson_url).then(data => {
    console.log(data);
});

// 2. Import & Visualize the Data

// Define variables for tile layers
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

// Creating map object
var myMap = L.map("map", {
  center: [38.500000, -98.000000],
  zoom: 4,
  layers: [light]
});

// Create a control for the layers, add overlay layers to it
L.control.layers(baseMaps).addTo(myMap);

// Function to set color of the circles
// (the color of the circle is determined by the depth of the earthquake "feature.geometry.coordinates")
function setcolors(depth){ 
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

// Perform an API call to earthquake.usgs.gov
d3.json(geojson_url).then(data => {
  L.geoJSON(data, { 
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            fillOpacity: 0.75,
            radius: feature.properties.mag*3,
            fillColor: setcolors(feature.geometry.coordinates[2]),
            color: "black",
            weight: 1
        });
    },
    // Binding popup
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`<div style="background-color:${setcolors(feature.geometry.coordinates[2])};">${feature.properties.place}
      <br>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}<br>${new Date(feature.properties.time)}</div>`);
    }
  }).addTo(myMap)
    // Adding legend to the map
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
        var colors = ["#00FF00", "#e2eb34", "#ebd334", "#eb9f34", "#eb5e34", "#FF0000"];
        var labels = [];

        var legendInfo = "<h3>Depth of Earth</h3>" +
          "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
          "</div>";

        div.innerHTML = legendInfo;
    
        limits.forEach(function(limit, index) {
        labels.push("<p><div class=\"color\" style=\"background-color: " + colors[index] + "\"> </div> <span>" + limit +  "</span> </p>");
    });
    div.innerHTML += labels.join(""); // joining all the tags into one single string 
    return div;
};
legend.addTo(myMap);
});