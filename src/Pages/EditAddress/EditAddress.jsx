import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Header } from "@Common/Header";
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { PageHeader } from '@Common/PageHeader/PageHeader';
import { BackButton } from '@Common/BackButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import { useParams, useHistory } from 'react-router-dom';
import { useAddressContext } from '@Context/AddressContext';
import { OverlayAddressSelector } from '@View/OverlayAddressSelector/OverlayAddressSelector';
import { useCartContext } from '@Context/CartContext';
import { useStoreContext } from '@Context/StoreContext';
import { NearbyStoreModal } from "@Common/NewAddressList/NearbyStoreModal";
import { getNearbyStores, removeUserFavAddressList, updateUserFavAddressList } from '@API/api';
import { useAlertContext } from '@Context/AlertContext';
import { useUserContext } from '@Context/UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem"
  },
  card: {
    padding: '1rem',
    position: 'relative',
    borderRadius: '1rem',
    marginBottom: '2rem'
  },
  fieldInput: {
    color: theme.palette.primary.main,
    'textOverflow': 'ellipsis'
  },
  deleteBtn: {
    color: theme.palette.error.main,
    marginTop: '1rem'
  },
  addAddressBtn: {
    borderRadius: '2rem',
    padding: '1rem',
    fontWeight: theme.typography.fontWeightBold,
  }
}));

const EditAddress = () => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  const { user } = useUserContext();
  const { getAddressById, removeAddress, editAddress, editingAddrInCart, setEditingAddrInCart, generateValuesForAddAddr } = useAddressContext();
  const { shoppingType } = useCartContext();
  const { setUserLocation, setNearbyStores, setSelectedStore, getStoreBasedOnDistance, } = useStoreContext();
  const { pushAlertPopUp } = useAlertContext();

  const [showOverlayAddressSelector, setShowOverlayAddressSelector] = useState(false);
  const [address, setAddress] = React.useState(getAddressById(id));
  const [showNearbyStoreModal, setShowNearbyStoreModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // set to false when exit from this page
  useEffect(() => {
    return () => {
      if (editingAddrInCart) setEditingAddrInCart(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingAddrInCart])

  const onSelectAddressViewClosed = () => {
    setShowOverlayAddressSelector(false);
  }

  const onAddressEdited = (editedAddress) => {
    setAddress(editedAddress);
    editAddress(id, editedAddress);
    setShowOverlayAddressSelector(false);
    try {
      // console.log('editedAddress',editedAddress);
      const values = generateValuesForAddAddr(editedAddress, user);
      if (editedAddress.customerFavouriteAddressId) {
        updateUserFavAddressList(values, editedAddress.customerFavouriteAddressId).then(res => {
          // console.log(res);
        }).catch(err => {
          pushAlertPopUp(`Problem connecting to server. Please try again later`);
        })
      } else {
        // console.log('editedAddress.customerFavouriteAddressId is',editedAddress.customerFavouriteAddressId)
      }
    } catch (err) {
      // ;
    }
    // console.log('getAddressById(id), is it diff from above?',{...getAddressById(id)});
    onAddressSelected(editedAddress);
  }

  // called when address's address edited
  const onAddressSelected = (address) => {
    setSelectedStore(undefined);  // if user click X below modal, no store will be selected, so we can assume no store seledted to catch this case
    const currentPosition = address.place.geometry.location;
    const formattedPos = {
      lat: currentPosition.lat(),
      lng: currentPosition.lng(),
    }
    // same as useEffect above
    setUserLocation(formattedPos);
    setShowNearbyStoreModal(true);
    // get nearby stores
    setIsSearching(true);
    // const debugObj = {shoppingType, lat:formattedPos.lat, lng:formattedPos.lng}
    getNearbyStores(shoppingType, formattedPos.lat, formattedPos.lng).then(res => {
      setNearbyStores(getStoreBasedOnDistance(res, formattedPos));
    }).then(() => setIsSearching(false));
  };

  const handleChange = (event) => {
    setAddress({ ...address, [event.target.name]: event.target.checked || event.target.value });
  };

  const onAddressClick = () => {
    setShowOverlayAddressSelector(true);
  }

  const deleteAddress = () => {
    // if this is an address which stored in backend
    const currAddrBackendId = getAddressById(id).customerFavouriteAddressId;
    // console.log('user.token',user.token);
    if (currAddrBackendId) {
      removeUserFavAddressList(user.token, currAddrBackendId).then(res => {
        removeAddress(id);
        pushAlertPopUp('Favourite address has been removed successfully');
        history.goBack();
      })
      .catch((error) => {
        pushAlertPopUp('Failed to remove address, please try again');
        // console.log("error", error);
        return error;
      });
    } else {
      removeAddress(id);
      history.goBack();
    }
  }

  const submit = () => {
    editAddress(id, address);
    const temp = { ...address };
    temp['token'] = user.token;
    updateUserFavAddressList(temp, temp.customerFavouriteAddressId).then(res => {
      history.go(-1);
    }).catch(err => {
      pushAlertPopUp(`Problem connecting to server. Please try again later`);
    })
  }

  const onStoreSelected = () => {
    setShowNearbyStoreModal(false);
    pushAlertPopUp("Address updated successfully");
    history.go(-1);
  }

  return <PageLayout
    className={'greyBg'}
    header={
      <Header
        leftSlot={<BackButton />}
        centerSlot={<PageHeader>Edit Favourite Address</PageHeader>}
      />
    }
    body={
      <div className={classes.root}>
        <Card className={classes.card}>
          <TextField
            label="Name"
            style={{ margin: 8 }}
            fullWidth
            name="name"
            onChange={handleChange}
            margin="normal"
            disabled={editingAddrInCart}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{ 'aria-label': 'enter name', className: classes.fieldInput }}
            value={address ? address.title : ""}
          />
          <TextField
            label="Address"
            style={{ margin: 8 }}
            fullWidth
            name="address"
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            onClick={onAddressClick}
            inputProps={{ 'aria-label': 'enter address', className: classes.fieldInput, readOnly: true }}
            value={address ? address.address : ""}
          />
          <TextField
            label="Floor/Unit"
            style={{ margin: 8 }}
            fullWidth
            name="address2"
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{ 'aria-label': 'enter floor/ unit', className: classes.fieldInput }}
            value={address ? address.address2 ?? "" : ""}
          />
          <TextField
            label="Note to rider"
            style={{ margin: 8 }}
            fullWidth
            name="notes"
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{ 'aria-label': 'enter name', className: classes.fieldInput }}
            value={address ? address.notes : ""}
          />
          {
            editingAddrInCart ? <></> :
              <Button
                className={classes.deleteBtn}
                startIcon={<DeleteIcon />}
                onClick={deleteAddress}
              >
                Remove
              </Button>
          }
        </Card>
        <Button className={classes.addAddressBtn} variant="contained" color="primary" onClick={submit} fullWidth>
          Save address
        </Button>
        {
          showOverlayAddressSelector
          &&
          <OverlayAddressSelector
            title={`EDIT ${address.title} ADDRESS`}
            defaultAddress={address}
            onBackButtonClicked={onSelectAddressViewClosed}
            onUseAddressClicked={onAddressEdited}
            isEditingAddress
          />
        }
        {
          showNearbyStoreModal &&
          <NearbyStoreModal
            currentAddressId={id}
            open={showNearbyStoreModal}
            onStoreSelected={onStoreSelected}
            setShowNearbyStoreModal={setShowNearbyStoreModal}
            setIsSelectStoreModalOpened={() => { }}
            isSearching={isSearching}
            onClose={() => setShowNearbyStoreModal(true)}
          />
        }
      </div>
    }
  />
};

export { EditAddress };
