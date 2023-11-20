import React, { useState, useEffect } from "react";
import { Header } from "@Common/Header";
import { BackButton } from "@Common/BackButton";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { PageHeader } from "@Common/PageHeader/PageHeader";
import { EmptyState } from "@Common/EmptyState/EmptyState";
import { OrderList } from "@Common/OrderList/OrderList";
import { useCartContext } from "@Context/CartContext";
import { useCurrency } from "@Hook/useCurrency";
import { TextField, FormControlLabel, Checkbox, makeStyles, lighten, Typography, Button, CircularProgress, withStyles, LinearProgress } from '@material-ui/core'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useAction } from "@Hook/useAction";
import clsx from "clsx";
import { useHistory } from "react-router-dom";
import { routes } from "src/constants/routes.constant";
import { useAddressContext } from "@Context/AddressContext";
import { DeliveryTime } from "./DeliveryTime";
import { useStoreContext } from "@Context/StoreContext";
import { ShoppingType } from "@Context/CartContext";
import { StoreSelectorModal } from "@Common/StoreSelector";
import { placeUserOrderSqs, placeUserOrderSqsPickUp, getPlaceUserOrderMessage, checkCart, getCartRecommendations, getUserPendingOrder } from '@API/api';
import { useUserContext } from "@Context/UserContext";
import { CatalogHorizontal } from "@Common/Catalogs";
import { OverlayLoader } from "@Common/Loader";
import DisabledBottomBar from './DisabledBottomBar';
import { usePromoContext } from "@Context/PromoContext";
import ErrorIcon from "@Assets/svgs/alert-icon-white.svg";
import Fork_Icon from "@Assets/svgs/fork.svg"
import Marker_Icon from "@Assets/svgs/marker.svg"
import { SecondaryButton } from '@View/Button/Button'
import { PullToRefresh } from "react-js-pull-to-refresh";
import { useAlertContext } from "@Context/AlertContext";
import "./Cart.scss"
import { Pages } from "@Context/PageContext";

// Promise helpers
Promise.wait = (time) => new Promise(resolve => setTimeout(resolve, time || 0));
Promise.retry = (countLeft, fn, delay) => fn().catch(err => countLeft > 0 ? Promise.wait(delay).then(() => Promise.retry(countLeft - 1, fn, delay)) : Promise.reject('failed: countLeft 0'));

const RefreshContent = () => {
  return (
    <div style={{ position: "absolute", left: "50%", top: "3%", backgroundColor: "White" }} >
      <CircularProgress size={30} style={{ color: "black" }} />
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  sectionWrapper: {
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  sectionHeader: {
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
    color: theme.palette.grey[700]
  },
  sectionContentDivider: {
    borderTop: `1px solid ${theme.palette.grey[300]}`
  },
  sectionContent: {
    fontSize: '0.8rem',
    color: theme.palette.grey[600]
  },
  label: {
    width: '100%',
    marginLeft: '-1.2rem'

  },
  deliveryMessage: {
    fontFamily: 'din_regular',
    color: theme.palette.grey[700]
  },
  total: {
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
    color: theme.palette.grey[700]
  },
  disabledTotal: {
    color: theme.palette.grey[700]
  },
  disabledPlaceOrder: {
    color: theme.palette.grey[500]
  },
  footer: {
    background: theme.palette.customGrey.lighter,
  },
  footerProgressBar: {
    backgroundColor: theme.palette.secondary.main
  },
  paymentButton: {
    marginTop: '0.5rem',
    borderColor: theme.palette.grey[300]
  },
  section: {
    paddingTop: '1rem'
  },
  alert: {
    backgroundColor: `${lighten(theme.palette.primary.light, 0.5)}`,
  },
  alsoOrderedWrapper: {
    padding: '1rem 0rem 0rem'
  },
  promoRemoveButton: {
    color: theme.palette.primary.main,
    fontSize: '0.73rem',
    padding: '0rem 1rem'
  },
  tncLink: {
    color: theme.palette.primary.main,
  },
  smallMarginTop: {
    marginTop: '0.5rem',
  },
  mediumMarginTop: {
    marginTop: '1.5rem',
  },
  title: {
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
    color: theme.palette.grey[700],
    flex: 1,
  },
  noWrap: {
    whiteSpace: "nowrap"
  },
  bold: {
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
  },
  boldMedium: {
    fontWeight: theme.typography.platformFontWeightMedium,
  },
  boldLight: {
    fontWeight: theme.typography.platformFontWeightLight,
  },
}));

const CustomLinearProgress = withStyles(theme => ({
  colorPrimary: {
    backgroundColor: '#B2DFDB',
  },
  barColorPrimary: {
    backgroundColor: theme.palette.success.main
  }
}))(LinearProgress);

const Cart = () => {
  const classes = useStyles();
  const history = useHistory();
  const { formatCurrency } = useCurrency();
  const { shoppingType, cart, deliveryInfo, setDeliveryInfo, miscellaneousInfo, setMiscellaneousInfo, total, subtotal, replaceCart, formatProducts, getPlaceUserOrderSqsData, isSomeProductsInvalid, checkIfDeliveryFreeAfterCheckCart, checkBasketValueInfo, basketValueInfo, progress } = useCartContext();
  const { checkIsActionCallable } = useAction();
  const { selectedAddress, setEditingAddrInCart } = useAddressContext();
  const { user, isNeedEmail } = useUserContext();
  const { pushAlertPopUp } = useAlertContext();
  const { selectedStore } = useStoreContext();
  const { isPromoCodeApplying, removePromoCode, checkPromoStatus, promoCodeInfo, promoCode, setPromoCode, freeItemCart, setHasPromoCodeApplied,hasPromoCodeApplied } = usePromoContext();

  const [isSelectStoreModalOpened, setIsSelectStoreModalOpened] = useState(false);
  const [hasProductInvalid, setHasProductInvalid] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [paying, setPaying] = useState(false);
  const [timeLabel, setTimeLabel] = useState({ label: 'ASAP', value: 'asap' });

  const [refreshData, setRefreshData] = useState(false);
  const onRefresh = () => {
    return new Promise((resolve) => {
      setRefreshData(true)
      setTimeout(() => {
        setRefreshData(false)
        resolve();
      }, 3000)
    });
  }

  const selectAddress = () => {
    setIsSelectStoreModalOpened(true);
  }

  const editNote = () => {
    if (!selectedAddress) {
      selectAddress();
      return;
    }
    // console.log('navigate to', selectedAddress.id)
    setEditingAddrInCart(true);
    history.push({ pathname: routes.editAddress.replace(':id', selectedAddress.id) });
  }

  // check if price is diff from check-Cart, pick up may lower the price
  // return the price updated cart if it is diff from response
  const checkIfPriceDiff = (responseProducts) => {
    // console.log(cart);
    // response of checkcart will return items in diff sequence that we submitted
    const diffPriceProduct = cart.filter(item => {
      const itemInResponse = responseProducts.find(p => p.customerCartProductId === item.productId);
      return itemInResponse.price !== item.price || itemInResponse.discountedPrice !== item.discountedPrice;
    });
    // console.log('diffPriceProduct',diffPriceProduct);
    // console.log('responseProducts',responseProducts);
    if (diffPriceProduct.length > 0) {
      // update price for every item in cart
      const copy = cart.map(p => ({ ...p }));
      const formattedCartPriceUpdated = copy.map((item) => {
        const itemInResponse = responseProducts.find(p => p.customerCartProductId === item.productId);
        // console.log('itemInResponse',itemInResponse);
        if (!itemInResponse) {
          return item;
        } else {
          return {
            ...item,
            price: itemInResponse.price,
            discountedPrice: itemInResponse.discountedPrice
          }
        }
      });
      // console.log('return formattedCartPriceUpdated', formattedCartPriceUpdated)
      return formattedCartPriceUpdated;
    }
    return null;
  }

  const submitOrder = () => {
    checkIsActionCallable((token = user.token, primaryEmail = user.PrimaryEmail) => {

      if (isNeedEmail) {
        history.push(({ pathname: routes.submitEmail }))
      }
      setPaying(true);

      const values = getPlaceUserOrderSqsData(cart, 30, shoppingType, token, true, timeLabel, selectedStore,hasPromoCodeApplied);
      // check if status of product is "Valid" at the moment of making payment
      checkCart(values).then(async res => {

        if(res.statusCode !==200){
          console.log('return1')
          pushAlertPopUp(res.errorMessage);
          setPaying(false);
          return;
        }

        else if (res.products && isSomeProductsInvalid(setHasProductInvalid, res.products)) return;
        // loop throught cart to change the price of each product
        // PickUp will lower the price of product
        const resultCart = checkIfPriceDiff(res.products);
        let values2 = values;
        if (resultCart) {
          values2 = getPlaceUserOrderSqsData(resultCart, 30, shoppingType, token, true, timeLabel, selectedStore);
        }
        // check promo status
        let isFreeProductDiscountType = false;
        if (res.products.find(p => p.isFreeItem)) {
          isFreeProductDiscountType = true;
        }
        const { errorMessage, promoCode, promoTitle, totalPromoDiscount } = res;
        if (isPromoCodeApplying) {
          const canProceed = checkPromoStatus(errorMessage, promoCode, promoTitle, totalPromoDiscount, isFreeProductDiscountType, res.products);
          if (!canProceed) {
            setPaying(false);
            return;
          }
        }

        let returnedPromise;
        if (shoppingType === ShoppingType.PickUp) {
          returnedPromise = placeUserOrderSqsPickUp(values2);
        } else {
          returnedPromise = placeUserOrderSqs(values2);
        }

        await returnedPromise.then(async res => {
          // pushAlertPopUp('placeUserOrderSqs returned response.', JSON.stringify(res));
          const delay = 2000;
          const tries = 10;
          return await Promise.retry(tries, async () => retryUntilSuccessAndPay(res.msgId, token, primaryEmail), delay)
            .catch(err => {
              pushAlertPopUp('Place order fail. Please try again');
              setPaying(false);
              return err;
            });
        }).catch(err => {
          pushAlertPopUp('Place order fail. Please try again');
          return err;
        })
      }).catch(err => {
        pushAlertPopUp('Place order fail. Please try again');
      })
    });
  };

  const retryUntilSuccessAndPay = async (msgId, token, primaryEmail) => {
    // console.log('retryUntilSuccessAndPay primaryEmail',primaryEmail)
    // pushAlertPopUp('user token b4 getPlaceUserOrderMessage', user.token);
    function onSuccess(orderMsgRes) {
      pushAlertPopUp(`Thanks for ordering with us!`, `Your order status will be emailed to ${primaryEmail}`);
      removePromoCode();
      replaceCart([]);
      const tries = 8, delay = 2000;
      Promise.retry(tries, async () => retryUntilOrderInPendingOrders(token, orderMsgRes.orderId), delay)
        .then(res => {
          // res is "Just made order in pending orders"
          history.replace({ pathname: routes.ongoingOrder.replace(':id', orderMsgRes.orderId) });
        }).catch(err => {
          pushAlertPopUp('The order payment is processing, please check your order at MY ORDER page');
          history.replace({ pathname: routes.home });
          return err;
        })
    }
    const result = await getPlaceUserOrderMessage(msgId, token).then(orderMsgRes => {
      const { status, paymentUrl } = orderMsgRes;
      if (status !== 'true') {
        // pushAlertPopUp('Status not true', `Status from getPlaceUserOrderMessage: ${res.status}`);
        throw new Error('Status not equal to true. Try again.');
      } else if (paymentUrl.includes("no-payment.html")) {
        // "https://d102dno33o9pa9.cloudfront.net/public/static-html/no-payment.html"
        onSuccess(orderMsgRes);
        return Promise.resolve('Done Payment');
      }
      // pushAlertPopUp('getPlaceUserOrderMessage response', JSON.stringify(orderMsgRes.orderId));
      try {
        // eslint-disable-next-line no-undef
        my.tradePay({
          paymentUrl: paymentUrl,
          success: (res) => {
            if (res.resultCode === "9000") {
              onSuccess(orderMsgRes);
            } else {
              switch (res.resultCode) {
                case "8000":
                  pushAlertPopUp('The order payment is processing, please check your order at MY ORDER page');
                  break;
                case "4000":
                  pushAlertPopUp('Payment failed. Please try again.');
                  break;
                case "6001":
                  // pushAlertPopUp('User cancel to pay.');
                  break;
                case "6002":
                  pushAlertPopUp('Problem connecting network, please try again');
                  break;
                case "6004":
                  pushAlertPopUp('Payment failed. Please try again.');
                  break;
                default:
                  pushAlertPopUp('Payment failed. Please try again.');
                  break;
              }
              setPaying(false);
            }
          },
          fail: (err) => {
            pushAlertPopUp('Payment failed. Please try again.');
            setPaying(false);
          }
        });
      } catch {
        pushAlertPopUp('Payment failed. Please try again.');
        setPaying(false);
      }
    });
    if (result === "Done Payment") {
      return Promise.resolve('Finally Done Payment');
    }
  }

  const retryUntilOrderInPendingOrders = async (token, orderIdOfJustMadeOrder) => {
    return await getUserPendingOrder(token).then(res => {
      if (res[0].orderId !== orderIdOfJustMadeOrder) {
        // pushAlertPopUp('Just-made order not in pending orders. Trying again...');
        throw new Error('Just-made order not in pending orders. Try again.');
      }
      // pushAlertPopUp('Just made order in pending orders');
      return "Just made order in pending orders";
    })
  }

  // remove the message at the top if no invalid product in cart
  const checkCartIsProductsInvalid = (products) => {
    const invalidProducts = products.filter(p => p.isDisabled === true);
    if (invalidProducts.length !== 0) {
      setHasProductInvalid(true);
      return true;
    } else {
      setHasProductInvalid(false);
      return false;
    }
  }

  // get recommendations when selected store changed or refreshData changed to true
  useEffect(() => {
    if (selectedStore) {
      getCartRecommendations(shoppingType, selectedStore.storeId).then(res => {
        setRecommendations(formatProducts(res));
        const temp = formatProducts(res).filter(p => {
          return !cart.find(productInCart => productInCart.productId === p.productId);
        })
        setFilteredRecommendations(temp);
      });
    }
    // user can't change shopping type so no shoppingType as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore]);

  useEffect(() => {
    if (refreshData === true && selectedStore) {
      getCartRecommendations(shoppingType, selectedStore.storeId).then(res => {
        setRecommendations(formatProducts(res));
        const temp = formatProducts(res).filter(p => {
          return !cart.find(productInCart => productInCart.productId === p.productId);
        })
        setFilteredRecommendations(temp);
      });
    }
    // user can't change shopping type so no shoppingType as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

  // set delivery info when these dependencies changed
  useEffect(() => {
    if (shoppingType === ShoppingType.Delivery) {
      setDeliveryInfo((prev) => ({
        ...prev,
        name: selectedAddress?.title,
        address: `${selectedAddress?.address2 || ""}${selectedAddress?.address || ""}`,
        noteToRider: selectedAddress?.notes
      }));
    }
    else {
      setDeliveryInfo((prev) => ({
        ...prev,
        name: selectedStore?.storeName || "",
        address: selectedStore?.address || "",
        noteToRider: ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress, selectedStore, shoppingType]);

  const checkCartMethod = (hasPromo=true) => {
    // console.log('before checkCart, selectedStore is', `${JSON.stringify(selectedStore.storeName)}`)
    // console.log('before checkCart, selectedAddress is', `${JSON.stringify(selectedAddress)}`)
    const values = getPlaceUserOrderSqsData(cart, 30, shoppingType, user.token, false, timeLabel, selectedStore);
    checkCart(values).then(res => {
      // compare to see if needed then only replace cart
      const resultCart = checkIfPriceDiff(res.products);
      if (resultCart) {
        // console.log('result cart', resultCart);
        replaceCart(resultCart);
        isSomeProductsInvalid(setHasProductInvalid, res.products, resultCart);
      } else {
        isSomeProductsInvalid(setHasProductInvalid, res.products);
      }
      //check basketValue amount
      checkBasketValueInfo(res)
      // check if delivery fee is FREE
      checkIfDeliveryFreeAfterCheckCart(res.basketValue, res.deliveryDiscountAmount, res.deliveryFee, res.deliverySurchargeAmount, hasPromo);
    }).catch(err => {
      // ;
      // pushAlertPopUp('Error when checking product availability',JSON.stringify(err));


      pushAlertPopUp(`Problem connecting to server. Please try again later`);
      return err;
    });
  }
  // Check if product available, 
  // update the price if the product added in home page (in that few seconds) 
  // when original shopping type of delivery changed to pick up
  // but haven't trigger refresh of products in home page.
  // Get delivery fee if selectedStore changed
  useEffect(() => {
    if (selectedStore && cart.length !== 0) {
      // console.log('check cart in useEffect')
      checkCartMethod(isPromoCodeApplying);
    }
    // can't change shopping type so no shoppingType as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore]);

  useEffect(() => {
    if (refreshData === true && selectedStore && cart.length !== 0) {
      checkCartMethod(isPromoCodeApplying);
    }
    // can't change shopping type so no shoppingType as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

  useEffect(() => {
    if (isPromoCodeApplying && !paying) {
      onPromoCodeApplied();
    }
    checkCartIsProductsInvalid([...cart, ...freeItemCart]);
    const temp = recommendations.filter(p => {
      return !cart.find(productInCart => productInCart.productId === p.productId);
    })
    setFilteredRecommendations(temp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal])

  useEffect(() => {
    if (!isPromoCodeApplying && !paying){
      checkCartMethod(isPromoCodeApplying)
    }
  }, [subtotal])

  useEffect(() => {
    if (refreshData === true) {
      if (isPromoCodeApplying && !paying) {
        onPromoCodeApplied();
      }
      checkCartIsProductsInvalid([...cart, ...freeItemCart]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData])

  const navigateToProductListing = (catalog) => () => {
    history.push({
      pathname: routes.productListing.replace(":id", 'recommendations'),
    });
  };

  const onChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    // if it's promocode
    if (name === "promoCode") {
      setPromoCode(() => value.toUpperCase());
      setHasPromoCodeApplied(false);
    } else {
      setMiscellaneousInfo({
        ...miscellaneousInfo,
        [name]: value
      });
    }
  }

  const checkCartWithPromoCode = (values) => {
    checkCart(values).then(res => {
      checkBasketValueInfo(res)
      // in case delivery fee changed and some product become invalid
      checkIfDeliveryFreeAfterCheckCart(res.basketValue, res.deliveryDiscountAmount, res.deliveryFee, res.deliverySurchargeAmount);
      let isFreeProductDiscountType = false;
      if (res.products && isSomeProductsInvalid(setHasProductInvalid, res.products)) {
        // console.log('Some Products Invalid');
      } else {
        if (res.products && res.products.find(p => p.isFreeItem)) {
          isFreeProductDiscountType = true;
        }
      };
      const { errorMessage, promoCode, promoTitle, totalPromoDiscount } = res;
      // const debugPurpose = {errorMessage, promoCode, promoTitle, totalPromoDiscount};
      // pushAlertPopUp('checkPromoStatus');
      checkPromoStatus(errorMessage, promoCode, promoTitle, totalPromoDiscount, isFreeProductDiscountType, res.products);
    }).catch(err => {
      pushAlertPopUp(`Problem connecting to server. Please try again later`);
      console.error(err);
    });
  }
  const onPromoCodeApplied = (event) => {
    checkIsActionCallable((token = user.token) => {
      // pass token after login
      let _hasPromocodeApplied = false
      if(promoCode.length>0){
        setHasPromoCodeApplied(true)
        _hasPromocodeApplied = true
      }
      const values = getPlaceUserOrderSqsData(cart, 30, shoppingType, token, true, timeLabel, selectedStore,_hasPromocodeApplied);
      checkCartWithPromoCode(values);
    })
  }

  if (paying) return <OverlayLoader />;

  return (
    <PageLayout
      header={
        <Header
          leftSlot={<BackButton />}
          centerSlot={<PageHeader>CART</PageHeader>}
        />
      }
      containerFullHeigth
      PageName={Pages.cart}

      body={
        cart.length === 0 ? <>
          <EmptyState title="Your Shopping Cart is empty" description="Continue shopping and get it filled with your favourite item(s)." />
          <DisabledBottomBar total={'RM 0.00'} noItemInCart />
        </> : <PullToRefresh
          pullDownThreshold={0}
          onRefresh={onRefresh}
          triggerHeight={300}
          startInvisible={true}>
          {refreshData ? (
            <RefreshContent />
          ) : null}
          {
            hasProductInvalid &&
            <div className={clsx(classes.alert, 'cart-alert')}>
              <div className="cart-alertIcon">
                <img src={ErrorIcon} alt={'Error'} />
              </div>
              <Typography variant="body2">
                {"The item(s) in your cart is not available at your selected outlet. Please choose a different outlet or item."}
              </Typography>
            </div>
          }
          <div className="cart-container">
            <OrderList items={[...cart, ...freeItemCart]} showItemsCount isReadOnly={false} />
            <div className={classes.section}>
              <div className={classes.sectionHeader}>{shoppingType === ShoppingType.PickUp ? "Pick Up Information" : "Delivery Information"}</div>
              <div className={clsx('cart-flexContainer', classes.sectionWrapper, 'cart-sectionWrapper')}>
                <div className='cart-iconWrapper'>
                  <img src={Marker_Icon} alt="icon" height="25px" width="25px" />
                </div>
                <div className='cart-flex'>
                  <div className='cart-flexContainer'>
                    <div className='cart-flex'>
                      <div className={classes.sectionHeader}>{deliveryInfo.name || "Please select an address"}</div>
                      <div className={classes.sectionContent}>
                        {deliveryInfo?.address || ""}
                      </div>
                    </div>
                    <div className={clsx(classes.boldMedium, "cart-sectionContentButton")}>
                      <SecondaryButton
                        handleClick={selectAddress}
                        title={'Change'}
                      />
                    </div>
                  </div>
                  {
                    shoppingType === ShoppingType.PickUp ? <></> :
                      <div className={clsx('cart-flexContainer', classes.sectionContentDivider, 'cart-sectionContentDivider')}>
                        <div className='cart-flex'>
                          <div className={clsx(classes.sectionHeader, 'cart-sectionSubHeader')}>Note to rider</div>
                          <div className={classes.sectionContent}>
                            {deliveryInfo.noteToRider}
                          </div>
                        </div>
                        <div className={clsx(classes.boldMedium, "cart-sectionContentButton")}>
                          <SecondaryButton
                            handleClick={editNote}
                            title={deliveryInfo.noteToRider === "" ? 'Add' : 'Edit'}
                          />
                        </div>
                      </div>
                  }
                </div>
              </div>
              <DeliveryTime
                orderType={shoppingType}
                selectedStore={selectedStore}
                timeLabel={timeLabel}
                setTimeLabel={setTimeLabel}
              />
            </div>
            <div className={classes.section}>
              <div className={classes.sectionHeader}>Cutlery Request</div>
              <div className={clsx('cart-flexContainer', classes.sectionWrapper, 'cart-sectionWrapper')}>
                <div className='cart-iconWrapper'>
                  <img src={Fork_Icon} alt="fork" height="25px" width="25px" />
                </div>
                <FormControlLabel
                  className='cart-flex'
                  classes={{ label: classes.label }}
                  checked={miscellaneousInfo.isCulteryRequested}
                  control={<Checkbox color="primary" icon={<RadioButtonUncheckedIcon />} checkedIcon={<CheckCircleIcon />} name="isCulteryRequested" />}
                  onChange={onChange}
                  label={
                    miscellaneousInfo.isCulteryRequested ? <>
                      <div className={classes.sectionHeader}>Cutlery Required</div>
                      <div className={classes.sectionContent}>
                        Cutlery will be provided together with the order, subject to in-store availability
                      </div>
                    </> : <>
                      <div className={classes.sectionHeader}>No Cutlery Required</div>
                      <div className={classes.sectionContent}>
                        Thank you for reducing plastic waste!
                      </div>
                    </>
                  }
                  labelPlacement="start"
                />
              </div>
            </div>
            <div className={classes.section}>
              <div className={classes.sectionHeader}>Remarks</div>
              <TextField
                name={'remarks'}
                variant="outlined"
                fullWidth multiline row={2}
                className='cart-remarks'
                onChange={onChange}
                placeholder="Add remarks"
              />
            </div>
            {
              filteredRecommendations.length === 0 ? <></> :
                <div className={classes.alsoOrderedWrapper}>
                  <CatalogHorizontal title="People also ordered" catalogItems={filteredRecommendations} onViewMoreClicked={navigateToProductListing(filteredRecommendations[0])} noLeftPadding />
                </div>
            }
            <div className={classes.section}>
              {
                !isPromoCodeApplying ?
                  <>
                    <div className={classes.sectionHeader}>Promo Code (if any)</div>
                    <div className={clsx('cart-flexContainer', classes.smallMarginTop)}>
                      <TextField
                        name={'promoCode'}
                        variant="outlined"
                        fullWidth
                        className={clsx('cart-flex')}
                        inputProps={{ className: 'cart-promoInput' }}
                        value={promoCode}
                        onChange={onChange}
                        placeholder="ENTER PROMO CODE"
                      />
                      <div className={clsx('cart-promoButton', 'cart-sectionContentButton', classes.boldMedium)}>
                        <Button variant="contained" color="primary" onClick={onPromoCodeApplied} className={clsx('cart-applyButton', classes.boldMedium)} >Apply</Button>
                      </div>
                    </div></> : <></>
              }
              <div className='cart-flexContainer'>
                <div className={clsx(classes.paymentButton, 'cart-flex', classes.sectionContent, classes.mediumMarginTop, classes.bold)}>Subtotal</div>
                <div className={clsx('cart-currency', 'cart-sectionContentAmount', classes.sectionContent, classes.bold)}>
                  {formatCurrency(subtotal)}
                </div>
              </div>
              {
                shoppingType === ShoppingType.Delivery ?
                  <div className='cart-flexContainer'>
                    <div className={clsx(classes.paymentButton, 'cart-flex', classes.sectionContent, classes.bold)}>Delivery</div>
                    <div className={clsx('cart-currency', 'cart-sectionContentAmount', classes.sectionContent, classes.boldMedium)}>
                      {miscellaneousInfo.deliveryFee !== 0 ? formatCurrency(miscellaneousInfo.deliveryFee) : "FREE"}
                    </div>
                  </div> : <></>
              }
              {
                (shoppingType === ShoppingType.Delivery && miscellaneousInfo.deliverySurchargeAmount && miscellaneousInfo.deliverySurchargeAmount) > 0 && (
                  <div className='cart-flexContainer'>
                    <div className={clsx(classes.paymentButton, 'cart-flex-surcharge', classes.sectionContent, classes.bold)}>Peak Hour Delivery Surcharge</div>
                    <div className={clsx('cart-currency', 'cart-sectionContentAmount', classes.sectionContent, classes.boldMedium)}>
                      {formatCurrency(miscellaneousInfo.deliverySurchargeAmount)}
                    </div>
                  </div>
                )
              }
              {
                isPromoCodeApplying &&
                <div>
                  <div className='cart-flexContainer'>
                    <div className={clsx(classes.paymentButton, classes.sectionContent, classes.noWrap, classes.bold)}>{'Promo Code'}</div>
                    <div
                      className={clsx(classes.paymentButton, 'cart-flex', classes.promoRemoveButton, classes.bold)}
                      onClick={() => {
                        removePromoCode()
                        checkCartMethod(false)
                        
                      }}
                    >Remove</div>
                    <div className={clsx('cart-currency', 'cart-sectionContentAmount', classes.sectionContent, classes.boldMedium)}>
                      {"- " + formatCurrency(promoCodeInfo.totalPromoDiscount)}
                    </div>
                  </div>
                  <div className={clsx('cart-flex', classes.sectionContent)}>{promoCodeInfo.promoTitle}</div>
                </div>
              }
              <div className="cart-flexContainer">
                <span className={clsx(classes.boldLight, 'cart-tnc', 'cart-flex')}>{'By placing an order, you are accepting our '}
                  <Typography
                    className={clsx(classes.tncLink, 'cart-tncLink', 'cart-flex')}
                    onClick={() => history.push(({ pathname: routes.tnc }))} component={'span'}
                  >{'Terms & Conditions'}</Typography>
                </span>
              </div>
            </div>
            {
              selectedStore && !hasProductInvalid ? (
              <>
              {basketValueInfo.basketValue && basketValueInfo.basketValue > 0 && (
               <div className={clsx(classes.footerProgressBar, 'cart-progress-bar')}>
                 <Typography component="div" variant="subtitle2" className={clsx(classes.deliveryMessage, 'cart-flex')}>
                    {basketValueInfo.freeDeliveryMessage}
                  </Typography>
                  {progress === 100 ? (
                    <CustomLinearProgress variant="determinate" value={progress}/>
                  ) : (
                    <LinearProgress variant="determinate" value={progress}/>
                  )}
              </div>
              )}
              <div className={clsx('cart-flexContainer', classes.footer, 'cart-footer')}>
                  <Typography component="div" variant="h6" className={clsx(classes.total, 'cart-flex')}>
                    <div>TOTAL</div>
                    <div>{formatCurrency(total)}</div>
                  </Typography>
                  <div className={clsx('cart-textAlignCenter', 'cart-flex')}>
                    <Button className={clsx(classes.boldMedium, 'cart-placeOrderButton')} variant="contained" color="primary" onClick={submitOrder}>Place order</Button>
                  </div>
                </div> 
              </> 
                ) : <DisabledBottomBar total={formatCurrency(total)} />
            }
            {
              isSelectStoreModalOpened &&
              <StoreSelectorModal
                open={isSelectStoreModalOpened}
                setIsSelectStoreModalOpened={setIsSelectStoreModalOpened}
                onClose={() => setIsSelectStoreModalOpened(false)}
                grayOutAnother={true}
              />
            }
          </div>
        </PullToRefresh>
      }
    />
  );
};

export { Cart };