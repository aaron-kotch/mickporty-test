import React, { useState, memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { ReactComponent as TransparentAddIcon } from '@Assets/svgs/plus-item-transparent.svg';
import { ReactComponent as TransparentRemoveIcon } from '@Assets/svgs/minus-item-transparent.svg'
import IconButton from '@material-ui/core/IconButton';
import { useCartContext } from "@Context/CartContext";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import { useCurrency } from "@Hook/useCurrency";
import clsx from 'clsx';
import { mandatoryOptions } from '@Pages/ProductDetails/MandatoryOption';
import { useHistory } from 'react-router-dom';
import { routes } from "src/constants/routes.constant";
import AddButton_Icon from "@Assets/svgs/add-btn.svg"
import MinusButton_Icon from "@Assets/svgs/minus-btn.svg"
import Box from '@material-ui/core/Box';
import {SelectButton} from '@View/Button/Button'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '0 0.25rem'
  },
  card: {
    padding: '0.5rem 1rem',
    borderRadius: '0.7rem',
    marginBottom: '1rem',
    width: '100%',
    transition: 'margin .5s',
    'boxShadow': '0px 0px 2px 1.5px rgba(0, 0, 0, 0.1)'
  },
  deleteAction: {
    color: theme.palette.secondary.main,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '2rem',
    backgroundColor: theme.palette.error.main
  },
  cover: {
    height: '5rem',
    flex: '0 0 5rem',
    borderRadius: '0.8rem',
    alignSelf: 'center',
    border: `0.15rem solid ${theme.palette.customGrey.lighter}`,

  },
  flex: {
    flex: 1
  },
  content: {
    padding: '0 0 0 1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    "&:last-child": {
      paddingBottom: 0
    }
  },
  noImageContent: {
    padding: '0',
    "&:last-child": {
      paddingBottom: 0
    }
  },
  flexContainer: {
    display: 'flex'
  },
  flexContainerPrice: {
    display: 'flex',
    flexDirection: 'row'
  },
  price: {
    textAlign: 'right',
    alignSelf: 'flex-end',
    fontSize: '0.9rem',
    paddingBottom: '0.2rem',
  },
  stepperWrapper: {
    flex: '0 0 6rem',
    alignItems: 'center'
  },
  textSize: {
    fontSize: '0.9rem',
    textTransform: 'unset'
  },
  smallerTextSize: {
    fontSize: '0.7rem',
    textTransform: 'unset'
  },
  ifNotAvailableButton: {
    display: 'inline',
  },
  iconButton: {
    flex: '0 0 2rem',
    padding: 0,
  },
  itemNumber: {
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: '1.1rem',
    color: theme.palette.customGrey.medium,
    fontFamily: 'din_bold, din_regular',
  },
  slideLeft: {
    marginLeft: -80,
    borderRadius: '1.8rem 0 0 1.8rem',

  },
  slideOutAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width .5s',
    overflow: "hidden",
    borderRadius: '0 0.5rem 0.5rem 0',
    marginBottom: '1rem',
    width: '1rem'
  },
  delete: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.secondary.main,
  },
  redBold:{
    color: "#ff0000",
    fontFamily: 'din_bold, din_regular',
  },
  mandatoryOptionsText: {
    color: "#6D6E71"
  },
  mandatoryOptionsTextSize: {
    fontSize: "0.8rem",
    textTransform: 'unset',
  },
  dropdown: { 
    height: '1.5rem',
    width: '7rem',
    fontSize: '0.75rem',
    // zIndex: 1,
    border: '1px solid #fff',
    'backgroundColor': 'transparent',
    color: theme.palette.primary.main,
    marginBottom: "0.5rem",
    marginTop: "1.4rem"
  },
  originalPrice: {
    fontSize: "0.9rem",
    lineHeight: "1rem",
    textDecoration: "line-through",
    marginLeft: "0.25em",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.7rem",
    },
  },
  inlineText: {
    display: "inline",
  },
  fullWidth:{
    width: "100%"
  },
  bold:{
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
    color: theme.palette.grey[700],
  },
  ifNotAvailableText: {
    // whiteSpace: 'nowrap',
    paddingRight: '0.2rem',
    // wordWrap: 'break-word',
  }
}));

const OrderListItem = memo(({ removeItem, addItem, isReadOnly = false, onDeleteToggle, isActive, isEdit, showImage, ...props }) => {
  const classes = useStyles();
  const history = useHistory();
  const { formatCurrency } = useCurrency();
  const { updateCartItemQuantity, removeCartItem, setMandatoryOption } = useCartContext();
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);
  let priceBefore = null;
  let price = props.price;
  if(props.discountedPrice < props.price){
    priceBefore = props.price;  
    price = props.discountedPrice;
  }

  const itemDisabled = props.isDisabled

  const { isFreeItem = false, productImage, image, productName, mandatoryItem, quantity, isDisabled, productId } = props;

  React.useEffect(() => {
    onDeleteToggle && onDeleteToggle(isSwipedLeft);
  }, [isSwipedLeft, onDeleteToggle]);

  React.useEffect(() => {
    !isActive && setIsSwipedLeft(false);
  }, [isActive]);

  const handleChange = event => {
    // console.log('setMandatoryOption for',productId);
    if(isFreeItem){
      setMandatoryOption(productId, event.target.value, true);
    }else{
      setMandatoryOption(productId, event.target.value);
    }
  };

  const updateCartItemQuantityMethod = () => {
    updateCartItemQuantity(props, quantity + 1);
  }

  const navigateToProductDetails = () => {
    history.push({
      pathname: routes.productDetails.replace(":id", productId),
    });
  };

  return <div className={clsx(classes.root, classes.flexContainer)}>
    <div className={classes.slideOutAction} style={{ width: isEdit ? 0 : 0 }} onClick={() => removeCartItem(props, true, ()=>{}, false)}>
      <RemoveCircleIcon color="error" />
    </div>
    <Card className={clsx(classes.flexContainer, classes.card, { [classes.slideLeft]: (isSwipedLeft && !isReadOnly) || isEdit, [classes.swipeRight]: isEdit })}>
      {
        !showImage? <></> :
        <CardMedia
        className={classes.cover}
        image={`${process.env.REACT_APP_IMAGE_CLOUDFRONT}${productImage? productImage.replace("JPG","jpg"): image.replace("JPG","jpg")}`}
        title={productName}
        onClick={navigateToProductDetails}
        />
      }
      <CardContent className={clsx(!showImage? classes.noImageContent:classes.content, classes.flex)}>
        <div>

        <Typography variant="subtitle1" style={{marginBottom: "-0.25rem"}} component="div" className={clsx(classes.textSize, classes.bold)}>
          {productName}
        </Typography>
        <div style={{ width: '100%' }}>
          {isReadOnly ? (
            <Typography variant="subtitle1" component="div" style={{marginBottom: !itemDisabled ? "0.3rem" : "-0.25rem"}}>
              <span className={clsx(classes.mandatoryOptionsTextSize, classes.bold, classes.ifNotAvailableText)}>If not available: {" "}</span> 
              <span className={clsx(classes.mandatoryOptionsTextSize, classes.mandatoryOptionsText)}>{mandatoryOptions.find(option => mandatoryItem === option.value).label}</span>
            </Typography>
          ) : (
            <Box display="flex">
              <Typography variant="subtitle1" style={{marginBottom: "0.25rem"}} component="div" className={clsx(classes.mandatoryOptionsTextSize, classes.bold, classes.ifNotAvailableText)}>
                  <SelectButton
                    // eslint-disable-next-line eqeqeq
                      label={'If not available: '}
                      title={mandatoryItem=== false ? 'Remove it from my order': mandatoryItem=== true ? 'Cancel the entire order' : 'Remove it from my order'}
                      handleChange={handleChange}
                      value={mandatoryItem === undefined ? false : mandatoryItem}
                      selection={mandatoryOptions}
                      type={'available'}
                      isEdit={isEdit}
                  />
              </Typography>
            </Box>
          )}
        </div>
        {
          itemDisabled?
          <Typography variant="subtitle1" component="div" className={clsx(classes.mandatoryOptionsTextSize, classes.redBold)}>
          Item out of stock
        </Typography> : <></>
        }
        </div>

          <div className={classes.flexContainer}>
            {isReadOnly ? ( 
                <Typography variant="subtitle1" component="div">
                <span className={clsx(classes.textSize, classes.bold, classes.flexContainerPrice)}>
                    <span>Qty: </span>
                    <span>&nbsp;</span>
                    <span>{quantity}</span> 
                </span>
              </Typography>
              
            ) : (
                <div className={clsx({ [classes.stepperWrapper]: !isReadOnly, [classes.flex]: isReadOnly }, classes.flexContainer)}>
                <IconButton className={clsx(classes.iconButton)} size="small" disabled={quantity < 1} aria-label="remove" onClick={isReadOnly || isFreeItem ? () => {} : () => removeCartItem(props, false, ()=>{}, false)} disableFocusRipple={isFreeItem} disableRipple={isFreeItem}>
                  {
                    isFreeItem? <TransparentRemoveIcon />:
                    <img src={MinusButton_Icon} alt="minus"/>
                  }
                </IconButton>
                <div className={clsx(classes.itemNumber, classes.flex)}>{props.quantity}</div>
                <IconButton className={clsx(classes.iconButton)} size="small" aria-label="add" onClick={isReadOnly || isDisabled || isFreeItem ? null : updateCartItemQuantityMethod} disableFocusRipple={isDisabled || isFreeItem} disableRipple={isDisabled || isFreeItem}>
                  {
                    isDisabled || isFreeItem?
                    <TransparentAddIcon />:
                    <img src={AddButton_Icon} alt="add"/>
                  }
                </IconButton>
              </div>

            )}
          
          <div className={clsx(classes.price, classes.fullWidth)}>
            {!!priceBefore && (
            <Typography
              className={clsx(classes.inlineText, classes.originalPrice)}
              variant="body1"
              color="primary"
              component="div"
            >
              {formatCurrency(priceBefore)}
            </Typography>
            )}
            <div className={clsx(classes.flex, classes.price, classes.bold)}> 
              {formatCurrency(price)}
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
    {
      !isReadOnly?
      <div className={clsx(classes.delete, classes.slideOutAction)} style={{ width: isSwipedLeft || isEdit ? 80 : 0 }} onClick={() => removeCartItem(props, true,  ()=>{}, false)}>Delete</div> : 
      <></>
    }
  </div>;
});

export { OrderListItem };
