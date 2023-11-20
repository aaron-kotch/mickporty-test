import React, { useState, useEffect, useRef } from "react";
import { Card, Box, Typography, Button } from "@material-ui/core";
import { Modal } from "@Common/Modal";
import { makeStyles, lighten } from "@material-ui/core/styles";
import clsx from "clsx";
import useViewPortSize from "@Hook/useViewPortSize";
import { SelectAddressRadioControl } from "@Common/NewAddressList/SelectAddressRadioControl";
import { NearbyStoreModal } from "@Common/NewAddressList/NearbyStoreModal";
import { OverlayAddressSelector } from "@View/OverlayAddressSelector/OverlayAddressSelector";
import { NearbyStoreList } from "@Common/NearbyStoreList";
import { useAddressContext } from "@Context/AddressContext";
import { useStoreContext } from "@Context/StoreContext";
import { useCartContext, ShoppingType } from "@Context/CartContext";
import pickUpSVG from '@Assets/svgs/pickup.svg';
import DeliverySVG from '@Assets/svgs/delivery.svg';
import { searchStoresInfoOnPickUp, getNearbyStores, addUserFavAddressList } from '@API/api';
import { getUserCurrentLocation } from "@Util/map";
import { useUserContext } from "@Context/UserContext";
import { useAlertContext } from '@Context/AlertContext';
import { OverlayLoader } from "@Common/Loader";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem 0.5rem 1rem",
    margin: 12,
    maxWidth: "90%",
    height: (props) => `calc(${props.modalHeight}px )`,
    minHeight: 300,
    maxHeight: "unset",
    borderRadius: '1rem',
  },
  modalTitle: {
    textAlign: "center",
  },
  navSelector: {
    flex: "0 0 30%",
    textAlign: "center",
    padding: "18px 12px 8px 12px",
    borderRadius: "0.8rem",
    "&.active": {
      border: `1px solid ${theme.palette.primary.main}`,
      backgroundColor: lighten(theme.palette.primary.main, 0.95),
    },
  },
  navName: {
    fontSize: "1.3rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.8rem",
    },
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
  },
  storeListItemIcon: {
    width: 36,
    height: 36,
    verticalAlign: "bottom",
  },
  addNewAddressSection: {
    width: "80%",
    // height: "100%",
    textAlign: "center",
    margin: "0 auto",
    // flex:1, 
    // display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  addNewAddressBtn: {
    padding: "1rem 1.5rem",
    borderRadius: "2rem",
    width: "100%",
    fontWeight: theme.typography.platformFontWeight,
    fontSize: "0.8rem",
  },
  input: {
    marginLeft: theme.spacing(1),
    width: "100%",
  },
  gray: {
    opacity: '0.5'
  },
  bold: {
    fontFamily: 'din_bold, din_regular',
  }
}));

const PurchaseOption = {
  Delivery: 0,
  PickUp: 1,
};

const outerModalHeight = 200;

const StoreSelectorModal = ({ grayOutAnother, setIsSelectStoreModalOpened = () => { }, open, ...props }) => {
  const [, vpHeight] = useViewPortSize();
  const modalHeight = vpHeight - outerModalHeight;
  const classes = useStyles({
    modalHeight,
  });
  const { user } = useUserContext();
  const { setUserLocation, setNearbyStores, setSelectedStore, getStoreBasedOnDistance, setUserEnabledLocation, } = useStoreContext();
  const { setShoppingType, shoppingType } = useCartContext();
  const { selectedAddress, addresses, addAddress, generateValuesForAddAddr, setSelectedAddress } = useAddressContext();
  const { pushAlertPopUp } = useAlertContext();
  // if props.grayOutAnother is passed
  // get pre-defined value set outside of cart page
  const [shoppingOption, setShoppingOption] = useState(grayOutAnother ? PurchaseOption[shoppingType] : PurchaseOption.Delivery);
  const [showNearbyStoreModal, setShowNearbyStoreModal] = useState(false);
  const [showSelectAddressView, setShowSelectAddressView] = useState(false);
  const [isSearching, setIsCurrentlySearching] = useState(true);
  const [storeSearchResult, setStoreSearchResult] = useState([]);
  // User's CURRENT location on earth with device
  const [pickUpTabUserLocation, setPickUpTabUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const didMountRef = useRef(false);

  const setIsSearching = (value) => {
    // console.log('setIsSearching to',value);
    setIsCurrentlySearching(value);
  }

  // when new address added, auto select the newly added address and search
  useEffect(() => {
    if (didMountRef.current) {
      const newAddr = addresses[addresses.length - 1];
      setSelectedAddress(newAddr);
      onAddressSelected(newAddr);
    } else {
      // first render of StoreSelectorModal
      didMountRef.current = true;
      searchNearbyStores();
    }
    return () => {
      didMountRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  // called when new address added or when one of the address clicked
  const onAddressSelected = (address) => {
    setSelectedStore(undefined);  // if user click X below modal, no store will be selected, so we can assume no store seledted to catch this case
    // const currentPosition = address.place.geometry.location;
    const formattedPos = {
      lat: address.latitude,
      lng: address.longitude
    }
    setSelectedAddress(address)

    // same as useEffect above
    setUserLocation(formattedPos);
    setIsSearching(true);
    setShowNearbyStoreModal(true);
    setNearbyStores(['isAfterSelectAddressSearching']);
    // get nearby stores
    // const debugObj = {shoppingType, lat:formattedPos.lat, lng:formattedPos.lng}
    getNearbyStores(shoppingType, formattedPos.lat, formattedPos.lng).then(res => {
      // console.log('nearby stores based on this address', res);
      setNearbyStores(getStoreBasedOnDistance(res, formattedPos));
      setIsSearching(false);
    }).catch((err) => {
      setIsSearching(false)
      pushAlertPopUp(`Problem connecting to server. Please try again later`);
    });
  };

  // this method triggered when the radio button clicked and in fact onAddressSelected triggered too
  const onAddressClicked = () => {
    setShowNearbyStoreModal(true);
  };

  const onAddNewAddressClicked = () => {
    setShowSelectAddressView(true);
  };

  const onSelectAddressViewClosed = () => {
    setShowSelectAddressView(false);
  };

  // trigger useEffect
  const onNewAddressAdded = (addr) => {
    // console.log('in StoreSelectorModal, addr passed to onNewAddressAdded', addr);
    const values = generateValuesForAddAddr(addr, user);
    // console.log('in StoreSelectorModal, values passed to onNewAddressAdded', values);
    // console.log('and the place', addr.place);
    // if user is logged in
    if (user.token) {
      addUserFavAddressList(values).then(res => {
        // console.log(res);
        // will trigger useEffect to select this address
        // const newAddr = addAddress(values, () => setIsLoading(false));
        // onAddressSelected(newAddr);
      }).catch((err) => {
        // setIsLoading(false);
        // console.log("error", error)
        pushAlertPopUp(`Problem connecting to server. Please try again later`);
      });
      // show loading to give time for async call addUserFavAddressList
      // setIsLoading(true)
    }
    // will trigger useEffect to select this address
    const newAddr = addAddress(values, () => setShowSelectAddressView(false));
    onAddressSelected(newAddr);
  };

  const searchStoreForPickUp = (query) => {
    setIsSearching(true);
    searchStoresInfoOnPickUp(query).then(res => {
      setIsSearching(false);
      if (!pickUpTabUserLocation) {
        // pick up not getting user location, user disabled it
        // console.log(res);
        setStoreSearchResult(res);
      } else {
        setStoreSearchResult(getStoreBasedOnDistance(res, pickUpTabUserLocation));
      }
    });
  }

  // For PickUp only - search any stores without location constraint
  const onStoreSearch = (query, isKeyDown, event) => {
    // const query = event.target.value;
    if (event.key) {    // keyCode is deprecated
      if (event.key === 'Enter') {
        searchStoreForPickUp(query);
      }
    } else {
      searchStoreForPickUp(query);
    }
  };

  // will set shopping type as Pick Up
  const onStoreClick = (store) => (e) => {
    // if this store has no online ecom then no effect
    if (store.storeStatus === 'Open') {
      setSelectedStore(store);
      setShoppingType(ShoppingType.PickUp);
      setIsSelectStoreModalOpened(false);
    }
  };

  // for Pick Up tab
  const searchNearbyStores = () => {
    setIsSearching(true);
    getUserCurrentLocation((pos) => {
      const formattedPos = { lat: parseFloat(pos.lat), lng: parseFloat(pos.lng) };
      setPickUpTabUserLocation(formattedPos);
      setUserEnabledLocation(true);
      // setIsSearching(false);
      getNearbyStores("PickUp", formattedPos.lat, formattedPos.lng).then(res => {
        setStoreSearchResult(getStoreBasedOnDistance(res, formattedPos));
      }).then(() => setIsSearching(false));
      // onFailedGettingUserLocation and onNotAgreedSharing
      // if user didnt agree, stop loading 
    }, () => setIsSearching(false), () => setIsSearching(false), pushAlertPopUp);
  }

  const selectShoppingOption = (option) => {
    if (!grayOutAnother) {
      setShoppingOption(option);
    }
  };

  // if (isLoading) return <OverlayLoader />;

  return (
    <>
      <Modal {...props} open={open} className={classes.root}>
        <Box display="flex" justifyContent="space-evenly">
          <Card
            className={clsx(
              classes.navSelector,
              shoppingOption === PurchaseOption.Delivery ? "active" : "",
              { [classes.gray]: shoppingOption !== PurchaseOption.Delivery && grayOutAnother }
            )}
            onClick={() => selectShoppingOption(PurchaseOption.Delivery)}
          >
            <img src={DeliverySVG} alt="" className={classes.storeListItemIcon} />
            <Typography className={classes.navName} color="textPrimary">
              Delivery
            </Typography>
          </Card>
          <Card
            className={clsx(
              classes.navSelector,
              shoppingOption === PurchaseOption.PickUp ? "active" : "",
              { [classes.gray]: shoppingOption !== PurchaseOption.PickUp && grayOutAnother }
            )}
            onClick={() => selectShoppingOption(PurchaseOption.PickUp)}
          >
            <img src={pickUpSVG} alt="" className={classes.storeListItemIcon} />
            <Typography className={classes.navName} color="textPrimary">
              Self Pick-Up
            </Typography>
          </Card>
        </Box>
        <br />
        {/* Both components below still rendered, just the display: none */}
        <div
          className={classes.addNewAddressSection}
          style={{
            display:
              shoppingOption === PurchaseOption.Delivery ? "block" : "none",
          }}
        >
          <div>
            <Typography
              variant="h6"
              // component="h2"
              style={{ textAlign: "center" }}
              className={classes.bold}
            >
              Deliver to
            </Typography>
            <Button
              className={classes.addNewAddressBtn}
              variant="contained"
              color="primary"
              onClick={onAddNewAddressClicked}
            >
              ADD ADDRESS
            </Button>
            <SelectAddressRadioControl
              addresses={addresses}
              addressId={selectedAddress?.id}
              onAddressClicked={onAddressClicked}
              onAddressSelected={onAddressSelected}
            />
          </div>
          {/* <Typography
            variant="subtitle2"
            component="h6"
            style={{ textAlign: "center" }}
          >
            Please add delivery address
          </Typography> */}
        </div>
        <div
          className={classes.addNewAddressSection}
          style={{
            display:
              shoppingOption === PurchaseOption.PickUp ? "block" : "none",
          }}
        >
          <NearbyStoreList
            title="Our Stores"
            onSearch={onStoreSearch}
            isSearching={isSearching}
            list={storeSearchResult}
            // list={nearbyStoresTemp}
            onItemClick={onStoreClick}
            onNearbyOutletClick={searchNearbyStores}
            placeholder="Search Outlets"
          // noSearchIcon={true}
          />
        </div>
        {showSelectAddressView && (
          <OverlayAddressSelector
            title={"ADD NEW ADDRESS"}
            onBackButtonClicked={onSelectAddressViewClosed}
            onUseAddressClicked={onNewAddressAdded}
          />
        )}
      </Modal>
      {
        showNearbyStoreModal &&
        <NearbyStoreModal
          currentAddressId={selectedAddress.id}
          currentAddress={selectedAddress}
          open={showNearbyStoreModal}
          onClose={() => setShowNearbyStoreModal(false)}
          setShowNearbyStoreModal={setShowNearbyStoreModal}
          setIsSelectStoreModalOpened={setIsSelectStoreModalOpened}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
        />
      }
    </>
  );
};

export { StoreSelectorModal };
