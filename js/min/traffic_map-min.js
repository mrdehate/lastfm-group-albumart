function initialize(){var e=new google.maps.LatLng(42.45887,-83.21938),a={zoom:9,center:e,disableDefaultUI:!0},i=new google.maps.Map(document.getElementById("map-canvas"),a),n=new google.maps.TrafficLayer;n.setMap(i)}google.maps.event.addDomListener(window,"load",initialize),setInterval(initialize,12e4);