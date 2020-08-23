import React, {useState, useEffect} from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker.jsx';
import axios from 'axios';

import './map.css'

/*
TODO: 
https://github.com/google-map-react/google-map-react-examples/blob/master/src/examples/Main.js#L40
*/



const Map = () => {

    // Return map bounds based on list of places
const getInfoWindowString = (place) => `
<div>
    <div style="font-size: 16px;">
        ${place.name}
    </div>
    <div style="font-size: 14px; color: grey;">
        ${place.address}
    </div>
</div>`;

// <div style="font-size: 16px;">
//     ${place.name}
//   </div>
//   <div style="font-size: 14px;">
//     <span style="color: grey;">
//     ${place.rating}
//     </span>
//     <span style="color: orange;">${String.fromCharCode(9733).repeat(Math.floor(place.rating))}</span><span style="color: lightgrey;">${String.fromCharCode(9733).repeat(5 - Math.floor(place.rating))}</span>
//   </div>
//   <div style="font-size: 14px; color: grey;">
//     ${place.types[0]}
//   </div>
//   <div style="font-size: 14px; color: grey;">
//     ${'$'.repeat(place.price_level)}
//   </div>
//   <div style="font-size: 14px; color: green;">
//     ${place.opening_hours.open_now ? 'Open' : 'Closed'}
//   </div>

const getMapBounds = (map, maps, places) => {
const bounds = new maps.LatLngBounds();

places.forEach((place) => {
  bounds.extend(new maps.LatLng(
    place.lat,
    place.lng,
  ));
});
return bounds;
};

// Re-center map when resizing the window
const bindResizeListener = (map, maps, bounds) => {
    maps.event.addDomListenerOnce(map, 'idle', () => {
        maps.event.addDomListener(window, 'resize', () => {
            map.fitBounds(bounds);
        });
    });
};

// Fit map to its bounds after the api is loaded
const apiIsLoaded = (map, maps, places) => {
// Get bounds by our places
const bounds = getMapBounds(map, maps, places);
// Fit map to bounds
map.fitBounds(bounds);
// Bind the resize listener
bindResizeListener(map, maps, bounds);

const infowindow = new maps.InfoWindow();
const markers = places.map((place) => {
    return new maps.Marker({
      placeData: place,
      position: {
        lat: place.lat,
        lng: place.lng, //place.geometry.location.lng
      },
      map,
    });
  });
  
markers.forEach((marker, i) => {
  marker.addListener('click', (e) => {
    infowindow.setContent(getInfoWindowString(marker.placeData))
    infowindow.open(map, marker)
  });
});
};

    const testPlace = [
        {
            _id: 1,
            name: 'Branch 1',
            address: '1600 Amphitheatre Parkway, Mountain View, california.',
            lat: 37.42216,
            lng: -122.08427,
        },
        {
            _id: 2,
            name: 'Branch 2',
            address: '1600 Amphitheatre Parkway, Mountain View, california.',
            lat: 38.42216,
            lng: -122.08427,
           
        },
        {
            _id: 3,
            name: 'Branch 3',
            address: '1600 Amphitheatre Parkway, Mountain View, california.',
            lat: 38.22236,
            lng: -122.08427,
           
        },
    ]
    
    const [ places, setPlaces ] = useState(testPlace);

    const [displayMarker, setDisplayMarker] = useState();

	const _onChildClick = (key, childProps) => {
        console.log('h')
		if (displayMarker && displayMarker === childProps.branch._id) {
			setDisplayMarker()
		} else {
			setDisplayMarker(childProps.branch._id)
		}
	}

    const fetchData = async () => {
        const config = {
            headers: { Authorization: `Bearer ${'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZ4dV…ariJBDuAZ6UrQPZXevmqzQEcfwBpq85AdjS2RKMVCeGBblEIA'}` }
        };
        const encodedString = new Buffer('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZ4dV…ariJBDuAZ6UrQPZXevmqzQEcfwBpq85AdjS2RKMVCeGBblEIA').toString('base64');
        await axios.get(
            'https://stageapi.daikincloud.io/1.5/goodman/branches', 
            {
                headers: {
                  'Authorization': `Bearer ${encodedString}`,
                  'Content-Type': 'application/json'
                }
            })
            .then(function (response) {
                // handle success
                console.log('RES', response);
            })
            .catch(function (error) {
                // handle error
                console.log('ERROR', error);
            })
            .finally(function () {
                // always executed
            });
    }

    useEffect(() => {
       fetchData()
    }, [])


    return (
        <>
            <h1>Map</h1>
            <div style={{ height: '600px', width: '100%' }}>

                <GoogleMapReact
                    bootstrapURLKeys={{ key: 'AIzaSyBguMmo9uc4RdPS3N7qWH2AiGZQ9Vf4vTw' }}
                    defaultCenter={{
                        lat: 37.42216,
                        lng: -122.08427,
                    }}
                    defaultZoom={17}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => apiIsLoaded(map, maps, places)}
                    onChildClick={_onChildClick}
                >
                {/* {
                    places.map(branch => ( 
                        <Marker
                            show={displayMarker}
							branch={branch}
                            key={branch._id}
                            lat={branch.lat}
                            lng={branch.lng}
                        />
                    ))
                } */}
                </GoogleMapReact>
            </div>
        </>
    )
}

export default Map;