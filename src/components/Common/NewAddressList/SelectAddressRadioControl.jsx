import React from "react";
import { makeStyles, RadioGroup } from "@material-ui/core";
import { SelectAddressRadioItem } from "./SelectAddressRadioItem";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    marginTop: 20,
    overflowY: "scroll"
  },
  flexContainer: {
    display: 'block',
    textAlign: 'left',
  },
}));

const SelectAddressRadioControl = ({
  addresses = [],
  addressId,
  onAddressSelected = (address) => {},
  onAddressClicked: propOnAddressClicked = (address) => {}
}) => {

  const classes = useStyles();

  // when selection changed by clicking at the 'dot'
  const handleChange = (e) => {
    const val = e.target.value;
    // console.log('val',val);
    onAddressSelected(addresses.find(addr => addr.id === val));
    // onAddressSelected(addresses[val]);
  }

  const onAddressClicked = (address) => {
    onAddressSelected(addresses.find(addr => addr.id === address.id));
    propOnAddressClicked(address);
  }

  return (
    <div className={classes.root}>
      <RadioGroup 
        aria-label="new-address-radios"
        name="newaddressselection"
        className={classes.flexContainer}
        value={addressId || ""}
        onChange={handleChange}
      >
        {
          addresses.map((addr) => (
            <SelectAddressRadioItem key={addr.id} onLabelClicked={onAddressClicked} addressItem={addr}/>
          ))
        }
      </RadioGroup>
    </div>
  )
}

export { SelectAddressRadioControl }