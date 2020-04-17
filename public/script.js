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

    function createMarker(title, content, position) {
        console.log(position)
        var closed = true;
        var markerInfoWindow = new google.maps.InfoWindow({
            content: content
        });
    
        var mapMarker = new google.maps.Marker({
            position: position,
            map: map,
            icon: 'https://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=info|FFFF00',
            title: title
        });

            
        var panormaMarker = new google.maps.Marker({
            position: position,
            map: panorama,
            icon: 'https://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=info|FFFF00',
            title: title
        });
        
        markerInfoWindow.open(panorama, panormaMarker);

        
        mapMarker.addListener('click', function(e) {
            sv.getPanorama({location: e.latLng, radius: 50}, processSVData);

            if (closed) {
                markerInfoWindow.open(map, mapMarker);
                closed = false;
            } else {
                markerInfoWindow.close(map, mapMarker);
                closed = true;
            }
        });
    }

    
    var db = firebase.firestore();
    db.collection("businesses").get().then((querySnapshot) => {
        querySnapshot.forEach((businessQuery) => {
            var business = businessQuery.data();

            var businessContent = '<div id="content">'+
            '<div id="siteNotice"></div>'+
            '<h1 id="firstHeading" class="firstHeading">' + business.name +'</h1>'+
            '<div id="bodyContent">'+
            '<p>' + business.help + '</p>' +
            '<p><a href="' + business.url + '">' + business.url + '</a></p>' +
            '<p>' + business.phone + '</p>' +
            '</div></div>';        

            createMarker(business.name, businessContent, {
                lat: business.latitude ? parseFloat(business.latitude) : business.location.latitude,
                lng: business.longitude ? parseFloat(business.longitude) : business.location.longitude
            });
            
        });
    });

    var catBirdContent = '<div id="content">'+
    '<div id="siteNotice"></div>'+
    '<h1 id="firstHeading" class="firstHeading">Cat Bird</h1>'+
    '<div id="bodyContent">'+
    '<p>How to support: Shop online even though there will be no clear shipping date</p>' +
    '<p>Message: <a href="https://www.catbirdnyc.com/covid19">https://www.catbirdnyc.com/covid19</a></p>' +
    '<p><a href="https://www.catbirdnyc.com">https://www.catbirdnyc.com</a></p>' +
    '</div></div>';
    
    var awokeVintageContent = '<div id="content">'+
    '<div id="siteNotice"></div>'+
    '<h1 id="firstHeading" class="firstHeading">Awoke Vintage</h1>'+
    '<div id="bodyContent">'+
    '<p>How to support: <a href="https://www.instagram.com/awokevintagebrooklyn">Shop instagram</a></p>' +
    '<p><a href="https://www.awokevintage.com/">https://www.awokevintage.com</a></p>' +
    '</div></div>';

    var brooklynSpectaclesContent = '<div id="content">'+
    '<div id="siteNotice"></div>'+
    '<h1 id="firstHeading" class="firstHeading">Brooklyn Spectacles</h1>'+
    '<div id="bodyContent">'+
    '<p>How to support: <a href="https://brooklynspectacles.com">Shop online</a></p>' +
    '<p><a href="https://brooklynspectacles.com">https://brooklynspectacles.com</a></p>' +
    '</div></div>';

    //createMarker("Cat Bird", catBirdContent, {lat: 40.7164649, lng: -73.959563})
    //createMarker("Awoke Vintage", awokeVintageContent, {lat: 40.716602, lng: -73.958623})
    //createMarker("Brooklyn Spectacles", brooklynSpectaclesContent, {lat: 40.71674, lng: -73.958535})

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