var map, panorama, infoWindow;
      
function initMap() {
    var brooklynCenter = {lat: 40.650002, lng: -73.949997};
    var northWilliamsburg = {lat: 40.7162014, lng: -73.9594509};
    //var bembe = {lat: 40.711210, lng: -73.964836};
    var bembe = {lat: 40.711375, lng: -73.965950};
    var sv = new google.maps.StreetViewService();

    map = new google.maps.Map(document.getElementById('map'), {
        center: bembe,
        zoom: 16
    });

    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('panorama'), {
            position: bembe,
            addressControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_CENTER
            },
            linksControl: false,
            panControl: false,
            enableCloseButton: false,
            pitch: 0
        }
    );

    function createMarker(business, position) {
        var businessContent = '<div id="content">'+
        '<div id="siteNotice"></div>'+
        '<h1 id="firstHeading" class="firstHeading">' + business.name +'</h1>'+
        '<div id="bodyContent">'+
        '<p>' + business.help + '</p>' +
        '<p><a href="' + business.url + '" target="_blank">' + business.url + '</a></p>' +
        '<p>(' + business.phone.substring(0, 3) + ') ' + business.phone.substring(3, 6) + '-' + business.phone.substring(6, 10) + '</p>' +
        '</div></div>';        

        console.log(position)
        var closed = true;
        var markerInfoMapWindow = new google.maps.InfoWindow({
            content: businessContent
        });

        var markerInfoPanoramaWindow = new google.maps.InfoWindow({
            content: businessContent
        });

        var mapMarker = new google.maps.Marker({
            position: position,
            map: map,
            icon: 'https://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=info|FFFF00',
            title: business.name
        });

            
        var panormaMarker = new google.maps.Marker({
            position: position,
            map: panorama,
            icon: 'https://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=info|FFFF00',
            title: business.name
        });
        
        markerInfoPanoramaWindow.open(panorama, panormaMarker);

        mapMarker.addListener('click', function(e) {
            sv.getPanorama({location: e.latLng, radius: 50}, processSVData);

            if (closed) {
                markerInfoMapWindow.open(map, mapMarker);
                closed = false;
            } else {
                markerInfoMapWindow.close(map, mapMarker);
                closed = true;
            }
        });
    }

    
    var db = firebase.firestore();
    db.collection("businesses").get().then((querySnapshot) => {
        querySnapshot.forEach((businessQuery) => {
            var business = businessQuery.data();
            createMarker(business, {
                lat: business.latitude ? parseFloat(business.latitude) : business.location.latitude,
                lng: business.longitude ? parseFloat(business.longitude) : business.location.longitude
            });
            
        });
    });

  /**
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      infoWindow.open(panorama);
      panorama.setPosition(pos);
      map.setCenter(pos)
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
      handleLocationError(true, infoWindow, panorama.getCurrentPosition());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
    handleLocationError(false, infoWindow, panorama.getCurrentPosition());
  }

  **/

    map.addListener('click', function(e) {
        sv.getPanorama({location: e.latLng, radius: 50}, processSVData);
    });

    function processSVData(data, status) {
        if (status === 'OK') {
            panorama.setPano(data.location.pano);
            panorama.setPov({
                heading: 270,
                pitch: 0
            });
        } else {
            console.error('Street View data not found for this location.');
        }
    }

    var request = {
        location: northWilliamsburg,
        radius: '500',
        //type: ['restaurant']
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
  infoWindow.open(panorama);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            console.log(results[i])
            createSearchMarker(results[i]);
        }
    }
}

function createSearchMarker(place) {
    /**
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: place.icon
    });

    google.maps.event.addListener(marker, 'click', function() {
        console.log(place.id)
        var request = {
            placeId: place.place_id,
            fields: ['formatted_phone_number', 'website']
        };

        service.getDetails(request, function(placeDetails, status) {
            console.log(status)
            console.log(placeDetails)
            var content = '<div id="content">'+
            '<div id="siteNotice"></div>'+
            '<h1 id="firstHeading" class="firstHeading">' + place.name + '</h1>'+
            '<div id="bodyContent">'+
            '<p><a href="' + placeDetails.website + '">' + placeDetails.website + '</a></p>' +
            '<p>' + placeDetails.formatted_phone_number + '</a></p>' +
            '</div></div>';

            var infoWindow = new google.maps.InfoWindow({
                content: content
            });

            infoWindow.open(map, marker);
        });
    });
    */
  }