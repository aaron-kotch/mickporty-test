import React, { useState, useEffect, memo } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import { useCartContext } from "@Context/CartContext";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Selection } from "@Common/Selection";
import Button from "@material-ui/core/Button";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  iconWrapper: {
    flex: '0 0 2rem',
    alignSelf: 'start',
    marginRight: '0.5rem'
  },
  sectionWrapper: {
    margin: '0.5rem 0',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '0.25rem',
    padding: '0.5rem'
  },
  sectionHeader: {
    'whiteSpace': 'nowrap',
    fontWeight: theme.typography.platformFontWeight,
    color: theme.palette.grey[700]
  },
  sectionContent: {
    fontSize: '0.8rem',
    color: theme.palette.grey[500]
  },
  sectionContentButton: {
    flex: '0 0 2rem',
    alignSelf: 'start'
  },
  input: {
    padding: '0.5rem'
  },
  label: {
    width: '100%'
  },
  section: {
    paddingTop: '1rem'
  },
  dropdown: { 
    opacity: 0,
    height: '2rem',
    width: 'inherit',
    zIndex: 1,
    position: 'absolute',
  },
  textLeft: {
    'textAlign': 'start',
  },
  button:{
    padding: 'inherit 0',
    justifyContent: "flex-end"
  }
}));

export const mandatoryOptions = [
  { label: 'Remove it from my order', value: false, isMandatory: 'not mandatory' },
  { label: 'Cancel the entire order', value: true, isMandatory: 'mandatory' },
];

const MandatoryOption = memo(({ productId }) => {
  const classes = useStyles();
  const { setMandatoryOption, cart } = useCartContext();
  const [isMandatory, setIsMandatory] = useState(cart.find(p => p.productId === productId)?cart.find(p => p.productId === productId).mandatoryItem: false);

  useEffect(()=>{
    setIsMandatory(cart.find(p => p.productId === productId)?cart.find(p => p.productId === productId).mandatoryItem: false);
  },[cart, productId])

  const handleChange = event => {
    // value from event always string
    if(event.target.value === true){
      setMandatoryOption(productId, true);
    }else{
      setMandatoryOption(productId, false);
    }
  };

  // const isMandatory = cart.find(p => p.productId === productId).mandatoryItem;
  // console.log(isMandatory);
  const text = isMandatory? mandatoryOptions[1].label : mandatoryOptions[0].label
  // console.log(isMandatory);
  
  return <div className={clsx(classes.flexContainer, classes.sectionWrapper)}>
    <div className={classes.flex}>
      <div className={classes.flexContainer}>
        <div className={clsx(classes.flex, classes.textLeft)}>
          <div className={classes.sectionHeader}>If this product is not available</div>
          <div className={classes.sectionContent}>
            {text}
          </div>
        </div>
        <div className={classes.sectionContentButton}>
          <Button color="primary" className={classes.button}><ChevronRightIcon />
              <Selection 
                componentClass={classes.dropdown}
                selectionList={mandatoryOptions}
                currentSelectionValue={isMandatory === null ? false : isMandatory}
                handleFilterChange={handleChange}
              />
          </Button>
        </div>
      </div>
    </div>
  </div>;
});

export { MandatoryOption };