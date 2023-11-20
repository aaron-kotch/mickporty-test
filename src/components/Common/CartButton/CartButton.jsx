import React from "react";
import Fab from '@material-ui/core/Fab';
// import LocalMallOutlinedIcon from '@material-ui/icons/LocalMallOutlined';
import { ReactComponent as LocalMallOutlinedIcon } from '@Assets/svgs/shopping-bag.svg';
import Badge from '@material-ui/core/Badge';
import clsx from "clsx";
import { useHistory } from 'react-router-dom';
import { routes } from "src/constants/routes.constant";
import { useCartContext, ShoppingType } from "@Context/CartContext";
import { useStoreContext } from "@Context/StoreContext";
import { useAddressContext } from "@Context/AddressContext";
// import { useAlertContext } from '@Context/AlertContext';
import './CartButton.scss'

const CartButton = ({ className, isSquare = false, isShown = true }) => {
  // const classes = useStyles();
  const history = useHistory();
  const { cart, setMiscellaneousInfo, miscellaneousInfo, shoppingType } = useCartContext();
  const { selectedStore, setIsSelectStoreModalOpened } = useStoreContext();
  const { selectedAddress } = useAddressContext();
  // const { pushAlertPopUp } = useAlertContext();

  const totalItems = React.useMemo(() => cart.reduce((acc, { quantity }) => acc + quantity, 0), [cart]);

  const navigateToCart = () => {
    setMiscellaneousInfo({ ...miscellaneousInfo, paymentMethod: null });
    history.push({
      pathname: routes.cart
    });
  };

  const onButtonClick = () => {
    if (shoppingType === ShoppingType.Delivery && (!selectedAddress || !selectedStore)) {
      // pushAlertPopUp(`Please select a store before add item to cart`);
      setIsSelectStoreModalOpened(true);
    } else if (shoppingType === ShoppingType.PickUp && !selectedStore) {
      setIsSelectStoreModalOpened(true);
    } else {
      navigateToCart();
    }
  }

  return isShown || isSquare ?
    (<Fab color="primary" aria-label="add" className={clsx(className, { 'button-border': isSquare })} onClick={onButtonClick}>
      <Badge badgeContent={totalItems} color="error" classes={{ badge: !isSquare && 'button-badge' }}>
        <LocalMallOutlinedIcon />
      </Badge>
    </Fab>) : null
};

export { CartButton };
