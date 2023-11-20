import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@Common/Header";
import { MenuButton } from "@Common/MenuButton";
import { BottomNavigationBar } from "@Common/BottomNavigationBar";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { PageHeader } from "@Common/PageHeader/PageHeader";
import { Tabs, Tab, makeStyles, CircularProgress } from '@material-ui/core'
import { ReviewModal } from "@Common/ReviewModal/ReviewModal";
import { routes } from "src/constants/routes.constant";
import { useHistory } from "react-router-dom";
import { useCartContext } from "@Context/CartContext";
import {
  getUserCompletedOrder,
  getUserPendingOrder,
  submitOrderReview,
} from "@API/api";
import useViewPortSize from "@Hook/useViewPortSize";
import { useUserContext } from "@Context/UserContext";
import { useStoreContext } from "@Context/StoreContext";
import OrdersPageList from "./OrdersPageList";
import { getS3Link } from '@Util/function.js';
import { PullToRefresh } from "react-js-pull-to-refresh";
import { CustomRefreshContent } from '@Common/RefreshContent'
import { usePageContext, Pages } from "@Context/PageContext";
import { useAlertContext } from '@Context/AlertContext';
import { StoreSelectorModal } from "@Common/StoreSelector";
import "./Orders.scss";

const useStyles = makeStyles(() => ({
  tabs: {
    borderRadius: "0.5rem",
  },
  tabsIndicator: {
    display: "none",
  },
  loader: {
    height: (props) => `calc(${props.height}px )`,
    width: "100%",
    display: "flex",
    flex: "1",
    justifyContent: "center",
    alignItems: "center"
  },
  bold: {
    fontFamily: 'din_bold, din_regular',
  }
}));

const Orders = React.memo(function MyComponent() {
  const [, vpHeight] = useViewPortSize();
  const height = vpHeight - 200;
  const classes = useStyles({ height, });
  const history = useHistory();
  const { selectedStore } = useStoreContext();
  const { replaceCart } = useCartContext();
  const { user } = useUserContext();
  const { selectedTab, setSelectedTab, orders, saveOrders, getAllOrders, setGetAllOrders, reviewedOrders, setReviewedOrders } = usePageContext();
  const { pendingOrders, historyOrders } = orders;

  const { pushAlertPopUp } = useAlertContext();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [review, setReview] = React.useState({});
  const [images, setImages] = React.useState([]);
  const [isSelectStoreModalOpened, setIsSelectStoreModalOpened] = React.useState(false);
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

  const queryOrder = useCallback(async (prevPendingTngOrders, prevCompletedTngOrders) => {
    return await getUserPendingOrder(user.token).then(async (ret) => {
      // console.log('ret pending orders', ret);
      // add isPending property
      if (!ret) ret = []
      ret = ret.map((r) => {
        r["isPending"] = true;
        return r;
      });
      const pendingTngOrders = ret.filter(o => o.orderNumber.startsWith('TNG'))

      await getUserCompletedOrder(user.token).then((res) => {
        // console.log('ret history orders', res);
        if (!res) res = []
        res = res.map((r) => {
          r["isPending"] = false;
          return r;
        });
        const completedTngOrders = res.filter(o => o.orderNumber.startsWith('TNG'))
        // save orders in context
        // if called queryOrder before
        if (prevPendingTngOrders && prevCompletedTngOrders) {
          // console.log('got prevPendingTngOrders & prevCompletedTngOrders');
          if (prevPendingTngOrders.length !== pendingTngOrders.length || prevCompletedTngOrders.length !== completedTngOrders.length) {
            // saveOrders([], []);
            saveOrders(pendingTngOrders, completedTngOrders);
          }
        } else {
          // saveOrders([], []);
          saveOrders(pendingTngOrders, completedTngOrders);
        }
      });
      // pushAlertPopUp(`Problem connecting to server. Please try again later`, `this shud be error`);
    }).catch((err) => {
      pushAlertPopUp(`Problem connecting to server. Please try again later`);
    }).then(() => setGetAllOrders(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // get orders on first render
  useEffect(() => {
    if (getAllOrders) {
      // still call to check if order added into list
      queryOrder(pendingOrders, historyOrders);
    } else {
      queryOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllOrders]);

  useEffect(() => {
    if (refreshData === true) {
      queryOrder();
    }
  }, [queryOrder, refreshData]);

  const navigateToOrderDetails = (order) => {
    history.push({
      pathname: (order.isPending ? routes.ongoingOrder : routes.order).replace(
        ":id",
        order.orderId
      ),
    });
  };

  const onReorder = (ev, item) => {
    ev.stopPropagation();
    if (!selectedStore) {
      // pushAlertPopUp(`Please select a store before add item to cart`);
      setIsSelectStoreModalOpened(true);
    } else {
      // add attribute to be used in Cart.jsx - almost the same as formatProducts method in CartContext.jsx except mandatoryItem field
      const items = item.orderDetailProduct.map((p) => {
        return {
          ...p,
          id: p.productId,
          productName: p.title,
          productImage: p.image,
        };
      });
      replaceCart(items);
      history.push({
        pathname: routes.cart,
      });
    }
  };

  const onReview = (ev, item) => {
    ev.stopPropagation();
    setSelectedOrder(item);
  };

  const onTabChange = (_, value) => {
    setSelectedTab(value);
  };

  const submitImagesAndReview = async (review, images) => {
    let { productAvailabilityRating, overallRating, foodRating, driverServiceRating, waitingTimeRating, staffServiceRating } = review;
    if (driverServiceRating) staffServiceRating = driverServiceRating;
    if (!staffServiceRating || !productAvailabilityRating || !overallRating || !foodRating || !waitingTimeRating) {
      pushAlertPopUp('Please select at least 1 star for each rating');
      return;
    }
    // run parallelly
    let imagepath = `review/${user.AccountNo}/${selectedOrder.orderNumber
      }`;
    const filePathArr = [];
    for (let i = 0; i < 3; i++) {
      if (images[i]) {
        let fileName = `image${i + 1}.jpg`;
        filePathArr.push(`${imagepath}/${fileName}`)
        getS3Link(i, imagepath, images, user.token, pushAlertPopUp, fileName);
      }
    }
    submitOrderReview(selectedOrder.orderId, review, user.token, filePathArr).then((res) => {
      setReviewedOrders(prevState => {
        const temp = [...prevState];
        temp.push(selectedOrder.orderId);
        return temp;
      })
      setReview({});
      setImages([]);
      pushAlertPopUp(`${res.message}`);
      setSelectedOrder(null);
    }).catch(err => {
      pushAlertPopUp('Fail to place your review. Please try again');
    });
  }

  return (
    <>
      <PageLayout
        header={
          <Header
            leftSlot={<MenuButton />}
            centerSlot={<PageHeader>My Orders</PageHeader>}
          />
        }
        // containerFullHeigth
        body={
          <div style={{ padding: "0 0.2rem" }} className="tab-container">
            <Tabs
              value={selectedTab}
              onChange={onTabChange}
              aria-label="Type of order"
              TabIndicatorProps={{ className: classes.tabsIndicator }}
              textColor="primary"
              variant="fullWidth"
              className={classes.bold}
            >
              <Tab label="Pending Orders" />
              <Tab label="Past Orders" />
            </Tabs>
            {
              getAllOrders === false ? (
                <div className={classes.loader}><CircularProgress /></div>
              ) : (
                <PullToRefresh
                  pullDownThreshold={0}
                  onRefresh={onRefresh}
                  triggerHeight={300}
                  startInvisible={true}>
                  {refreshData ? (
                    <CustomRefreshContent />
                  ) : null}
                  <OrdersPageList
                    selectedTab={selectedTab}
                    pendingOrders={pendingOrders}
                    historyOrders={historyOrders}
                    navigateToOrderDetails={navigateToOrderDetails}
                    onReview={onReview}
                    onReorder={onReorder}
                    showImage={false}
                    reviewedOrders={reviewedOrders}
                  />
                </PullToRefresh>
              )}

          </div>
        }
        footer={<BottomNavigationBar />}
        PageName={Pages.orders}
      />
      <ReviewModal
        open={!!selectedOrder}
        // open={true}
        order={selectedOrder}
        onSubmit={submitImagesAndReview}
        onClose={() => setSelectedOrder(null)}
        review={review}
        setReview={setReview}
        images={images}
        setImages={setImages}
      />
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

export { Orders };
