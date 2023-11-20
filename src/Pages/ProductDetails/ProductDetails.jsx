import React, { useState, useEffect, memo } from "react";
import { makeStyles, lighten } from '@material-ui/core/styles';
import { BackButton } from "@Common/BackButton";
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { ReactComponent as AddIcon } from '@Assets/svgs/plus-item-blue.svg';
import { ReactComponent as RemoveIcon } from '@Assets/svgs/minus-item-blue.svg';
import AddIcon2 from '@Assets/svgs/plus-item-blue.svg';
import RemoveIcon2 from '@Assets/svgs/minus-item-blue.svg';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import clsx from "clsx";
import { CartButton } from "@Common/CartButton/CartButton";
import { useCartContext } from "@Context/CartContext";
import { useStoreContext } from "@Context/StoreContext";
import { useCurrency } from "@Hook/useCurrency";
import { getCatalogItemByProductId, getRecommendations } from "@API/api";
import { useParams } from "react-router-dom";
import { CatalogHorizontal } from "@Common/Catalogs";
import { Loader } from "@Common/Loader";
import { useHistory } from "react-router-dom";
import { routes } from "src/constants/routes.constant";
import { MandatoryOption } from './MandatoryOption';
import { ShoppingType } from "@Context/CartContext";
import { useAlertContext } from '@Context/AlertContext';
import { StoreSelectorModal } from "@Common/StoreSelector";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
    background: theme.palette.grey[100],
    minHeight: '100vh',
    position: 'relative'
  },
  backButton: {
    color: theme.palette.primary.main,
  },
  productImage: {
    width: 'auto',
    height: '40rem',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    "&>img": {
      width: '100%',
      height: 'auto',
    },
    [theme.breakpoints.down("xs")]: {
      height: '350px',
    }
  },
  card: {
    width: '50%',
    margin: '-2rem auto 0',
    borderRadius: '1rem',
    textAlign: 'center',
    color: theme.palette.grey[700],
    [theme.breakpoints.down("xs")]: {
      width: '20rem',
    }
  },
  inlineText: {
    display: 'inline',
  },
  cardHeaderIcon: {
    marginRight: '1rem',
    verticalAlign: 'sub',
    color: theme.palette.primary.main,
  },
  cardHeaderText: {
    lineHeight: '1.5rem',
    fontFamily: 'din_bold, din_regular',
  },
  price: {
    fontFamily: 'din_bold, din_regular',
  },
  bold: {
    fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
  },
  originalPrice: {
    marginLeft: '0.25rem',
    textDecoration: 'line-through',
    fontSize: '0.8rem'
  },
  description: {
    marginTop: '0.5rem',
    minHeight: '3rem'
  },
  iconButton: {
    // backgroundColor: `${lighten(theme.palette.primary.light, 0.5)}`,
    // color: theme.palette.primary.main
  },
  disableIconImage: {
    width: '40px'
  },
  disabledIconButton: {
    backgroundColor: `${lighten(theme.palette.secondary.main, 0.5)}`,
    // color: theme.palette.customGrey.light
    opacity: 0.4
  },
  itemNumber: {
    margin: '0 0.5rem',
    display: 'inline',
    fontFamily: 'din_bold, din_regular',
  },
  addToCartButton: {
    marginTop: '1rem',
    padding: '0.7rem',
    borderRadius: '2rem',
    fontWeight: theme.typography.platformFontWeight,
    fontSize: '0.85rem',
    color: `${theme.palette.secondary.main}`,
  },
  addToCartButtonContainer: {
    paddingRight: '2rem',
    paddingLeft: '2rem',
  },
  addToCartButtonColor: {
    backgroundColor: `${theme.palette.primary.main}`,
    // '&:active':{
    //   backgroundColor: `${theme.palette.primary.main}`,
    // },
    '&:hover': {
      backgroundColor: `${theme.palette.primary.main}`,
    },
  },
  disabledAddToCartButtonColor: {
    backgroundColor: `${theme.palette.customGrey.light}`,
    '&:hover': {
      backgroundColor: `${theme.palette.customGrey.light}`,
    },
  },
  discountTag: {
    position: 'absolute',
    top: '2.5rem',
    left: '0.5rem',
    background: theme.palette.discount.main,
    borderRadius: '2rem',
    padding: '0.5rem 1rem',
    color: theme.palette.secondary.main
  },
  unavailableTag: {
    position: 'absolute',
    top: '3.3rem',
    left: '0.5rem',
    background: theme.palette.customGrey.light,
    borderRadius: '2rem',
    padding: '0.6rem 2rem',
    color: theme.palette.secondary.main,
    fontWeight: theme.typography.platformFontWeight,
    fontSize: "14px",
    height: "14px",
    display: "flex",
    alignItems: "center"
  },
  cartButton: {
    position: 'fixed',
    // right: '5rem',
    right: '20px',
    top: '20px',
    // top: '2.75rem',
    zIndex: 1,
    boxShadow: 'unset',
    [theme.breakpoints.up("lg")]: {
      right: '15rem',
    },
    [theme.breakpoints.down("xs")]: {
      right: '1rem',
      top: '1rem',
    }
  },
  alsoOrderedWrapper: {
    padding: '1rem 0 2rem'
  },
  cardContentPadding: {
    // paddingRight: '2rem',
    // paddingLeft: '2rem',
    // paddingTop: '1rem',
    // paddingBottom: '1rem',
  },
}));
const ProductDetails = memo(() => {
  const classes = useStyles();
  const { formatCurrency } = useCurrency();
  const history = useHistory();
  const { id } = useParams();
  const { cart, updateCartItemQuantity, getItemQuantity, shoppingType, formatProducts, removeCartItem } = useCartContext();
  const { selectedStore } = useStoreContext();
  const { pushAlertPopUp } = useAlertContext();

  const [tempQuantity, setTempQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [itemData, setItemData] = useState(null);
  const [recommendations, setRecommendations] = useState(undefined);
  const [isSelectStoreModalOpened, setIsSelectStoreModalOpened] = React.useState(false);

  // Call API to get product details
  useEffect(() => {
    // get the product based on product id
    getCatalogItemByProductId(id, shoppingType, selectedStore?.storeId).then(details => {
      // add duplicate values
      details['productImage'] = details.image;
      details['id'] = details.productId;
      details['productName'] = details.title;
      details['mandatoryItem'] = false;      // default set to false
      // check if got discount
      details.priceBefore = null;
      if (details.discountedPrice < details.price) {
        details.priceBefore = details.price;
        details.price = details.discountedPrice;
      }
      // console.log(details);
      setItemData(details);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, id, shoppingType]);    // couldnt change store here so dont need store as dependency

  useEffect(() => {
    getRecommendations(shoppingType, selectedStore ? selectedStore.storeId : "").then(res => {
      setRecommendations(formatProducts(res));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore, shoppingType])

  // Auto set item quantity and isInCart if in cart when cart changes or itemDate loaded
  React.useEffect(() => {
    if (itemData) {
      const quantity = getItemQuantity(itemData);
      if(quantity===0){
        setTempQuantity(tempQuantity)
      }
      else{
      setTempQuantity(quantity);
      }
      setIsInCart(quantity > 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, itemData]);

  const onCartButtonClick = () => {
    // console.log(JSON.stringify(itemData));
    if (!selectedStore) {
      // pushAlertPopUp(`Please select a store before add item to cart`);
      setIsSelectStoreModalOpened(true);
    } else if (itemData.isDisabled) {
      return;
    } else {
      if (tempQuantity === 0) {
        setIsInCart(false);
        removeCartItem({ ...itemData }, true);
      } else {
        updateCartItemQuantity({ ...itemData }, tempQuantity);
      }
    }
  };

  const navigateToProductListing = (catalog) => () => {
    history.push({
      pathname: routes.productListing.replace(":id", 'recommendations'),
    });
  };

  const setTempQuantityMethod = (quantity) => {
    if (itemData.isDisabled) return;
    if (shoppingType === ShoppingType.Delivery) {
      if (quantity > ecommerceMaximumQuantity) {
        pushAlertPopUp('The item quantity has exceeded the maximum order quantity');
        return;
      }
    } else {
      if (tempQuantity > pickupMaximumQuantity) {
        pushAlertPopUp('The item quantity has exceeded the maximum order quantity');
        return;
      }
    }
    setTempQuantity(quantity);
  }

  if (itemData === null) {
    return <Loader />;
  }

  const { isDisabled, promotionDescription, image, title, price, priceBefore, description, mandatoryItem, productId, ecommerceMaximumQuantity, pickupMaximumQuantity } = itemData;
  let chipLabel = '';
  let tagClass = '';
  if (isDisabled) {
    chipLabel = "Unavailable";
    tagClass = classes.unavailableTag;
  } else if (promotionDescription) {
    chipLabel = promotionDescription;
    tagClass = classes.discountTag;
  }

  return (<>
    <Container className={classes.root}>
      {
        cart.length > 0 &&
        <CartButton className={classes.cartButton} isSquare />
      }
      <div className={classes.productImage} style={{ backgroundImage: `url('${process.env.REACT_APP_IMAGE_CLOUDFRONT}${image.replace("JPG", "jpg")}')` }}>
        <BackButton className={'backButton-withoutHeader'} />
      </div>
      {
        <div className={tagClass}>{chipLabel}</div>
      }
      <Card className={classes.card}>
        <CardContent className={classes.cardContentPadding}>
          <div>
            {/* <FavoriteBorderIcon className={clsx(classes.cardHeaderIcon, classes.inlineText)} /> */}
            <div className={clsx(classes.cardHeaderText, classes.inlineText)} gutterBottom >
              {title}
            </div>
          </div>
          <div>
            <Typography className={clsx(classes.inlineText, classes.price)} component="p">
              {formatCurrency(price)}
            </Typography>
            {
              !!priceBefore && <Typography className={clsx(classes.inlineText, classes.originalPrice)} variant="body1" color="primary" component="p">
                {formatCurrency(priceBefore)}
              </Typography>
            }
          </div>
          <Typography className={classes.description} variant="body2" color="textSecondary" component="p">
            {description}
          </Typography>
          {
            isInCart ?
              <MandatoryOption isMandatory={mandatoryItem} productId={productId} /> : <></>
          }
          <div>
            {isDisabled || tempQuantity <= 0 ? (
              <IconButton className={isDisabled ? classes.disabledIconButton : classes.iconButton} disabled aria-label="remove">
                <img src={RemoveIcon2} className={clsx(classes.disableIconImage, classes.disabledIconButton)} alt='disabled minus' />
              </IconButton>
            ) : (
              <IconButton className={isDisabled ? classes.disabledIconButton : classes.iconButton} disabled={tempQuantity === 0} aria-label="remove" onClick={() => setTempQuantityMethod(tempQuantity - 1)}>
                <RemoveIcon />
              </IconButton>
            )}
            <div className={clsx(classes.itemNumber)}>{tempQuantity}</div>
            {isDisabled ? (
              <IconButton className={isDisabled ? classes.disabledIconButton : classes.iconButton} disabled aria-label="add">
                <img src={AddIcon2} className={clsx(classes.disableIconImage, classes.disabledIconButton)} alt='disabled add' />
              </IconButton>
            ) : (
              <IconButton className={isDisabled ? classes.disabledIconButton : classes.iconButton} aria-label="add" onClick={() => setTempQuantityMethod(tempQuantity + 1)}>
                <AddIcon />
              </IconButton>
            )}
          </div>
          <div className={classes.addToCartButtonContainer}>
            <Button className={clsx(classes.addToCartButton, isDisabled && classes.disabledAddToCartButtonColor, !isDisabled && classes.addToCartButtonColor)} variant="contained" onClick={onCartButtonClick} fullWidth>
              {isInCart ? "UPDATE CART QUANTITY" : "ADD TO CART"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className={classes.alsoOrderedWrapper}>
        <CatalogHorizontal title="People Also Ordered" catalogItems={recommendations} onViewMoreClicked={navigateToProductListing()} />
      </div>
    </Container>
    {
      isSelectStoreModalOpened &&
      <StoreSelectorModal
        open={isSelectStoreModalOpened}
        setIsSelectStoreModalOpened={setIsSelectStoreModalOpened}
        onClose={() => setIsSelectStoreModalOpened(false)}
      />
    }
  </>
  );
});

export { ProductDetails };
