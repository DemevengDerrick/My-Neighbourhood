// Initiate a leaflet map instance centered with setView and zoom level
var map = L.map('map').setView([3.86667, 11.51667], 13);

// Add Basemap
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var google_hybrid = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}")

// Feature class

var pois_yaounde = new L.geoJson();
//pois_yaounde.addTo(map);

$.ajax({
dataType: "json",
url: "https://personal.psu.edu/dcd5396/mcda/data/pois_yaounde2.json",
success: function(data) {
    $(data.features).each(function(key, data) {
        //console.log(data.properties.fclass)
        pois_yaounde.bindPopup(function (layer) {
            return "<strong>Type : </strong> " + layer.feature.properties.fclass + "<br>" + "<strong>Name :</strong> " + layer.feature.properties.name;
        }).addData(data);
    });
}
})

// Layer control

var baseLayers = {
    "OpenStreetMap": osm,
    "Google Hybrid" : google_hybrid,
};

var overlays = {
    //"OSM POIs Yaounde": pois_yaounde
};

L.control.layers(baseLayers, overlays).addTo(map);

// Reachability plugin
var reachabilityControl = L.control.reachability({
    // add settings/options here
    apiKey: '5b3ce3597851110001cf6248eebd1aa3e4444e57a488066e50bd211b',
    //showOriginMarker : false,
}).addTo(map);

// Custom Icons
var MyIcon = L.icon({
    iconUrl: 'leaf-green.png',
    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

function pointToLayer(feature,latlng){
    return L.marker(latlng,{icon: MyIcon});
}
// Getting return polygon from reachability polygon and using it in turf to get pois within
var selectedPois = L.geoJson()
var numClick = 0 // number of clicks of the reach button variable
var labels;
var data;
const ctx = document.getElementById('myChart');
var chart; // variable to conatain the chart instance

// Create Chart function
function createChart() {
    chart = new Chart(ctx, {
      type: 'bar',
      options: {
        animation: true
      },
      data: {
        labels: labels,
        datasets: [{
          label: '# Points of Interest within reach area',
          data: data,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

// add event listenner to the reach button
$("#reach").click(function(){
    selectedPois.clearLayers()
    var latestReachabilityArea = reachabilityControl.latestIsolines.toGeoJSON();
    //console.log(latestReachabilityArea.features[0]);
    var ptsWithin = turf.pointsWithinPolygon(pois_yaounde.toGeoJSON(), latestReachabilityArea.features[0]);
    selectedPois.addData(ptsWithin);
    //selectedPois.pointToLayer = pointToLayer;
    selectedPois.addTo(map);
    //console.log(ptsWithin.features.length)
    // Create Data and Labels for chart
    var featuresCount = {}
    for(let i=0; i<ptsWithin.features.length; i++){
        let fclass = ptsWithin.features[i].properties.fclass
        //console.log(fclass)
        if(featuresCount.hasOwnProperty(fclass)){
            //console.log(featuresCount.fclass)
            featuresCount[fclass] += 1
            //console.log(featuresCount.fclass)
        }
        else{
            //console.log(fclass)
            featuresCount[fclass] = 1
        }
    }

    //console.log(featuresCount)
    //---------------------------------------------------------------------------------
    // chart.js bar chart implementation
    labels = Object.keys(featuresCount)
    data = Object.values(featuresCount)

    // check the number of times the reach button has been clicked and then clears chart if the num > 1
    numClick += 1
    if (numClick > 1){
        chart.destroy();
    }
    // 

    createChart();
})

// resize the chart as the window size changes
window.addEventListener("resize", function() {
    if (chart) {
        chart.destroy();
    }
    createChart();
});

// Delete the pois within the reachability area
$("#delReach").click(function(){
    selectedPois.clearLayers()
})

//------------------------------------------------------------------------------
// Get the modal
var modal = document.getElementById("myModal");

// Get the close button
var closeButton = document.getElementsByClassName("close")[0];

closeButton.addEventListener("click",function(){
    modal.style.visibility = "hidden"
    modal.style.height = "0px"

    //console.log("Clicked")
})