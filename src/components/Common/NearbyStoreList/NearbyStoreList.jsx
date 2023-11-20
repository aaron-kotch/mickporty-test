import React, { useState, useEffect } from 'react';
import { Paper, InputBase, Typography, Button, makeStyles, lighten, CircularProgress } from '@material-ui/core';
import { OverlayAddressSelector } from "@View/OverlayAddressSelector/OverlayAddressSelector";
import MyLocationIcon from '@material-ui/icons/MyLocation';
import SearchIcon from "@material-ui/icons/Search";
import { StoreList } from "./StoreList";
import { useAddressContext } from "@Context/AddressContext";
import clsx from "clsx";
import { useStoreContext } from '@Context/StoreContext';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from "@material-ui/core/IconButton";
import "./NearbyStoreList.scss"

const useStyles = makeStyles((theme) => ({
  addressBar: {
    display: 'flex',
    borderRadius: '0.5rem',
    backgroundColor: `${lighten(theme.palette.primary.light, 0.5)}`,
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0.25rem 0.5rem',
    [theme.breakpoints.down("xs")]: {
      marginTop: '0.5rem'
    }
  },
  icon: {
    flex: '0 0 2rem',
  },
  placeholder: {
    flex: 1,
    overflow: 'hidden',
  },
  placeholderTitle: {
    color: theme.palette.grey[800]
  },
  placeholderDesc: {
    color: theme.palette.grey[600]
  },
  textOverflow: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  searchButton: {
    flex: '0 0 5rem',
    textTransform: "none"
  },
  filterBar: {
    marginTop: '0.5rem',
    padding: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: "100%",
    backgroundColor: `${lighten(theme.palette.primary.light, 0.75)}`,
    border: 0,
  },
  input: {
    marginLeft: theme.spacing(1),
    width: "100%"
  },
  buttonContainer: {
    padding: '0.25rem 0',
    textAlign: 'left'
  },
  loader:{
    width: "100%",
    marginTop: "4rem",
    textAlign: "center",
  },
  bold:{
    fontFamily: 'din_bold, din_regular',
  }
}));
// shown at 
// 1) second tab (PickUp) of first modal when user click 'Select Stores' 
// 2) after user select address for delivery
const NearbyStoreList = ({ addressId, address, title, onSearch, isSearching, list, onItemClick, onNearbyOutletClick, placeholder = "Search Outlets", noSearchIcon, isAfterSelectAddressSearching = false }) => {
  const classes = useStyles();

  const { getAddressById, editAddress } = useAddressContext();
  const { setUserLocation } = useStoreContext();
  const [ currentAddress, setCurrentAddress ] = useState({});
  const [showSelectAddressView, setShowSelectAddressView] = React.useState(false);
  const [query, setQuery] = useState('');

  const onSelectAddressViewClosed = () => {
    setShowSelectAddressView(false);
  }

  const onEdit = () => {
    setShowSelectAddressView(true);
  }

  const onUseAddressClicked = (addr) => {
    let formattedPos = {};
    if(addr.place){
      const currentPosition = addr.place.geometry.location;
      formattedPos = {
        lat: currentPosition.lat(),
        lng: currentPosition.lng(),
      }
    }else{
      // if place details havent return yet, use the possibly exist lat and lng in the address
      formattedPos = {
        lat: addr.latitude,
        lng: addr.longitude
      }
    }
    // console.log('formattedPos',formattedPos);
    setUserLocation(formattedPos);
    setCurrentAddress(addr);
    editAddress(addressId, addr);
    setShowSelectAddressView(false);
  }

  const onChange = (event) => {
    setQuery(event.target.value);
  }

  useEffect(() => {
    if(addressId !== null && addressId !== undefined){
      setCurrentAddress(getAddressById(addressId))
    } else{
      setCurrentAddress(address)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>
    {
      // this seciton is not shown for pick up tab of first modal
      !onNearbyOutletClick && <div className={classes.addressBar}>
        <div className={classes.placeholder}>
          <Typography variant="body2" className={clsx(classes.placholderTitle, classes.textOverflow, classes.bold)}>
            {currentAddress?.title}
          </Typography>
          <Typography variant="body2" className={clsx(classes.placholderDesc, classes.textOverflow)}>
            {currentAddress?.address}
          </Typography>
        </div>
        <Button className={classes.searchButton} color="primary" size="small" onClick={onEdit}>Edit</Button>
      </div>
    }
    <Typography variant="h6" component="h2" style={{textAlign: "center"}} className={classes.bold}>{title}</Typography>
    <Paper elevation={0} component="div" className={classes.filterBar}>
      <InputBase
        className={classes.input}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={(event) => onSearch(query, true, event)}
        inputProps={{ 'aria-label': 'search store', }}
        endAdornment={<InputAdornment position="end">
        {
          noSearchIcon? <></>:
          <IconButton
          disableRipple
          aria-label="search stores"
          component="span"
          color="primary"
          onClick={(event) => onSearch(query, false, event)}
          >
          <SearchIcon />
        </IconButton>
        }
      </InputAdornment>}
      />
    </Paper>
    {
      !!onNearbyOutletClick && <div className={classes.buttonContainer}>
        <Button
          startIcon={<MyLocationIcon color="primary" />}
          onClick={onNearbyOutletClick}
        >
          <span id="no-uppercase">Nearby Outlets</span>
        </Button>
      </div>
    }
    {
      list && list.length === 0 && !isSearching && !isAfterSelectAddressSearching ? <div className={classes.loader}>No store found</div> : <></>
    }
    {
      isSearching || isAfterSelectAddressSearching? <div className={classes.loader}><CircularProgress/></div>:
      <StoreList storeListItems={list} onItemClicked={onItemClick} />
    }
    {
      showSelectAddressView
      &&
      <OverlayAddressSelector 
        title={"EDIT ADDRESS"} 
        defaultAddress={currentAddress}
        onBackButtonClicked={onSelectAddressViewClosed}
        onUseAddressClicked={onUseAddressClicked}
        isEditingAddress
      />
    }
  </>;
};

export { NearbyStoreList };
