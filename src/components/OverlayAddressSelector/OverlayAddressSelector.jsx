import React, { useState } from "react";
import { OverlayPageLayout } from "@Common/PageLayout/OverlayPageLayout";
import { Header } from "@Common/Header/Header";
import { BackButton } from "@Common/BackButton/BackButton";
import { PageHeader } from "@Common/PageHeader/PageHeader";
import { GoogleMap } from "@Common/Map/GoogleMap";
import { makeStyles, Paper, Chip, Box, Card, CardContent, TextField, IconButton, lighten, InputBase, Button, Typography, List, ListItem } from "@material-ui/core";
import { config } from "src/constants/config";
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import useViewPortSize from "@Hook/useViewPortSize";
import { useStoreContext } from "@Context/StoreContext";
import { useMemo } from "react";
import { useEffect } from "react";
import { getUserCurrentLocation } from "@Util/map";
import { useRef } from "react";
import { useOnClickOutside } from "@Hook/useOnClickOutside";
import ClearIcon from '@material-ui/icons/Clear';
import { useTheme } from '@material-ui/styles';
import { useAlertContext } from '@Context/AlertContext';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    paddingTop: '1rem'
  },
  filterBar: {
    height: (props) => props.step === 1 ? "0px" : "44px",
    opacity: (props) => props.step === 1 ? 0 : 1,
    padding: '0 4px',
    margin: '0 auto',
    boxSizing: "border-box",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: "96%",
    backgroundColor: `${lighten(theme.palette.primary.light, 0.75)}`,
    border: 0,
    transition: "height 0.18s ease, opacity 0.15s ease",
  },
  addressSearchInput: {
    marginLeft: theme.spacing(1),
    width: "100%",
  },
  iconButton: {
    textAlign: "right",
    padding: '10px 6px',
  },
  bottomSection: {
    position: "fixed",
    display: "flex",
    bottom: 10,
    marginLeft: -6, //offset overlay padding
    width: "100%",
    justifyContent: "center"
  },
  bottomSectionActionButton: {
    padding: '1rem 1.5rem',
    borderRadius: '2rem',
    width: '100%',
    fontWeight: theme.typography.platformFontWeight,
    fontSize: "0.8rem"
  },
  card: {
    width: '90%',
    padding: 0,
    position: 'relative',
    borderRadius: '1rem',
    marginBottom: '2rem'
  },
  fieldInput: {
    color: theme.palette.customGrey.dark,
    '&::placeholder': { /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: theme.palette.customGrey.dark,
      opacity: 1 /* Firefox */
    },
    fontSize: "0.8rem"
  },
  chips: {
    width: "95%",
    margin: "0 auto",
    justifyContent: "space-between"
  },
  chipLabel: {
    flex: "0 0 32%",
    textTransform: "uppercase",
    minWidth: 0,
    fontSize: "0.8rem",
    "& > span": {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  },
  labelAs: {
    marginLeft: theme.spacing(1),
    paddingBottom: "0.5rem",
    fontWeight: theme.typography.platformFontWeight,
    fontSize: "0.8rem"
  },
  selectedAddressField: {
    display: 'flex',
    borderRadius: '0.5rem',
    backgroundColor: `${theme.palette.primary.lighter}`,
    alignItems: 'center',
    marginTop: '1rem',
    padding: '0.75rem 0.75rem'
  },
  placeholder: {
    flex: 1,
    color: theme.palette.customGrey.dark
  },
  editButton: {
    flex: '0 0 2rem',
    display: 'inline-block',
    textTransform: "none",
    textAlign: "right"
  },
  predictionItems: {
    position: "absolute",
    display: "block",
    width: "100%",
    zIndex: 1,
    top: "60px",
    backgroundColor: "white",
  },
  predictionItem: {
    "&:not(:last-child)": {
      borderBottom: "1px solid lightgrey",
    }
  },
  bold: {
    fontWeight: theme.typography.platformFontWeight,
  },
}));

const outerMapHeight = 120;

const TypeLabels = ["HOME", "WORK", "OTHER"];

const OverlayAddressSelector = ({
  title = "Select Address",
  defaultAddress = {
    address: "",
    address2: "",
    notes: "",
    title: "HOME",
    place: undefined,
  },
  onBackButtonClicked,
  onUseAddressClicked: propOnUseAddressClicked = (addr) => { },
  isEditingAddress = false,
}) => {
  const theme = useTheme();
  const searchAreaRef = useRef(null);
  const geocodingTimeoutRef = useRef(null);
  const triggerZoomChangedRef = useRef(true);
  const [askedUserConsent, setAskedUserConsent] = useState(false);
  const { userEnabledLocation, setUserEnabledLocation, userLocation, setUserLocation } = useStoreContext();
  const { pushAlertPopUp } = useAlertContext();

  const [, vpHeight] = useViewPortSize();
  const mapHeight = vpHeight - outerMapHeight;
  const defaultAddressAvailable = !!defaultAddress.latitude;
  const [step, setStep] = useState(0);
  const [selectedChipLabel, setSelectedChipLabel] = useState(TypeLabels.findIndex(l => l.toLowerCase() === defaultAddress?.title?.toLowerCase()) || 0);
  const [addressSearch, setAddressSearch] = useState(defaultAddressAvailable ? defaultAddress.address : "");
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictions, setPredictions] = useState([]);      // this predictions contributed by Google API
  const [selectedPlace, setSelectedPlace] = useState(undefined);
  const [addressDetail, setAddressDetail] = useState(defaultAddress);
  // const [selectedPrediction, setSelectedPrediction] = useState(null);

  useOnClickOutside(searchAreaRef, () => setShowPredictions(false));

  const classes = useStyles({
    step,
    mapHeight
  });

  const onNextClicked = () => {
    setStep((s) => s + 1);
  }

  const onAddressSearchChange = (event) => {
    setAddressSearch(event.target.value);
  }

  const handleChange = (event) => {
    setAddressDetail((addrDtl) => ({ ...addrDtl, [event.target.name]: event.target.checked || event.target.value }));
  };

  const onChipLabelClicked = (index) => () => {
    setSelectedChipLabel((cur) => cur !== index ? index : cur)
    setAddressDetail((addrDtl) => ({ ...addrDtl, title: TypeLabels[index] }));
  }

  // Final decide which address to use for delivery
  const onUseAddressClicked = () => {
    // console.log("onUseAddressClicked: ", addressDetail)
    propOnUseAddressClicked(addressDetail);
  }

  const onSearched = (predictions) => {
    setPredictions(predictions);
  }

  const togglePredictionListVisible = (toggle) => () => {
    setShowPredictions(true);
  }

  const onSelectPredictionListItem = (place) => (event, removeSelectedPrediction) => {
    // console.log('in onSelectPredictionListItem, place',place);

    setAddressSearch(place.description);
    setAddressDetail((curAddress) => ({
      ...curAddress,
      address: place.description,
      place
    }));

    setSelectedPlace(place);  // trigger placeServiceRef.current.getDetails
    setShowPredictions(false);
  }

  // same method in FavouriteAddresses
  const getAddressByGeocodeLatLng = (geocoder, lat, lng) => {
    const latlng = { lat, lng };

    return geocoder
      .geocode({ location: latlng })
      .then((response) => {
        return response.results[0] || null;
      })
      .catch((err) => {
        pushAlertPopUp(`Problem connecting to server. Please try again later`);
        console.warn("Geocoder failed due to: " + err);
        return null;
      });
  }

  // set addressDetails after get user location based on center of map
  const assignAddress = (place) => {
    // console.log('in assignAddress, place',place)
    setAddressSearch(place.formatted_address);
    setAddressDetail((curAddress) => ({
      ...curAddress,
      address: place.formatted_address,
      place
    }));
    setSelectedPlace(null);
  }
  // set addressDetails.place after get user location based on center of map
  const assignAddressPlace = (place) => {
    // console.log('in assignAddressPlace, place',place)
    setAddressDetail((curAddress) => ({
      ...curAddress,
      place
    }));
  }

  // when user idle on map, set center as selected address
  const mapEventRegistries = useMemo(() => {
    const startReverseGeocoding = (map, geocoder) => {
      const mapCenterLat = map.center.lat();
      const mapCenterLng = map.center.lng();

      clearTimeout(geocodingTimeoutRef.current);
      geocodingTimeoutRef.current = setTimeout(() =>
        getAddressByGeocodeLatLng(geocoder, mapCenterLat, mapCenterLng)
          .then(assignAddress), 500);
    }
    const startReverseGeocodingAndAssignPlace = (map, geocoder) => {
      const mapCenterLat = map.center.lat();
      const mapCenterLng = map.center.lng();

      clearTimeout(geocodingTimeoutRef.current);
      geocodingTimeoutRef.current = setTimeout(() =>
        getAddressByGeocodeLatLng(geocoder, mapCenterLat, mapCenterLng)
          .then(assignAddressPlace), 500);
    }
    return [
      ['idle', (map, geocoder) => {
        // if(!isEditingAddress){
        // console.log('idle');
        startReverseGeocoding(map, geocoder);
        // }
      }, "once"],
      ['dragend', (map, geocoder) => {
        // console.log('dragend');
        startReverseGeocoding(map, geocoder);
      }],
      // ['zoom_changed', (map, geocoder) => {
      ['zoom_changed ', (map, geocoder) => {
        // console.log('zoom_changed');
        // console.log('bounds_changed ');
        // console.log('triggerZoomChangedRef.current',triggerZoomChangedRef.current);
        if (triggerZoomChangedRef.current) {
          startReverseGeocoding(map, geocoder);
        } else {
          startReverseGeocodingAndAssignPlace(map, geocoder);
          triggerZoomChangedRef.current = true;
        }
      }],
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set user location when user position changed
  useEffect(() => {
    if (!!addressDetail.place) {
      setAskedUserConsent(true);
      return;
    }

    getUserCurrentLocation((pos) => {
      const formattedPos = { lat: parseFloat(pos.lat), lng: parseFloat(pos.lng) };
      setUserLocation(formattedPos);
      setAskedUserConsent(true);
      setUserEnabledLocation(true);
      // onFailedGettingUserLocation and onNotAgreedSharing
      // if user didnt agree, let the app know we have asked them 
    }, () => setAskedUserConsent(true), () => setAskedUserConsent(true), pushAlertPopUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressDetail.place])

  // console.log('selectedPlace on render',selectedPlace)
  // console.log('addressDetail on render',addressDetail)

  return (
    <OverlayPageLayout
      header={
        <Header
          leftSlot={<BackButton onBackClicked={onBackButtonClicked} />}
          centerSlot={<PageHeader>{title}</PageHeader>}
        />
      }
      body={
        !askedUserConsent
          ?
          <div></div>
          :
          <div className={classes.root}>
            <div ref={searchAreaRef}>
              <Box flexShrink={0} flexGrow={1}>
                <Paper elevation={0} component="div" className={classes.filterBar}>
                  <IconButton type="submit" className={classes.iconButton} aria-label="search">
                    <LocationSearchingIcon color={userEnabledLocation ? "primary" : undefined} />
                  </IconButton>
                  <InputBase
                    className={classes.addressSearchInput}
                    placeholder="e.g. Name, Location"
                    name="address"
                    inputProps={{ 'aria-label': 'search store' }}
                    onChange={onAddressSearchChange}
                    value={addressSearch}
                    onFocus={togglePredictionListVisible(true)}
                    autoComplete={"off"}
                  />
                  <IconButton onClick={() => { setAddressSearch('') }} className={classes.iconButton} aria-label="search">
                    {addressSearch.length > 0 ?
                      <ClearIcon color="primary" />
                      : null}
                  </IconButton>
                </Paper>
              </Box>
              {
                showPredictions && predictions.length > 0
                &&
                <List className={classes.predictionItems}>
                  {
                    predictions.map((prediction, i) => (
                      <ListItem
                        className={classes.predictionItem}
                        key={prediction.place_id}
                        onClick={onSelectPredictionListItem(prediction)}
                      >
                        {prediction.description}
                      </ListItem>
                    ))
                  }
                </List>
              }
            </div>
            <GoogleMap
              height={step === 0 ? mapHeight : mapHeight / 2}
              apiKey={config.googleMapKey}
              showCurrentUserLocation
              // if no default address, use userLocation
              initialCenterPosition={defaultAddressAvailable ? { lat: parseFloat(defaultAddress.latitude), lng: parseFloat(defaultAddress.longitude) } : userLocation}
              centerPosition={userLocation}
              overridePlaceId={selectedPlace?.place_id || defaultAddress.place?.place_id}
              search={addressSearch}
              focusZoomLevel={18}
              onSearched={onSearched}
              onMapEvents={mapEventRegistries}
              drawCenterIcon
              triggerZoomChangedRef={triggerZoomChangedRef}
              noCurrLocationMarker={true}
              isEditingAddress={isEditingAddress}
              addressDetail={addressDetail}
              setAddressDetail={setAddressDetail}
            />
            <div className={classes.bottomSection}>
              {
                step === 0
                  ?
                  <Button
                    className={classes.bottomSectionActionButton}
                    variant="contained" color="primary"
                    style={{ width: "70%", marginBottom: 50 }}
                    disabled={!addressDetail.address}
                    onClick={onNextClicked}
                  >
                    NEXT
                  </Button>
                  :
                  <Card className={classes.card}>
                    <CardContent>
                      <div className={classes.selectedAddressField}>
                        <Typography variant="body2" className={classes.placeholder}>
                          {addressDetail.address}
                        </Typography>
                        <Button className={classes.editButton} color="primary" size="small" onClick={() => setStep(0)}>Edit</Button>
                      </div>
                      <TextField
                        label="Floor/Unit"
                        style={{ margin: 8 }}
                        fullWidth
                        name="address2"
                        onChange={handleChange}
                        placeholder={"Floor/Unit"}
                        margin="normal"
                        autoComplete="off"
                        InputLabelProps={{
                          shrink: true,
                          classes: {
                            root: classes.bold,
                          }
                        }}
                        inputProps={{ 'aria-label': 'enter floor/unit', className: clsx(classes.fieldInput) }}
                        value={addressDetail.address2}
                      />
                      <TextField
                        label="Note to rider"
                        style={{ margin: 8 }}
                        fullWidth
                        name="notes"
                        onChange={handleChange}
                        placeholder={"e.g. landmark/building"}
                        margin="normal"
                        InputLabelProps={{
                          shrink: true,
                          classes: {
                            root: classes.bold,
                          }
                        }}
                        autoComplete="off"
                        inputProps={{ 'aria-label': 'enter note to rider', className: clsx(classes.fieldInput) }}
                        value={addressDetail.notes}
                      />
                      <Typography className={clsx(classes.labelAs, classes.bold)} color="textSecondary">Label as</Typography>
                      <Box className={classes.chips} display="flex" justifyContent="space-between">
                        {
                          TypeLabels.map((type, i) => (
                            <Chip
                              className={classes.chipLabel}
                              component="button"
                              label={type}
                              variant={"outlined"}
                              onClick={onChipLabelClicked(i)}
                              color={selectedChipLabel === i ? "primary" : "default"}
                              style={{ color: `${selectedChipLabel === i ? "primary" : theme.palette.customGrey.light}` }}
                            />
                          ))
                        }
                      </Box>
                      <br />
                      <Button
                        className={classes.bottomSectionActionButton}
                        variant="contained" color="primary" style={{ width: "90%", transform: "translateX(5%)" }}
                        onClick={onUseAddressClicked}>USE THIS ADDRESS</Button>
                    </CardContent>
                  </Card>
              }
            </div>
          </div>
      }
    />
  )
}

export { OverlayAddressSelector }