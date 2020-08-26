import React, {useState, useEffect} from 'react';
import GoogleMapReact from 'google-map-react';
import axios from 'axios';


// TODO 
/*
    - UPDATE ALL TEST DATA VALUES WITH REAL DATA - in order to determine which branch is the  "home" 
    branch I used the home key, Seeing as I have not received the 
    bearer token to make a proper request this test data and the values
    used will need to be changed to reflect the correct data
    - with correct bearer token uncomment fetch call
    - current console warning is due to google map react library, there is a ticket in for this to be 
    resolved by google-map-react team it will NOT affect the application
    - handle setHomeBranch function
*/
const TEST_PLACES = [
    {
        _id: 1,
        name: 'Branch 1',
        address: '1600 Amphitheatre Parkway, Mountain View, california.',
        lat: 37.42216,
        lng: -122.08427,
        home: true,
    },
    {
        _id: 2,
        name: 'Branch 2',
        address: '1600 Amphitheatre Parkway, Mountain View, california.',
        lat: 38.42216,
        lng: -122.08427,
        home: false,
    },
    {
        _id: 3,
        name: 'Branch 3',
        address: '1600 Amphitheatre Parkway, Mountain View, california.',
        lat: 38.22236,
        lng: -122.08427,
        home: false,
    },
];

const Map = () => {
    const [ places, setPlaces ] = useState([]);
    const [ errorMsg, setErrorMsg ] = useState();

    const homeIcon = {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
        fillColor: 'blue',
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 1,
    }

    // Return map bounds based on list of places
    // This is the infowwindow content any additional
    const getInfoWindowString = (place) => {
        
        // Must return string NOT jsx
        return (
            `<div 
                style="
                    min-height: 100px;
                    width: 300px;
                    display: flex; 
                    flex-direction: column;
                    align-items: start;
                    justify-content: space-around;
                    text-align: left;
                "
            >
                <div 
                    style="font-size: 16px;"
                    width: 300px;
                    display: flex !important; 
                    justify-content: space-between;

                >   
                    <p>Branch Name: ${place.branchName}</p> 
                    <p>Branch Number: ${place.branchNumber}</p> 
                
                </div>
                <div>
                    ${
                        place.home ? `<b>home branch</b>` : ``
                    }
                </div>
                <div style="color: grey;">
                    <p>${place.address}</p>
                </div>
            </div>`
        )
    }    

    
    /* 
        html elems MUST be written with js in order to handle adding 
        a button with an action to infoWindow
    */
    const renderInfoWindowContent = (place) => {

        const div = document.createElement("div");
        div.id = "container";
        div.innerHTML += getInfoWindowString(place);

        const button = document.createElement("button");
        button.onclick = () => setHomeBranch(place);
        button.innerHTML = 'Set As Home Branch';

        div.appendChild(button);

        return div
    }

    const setHomeBranch = (place) => {
        console.log('set home:', place);
        // handle call 
    }

      

    const getMapBounds = (map, maps, places) => {
        const bounds = new maps.LatLngBounds();

        places.forEach((place) => {
            bounds.extend(new maps.LatLng(
                place.location[1], // lat
                place.location[0] // lng
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
            
            const {home, location} = place;
            return new maps.Marker({  
                // if marker is for "home branch" set icon to custom Blue Icon                     
                ...home && {icon: homeIcon},
                placeData: place,
                position: {
                    lat: location[1], // lat
                    lng: location[0], // lng
                },
                map,
            });
        });
        
        // Marker click event open info window
        markers.forEach(marker => {
            marker.addListener('click', () => {
                infowindow.setContent(
                    renderInfoWindowContent(marker.placeData)
                );
                infowindow.open(map, marker)
            });
        });
    };
    

    const fetchMapData = async (source) => {
       
        await axios.get(
            'https://stageapi.daikincloud.io/1.5/goodman/branches', 
            {
                headers: {
                  'Authorization': `Bearer`,
                  'Content-Type': 'application/json'
                },
                cancelToken: source.token,
            }
        )
        .then(function (response) {
            // handle success
            console.log(response.data)
            setPlaces(response.data);
        })
        .catch(function (error) {
            // handle error
            if (axios.isCancel(error)) {

            } else {
                setErrorMsg('There was an error loading map');
            }
            setErrorMsg('There was an error loading map');
        });
    }


    useEffect(() => {
        /*
            source - used to cancel call if user navs away before call completes
            necessary to prevent any memory leaks 
        */
        const source = axios.CancelToken.source()
        
        // TODO - uncomment once have bearer token
        fetchMapData(source);

        return () => {
            source.cancel()
        }
    }, []);

    
    const renderMap = () => (
        // TODO - update height once placed
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
            >
            </GoogleMapReact>
        </div>
    );

    return (
        <>
            <h1>Map</h1>
            {places.length ? renderMap() : null}
            {errorMsg ?  errorMsg : null }
        </>
    )
}

export default Map;