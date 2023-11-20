import React, { useState, useEffect } from "react";
import { Modal } from "@Common/Modal/Modal";
import useViewPortSize from "@Hook/useViewPortSize";
import { lighten } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";
import { NearbyStoreList } from "@Common/NearbyStoreList";
import { useStoreContext } from "@Context/StoreContext";
import { useCartContext } from "@Context/CartContext";
import { ShoppingType } from "@Context/CartContext";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem",
    margin: 12,
    maxWidth: "90%",
    height: props => `calc(${props.modalHeight}px )`,
    minHeight: 300,
    maxHeight: "unset"
  },
  modalTitle: {
    textAlign: "center"
  },
  navSelector: {
    flex: "0 0 30%",
    textAlign: "center",
    padding: "18px 12px",
    "&.active": {
      border: `1px solid ${theme.palette.primary.main}`,
      backgroundColor: lighten(theme.palette.primary.main, 0.95)
    }
  },
  navName: {
    fontSize: "1rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.7rem",
    }
  },
  storeListItemIcon: {
    width: 18,
    height: 18,
    verticalAlign: "top"
  },
  addNewAddressSection: {
    width: "80%",
    textAlign: "center",
    margin: "0 auto",
  },
  addNewAddressBtn: {
    padding: '0.5rem 1.5rem',
    borderRadius: '2rem',
    width: "100%",
    fontWeight: theme.typography.platformFontWeight,
    fontSize: "0.8rem"
  },
}));

const outerModalHeight = 200;

// Show this modal after select address for delivery
// used in StoreSelectorModal and EditAddress
const NearbyStoreModal = ({ currentAddressId, currentAddress, setShowNearbyStoreModal,  setIsSelectStoreModalOpened, isSearching, setIsSearching = () => {}, onStoreSelected = () => {}, ...props}) => {
  // console.log('currentAddressId',currentAddressId)
  // console.log('currentAddress',currentAddress)
  const [, vpHeight] = useViewPortSize();
  const modalHeight = vpHeight - outerModalHeight;
  const classes = useStyles({
    modalHeight
  });
  const { setShoppingType } = useCartContext();
  const { nearbyStores, setSelectedStore } = useStoreContext();
  const [filteredStores, setFilteredStores] = useState([]);
  let isAfterSelectAddressSearching = false;
  if(nearbyStores[0] === "isAfterSelectAddressSearching"){
    isAfterSelectAddressSearching = true;
  }

  useEffect(()=>{
    if(!isAfterSelectAddressSearching)
    setFilteredStores(nearbyStores);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[nearbyStores])

  const onStoreSearch = (query, isKeyDown, event) => {
    if(isKeyDown && event.key !== 'Enter') return;
    // const query = event.target.value;
    if (query === "") {
      setFilteredStores(nearbyStores);
    } else {
      // setIsLoading(true);
      const result = nearbyStores.filter(s => s.storeName.toLowerCase().includes(query.toLowerCase()));
      setFilteredStores(result);
    }
  };

  const onStoreClick = (store) => (e) => {
    setShoppingType(ShoppingType.Delivery);
    setSelectedStore(store);
    setShowNearbyStoreModal(false);
    setIsSelectStoreModalOpened(false);
    onStoreSelected();
  };

  return (
    <Modal
      {...props}
      className={classes.root}
    >
      <NearbyStoreList addressId={currentAddressId} address={currentAddress} title="Nearby Stores" onSearch={onStoreSearch} list={filteredStores} isAfterSelectAddressSearching={isAfterSelectAddressSearching} onItemClick={onStoreClick} isSearching={isSearching} />
    </Modal>
  )
}

export { NearbyStoreModal }