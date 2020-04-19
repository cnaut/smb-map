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


    var openInfoWindow;
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

                if (openInfoWindow) {
                    openInfoWindow.close(map)
                }

                openInfoWindow = markerInfoMapWindow;
                
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
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
  infoWindow.open(panorama);
}