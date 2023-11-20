import React, { useEffect } from "react";
import { usePromoContext } from "./PromoContext";
import { useAlertContext } from '@Context/AlertContext';
import { useAddressContext } from '@Context/AddressContext';
import { useCurrency } from "@Hook/useCurrency";
import moment from 'moment';

export const ShoppingType = {
  Delivery: "Delivery",
  PickUp: "PickUp",
};

const CartContext = React.createContext({
  cart: [],
  shoppingType: ShoppingType.Delivery,
  deliveryInfo: {
    name: "",
    address: "",
    noteToRider: "",
    time: "",
  },
  miscellaneousInfo: {
    paymentMethod: null,
    contactNumber: null,
    isCulteryRequested: false,
    remarks: "",
    oriDeliveryFee: 0,
    deliveryFee: 0,
    basketValue: null,
    deliveryDiscountAmount: null,
    deliverySurchargeAmount: 0,
  },
  addCartItem: (item) => { },
  updateCartItemQuantity: (item) => { },
  removeCartItem: (item, removeAll) => { },
  getAmount: (item) => { },
  getItemQuantity: (item) => { },
  setMiscellaneousInfo: (misc) => { },
  setDeliveryInfo: (deliveryInfo) => { },
  setShoppingType: () => { },
  replaceCart: (items) => { },
  subtotal: 0,
  total: 0,
});

const CartProvider = ({ children }) => {
  const { promoCodeInfo, freeItemCart, setFreeItemCart, promoCode, hasPromoCodeApplied } = usePromoContext();
  const { pushAlertPopUp, tngSetStorage, tngGetStorage } = useAlertContext();
  const { selectedAddress } = useAddressContext();
  const { formatCurrency } = useCurrency();


  const [shoppingType, setShoppingType] = React.useState(ShoppingType.Delivery);
  const [deliveryInfo, setDeliveryInfo] = React.useState({
    name: "",
    address: "",
    noteToRider: "",  // aka "notes" in address related component
    time: "asap",
  });
  const [miscellaneousInfo, setMiscellaneousInfo] = React.useState({
    paymentMethod: null,
    contactNumber: null,
    isCulteryRequested: false,
    remarks: "",
    deliveryFee: 0,
    deliverySurchargeAmount: 0
  });
  const [cart, setCart] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(null);
  const [total, setTotal] = React.useState(0);
  const [subtotal, setSubtotal] = React.useState(0);
  const [openLastItemConfirm, setOpenlastItemConfirm] = React.useState(false);
  const [removeLastItem, setRemoveLastItem] = React.useState(null);
  const [basketValueInfo, setBasketValueInfo] = React.useState({
    basketValue: null,
    freeDeliveryMessage: "",
    total: 0,
  })

  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    tngGetStorage('shoppingType',
      (data) => {
        if (data === ShoppingType.Delivery || data === ShoppingType.PickUp)
          setShoppingType(data)
      })
    tngGetStorage('cart',
      (data) => {
        if (data) {
          setCart(data)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (shoppingType === ShoppingType.Delivery || shoppingType === ShoppingType.PickUp)
      tngSetStorage('shoppingType', shoppingType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingType])

  useEffect(() => {
    if (Array.isArray(cart)) {
      tngSetStorage('cart', cart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart])


  const checkBasketValueInfo = (item) => {
    if (item.statusCode !== 200){
      return
    }
    if(item.basketValue){
      setBasketValueInfo({
        basketValue: item.basketValue,
        freeDeliveryMessage: item.freeDeliveryMessage,
      })
    }
  }
  const getItemAmount = (selected) => {
    return selected.price * selected.quantity;
  };

  const replaceCart = (items) => {
    setCart(prevCart => [...items]);
  };

  const updateCartItemQuantity = (selected, quantity) => {
    let cartItems = cart.map(p => ({ ...p }));
    const selectedIndex = cartItems.findIndex((item) => {
      if (!selected.id) {
        return item.id === selected.productId
      }
      return item.id === selected.id
    });
    if (selectedIndex > -1) { // already have similar item in cart
      if (shoppingType === ShoppingType.Delivery) {
        // console.log('cartItems[selectedIndex]',cartItems[selectedIndex]);
        if (quantity > cartItems[selectedIndex].ecommerceMaximumQuantity) {
          pushAlertPopUp('The item quantity has exceeded the maximum order quantity');
        } else {
          cartItems[selectedIndex].quantity = quantity;
        }
      } else {
        // console.log('cartItems[selectedIndex]',cartItems[selectedIndex]);
        if (quantity > cartItems[selectedIndex].pickupMaximumQuantity) {
          pushAlertPopUp('The item quantity has exceeded the maximum order quantity');
        } else {
          cartItems[selectedIndex].quantity = quantity;
        }
      }
    } else {    // item not in cart yet
      cartItems.push({ ...selected, quantity });
    }
    setCart(() => cartItems);
  }

  const removeCartItem = React.useCallback(
    (selected, all = false, callbackIfRemovingAll, noConfirmationPopUp = true) => {
      const cartItems = cart.map(p => ({ ...p }));
      const selectedIndex = cart.findIndex((item) => {
        if (!selected.id) {
          return item.id === selected.productId
        }
        return item.id === selected.id
      });
      if (selectedIndex > -1) {
        if (cartItems[selectedIndex].quantity > 1 && !all) {
          cartItems[selectedIndex].quantity -= 1;
          setCart(cartItems);
        } else {
          if (noConfirmationPopUp) {
            // console.log('cartItems', cartItems);
            cartItems.splice(selectedIndex, 1);
            tngSetStorage('cart', cartItems);
            setCart(cartItems);
          } else {
            setRemoveLastItem(() => () => {
              if (callbackIfRemovingAll) callbackIfRemovingAll();
              cartItems.splice(selectedIndex, 1);
              tngSetStorage('cart', cartItems);
              setCart(cartItems);
            });
            setOpenlastItemConfirm(() => true);
          }
        }
      }
    },
    // eslint-disable-next-line
    [cart]
  );

  const getItemQuantity = React.useCallback(
    (selected) => {
      const selectedIndex = cart.findIndex((item) => item.id === selected?.id);
      return selectedIndex > -1 ? cart[selectedIndex].quantity : 0;
    },
    [cart]
  );

  const formatProducts = (products = []) => {
    const after = products.map(p => {
      return {
        ...p,
        id: p.productId,
        productName: p.title,
        productImage: p.image,
        mandatoryItem: false
      }
    });
    return after;
  }

  const setMandatoryOption = (productId, value, isFreeItem) => {
    if (isFreeItem) {
      const tempCart = freeItemCart.map(p => ({ ...p }));
      const product = tempCart.find(p => p.productId === productId);
      product['mandatoryItem'] = value;
      setFreeItemCart(() => tempCart);
    } else {
      const tempCart = cart.map(p => ({ ...p }));
      const product = tempCart.find(p => p.productId === productId);
      product['mandatoryItem'] = value;
      setCart(() => tempCart);
    }
  }

  // set product become valid or invalid after changing store
  const isSomeProductsInvalid = (
    setHasProductInvalid,
    products,
    updatedCart
  ) => {
    // console.log('isSomeProductsInvalid', products);
    const invalidProducts = products?.filter((p) => p.status === "Invalid");
    // console.log('invalidProducts', invalidProducts);

    if (invalidProducts?.length > 0) {
      setHasProductInvalid(true);
    } else {
      setHasProductInvalid(false);
    }
    let hasProductInvalid = false;
    // if we shud check based on a new cart updated in checkIfPriceDiff
    const copy = updatedCart
      ? updatedCart.map((p) => ({ ...p }))
      : cart.map((p) => ({ ...p }));
    // check if the copy diff. Else will run into infinite loop when promocode applied and change quantity of product
    const cartIsDiff = copy.find((productInCart) => {
      const theTarget = products?.find(
        (p) => p.customerCartProductId === productInCart.productId
      );
      if (theTarget) {
        if (
          theTarget.status === "Valid" &&
          productInCart["isDisabled"] === false
        ) {
          return false;
        } else if (
          theTarget.status === "Invalid" &&
          productInCart["isDisabled"] === true
        ) {
          return false;
        } else {
          return true;
        }
      }
      return false;
    });
    // console.log('cartIsDiff',cartIsDiff)
    // console.log('freeItemCart',freeItemCart)
    // console.log('copy',copy)
    if (cartIsDiff || copy.length + freeItemCart.length !== products?.length) {
      copy.forEach((productInCart) => {
        const theTarget = products?.find(
          (p) => p.customerCartProductId === productInCart.productId
        );
        if (theTarget) {
          // need to validate cuz might be free product, they are not in cart
          if (theTarget.status === "Valid") {
            productInCart["isDisabled"] = false;
          } else {
            productInCart["isDisabled"] = true;
            hasProductInvalid = true;
          }
        }
      });

      // console.log('copy', copy);
      replaceCart(copy);
      return hasProductInvalid;
    }
  };
  // when token passed means getPlaceUser-OrderSqsData called after logged in
  const getPlaceUserOrderSqsData = (cart, timeLength, orderType, token, applyPromoCode = false, timeLabel, selectedStore,_hasPromocodeApplied=false) => {
    let dateObj;
    let isAdvancedOrder;
    // console.log(timeLabel);
    if (timeLabel.label.toLowerCase().includes('asap')) {
      dateObj = new Date(new Date().getTime() + timeLength * 60000)
      isAdvancedOrder = false
    } else {
      dateObj = moment(timeLabel.label, ["h:mm A"]).toDate();
      isAdvancedOrder = true
    }
    // console.log(dateObj);

    // limit the data pass to backend
    const tempCombinedCart = [...cart];
    const formattedCart = tempCombinedCart.map(p => {
      const {
        discountedPrice,
        image,
        mandatoryItem,
        price,
        productId,
        quantity,
        sku,
        title } = p;
      return {
        discountedPrice,
        image,
        mandatoryItem: mandatoryItem ? 1 : 0,
        price,
        productId,
        quantity,
        sku,
        title,
      }
    });
    return {
      productList: JSON.stringify(formattedCart),
      deliveryAddress: selectedAddress ?? null,
      floorOrUnit: selectedAddress?.address2,
      scheduledDateTime: dateObj.toISOString(),
      isAdvancedOrder: isAdvancedOrder,
      distance: selectedStore.distance,
      token: token,      // needed for check-Cart when applying promocode
      orderType: orderType,   // needed for check-Cart
      storeId: selectedStore ? selectedStore.storeId : null,
      noteToRider: deliveryInfo.noteToRider,
      miscellaneousInfo: miscellaneousInfo,
      promoCode: applyPromoCode && _hasPromocodeApplied ? promoCode : ""  // do not apply promo code for usual check-Cart
    };
  }

  const checkIfDeliveryFreeAfterCheckCart = (basketValue = 0, deliveryDiscountAmount = 0, oriDeliveryFee = 0, deliverySurchargeAmount = 0, isPromoCodeApplying=false) => {
    // console.log(basketValue, deliveryDiscountAmount, oriDeliveryFee);
    let promoCodeDiscount = promoCodeInfo.totalPromoDiscount
    if (!isPromoCodeApplying){
      promoCodeDiscount = 0
    }
    if ((subtotal - promoCodeDiscount) > basketValue && deliveryDiscountAmount) {
      let net = oriDeliveryFee - deliveryDiscountAmount
      if (net < 0) {
        net = 0;
      }
      setMiscellaneousInfo({ ...miscellaneousInfo, deliveryFee: net, basketValue: basketValue, deliveryDiscountAmount: deliveryDiscountAmount, oriDeliveryFee: oriDeliveryFee, deliverySurchargeAmount: deliverySurchargeAmount });
    } else {
      setMiscellaneousInfo({ ...miscellaneousInfo, deliveryFee: oriDeliveryFee, basketValue: basketValue, deliveryDiscountAmount: deliveryDiscountAmount, oriDeliveryFee: oriDeliveryFee, deliverySurchargeAmount: deliverySurchargeAmount });
    }
  }
  const checkIfDeliveryFreeWhenCartChanged = (subtotal) => {
    const { basketValue = 0, deliveryDiscountAmount = 0, oriDeliveryFee = 0 } = miscellaneousInfo;
    if ((subtotal - promoCodeInfo.totalPromoDiscount) > basketValue && deliveryDiscountAmount) {
      let net = oriDeliveryFee - deliveryDiscountAmount
      if (net < 0) {
        net = 0;
      }
      setMiscellaneousInfo({ ...miscellaneousInfo, deliveryFee: net, basketValue: basketValue, deliveryDiscountAmount: deliveryDiscountAmount, oriDeliveryFee: oriDeliveryFee });
    } else {
      setMiscellaneousInfo({ ...miscellaneousInfo, deliveryFee: oriDeliveryFee, basketValue: basketValue, deliveryDiscountAmount: deliveryDiscountAmount, oriDeliveryFee: oriDeliveryFee });
    }
  }

  React.useEffect(() => {
    setSubtotal(() =>
      cart.reduce((sum, item) => {
        if (item.discountedPrice < item.price) {
          return (sum += item.discountedPrice * item.quantity)
        }
        return (sum += item.price * item.quantity)
      }, 0)
    );
  }, [cart]);

  // React.useEffect(() => {
  //   // console.log('subtotal changed', subtotal);
  //   checkIfDeliveryFreeWhenCartChanged(subtotal);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [subtotal]);

  React.useEffect(() => {
    setTotal(() => {
      const tempTotal = (subtotal - promoCodeInfo.totalPromoDiscount) + miscellaneousInfo.deliveryFee + miscellaneousInfo.deliverySurchargeAmount;
      // console.log(`subtotal`, subtotal);
      // console.log(`miscellaneousInfo`, miscellaneousInfo);
      // console.log(`promoCodeInfo`, promoCodeInfo);
      // console.log(`tempTotal`, tempTotal);
      return tempTotal < 0 ? 0 : tempTotal;
    });
  }, [cart, subtotal, miscellaneousInfo, promoCodeInfo]);

  React.useEffect(() => {
    if(basketValueInfo.basketValue){
      let percentage = (subtotal / basketValueInfo.basketValue) * 100
      if(percentage < 100){
        const previousPercentage = progress
        if (previousPercentage === 100){
          let value = basketValueInfo.basketValue - subtotal
          setBasketValueInfo({...basketValueInfo, freeDeliveryMessage: `${formatCurrency(value)} more to free delivery`})
        }
        setProgress(percentage)
      } else {
        setProgress(100)
      }
    }
  }, [basketValueInfo.basketValue, subtotal])

  return (
    <CartContext.Provider
      value={{
        cart,
        deliveryInfo,
        miscellaneousInfo,
        replaceCart,
        setDeliveryInfo,
        setMiscellaneousInfo,
        // addCartItem,
        removeCartItem,
        getItemAmount,
        getItemQuantity,
        updateCartItemQuantity,
        isLoading,
        total,
        subtotal,
        setShoppingType,
        shoppingType,
        formatProducts,
        setMandatoryOption,
        setIsLoading,
        openLastItemConfirm,
        setOpenlastItemConfirm,
        removeLastItem,
        getPlaceUserOrderSqsData,
        isSomeProductsInvalid,
        checkIfDeliveryFreeAfterCheckCart,
        basketValueInfo,
        checkBasketValueInfo,
        progress,
        setProgress
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCartContext = () => {
  return React.useContext(CartContext);
};

export { CartProvider, useCartContext };
