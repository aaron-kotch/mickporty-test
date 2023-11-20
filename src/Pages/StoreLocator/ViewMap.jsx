import React, { useMemo, useState, useRef } from "react";
import { GoogleMap } from "@Common/Map/GoogleMap";
import { Box, Chip, IconButton, List, ListItem, makeStyles, Typography } from "@material-ui/core";
import grey from "@material-ui/core/colors/grey";
import { NavigationModal } from "@Common/NavigationModal/NavigationModal";
import useViewPortSize from "@Hook/useViewPortSize";
import { config } from "src/constants/config";
import { CommonStoreList } from "@Common/CommonStoreList";
import { useEffect } from "react";
import { useStoreContext } from "@Context/StoreContext";
import { getUserCurrentLocation } from "@Util/map";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import clsx from "clsx";
import { useAlertContext } from '@Context/AlertContext';

const outerMapHeight = 265;

const useStyles = makeStyles((theme) => ({
  root: {
    overflowY: "hidden",
  },
  mapViewSection: {
    position: "relative",
  },
  filterLabel: {
    fontSize: "11px",
    justifyContent: "center"
  },
  chipLabel: {
    flex: "0 0 32%",
    textTransform: "uppercase",
    minWidth: 0,
    fontSize: "11px",

    "& > span": {
      paddingLeft: '0px',
      paddingRight: '0px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',

    },

    marginTop: '-15px',
    [theme.breakpoints.down('346')]: {
      fontSize: "9.8px",
    },
    [theme.breakpoints.down('313')]: {
      fontSize: "9px",
    },
    [theme.breakpoints.down('290')]: {
      fontSize: "8.5px",
    },
    [theme.breakpoints.down('276')]: {
      fontSize: "8px",
    },

  },
  disabledChipLabel: {
    borderColor: grey[300],
    color: 'black',
    opacity: '0.5 !important',
  },
  overlayStoreSection: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "#F8FEFF",
    maxHeight: props => `calc(${props.mapHeight / 2}px )`,
    overflowY: "auto",
    width: "calc(100% - 12px)",
    background: "white",
    borderRadius: 12
  },
  overlayFilterSection: {
    position: "absolute",
    bottom: -10,
    left: "calc(50% - 50px)", // Minus half width
    width: 100,
    background: "white",
    borderRadius: 8,
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    boxShadow: `0 0 5px ${grey[300]}`,
  },
  filterListItem: {
    display: "block",
    textAlign: "center",
    justifyContent: "center"
  },
  markerAddress: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  textPrimary: {
    color: theme.palette.primary.main
  },
  alignItemsCenter: {
    alignItems: 'center',
    borderRadius: '8px',
    marginBottom: '6px',
    padding: '0px',
    border: '1px solid'
  },
  filterBottomBorder: {
    borderBottom: '1px solid'
  }
}));

const ViewMap = () => {

  const { stores, nearbyStores, userLocation, userEnabledLocation, setUserEnabledLocation, setUserLocation } = useStoreContext();
  const { pushAlertPopUp } = useAlertContext();

  const [isGettingUserLocation, setIsGettingUserLocation] = useState(true);
  const [selectedChipLabel, setSelectedChipLabel] = useState(undefined);
  const [selectedLocation, setSelectedLocation] = useState(undefined);
  const [isNavigationModalOpened, setIsOpenNavigationModalOpened] = useState(false);
  const [markerContent, setMarkerContent] = useState(<div />);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(undefined);
  const [markers, setMarkers] = useState(stores);
  const [filters, setFilters] = useState([]);
  const [updateActiveMarkerIndex, setUpdateActiveMarkerIndex] = useState(0);
  const infoWindowRef = useRef(null);
  const [chipSelected, setChipSelected] = useState(false);

  // get user location on first render
  useEffect(() => {

    function onRetrievedPosition(pos) {
      // alert(JSON.stringify(pos))
      const formattedPos = { lat: parseFloat(pos.lat), lng: parseFloat(pos.lng) }
      setUserLocation(formattedPos);
      setIsGettingUserLocation(false);
      setUserEnabledLocation(true);
    }

    // stop loading if not able to get user location e.g. users deny to share location
    const turnOffLoader = () => setIsGettingUserLocation(false);

    getUserCurrentLocation(onRetrievedPosition, turnOffLoader, turnOffLoader, pushAlertPopUp);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setMarkers(stores);
  }, [stores])

  const openNavigationModal = () => {
    setIsOpenNavigationModalOpened(true);
  }

  const onInfoButtonClicked = (store) => {
    setSelectedLocation(store);
    setIsOpenNavigationModalOpened(true);
  }

  const setMarkerInfoContent = (markerStore, storeIndexInMarkers) => {
    const store = stores.find(s => s.storeId === markerStore.storeId);
    setActiveMarkerIndex(storeIndexInMarkers);
    setSelectedLocation(markerStore);
    setMarkerContent(
      <Box display="flex" alignItems="center">
        <div style={{ flex: "0 0 40px", textAlign: "center" }}>
          <img width={30} height={30} src='https://www.familymart.com.my/img/marker2.png' alt={'FamilyMart marker'} />
        </div>
        <div className={classes.markerAddress} style={{ flex: "1 1 auto" }}>
          <div><Typography className={classes.markerAddress} component="h5">{store.storeName}</Typography></div>
          <div><Typography className={classes.markerAddress} variant="body1">{store.address}</Typography></div>
        </div>
        <div style={{ flex: "0 0 40px", textAlign: "center" }}>
          <IconButton onClick={() => onInfoButtonClicked(store)}>
            <InfoOutlinedIcon color={"primary"} />
          </IconButton>
        </div>
      </Box>
    )
  }

  const [, vpHeight] = useViewPortSize();

  const onChipLabelClicked = (index) => () => {
    if (index === 0 && !userEnabledLocation) {
      pushAlertPopUp("Please enable GPS service.");
      return;
    }
    if (chipSelected && selectedChipLabel === index) {
      // console.log('ady selected this chip dah');
      setChipSelected(() => false);
    } else if (chipSelected && selectedChipLabel !== index) {
      setSelectedChipLabel(index);
    } else {
      // console.log('chip selected, selectedChipLabel',index);
      setSelectedChipLabel(selectedChipLabel !== index ? index : selectedChipLabel);
      setChipSelected(() => true);
    }
  }

  const mapHeight = vpHeight - outerMapHeight;
  const classes = useStyles({
    mapHeight
  });

  const renderView = useMemo(() => {
    const onStoreLocationListItemClicked = (store) => () => {
      setSelectedLocation(store);
      setSelectedChipLabel(undefined);
      let activeIndex = stores.findIndex(s => s.storeId === store.storeId);
      setActiveMarkerIndex(activeIndex);
      setUpdateActiveMarkerIndex(updateActiveMarkerIndex + 1);
    }
    const texts = ['24 Hours', 'Seating Area'];
    const filterStores = (text) => {
      infoWindowRef.current.close();  // close the infowindow
      const currentIndex = filters.indexOf(text);
      const newFilters = [...filters];

      if (currentIndex === -1) {
        newFilters.push(text);
      } else {
        newFilters.splice(currentIndex, 1);
      }
      setFilters(newFilters);

      // filter the stores based on hasSeatingArea isOnline24Hour
      const filteredStores = stores.filter(s => {
        // check for isOnline24Hour && hasSeatingArea
        if (newFilters.indexOf(texts[0]) !== -1 && newFilters.indexOf(texts[1]) !== -1) {
          if (s.isOnline24Hour && s.hasSeatingArea) {
            return true;
          }
        } else {
          // check for isOnline24Hour
          if (newFilters.indexOf(texts[0]) !== -1) {
            if (s.isOnline24Hour === true) {
              return s.isOnline24Hour;
            }
          }
          // check for hasSeatingArea
          if (newFilters.indexOf(texts[1]) !== -1) {
            if (s.hasSeatingArea === true) {
              return s.hasSeatingArea;
            }
          }
        }
        return false;
      });
      if (filteredStores.length !== 0) {
        setMarkers(filteredStores);
      } else {
        // both option not chosen
        setMarkers(stores);
      }
    }
    if (chipSelected) {
      // console.log('in view chip selected, selectedChipLabel',selectedChipLabel);
    } else {
      // console.log('in view ady selected chip dah');
      return null;
    }
    switch (selectedChipLabel) {
      case 0:
        return (
          <div className={classes.overlayStoreSection}>
            <CommonStoreList storeListItems={nearbyStores} onItemClicked={onStoreLocationListItemClicked} />
          </div>
        )

      case 1:
        return (
          <div className={classes.overlayFilterSection}>
            <List dense className={classes.alignItemsCenter}>
              <ListItem button className={clsx(classes.filterListItem, classes.filterBottomBorder)} >
                <Typography className={clsx({ [classes.textPrimary]: filters.indexOf('24 Hours') !== -1 }, classes.filterLabel)} onClick={() => filterStores('24 Hours')}>{'24 Hours'}</Typography>
              </ListItem>
              <ListItem button className={classes.filterListItem} >
                <Typography className={clsx({ [classes.textPrimary]: filters.indexOf('Seating Area') !== -1 }, classes.filterLabel)} onClick={() => filterStores('Seating Area')}>{'Seating Area'}</Typography>
              </ListItem>
            </List>
          </div>
        )

      default:
        return (null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, nearbyStores, stores, selectedChipLabel, chipSelected])

  if (isGettingUserLocation)
    return <div></div>

  return (
    <div className={classes.root}>
      <div className={classes.mapViewSection}>
        <GoogleMap
          apiKey={config.googleMapKey}
          height={mapHeight}
          initialCenterPosition={userLocation}
          centerPosition={userLocation}
          focusZoomLevel={14}
          markers={stores}
          changeableMarkers={markers}
          markerInfoContent={markerContent}
          markerIcon={'https://www.familymart.com.my/img/marker2.png'}
          activeMarkerIndex={activeMarkerIndex}
          updateActiveMarkerIndex={updateActiveMarkerIndex}
          showCurrentUserLocation
          onMarkerClicked={setMarkerInfoContent}
          infoWindowRef={infoWindowRef}
        />
        {renderView}
      </div>
      <br />
      <Box display="flex" justifyContent="space-between">
        <Chip
          className={classes.chipLabel}
          component="button"
          label={"Stores Near Me"}
          variant={selectedChipLabel === 0 ? "default" : "outlined"}
          onClick={onChipLabelClicked(0)}
          color="primary" />
        <Chip
          className={classes.chipLabel}
          label={"Filter"}
          variant={selectedChipLabel === 1 ? "default" : "outlined"}
          onClick={onChipLabelClicked(1)}
          color="primary" />
        <Chip
          className={classes.chipLabel}
          classes={{ disabled: classes.disabledChipLabel }}
          label={"Take Me There"}
          disabled={!selectedLocation}
          variant={selectedChipLabel === 2 ? "default" : "outlined"}
          onClick={openNavigationModal}
          color="primary" />
      </Box>
      <NavigationModal
        title={selectedLocation?.storeName}
        open={isNavigationModalOpened}
        onClose={() => setIsOpenNavigationModalOpened(false)}
        selectedLocation={selectedLocation}
      />
    </div>
  )
}

export { ViewMap };