(function() {
  class GeoLocalisation {
    constructor() {
      this.latitude = 50;
      this.longitude = 20;
      this.myTypeId = google.maps.MapTypeId.TERRAIN;
      this.zoom = 10;
      this.markers = [];
      this.bounds = null;
    }
    cleanMarkers(){
      this.markers.forEach(function(marker) {
        marker.setMap(null);
      });
      this.markers = [];
    }
    setMarker(){
      this.markers.push(new google.maps.Marker(arguments[0]));
    }
    getMap(elm){
      this.map = new google.maps.Map(elm, {
        center: {
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: this.zoom,
        myTypeId: this.myTypeId,
        fullscreenControl: true
      });
    }
    setControlers(obj) {
      var input = obj.input;
      var button = obj.button;

      this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
      this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);
      this.searchBox = new google.maps.places.SearchBox(input);
      this.detect = button;
    }
    searchBoxChange() {
      this.searchBox.addListener('places_changed', function() {
        var places = this.searchBox.getPlaces();
        if (places.length === 0) {
          return;
        }

        //clean markers
        this.cleanMarkers();

        this.bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          //set new marker
          var markerParams = {
            map: this.map,
            animation: google.maps.Animation.DROP,
            title: place.name,
            position: place.geometry.location
          };
          this.setMarker(markerParams);

          if (place.geometry.viewport) {
            this.bounds.union(place.geometry.viewport);
          } else {
            this.bounds.extend(place.geometry.location);
          }

          this.map.fitBounds(this.bounds);
          this.map.getCenter();
          var zoom = this.map.getZoom();
          this.map.setZoom(zoom > 15 ? 15 : zoom);

        }.bind(this));
      }.bind(this));

      return this;
    }

    takeCurrentLocalisation() {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      function error() {
        alert('Error. Plesase referesh');
      }

      function success(position) {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.map.setCenter(new google.maps.LatLng(this.latitude, this.longitude));
        var zoom = this.map.getZoom();
        this.map.setZoom(zoom < 15 ? 15 : zoom);

        this.cleanMarkers();
        var markerParams = {
          map: this.map,
          animation: google.maps.Animation.DROP,
          title: 'You are here!',
          position: {
            lat: this.latitude,
            lng: this.longitude
          }
        };

        this.setMarker(markerParams);
      }

      this.detect.addEventListener('click', function() {
        navigator.geolocation.getCurrentPosition(success.bind(this), error);
      }.bind(this));
    }


  }

  var map = new GeoLocalisation();
  map.getMap(document.getElementById('map'));
  map.setControlers({
      input: document.getElementById('pac-input'),
      button: document.getElementById('detect')
    })
  map.searchBoxChange();
  map.takeCurrentLocalisation();

})();
