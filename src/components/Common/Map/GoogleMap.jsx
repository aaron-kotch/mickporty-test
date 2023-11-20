import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core";
// import useScript from "@Hook/useScript";
import BlueDotCirclePulsing from "src/assets/svgs/BlueDotCirclePulsing.svg";
import MapCenterMarker from "src/assets/svgs/map-center-marker.svg";
import { useAddressContext } from "@Context/AddressContext";
import { useAlertContext } from '@Context/AlertContext';
import { useStoreContext } from "@Context/StoreContext";
import { getPositionOptions } from '@Util/map';

const useStyles = makeStyles(() => ({
  mapHolder: {
    padding: "6px",
  },
  map: {
    position: "relative",
    height: (props) => `calc(${props.height+43}px - 1rem)`,
    width: "100%",
    borderRadius: "12px",
    boxShadow: "0 0 4px 1px rgba(22, 22, 22, 0.1)",
    transition: "height 0.25s ease",
    "& .gmnoprint": {
      display: "none",
    },
    "&::after": {
      width: 22,
      height: 40,
      display: (props) => (props.drawCenterIcon ? "block" : "none"),
      content: '" "',
      position: "absolute",
      top: "50%",
      left: "50%",
      margin: "-40px 0 0 -11px",
      background: `url('${MapCenterMarker}')`,
      backgroundSize: "22px 40px",
      pointerEvents: "none",
    },
  },
  mapOverlay: {
    position: "fixed",
  },
  controlArea: {
    width: "90%",
    marginTop: "14px",
    borderRadius: "12px",
    boxSizing: "border-box",
    outline: "none",
    boxShadow: "0 0 12px 4px rgba(22, 22, 22, 0.2)",
    backgroundColor: "#eee",
    fontFamily: "Roboto",
  },
  querySection: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  queryInput: {
    flex: 1,
    paddingRight: 12,
  },
  searchIconButton: {
    padding: 10,
  },
  resultList: {
    backgroundColor: "#eee",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  resultListItem: {
    borderBottom: "1px solid lightgrey",
    "&:last-child": {
      borderBottom: 0,
    },
  },
  loadingIcon: {
    width: "24px !important",
    height: "24px !important",
  },
  // centerMarker: {
  //   position: "absolute",
  //   /*url of the marker*/
  //   background: "url(http://maps.gstatic.com/mapfiles/markers2/marker.png) no-repeat",
  //   /*center the marker*/
  //   // backgroundOrigin: "center",
  //   // top:"50%",
  //   // left:"50%",
  //   // zIndex: 0,
  //   // /*fix offset when needed*/
  //   // marginLeft: -10,
  //   // marginTop: 0,
  //   // /*size of the image*/
  //   // height: 34,
  //   // width: 20,
  //   // cursor: "pointer"
  //   top: 0,
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   margin: "auto",
  // }
}));

const GoogleMap = ({
  apiKey,
  height,
  overridePlaceId,
  search = undefined,
  initialCenterPosition = undefined,
  centerPosition = undefined,
  focusZoomLevel = 12,
  markers = [], // aka stores
  changeableMarkers: markerCoordinates = [],
  activeMarkerIndex = undefined,
  onMarkerClicked: onMarkerCoordinatesClicked = (coordinate) => {},
  markerInfoContent = null,
  markerIcon = null,
  showCurrentUserLocation = false,
  storeIcon = undefined,
  drawCenterIcon = false,
  onMapEvents = [], //e.g. [['dragend', callback]]
  onSearched = (prediction) => {},
  updateActiveMarkerIndex = null,
  triggerZoomChangedRef,
  infoWindowRef,
  noCurrLocationMarker = false,
  isEditingAddress = false,
  addressDetail = {},
  setAddressDetail = () => {},
}) => {
  // console.log('Google Map render');
  const { scriptHasLoaded } = useAddressContext();
  const { pushAlertPopUp } = useAlertContext();
  const { userEnabledLocation } = useStoreContext();

  const classes = useStyles({
    height,
    drawCenterIcon,
  });

  const queryTimeoutRef = useRef(null);
  const currentLocationUpdateIntervalRef = useRef(null);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const currentPositionMarkerRef = useRef(null);
  const markerRef = useRef(null);
  const markersRef = useRef([]);
  // const centerMarkerRef = useRef(null);
  const autoCompleteServiceRef = useRef(null);
  const placeServiceRef = useRef(null);

  const [hasMapLoaded, setHasMapLoaded] = useState(false);
  // const [hasInitMap, setHasInitMap] = useState(false);

  // call Google API to get predictions
  useEffect(() => {
    const onDisplaySuggestionResult = (predictions, status) => {
      // console.log('onDisplaySuggestionResult')
      try {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          console.error(status);
          return;
        }

        onSearched(predictions);
      } catch (err) {
        console.warn(err);
      }
    };

    const getPredictionByQueryInput = (query) => {
      // console.log('query in getPredictionByQueryInput',query);
      if (queryTimeoutRef && queryTimeoutRef.current) {
        clearTimeout(queryTimeoutRef.current);
      }

      queryTimeoutRef.current = setTimeout(() => {
        autoCompleteServiceRef.current.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: "my" },
          },
          onDisplaySuggestionResult
        );
      }, 1000);
    };
    if (!!search && search.length > 0) getPredictionByQueryInput(search);
    // console.log('search',search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]); // if onSearched is one of the dependencies of useEffect, the map will render infinitely

  // set map's center and zoom level when center position or zoom level changed
  useEffect(() => {
    // console.log(`set map's center and zoom level when center position or zoom level changed`)
    if (!centerPosition || !hasMapLoaded) return;
    
    mapRef.current?.setCenter(centerPosition);
    mapRef.current?.setZoom(focusZoomLevel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerPosition, focusZoomLevel]);

  // set the current location of user when first load
  // if user editing address, dont set
  useEffect(() => {
    // console.log('if user editing address, dont set. centerPosition',centerPosition, 'isEditingAddress', isEditingAddress)
    if (!centerPosition || !hasMapLoaded) return;
    if(isEditingAddress) return;
    // console.log('setting center for map. mapRef.current',mapRef.current)
    mapRef.current?.setCenter(centerPosition);
    mapRef.current?.setZoom(focusZoomLevel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMapLoaded, centerPosition, focusZoomLevel]);

  useEffect(() => {
    const initMap = () => {
      /* Init Google Map */
      if(!mapRef.current){
        const googlemaps = window.google.maps;
        const map = new googlemaps.Map(document.getElementById("map"), {
          // West Malaysia center by default
          center: initialCenterPosition || { lat: 3.1390, lng: 101.6869 },
          disableDefaultUI: true,
          gestureHandling: "greedy",
          zoom: initialCenterPosition ? focusZoomLevel : 18,
          clickableIcons: false
        });
        mapRef.current = map;
  
        // Init Geocoder
        const geocoder = new window.google.maps.Geocoder();
        geocoderRef.current = geocoder;
  
        /* Google Map Events */
        googlemaps.event.addListenerOnce(map, "tilesloaded", function () {
          setHasMapLoaded(true);
        });
  
        /* Embedding our component into google map view */
        const card = document.getElementById("search-control");
        map.controls[googlemaps.ControlPosition.TOP_CENTER].push(card);
  
        setMarkers(map, googlemaps, markers);
      }else{
        // not first render but need this block of code to set markers
        const map = mapRef.current; 
        const googlemaps = window.google.maps;
        setMarkers(map, googlemaps, markers);
      }
    };

    if (scriptHasLoaded) {
      initMap();

      // Init Services
      autoCompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
      placeServiceRef.current = new window.google.maps.places.PlacesService(
        document.getElementById("placeAttrId")
      );
    }else{
      // console.log('script has not loaded');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // dont need, these values will not be changed or their changes do not need to trigger initialisation of map
    scriptHasLoaded, markers
  ]);

  const onGetPositionSuccess = function (pos, map) {
    if (!currentPositionMarkerRef.current) {
      // console.log('first time enter here, currentPositionMarkerRef is null')
      if(noCurrLocationMarker) return;
      var markerImage = new window.google.maps.MarkerImage(
        BlueDotCirclePulsing,
        null,
        // The origin for my image is 0,0.
        new window.google.maps.Point(0, 0),
        // The center of the image is 50,50 (my image is a circle with 100,100)
        new window.google.maps.Point(30, 30)
      );

      var marker = new window.google.maps.Marker({
        position: { lat: pos.lat, lng: pos.lng },
        map: map,
        title: "Current Location",
        icon: markerImage,
        zIndex: 999,
      });

      currentPositionMarkerRef.current = marker;
    } else {
      // console.log('currentPositionMarkerRef exists')
      currentPositionMarkerRef.current.setPosition({
        lat: pos.lat,
        lng: pos.lng,
      });
    }

    // map.setCenter(pos);
  }

  const getLocationByHTML = (map) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const pos = {
            lat: +position.coords.latitude,
            lng: +position.coords.longitude,
          };
          onGetPositionSuccess(pos, map);
        },
        function () {
          pushAlertPopUp("Please enable GPS service");
        },
        getPositionOptions
      );
    } else {
      pushAlertPopUp(`Problem retrieving location. Please try again later`);
    }
  }

  // this will be called consistently to update user's location
  const updateCurrentUserLocationMarker = () => {
    if (!window.google?.maps) return;

    let map = mapRef.current;

    // Check if this browser supports HTML5 geolocation
    try{
      // eslint-disable-next-line no-undef
      my.getLocation({
        success: (res) => {
          const pos = {
            lat: parseFloat(res.latitude),
            lng: parseFloat(res.longitude)
          };
          onGetPositionSuccess(pos, map);
        },
        fail(res) {
          switch (res.error) {
            case "11":
              pushAlertPopUp(`Problem retrieving location. Please try again later`);
              break;
            case "12":
              pushAlertPopUp(`Problem connecting network, please try again`);
              break;
            case "13":
              pushAlertPopUp(`Problem retrieving location. Please try again later`);
              break;
            case "14":
              pushAlertPopUp(`Problem retrieving location. Please try again later`);
              break;
            default:
              break;
          }
          getLocationByHTML(map);
        },
      });
      return ;
    }catch(err){
      // console.log('tng SDK not available');
      getLocationByHTML(map);
    }
  };

  // used in InitMap
  const setMarkers = (map, googlemaps, stores) => {
    /* Make info window for current search location */
    const infowindow = new googlemaps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");
    let infoWindowWidth = document.getElementById("map").clientWidth - 50;
    if (infoWindowWidth > 600) infoWindowWidth = 600;

    infowindow.setOptions({
      minWidth: infoWindowWidth,
    });
    infowindow.setContent(infowindowContent);
    if(infoWindowRef) infoWindowRef.current = infowindow;

    // console.log('in set Markers, stores', stores);
    stores.map((m, idx) => {
      let coorMarker = new googlemaps.Marker({
        position: {
          lat: parseFloat(m.latitude),
          lng: parseFloat(m.longitude),
        },
        map: map,
        title: m.storeName,
        icon: markerIcon,
      });
      window.google.maps.event.addListener(coorMarker, "click", function () {
        // console.log('a marker clicked, whether trigger programmatically or by user gesture');
        infowindow.open(map, coorMarker);
        onMarkerCoordinatesClicked(m, idx);
      });

      markersRef.current.push(coorMarker);
      return null;
    });

    const marker = new googlemaps.Marker({
      map,
      anchorPoint: new googlemaps.Point(0, -29),
    });
    markerRef.current = marker;
  }
  
  // for filter in ViewMap
  const resetMarkers = (theMap, googlemaps, stores) => {
    const markers = markersRef.current;
    // console.log('reset Markers!', theMap);

    for (let i = 0; i < markers.length; i++) {
      if(stores.find(s => s.storeName === markers[i].getTitle())){
        markers[i].setVisible(true);
        markers[i].setClickable(true);
      }else{
        markers[i].setVisible(false);
        markers[i].setClickable(false);
      }
    }
  }

  // reset markers if marker coordinates changed
  useEffect(()=>{
    if(markerCoordinates.length !== 0 && scriptHasLoaded){
      const map = mapRef.current; 
      const googlemaps = window.google.maps;
      resetMarkers(map, googlemaps, markerCoordinates);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[markerCoordinates, scriptHasLoaded])

  // only used in OverlayAddressSelector
  // get placeId from autocomplete then use placeService to get details then mark it on map
  useEffect(() => {
    const getPlaceDetailAndMarkOnMap = (placeId) => {
      // console.log('getPlaceDetailAndMarkOnMap')

      const marker = markerRef.current;
      marker.setVisible(false);

      placeServiceRef.current.getDetails(
        {
          placeId,
        },
        (res, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            // console.log('res of getDetails', res);
            const geo = res.geometry,
              map = mapRef.current;

            if (!geo || !geo.location) {
              pushAlertPopUp(`Problem retrieving location. Please try again later`);
              return;
            }

            // If this place has a viewport definition, set it on map.
            triggerZoomChangedRef.current = false;
            if (geo.viewport) {
              mapRef.current.fitBounds(geo.viewport);
              map.setCenter(geo.viewport.getCenter());
            } else {
              // console.log('set center and set zoom');
              map.setCenter(geo.location);
              // map.setZoom(10);
            }

            marker.setPosition(geo.location);
            marker.setVisible(!drawCenterIcon);
            // else {
            //   if (!!centerMarkerRef.current) {
            //     centerMarkerRef.current.setPosition(geo.location);
            //     centerMarkerRef.current.setVisible(true);
            //   }
            // }
            // console.log('setSelectedPlace to response of PlacesService.getDetails')
            const currentPosition = geo.location;
            setAddressDetail({
              ...addressDetail,
              place: res,
              latitude: currentPosition.lat(),
              longitude: currentPosition.lng(),
            });
          } else {
            pushAlertPopUp("Please enable GPS service");
          }
        }
      );
    };
    if (!hasMapLoaded || !overridePlaceId) return;
    getPlaceDetailAndMarkOnMap(overridePlaceId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawCenterIcon, hasMapLoaded, overridePlaceId]);

  // update user location consistently if showCurrentUserLocation === true && user enabled location service
  useEffect(() => {
    if (!hasMapLoaded || !mapRef.current || !showCurrentUserLocation || !userEnabledLocation) return;

    updateCurrentUserLocationMarker();
    currentLocationUpdateIntervalRef.current = setInterval(
      updateCurrentUserLocationMarker,
      2000
    );

    return () => {
      clearInterval(currentLocationUpdateIntervalRef.current);
      currentPositionMarkerRef.current?.setMap(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMapLoaded, showCurrentUserLocation, userEnabledLocation]);

  // inform user if api key is null
  useEffect(() => {
    if (!apiKey) {
      pushAlertPopUp("Google Service not available, please contact app developer");
    }
  }, [apiKey, pushAlertPopUp]);

  // let GMap click the marker when the active marker index changed
  useEffect(() => {
    if (!hasMapLoaded || activeMarkerIndex === undefined) return;
    // console.log('active marker index changed to', activeMarkerIndex);
    // console.log('active marker changed to', markersRef.current[activeMarkerIndex]);
    window.google.maps.event.trigger(
      markersRef.current[activeMarkerIndex],
      "click"
    );
  }, [hasMapLoaded, activeMarkerIndex, updateActiveMarkerIndex]);

  // Register custom events
  useEffect(() => {
    if (!hasMapLoaded || !geocoderRef.current) return;

    const googleMapsEvent = window.google.maps.event;

    onMapEvents.map((e) => {
      const callOnce = !!e[2] && e[2] === "once";
      let listenerSwitch = "addListener";

      if (callOnce) listenerSwitch = "addListenerOnce";

      googleMapsEvent[listenerSwitch](mapRef.current, e[0], () => {
        e[1](mapRef.current, geocoderRef.current);
      });
      return null;
    });

    return () => {
      /* Remove custom events */
      onMapEvents.map((e) => {
        googleMapsEvent.removeListener(mapRef.current, e[0], () => {
          e[1](mapRef.current, geocoderRef.current);
        });
        return null;
      });
    };
  }, [hasMapLoaded, onMapEvents]);

  // useEffect(() => {
  //   if (!hasMapLoaded)
  //     return;

  //   const map = mapRef.current;

  //   if (drawCenterIcon) {
  //     const centerMarker = new window.google.maps.Marker({
  //       position: { lat: map.center.lat(), lng: map.center.lng() },
  //       map,
  //     });
  //     centerMarker.setVisible(true);

  //     centerMarkerRef.current = centerMarker;
  //   }
  // }, [mapRef.current, hasMapLoaded, drawCenterIcon])

  return (
    <div>
      <div className={classes.mapHolder}>
        <div className={classes.mapOverlay}>
          <div id="infowindow-content">{markerInfoContent}</div>
        </div>
        <div id="map" className={classes.map} />
        <div id="placeAttrId" />
      </div>
    </div>
  );
};

GoogleMap.displayName = "Google Map Component";
GoogleMap.propTypes = {
  apiKey: PropTypes.string.isRequired,
};

export { GoogleMap };
