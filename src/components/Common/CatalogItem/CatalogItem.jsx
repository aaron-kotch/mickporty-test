import React, { useState } from "react";
import { makeStyles, lighten } from "@material-ui/core/styles";
import { Box, Typography } from "@material-ui/core";
import { routes } from "src/constants/routes.constant";
import { useHistory } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import { ReactComponent as ShoppingCartOutlinedIcon } from '@Assets/svgs/shoppingCart.svg';
import Chip from "@material-ui/core/Chip";
import { useCurrency } from "@Hook/useCurrency";
import clsx from "clsx";
import { useCartContext } from "@Context/CartContext";
import { useEffect } from "react";
import { useStoreContext } from "@Context/StoreContext";
import { ShoppingType } from "@Context/CartContext";
import './CatalogItem.scss'
import AddButton_Icon from "@Assets/svgs/add-btn.svg"
import MinusButton_Icon from "@Assets/svgs/minus-btn.svg"
import { useAlertContext } from "@Context/AlertContext";

const useStyles = makeStyles((theme) => ({
  root: {},
  productImage: (props) => ({
    display: "block",
    width: "100%",
    aspectRatio: 1,
    objectFit: "cover",
  }),
  chipLabel: (props) => ({
    position: "absolute",
    top: 6,
    left: "5%",
    width: "90%",
    height: 18,
    fontWeight: theme.typography.platformFontWeight,
    color: `${lighten(theme.palette.primary.light, 0.9)}`,
    backgroundColor: props.isAvailable ? theme.palette.discount.main : theme.palette.customGrey.light,
  }),
}));

const CatalogItem = React.memo(({ classes: propClasses, ...props }) => {
  const history = useHistory();
  const { formatCurrency } = useCurrency();
  let {
    productId: id,
    title,
    price = "",
    isDisabled,
    discountedPrice,
    promotionDescription,
    // onQuantityChanged: propOnQuantityChanged = () => {},
    onBottomLeftIconClicked: propOnBottomLeftIconClicked = () => {},
  } = props;
  const isAvailable = !isDisabled;
  let chipLabel = isAvailable? promotionDescription: "Unavailable";
  let priceBefore = null;
  if(discountedPrice < price){
    priceBefore = price;  
    price = discountedPrice;
  }

  const classes = useStyles({
    isAvailable,
  });
  const { getItemQuantity, updateCartItemQuantity, removeCartItem, cart, shoppingType } = useCartContext();
  const { selectedStore, setIsSelectStoreModalOpened } = useStoreContext();
  const { pushAlertPopUp } = useAlertContext();
  const item = cart.find((p) => p.productId === id);
  const [quantity, setQuantity] = useState(item ? item.quantity : 0);
  const [showQuantity, setShowQuantity] = useState(
    item ? item.quantity > 0 : false
  );

  const onBottonLeftIconClicked = (e) => {
    if(!selectedStore){
      // pushAlertPopUp(`Please select a store before add item to cart`);
      setIsSelectStoreModalOpened(true)
    }else{
      propOnBottomLeftIconClicked(e);
      
      setShowQuantity(true);
      setQuantity(1);
      updateCartItemQuantity({...props}, 1);
    }

    e.stopPropagation();
  };

  const onQuantityPlusMinusClicked = (type) => (e) => {
    setQuantity((q) => {
      if (type === "-") {
        if(q - 1 < 1){
          const removeAll = (isRemovingAll) => {
            setShowQuantity(false);
            setQuantity(q-1);
          }
          removeCartItem({...props}, true, removeAll);
          // removeCartItem({...props}, true);
          return q;
        }else{
          removeCartItem({...props});
          return q-1;
        }
      }else if(type === "+" ){
        if (shoppingType === ShoppingType.Delivery && q + 1 > props.ecommerceMaximumQuantity) {
          pushAlertPopUp(`The item quantity has exceeded the maximum order quantity`);
          setQuantity(q);
          return;
        }else if(shoppingType === ShoppingType.PickUp && q + 1 > props.pickupMaximumQuantity){
          pushAlertPopUp(`The item quantity has exceeded the maximum order quantity`);
          setQuantity(q);
          return;
        }else{    // still within limit
          updateCartItemQuantity({ ...props }, quantity+1);
        }
        return q+1;
      }

      // return type === "+" ? q + 1 : q - 1;
    });
    e.stopPropagation();
  };

  const navigateToProductDetails = () => {
    history.push({
      pathname: routes.productDetails.replace(":id", id),
    });
  };

  useEffect(() => {
    const cartQuantity = getItemQuantity(props) || 0;
    if (cartQuantity > 0) {
      setQuantity(cartQuantity);
      setShowQuantity(true);
    }else{
      setQuantity(0);
      setShowQuantity(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  return (
    <Box
      key={id}
      flexGrow={0}
      flexShrink={0}
      className={clsx('catalog_item-container', propClasses?.root)}
      onClick={navigateToProductDetails}
    >
      <div className={clsx('catalog_item-image_cart ', propClasses?.imageCart)}>
        <div className='catalog_item-image_cart_overlay'>
          {!!chipLabel && (
            <Chip
              className={classes.chipLabel}
              label={chipLabel}
              variant="default"
              size="small"
            />
          )}
          {isAvailable ? (
            showQuantity ? (
              <Box
                className='catalog_item-quantity_control '
                display="flex"
                justifyContent="space-evenly"
                alignItems="center"
              >
                <IconButton
                  className='catalog_item-quantity_button'
                  disabled={quantity === 0}
                  aria-label="remove"
                  onClick={onQuantityPlusMinusClicked("-")}
                >
                  <img src={MinusButton_Icon} height="40px" width="40px" alt="minus"/>
                </IconButton>
                <div className={clsx('catalog_item-item_number', 'catalog_item-price')}>
                  {quantity}
                </div>
                <IconButton
                  className='catalog_item-quantity_button'
                  aria-label="add"
                  onClick={onQuantityPlusMinusClicked("+")}
                >
                    <img src={AddButton_Icon} height="40px" width="40px" alt="minus"/>
                </IconButton>
              </Box>
            ) : (
              <IconButton
                className='catalog_item-cart_icon'
                size="small"
                onClick={onBottonLeftIconClicked}
              >
                <ShoppingCartOutlinedIcon style={{ fontSize: 20 }} />
              </IconButton>
            )
          ) : null}
        </div>
        <img
          className={clsx(classes.productImage, propClasses?.productImage)}
          src={process.env.REACT_APP_IMAGE_CLOUDFRONT + props.image.replace("JPG","jpg")}
          alt={title}
        />
      </div>
      <div className='catalog_item-desc-box' >
        <div className={clsx('catalog_item-desc', propClasses?.desc)}>{title}</div>
      </div>
      <div className='catalog_item-price_section'>
        <span
          className={clsx('catalog_item-inline_text', 'catalog_item-price ')}
        >
          {formatCurrency(price)}
        </span>
        {(
          <Typography
            className={clsx('catalog_item-inline_text', 'catalog_item-original_price')}
            color="primary"
            component="p"
          >
            {!!priceBefore ? formatCurrency(priceBefore) : ""}
          </Typography>
        )}
      </div>
    </Box>
  );
});

export { CatalogItem };
