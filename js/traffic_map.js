function initialize() {
  var myLatlng = new google.maps.LatLng(42.45887, -83.21938);
  var mapOptions = {
    zoom: 9,
    center: myLatlng
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);
}

google.maps.event.addDomListener(window, 'load', initialize);
setInterval(initialize, 60000);