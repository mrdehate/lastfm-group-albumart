function initialize() {
  var myLatlng = new google.maps.LatLng(42.4236417,-83.4228403);
  var mapOptions = {
    zoom: 9,
    center: myLatlng,
    disableDefaultUI: true
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);
}

google.maps.event.addDomListener(window, 'load', initialize);
setInterval(initialize, 120000);