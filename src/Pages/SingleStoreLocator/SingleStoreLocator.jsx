import React, { useState } from "react";
import { GoogleMap } from "@Common/Map/GoogleMap";
import { Box, Chip, makeStyles, Typography } from "@material-ui/core";
import grey from "@material-ui/core/colors/grey";
import { NavigationModal } from "@Common/NavigationModal/NavigationModal";
import useViewPortSize from "@Hook/useViewPortSize";
import { config } from "src/constants/config";
import { useParams, useHistory } from "react-router-dom";
import { PageLayout } from "@Common/PageLayout";
import { Header } from "@Common/Header";
import { PageHeader } from '@Common/PageHeader/PageHeader';
import { BackButton } from '@Common/BackButton/BackButton';
import { useStoreContext } from "@Context/StoreContext";
import pickUpSVG from '@Assets/svgs/pickup.svg';
import deliverySVG from '@Assets/svgs/delivery.svg';
import seatingArea from '@Assets/svgs/SeatingArea.svg'
import { routes } from "src/constants/routes.constant";
import { Loader } from "@Common/Loader";

const outerMapHeight = 250;

const useStyles = makeStyles((theme) => ({
  root: {
    overflowY: "hidden",
    paddingTop: 16
  },
  mapViewSection: {
    position: "relative",
  },
  chipLabel: {
    position: "absolute",
    background: "white !important",
    bottom: 20,
    right: 20,
    width: 120,
    textTransform: "uppercase",
    minWidth: 0,
    fontSize: "0.6rem",
    "& > span": {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  },
  disabledChipLabel: {
    borderColor: grey[800],
    color: grey[600]
  },
  storeLabel: {
    fontSize: "0.8rem",
    fontWeight: theme.typography.platformFontWeight,
    paddingBottom: 6,
    color: theme.palette.text.secondary
  },
  storeAddress: {
    fontSize: "0.8rem",
    paddingBottom: 6,
    color: theme.palette.text.secondary
  },
  operationHourText: {
    fontSize: '0.8rem',
    lineHeight: "1.4rem",
    color: theme.palette.text.secondary
  },
  distanceText: {
    fontSize: "0.8rem",
    fontWeight: theme.typography.platformFontWeight,
  },
  
  storeListItemIcon: {
    width: 18,
    height: 18,
    paddingRight: 8,
    verticalAlign: "top"
  },
  seatingArea: {
    flex: "0 0 75px",
    paddingBottom: 2,
    textAlign: "center"
  },
  seatingAreaText: {
    fontSize: "0.8rem"
  },
  markerAddress: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }
}));

const SingleStoreLocator = () => {

  let { id } = useParams();
  const history = useHistory();

  const { stores } = useStoreContext();
  const [isNavigationModalOpened, setIsOpenNavigationModalOpened] = useState(false);
  const [, vpHeight] = useViewPortSize();

  const mapHeight = vpHeight - outerMapHeight;
  const classes = useStyles({
    mapHeight
  });

  const openNavigationModal = () => {
    setIsOpenNavigationModalOpened(true);
  }

  const selectedStore = stores.find(s => s.storeId === id);
  // if user go to GMap external page then back, no store selected
  if(!selectedStore){
    history.push(routes.storeLocator);
    return <Loader/>;
  }
  let { storeName, storeOperatingHours: storeOperationHour, ecomOperatingHours: deliveryOperationHour, address } = selectedStore;

  const markerContent = (
    <Box display="flex" alignItems="center">
      <div style={{flex: "0 0 40px", textAlign: "center"}}>
        <img width={30} height={30} src='https://www.familymart.com.my/img/marker2.png' alt={'FamilyMart Marker'}/>
      </div>
      <div className={classes.markerAddress} style={{flex: "1 1 auto"}}>
        <div><Typography className={classes.markerAddress} component="h5">{storeName}</Typography></div>
      </div>
    </Box>
  );
  return (
    <PageLayout
      header={
      <Header
        leftSlot={<BackButton />}
        centerSlot={<PageHeader>Store Locator</PageHeader>}
      />}
      body={
        <div className={classes.root}>
          <div className={classes.mapViewSection}>
            <GoogleMap 
              apiKey={config.googleMapKey}
              height={mapHeight} 
              initialCenterPosition={{ lat: parseFloat(selectedStore.latitude), lng: parseFloat(selectedStore.longitude) }} 
              centerPosition={{ 
                lat: parseFloat(selectedStore.latitude), 
                lng: parseFloat(selectedStore.longitude) }} 
              focusZoomLevel={15}
              markers={[{ 
                latitude: parseFloat(selectedStore.latitude), 
                longitude: parseFloat(selectedStore.longitude),
                storeName: selectedStore.storeName
              }]}
              markerIcon={'https://www.familymart.com.my/img/marker2.png'}
              markerInfoContent={markerContent}
              />
            <Chip
              className={classes.chipLabel}
              classes={{ disabled: classes.disabledChipLabel }}
              label={"Take Me There"}
              variant={"outlined"}
              onClick={openNavigationModal}
              color="primary"
            />
          </div>
          <br />
          <Box display="flex" alignItems="flex-end" justifyContent="space-between">
            <div style={{paddingRight: 12}}>
              <Typography className={classes.storeLabel} gutterBottom variant="h2">{storeName}</Typography>
              <Typography className={classes.storeAddress} gutterBottom variant="h2">{address}</Typography>
              <div>
                <Typography className={classes.operationHourText} variant="body1">
                <img src={pickUpSVG} alt='Pickup}' className={classes.storeListItemIcon} />  {storeOperationHour}
                </Typography>
              </div>
              <div>
                <Typography className={classes.operationHourText} variant="body1">
                  <img src={deliverySVG} alt='delivery' className={classes.storeListItemIcon} />  {deliveryOperationHour}
                </Typography>
              </div>
            </div>
            <div className={classes.seatingArea}>
              {/* <WeekendTwoToneIcon /> */}
              <img src={seatingArea} alt='Seating Area' className={classes.storeListItemIcon} />
              <Typography color="primary" component="div" className={classes.seatingAreaText}>Seating Area</Typography>
            </div>
          </Box>
          <NavigationModal
            title={storeName}
            open={isNavigationModalOpened}
            onClose={() => setIsOpenNavigationModalOpened(false)}
            selectedLocation={selectedStore}
          />
        </div>
      }
      footer={(null)}
    />
  )
}

export { SingleStoreLocator };