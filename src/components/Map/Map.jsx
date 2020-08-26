import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import axios from 'axios';


// TODO 
/*
    - set token - PLACEHOLDER_TOKEN
    - set google map api key- PLACEHOLDER_GOOGLE_MAP_API_KEY
    - current console warning is due to google map react library, there is a ticket in for this to be 
    resolved by google-map-react team it will NOT affect the application
    - handle setDefaultBranch function and set up set currentBranch
*/

const Map = (props) => {

    const { defaultBranch, currentBranch } = props;     
    const [ places, setPlaces ] = useState([]);
    const [ errorMsg, setErrorMsg ] = useState();

    const renderSpecialIcon = (type) => {
        const colors = {
            current: 'green',
            default: 'blue'
        }

        return  {
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
            fillColor:  colors[type],
            fillOpacity: 1,
            strokeColor: '#000',
            strokeWeight: 1,
            scale: 1,
        }
    }

    // START MAP FUNCTIONS

    // Return map bounds based on list of places
    // This is the infowindow content any additional
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
                    <h3>Branch Name: ${place.branchName}</h3> 
                    <p>Branch Number: ${place.branchNumber}</p> 
                
                </div>
                <div>
                    ${
                        place.branchNumber === defaultBranch ? `<b>home branch</b>` : ``
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

        const defaultBranchButton = document.createElement("button");
        defaultBranchButton.onclick = () => setDefaultBranch(place);
        defaultBranchButton.innerHTML = 'Set As Default Branch';

        // TODO - uncomment when ready to handle set current  and default branch
        //div.appendChild(defaultBranchButton);

        return div
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
            
            const {location, branchNumber} = place;
            return new maps.Marker({  
                // if marker is for "default branch" set icon to custom Blue Icon                     
                ...branchNumber === defaultBranch && {icon: renderSpecialIcon('default')},
                ...branchNumber === currentBranch && {icon: renderSpecialIcon('current')},
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
    // END MAP FUNCTIONS
    

    const fetchMapData = async (source) => {
       
        await axios.get(
            'https://stageapi.daikincloud.io/1.5/goodman/branches', 
            {
                headers: {
                  'Authorization': `Bearer ${PLACEHOLDER_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                cancelToken: source.token,
            }
        )
        .then(function (response) {
            // handle success
            setPlaces(response.data);
        })
        .catch(function (error) {
            // handle error
            if (!axios.isCancel(error)) {
                setErrorMsg('There was an error loading map');
            }
            console.log(error)
        });
    }

    const setDefaultBranch = async (branchNumber) => {
        await axios.put(
            'https://stageapi.daikincloud.io/1.5/user/profile', 
            {
                headers: {
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0YXlsb3JAcGFzcS5uZXQiLCJpc3MiOiJkYWlraW4uaW8iLCJpYXQiOjE1OTgyNzcxMTEsImV4cCI6MTkxMzYzNzExMSwiZHVyYWJsZSI6dHJ1ZX0.1e6VRfjyx-kEDwW2klEjNJNjMqtvqMRqzGWMvv2EwUk`,
                  'Content-Type': 'application/json'
                },
                data: {
                    "email": "greg@pasq.net",
                    "defaultBranch": branchNumber,
                }
            }
        )
        .then(function (response) {
            // handle success
            console.log(response)
        })
        .catch(function (error) {
            // handle error
            console.log(error)
            setErrorMsg('There was an error loading map');
        });
    }


    useEffect(() => {
        /*
            source - used to cancel call if user navs away before call completes
            necessary to prevent any memory leaks 
        */
        const source = axios.CancelToken.source()
        
        fetchMapData(source);

        return () => {
            source.cancel()
        }
    }, []);

    
    const renderMap = () => (
        // TODO - update height once placed
        <div style={{ height: '600px', width: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: PLACEHOLDER_GOOGLE_MAP_API_KEY }}
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
            {places.length ? renderMap() : null}
            {errorMsg ?  errorMsg : null }
        </>
    )
}

Map.propTypes = {
    defaultBranch: PropTypes.string.isRequired,
    currentBranch: PropTypes.string.isRequired,
};

export default Map;