function updateTrafficOnMap(map, trafficLayer, on)
{
  if(on === 0) {
    trafficLayer.setMap(null);
    trafficLayer = null;
    setTimeout(function() { updateTrafficOnMap(map, null, 1); }, 1);
  }
  
  if(on === 1) {
    var trafficLayer2 = new google.maps.TrafficLayer();
    trafficLayer2.setMap(map);
    // after 60 seconds. update the traffic map
    setTimeout(function() { updateTrafficOnMap(map, trafficLayer2, 0);}, 60000);
  }
}

function initialize() {
  var myLatlng = new google.maps.LatLng(42.45887, -83.21938);
  var mapOptions = {
    zoom: 9,
    center: myLatlng,
    disableDefaultUI: true
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

/*  var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map); */
  updateTrafficOnMap(map, null, 1);
}

google.maps.event.addDomListener(window, 'load', initialize);
//setInterval(initialize, 60000);