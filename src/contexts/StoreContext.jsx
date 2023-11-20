import React, { useState } from "react";
import { useEffect } from "react";
import { getDistanceFromLatLonInKm } from "@Util/map";
import { getAllStoresInfo, getNearbyStores } from "@API/api";
import { useCartContext } from "./CartContext";
import { useAlertContext } from "./AlertContext";
import { useAddressContext } from "./AddressContext";

// default values
const StoreContext = React.createContext({
  selectedStore: undefined,
  stores: [],
  nearbyStores: [],
  userEnabledLocation: false,
  userLocation: undefined,
  setSelectedStore: () => { },
  setNearbyStores: () => { },
  setUserEnabledLocation: () => { },
  setUserLocation: () => { },
  resetSelectedStore: () => { },
});

const StoreProvider = ({ children }) => {
  const { shoppingType } = useCartContext();
  const { tngGetStorage, tngSetStorage } = useAlertContext();
  const { selectedAddress, resetSelectedAddress } = useAddressContext();
  const [selectedStore, setSelectedStoreState] = useState(undefined);
  const [stores, setStores] = useState([]);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [userEnabledLocation, setUserEnabledLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(undefined);
  const [isSelectStoreModalOpened, setIsSelectStoreModalOpened] = React.useState(false);
  const [firstRender, setFirstRender] = useState(true);

  const setSelectedStore = (data) => {
    setSelectedStoreState(data);
    if (!!data) {
      tngSetStorage('selectedStore', data);
    } else {
      tngSetStorage('selectedStore', undefined);
    }
  }
  
  const resetSelectedStore = (data) => {
    setSelectedStoreState(data);
    tngSetStorage('selectedStore', data);
    resetSelectedAddress(data)
  }

  useEffect(() => {
    // if user delete address and that address is selectedAddress
    // in AddressContext selectedAddress will become undefined
    if (!selectedAddress && !firstRender) {
      setSelectedStore(undefined);
      tngSetStorage('selectedStore', undefined);
    } else {
      setFirstRender(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress])

  // call graphql API to get all stores on first render
  useEffect(() => {
    tngGetStorage('selectedStore', (data) => {
      setSelectedStoreState(data)
    })
    getAllStoresInfo().then((res) => {
      if (Array.isArray(res)) {
        setStores(res);
        // tngGetStorage('selectedStore', (data) => {
        // if(!!data){
        // setSelectedStoreState(data)
        // }
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // caluculate distance when shopping type and user location changed
  useEffect(() => {
    if (!userLocation) return;

    setStores((allStores) => {
      const storesWithDistance = getStoreBasedOnDistance(allStores);
      return storesWithDistance;
    });

    // response may be different based on different shopping type
    getNearbyStores(shoppingType, userLocation.lat, userLocation.lng).then(res => {
      setNearbyStores(getStoreBasedOnDistance(res));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingType, userLocation]);

  const getStoreBasedOnDistance = (stores, locationPassed) => {
    // console.log('locationPassed into getStoreBasedOnDistance',locationPassed);
    const storesWithDistance = stores.map((s) => {
      if (!locationPassed) {
        return {
          ...s,
          distance: getDistanceFromLatLonInKm(
            userLocation.lat,
            userLocation.lng,
            s.latitude,
            s.longitude
          ).toFixed(2),
        }
      }
      return {
        ...s,
        distance: getDistanceFromLatLonInKm(
          locationPassed.lat,
          locationPassed.lng,
          s.latitude,
          s.longitude
        ).toFixed(2),
      };
    });

    return storesWithDistance;
  }

  return (
    <StoreContext.Provider
      value={{
        selectedStore,
        stores,
        nearbyStores,
        userEnabledLocation,
        userLocation,
        setSelectedStore,
        setNearbyStores,
        setUserEnabledLocation,
        setUserLocation,
        getStoreBasedOnDistance,
        isSelectStoreModalOpened,
        setIsSelectStoreModalOpened,
        resetSelectedStore
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

const useStoreContext = () => {
  return React.useContext(StoreContext);
};

export { StoreProvider, useStoreContext };
