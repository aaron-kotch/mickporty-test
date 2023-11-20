import React, { useState, useEffect, useRef } from "react";
import { getFavAddressList } from '@API/api';
import useScript from "@Hook/useScript";
import { config } from "src/constants/config";
import { useAlertContext } from "@Context/AlertContext";
import { v4 as uuidv4 } from 'uuid';
import cloneDeep from 'lodash/cloneDeep'

const AddressContext = React.createContext({
  addresses: [],
  selectedAddress: undefined,
  getAddressById: (addrId) => { },
  addAddress: (addr) => { },
  removeAddress: (addrId) => { },
  editAddress: (addrId, addr) => { },
  editingAddrInCart: false,
  setEditingAddrInCart: () => { },
  resetSelectedAddress: () => { }
});

const AddressProvider = ({ children }) => {
  const [scriptHasLoaded] = useScript(
    `https://maps.googleapis.com/maps/api/js?key=${config.googleMapKey}&libraries=places`,
    "google"
  );
  const { pushAlertPopUp, tngSetStorage, tngGetStorage } = useAlertContext();
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [addresses, setAddresses] = useState([]);
  const [doneGettingAddrAfterLogin, setDoneGettingAddrAfterLogin] = useState(false);
  const [editingAddrInCart, setEditingAddrInCart] = useState(false);
  const didMountRef = useRef(false);
  const didMountRef2 = useRef(false);

  useEffect(() => {
    tngGetStorage('addresses',
      (data) => {
        if (Array.isArray(data)) {
          setAddresses(data);
          tngGetStorage('selectedAddress', (selectedAddr) => {
            // alert(`Addresses from cache: ${JSON.stringify(data)}`)
            // alert(`selectedAddress from cache: ${JSON.stringify(selectedAddr)}`)
            if (!!data.find(addr => selectedAddr.id === addr.id)) {
              // alert('set selectedAddress')
              setSelectedAddress(selectedAddr)
            }
          })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const resetSelectedAddress = (data) => {
    setSelectedAddress(data)
    tngSetStorage('selectedAddress', data);
  }
  
  useEffect(() => {
    if (Array.isArray(addresses) && didMountRef.current) {
      tngSetStorage('addresses', addresses);
    } else {
      didMountRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses])

  useEffect(() => {
    // if (!!selectedAddress && !!addresses.find(addr => addr.id === selectedAddress.id)) {
    if (didMountRef2.current) {
      tngSetStorage('selectedAddress', selectedAddress);
    } else {
      didMountRef2.current = true;
    }
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress])

  const getAddressById = (addrId) => {
    const temp = addresses.find((addr) => addr.id === addrId);
    return temp;
  };

  const getAddrObjToSave = (addr) => {
    return {
      title: addr.title,
      address: addr.address,
      notes: addr.notes,
      address2: addr.address2,
      id: `${uuidv4()}`,
      // place: addr.place,
      customerFavouriteAddressId: addr.customerFavouriteAddressId,
      latitude: addr.latitude,
      longitude: addr.longitude,
      city: addr.city,
      country: addr.country,
      state: addr.state,
      postal: addr.postal,
    }
  }

  // index starts from 1
  const addAddress = (addr, closeModalFunction = () => { }) => {
    const newAddr = getAddrObjToSave(addr);
    setAddresses((addrs) => [
      ...addrs,
      newAddr
    ]);
    closeModalFunction(false);
    return newAddr;
  }

  const removeAddress = (addrId) => {
    // const temp = cloneDeep(addresses);
    // const result = temp.filter((addr) => addr.id !== addrId);
    // setAddresses(result);
    setAddresses((addrs) => addrs.filter((addr) => addr.id !== addrId));

    // Set current address to null if deleted address id is this
    // alert(`remove address id ${addrId}`)
    // alert(`selectedAddress ${JSON.stringify(selectedAddress)}`)
    if (addrId === selectedAddress?.id) {
      setSelectedAddress(undefined);
    }
  }

  const editAddress = (addrId, addr) => {
    setSelectedAddress(addr);
    setAddresses((addrs) => {
      const temp = [...addrs];
      const targetAddr = temp.find(a => a.id === addrId);
      Object.assign(targetAddr, addr);
      targetAddr.id = addrId;
      return temp;
    });
    // const temp = cloneDeep(addresses);
    // const targetAddr = temp.find(a => a.id === addrId);
    // Object.assign(targetAddr, addr);
    // setAddresses(temp);
  };

  const getFavAddr = async (token) => {
    if (!doneGettingAddrAfterLogin) {
      setDoneGettingAddrAfterLogin(true);
      if (token !== null) {
        getFavAddressList(token).then(addressesRes => {
          // if got addresses from localStorage which is extra aka not in backend addresses
          // exclude them
          if (!!addressesRes && Array.isArray(addressesRes)) {
            // alert(`addressesRes ${JSON.stringify(addressesRes)}`)
            // not using customerFavouriteAddressId to check since address from
            // cache may not have customerFavouriteAddressId
            const exactAddresses = addresses.filter(addr => addressesRes.some(backendAddr => 
              backendAddr.address + "" === addr.address + "" && 
              backendAddr.latitude + "" === addr.latitude + "" &&
              backendAddr.longitude +"" === addr.longitude + ""))
            setAddresses(() => exactAddresses)
            // alert(`exactAddresses ${JSON.stringify(exactAddresses)}`)
            addressesRes.forEach(addr => {
              // add only if this addr from backend is not in list
              const foundAddrIdx = exactAddresses.findIndex(addrFromStorage => 
                addrFromStorage.address + "" === addr.address + "" && 
                addrFromStorage.latitude + "" === addr.latitude + "" &&
                addrFromStorage.longitude +"" === addr.longitude + "");
                // alert(`address foundAddrIdx ${foundAddrIdx}`)
              if (foundAddrIdx === -1) {
                // alert('address added')
                addAddress(addr);
              } else {
                setAddresses((prevAddresses) => {
                  // else replace the address stored cuz other info may be updated
                  const addressesCopy = cloneDeep(prevAddresses);
                  // const idx = addressesCopy.map(a => a.customerFavouriteAddressId).indexOf(addr.customerFavouriteAddressId)
                  // alert(`b4 replace the address on state with the values from backend ${JSON.stringify(addressesCopy[foundAddrIdx])}`)
                  addressesCopy[foundAddrIdx] = { ...addr, id: addressesCopy[foundAddrIdx].id };
                  // alert(`after replace the address on state with the values from backend ${JSON.stringify(addressesCopy[foundAddrIdx])}`)
                  return addressesCopy
                });
              }
            });
          }
        }).catch((err) => {
          // console.log("error", error)
          pushAlertPopUp(`Problem connecting to server. Please try again later`);
        });
      }
    }
  }

  // for calling API only
  const generateValuesForAddAddr = (addr, user = null) => {
    // console.log('addr', addr)
    let currentPosition;
    if (addr.place.geometry) {
      currentPosition = addr.place.geometry.location;
    } else {
      currentPosition = {
        lat: () => addr.latitude,
        lng: () => addr.longitude
      }
    }
    const city = addr.place.address_components.find(component => {
      return !!component.types.find(text => text === 'locality');
    })
    const country = addr.place.address_components.find(component => {
      return !!component.types.find(text => text === 'country');
    })
    const state = addr.place.address_components.find(component => {
      return !!component.types.find(text => text === 'administrative_area_level_1');
    })
    const postal = addr.place.address_components.find(component => {
      return !!component.types.find(text => text === 'postal_code');
    })
    const values = {
      address: addr.address,
      address2: "",
      title: addr.title,
      longitude: currentPosition.lng(),
      latitude: currentPosition.lat(),
      country: country ? country.long_name : "_",
      city: city ? city.long_name : "_",
      state: state ? state.long_name : "_",
      postal: postal ? postal.long_name : "_",
      token: user ? user.token : null,
      notes: addr.notes
    };
    return values;
  }

  return (<AddressContext.Provider value={{ addresses, addAddress, removeAddress, selectedAddress, editAddress, getAddressById, getFavAddr, scriptHasLoaded, setSelectedAddress, editingAddrInCart, setEditingAddrInCart, generateValuesForAddAddr, resetSelectedAddress }}>
    {children}
  </AddressContext.Provider>)
};

const useAddressContext = () => {
  return React.useContext(AddressContext);
};

export { AddressProvider, useAddressContext };
