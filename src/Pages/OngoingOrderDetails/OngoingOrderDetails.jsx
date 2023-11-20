import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from 'prop-types';
import { makeStyles, Typography, Stepper, Step, StepLabel, CircularProgress, styled, StepConnector, withStyles, Button,Modal, Paper } from "@material-ui/core";
// hooks
import { useCurrency } from "@Hook/useCurrency";
// components
import { BackButton } from "@Common/BackButton";
import { OrderList } from "@Common/OrderList/OrderList";
import CheckBoxIcon from "../../assets/svgs/square-check-icon.svg";
import { Header } from "@Common/Header";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { PageHeader } from "@Common/PageHeader/PageHeader";
import Store_Icon from "@Assets/svgs/pickup.svg";
import Received_Icon from "../../assets/svgs/order-received.svg";
import Prepare_Icon from "../../assets/svgs/preparing.svg";
import Completed_Icon from "../../assets/svgs/order-complete.svg";
import Stopwatch_Icon from "@Assets/svgs/stopwatch.svg"
import Delivery_Icon from "@Assets/svgs/delivery.svg"
import Fork_Icon from "@Assets/svgs/fork.svg"
import Marker_Icon from "@Assets/svgs/marker.svg"
import QR_Icon from "@Assets/svgs/qr-icon.svg"
import { getOrderDetailList } from "@API/api";
import Fab from '@material-ui/core/Fab';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { useParams, useHistory } from "react-router-dom";
import useViewPortSize from '@Hook/useViewPortSize';
import { useUserContext } from "@Context/UserContext";
import { useAlertContext } from "@Context/AlertContext";
import { usePageContext, Pages } from "@Context/PageContext";
import { ShoppingType } from '@Context/CartContext';
import AlertDialog from '@Common/AlertDialog/AlertDialog';
import { routes } from "src/constants/routes.constant";
import { PullToRefresh } from "react-js-pull-to-refresh";
import { CustomRefreshContent } from '@Common/RefreshContent'
import CheckCircle from '@material-ui/icons/Check';
import Moment from 'react-moment';
import QRCode from "react-qr-code";
// import mock from '@Mock/ongoing-order.json';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
    position: "relative",
    color: "#6D6E71",
    // fontFamily: "DIN Regular Alternate",
  },
  flexContainer: {
    display: "flex",
    alignItems: "center",
    justifyItems: "flex-start",
  },
  flex: {
    flex: 1,
  },
  flexMedium: {
    flex: 1,
    lineHeight: "1.1"
  },
  flexSmallerColumn: {
    flex: "0 0 6rem",
    textAlign: "right",
  },
  smallerFontSize: {
    fontSize: "0.8rem",
  },
  smalleFontSize: {
    fontSize: "0.9rem",
  },
  smallFontSize: {
    fontSize: "1rem",
  },
  mediumFontSize: {
    fontSize: "1.1rem",
  },
  qrSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: "1rem",
    borderRadius: "1rem",
    backgroundColor: "#e9fef2",
    marginBottom: "1rem"
  },
  qrDescription : {
    paddingLeft: "1rem",
    fontSize: "0.8rem",
    fontFamily: 'din_bold, din_regular'
  },
  showQRBtn : {
    textTransform: 'none',
    fontFamily: 'din_bold, din_regular',
    color: '#3e9a04'
  },
  qrModal: {
    width: '280px',
    height: '330px',
    top: '50%',
    left: '50%',
    position: 'fixed',
    transform: 'translate(-50%, -50%)',
    borderRadius: '1rem',
    padding: '1rem',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '30px',
  },
  qrModalDescription : {
    fontSize: "1rem",
    fontFamily: 'din_bold, din_regular',
    textAlign: 'center',
    opacity: '0.7'
  },
  closeButton: {
    position: 'fixed',
    left: '50%',
    marginLeft: '-1.75rem',
    bottom: '3.25rem',
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.main,
    [theme.breakpoints.down("md")]: {
      bottom: '20px',
    }
  },
  orderDetails: {
    margin: "1rem 0",
    backgroundColor: `#F4F9FC`,
    borderRadius: "1rem",
    padding: "0.5rem 1rem",
  },
  orderPlacementStatus: {
    margin: "1rem 0",
    backgroundColor: `#F5FCF8`,
    borderRadius: "1rem",
    padding: "1rem",
  },
  success: {
    width: "15%",
  },
  bolderText: {
    fontFamily: 'din_bold, din_regular',
    color: theme.palette.grey[700],
  },
  summary: {
    margin: "1rem 0",
    backgroundColor: theme.palette.grey[100],
    borderRadius: "1rem",
    padding: "1rem",
  },
  paddingBottom: {
    paddingBottom: "1rem",
  },
  paddingBottom2: {
    paddingBottom: "0.5rem",
  },
  paddingBottom3: {
    paddingBottom: "0.7rem",
  },
  iconWrapper: {
    flex: "0 0 2rem",
    display: "flex",
    height: '100%'
    // alignSelf: "start",
    // marginRight: "0.5rem",
    // 'objectFit': 'fill',
  },
  stepper: {
    padding: 0,
  },
  summaryText: {
    fontWeight: 100,
  },
  steps: {
    fontSize: "0.7rem",
    fontFamily: 'din_bold, din_regular',
    color: "#6D6E71"
  },
  loader: {
    height: (props) => `calc(${props.height}px )`,
    width: "100%",
    display: "flex",
    flex: "1",
    justifyContent: "center",
    alignItems: "center"
  }
}));

const QontoConnector = withStyles({
  alternativeLabel: {
    top: 10,
    left: 'calc(-50% + 10px)',
    right: 'calc(50% + 10px)',
  },
  // active: {
  //   '& $line': {
  //     borderColor: 'green',
  //     borderStyle: 'dashed',
  //   },
  // },
  // completed: {
  //   '& $line': {
  //     borderColor: 'blue',
  //     borderStyle: 'dashed',
  //   },
  // },
  line: {
    // border: "0.5px dashed #59595C",
    borderTop: "1.5px dashed #59595C",
    borderRight: "none",
    borderBottom: "none",
    borderLeft: "none",
  },
})(StepConnector);

const QontoStepIconRoot = styled('div')(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
  display: 'flex',
  height: 22,
  alignItems: 'center',

  '& .QontoStepIcon-completedIcon': {
    color: '#FFF',
    zIndex: 1,
    backgroundColor: '#1E91CF',
    borderRadius: '50%',
    // height: '1.5rem',
    // width: '1.5rem',
    // fontSize: 18,
  },
  '& .QontoStepIcon-circle': {
    width: "20px",
    height: "20px",
    borderRadius: '50%',
    border: '1px solid #59595C',
    color: "#59595C",
    backgroundColor: '#FFFFFF',
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  '& .QontoStepIcon-circle-inside': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  }
}));


function QontoStepIcon(props) {
  const { completed, className } = props;

  return (
    <QontoStepIconRoot className={className}>
      {completed ? (
        <CheckCircle
          style={{ fontSize: "1.2rem" }}
          className="QontoStepIcon-completedIcon" />
      ) : (
        // <FiberManualRecordOutlinedIcon fontSize="medium" className="QontoStepIcon-circle"/>
        <div className="QontoStepIcon-circle">
          <div className="QontoStepIcon-circle-inside" />
        </div>
      )}
    </QontoStepIconRoot>
  );
}

QontoStepIcon.propTypes = {
  /**
   * Whether this step is active.
   * @default false
   */
  active: PropTypes.bool,
  className: PropTypes.string,
  /**
   * Mark the step as completed. Is passed to child components.
   * @default false
   */
  completed: PropTypes.bool,
};

// Strucutre of data is the same with OrderDetails.jsx
const OngoingOrderDetails = () => {
  const [, vpHeight] = useViewPortSize();
  const height = vpHeight - 200;
  const classes = useStyles({ height, });
  const { id } = useParams();
  const history = useHistory();
  const { formatCurrency } = useCurrency();
  const { user } = useUserContext();
  const { pushAlertPopUp } = useAlertContext();
  const { saveScrollPosition } = usePageContext();

  const [data, setData] = useState(undefined);
  const [orderEnterFinalState, setOrderEnterFinalState] = useState(false);

  const [refreshData, setRefreshData] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [ongoingOrderStatus, setOngoingOrderStatus] = useState('')
  const onRefresh = () => {
    return new Promise((resolve) => {
      setRefreshData(true)
      setTimeout(() => {
        setRefreshData(false)
        resolve();
      }, 3000)
    });
  }

  const stepsDelivery = [
    { label: "Order Received", icon: Received_Icon },
    { label: "Order Preparation", icon: Prepare_Icon },
    { label: "Out for Delivery", icon: Delivery_Icon },
    { label: "Order Completed", icon: Completed_Icon },
  ];

  const stepsPickup = [
    { label: "Order Received", icon: Received_Icon },
    { label: "Order Preparation", icon: Prepare_Icon },
    { label: "Ready for Pickup", icon: Store_Icon },
    { label: "Order Completed", icon: Completed_Icon },
  ];

  const stepsIndex = {
    "Order Received": 1,
    "Order Preparation": 2,
    "Ready for Pickup": 3,
  }

  const stepsIndexDelivery = {
    "Order Received": 1,
    "Order Preparation": 2,
    "Out for Delivery": 3,
  }

  const queryOrderDetail = () => {
    getOrderDetailList(user.token, id).then(res => {
      let found
      let temp
      const orderStatus = res.order.status
      setOngoingOrderStatus(orderStatus)
      if (res.order.orderType === "Delivery") {
        found = Object.keys(stepsIndexDelivery).find(key => key === orderStatus);
        temp = { ...res, currentStep: stepsIndexDelivery[orderStatus] };
      } else {
        found = Object.keys(stepsIndex).find(key => key === orderStatus);
        temp = { ...res, currentStep: stepsIndex[orderStatus] };
      }
      if (found) {
        setData(temp);
      }
      else {
        setOrderEnterFinalState(true);
        temp = { ...res, currentStep: 4 };
        setData(temp);
      }
    }).catch((err) => {
      pushAlertPopUp(`Problem connecting to server. Please try again later`);
    });
  }

  useEffect(() => {
    window.onpopstate = e => {
      const newPageUrl = document.location.href;
      // console.log('window.onpopstate, directing to', newPageUrl);
      if (newPageUrl.includes(routes.order.replace(':id', data.order.orderId))) {
        // directing to completed order page, do nothing
        // console.log('ok, go to order complete page')
      } else if (newPageUrl.includes(routes.orders)) {
        // console.log('ok, go to orders page');
      } else if (!newPageUrl.includes(routes.orders)) {
        // console.log('not trying to go orders page? Not ok, go to home page')
        saveScrollPosition(0, Pages.home);
        history.replace(routes.home);
      }
    }
    return () => { window.onpopstate = () => { } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    queryOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (refreshData === true) {
      queryOrderDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

  if (!data)
    return <div className={classes.loader}><CircularProgress /></div>;

  let subtotal = data.orderDetails.reduce((acc, product) => {
    return acc + (product.subtotal);
  }, 0);
  // deliveryFee = data.grandTotal - subtotal;

  const { order, orderDetails } = data;
  const { orderNumber, orderId, orderType, scheduledDateTime, deliveryAddress, driverName, driverPhone, storeName, remarks, grandTotal, promoCode, promoCodeTitle, promoDiscount, deliveryFee, requiredCutlery = false, deliverySurchargeAmount = 0 } = order;

  return (
    <PageLayout
      header={
        <Header
          leftSlot={<BackButton />}
          centerSlot={<PageHeader>ORDER #{orderNumber}</PageHeader>}
        />
      }
      body={

        <div className={classes.root}>
          <PullToRefresh
            // pullDownContent={<PullDownContent />}
            // releaseContent={<ReleaseContent />}
            // refreshContent={<RefreshContent />}
            pullDownThreshold={20}
            onRefresh={onRefresh}
            triggerHeight={300}
            startInvisible={true}>
            {refreshData ? (
              <CustomRefreshContent />
            ) : null}
            {
              <>
                {ongoingOrderStatus==="Ready for Pickup"?(
                <div className={clsx(classes.qrSection)}>
                <img src={QR_Icon} width={'40px'} height={'40px'} style={{marginTop:'5px'}} alt="qrcode"/>
                <Typography className={classes.qrDescription}>Show QR code to cashier for scanning to pick up your products</Typography>
                <Button className={classes.showQRBtn} onClick={()=>setShowQrModal(true)} >Show</Button>
                </div>
                ):(
                <div
                  className={clsx(
                    classes.flexContainer,
                    classes.orderPlacementStatus
                  )}
                >
                  <div className={classes.success}>
                    <img src={CheckBoxIcon} alt="completed" height="30px" width="30px" />
                  </div>
                  <Typography
                    className={clsx(
                      classes.flexMedium,
                      classes.smallerFontSize,
                      classes.bolderText
                    )}
                    style={{ width: "80%" }}
                    variant="subtitle1"
                    component="div"
                  >
                    {orderType === "Delivery" ?
                      <>
                        Your order has been successfully placed. We will update you once it is out for delivery.
                      </> : 
                      <>
                        Your order has been successfully placed. We will update you once it is ready for pickup.
                      </>}
                  </Typography>
                </div>
                )}
                <Stepper
                  activeStep={data.currentStep}
                  className={classes.stepper}
                  alternativeLabel
                  connector={<QontoConnector />}
                >
                  {orderType === "Delivery" ? (
                    stepsDelivery.map((item) => {
                      return (
                        <Step key={item.label}>
                          <StepLabel StepIconComponent={QontoStepIcon}>
                            <div>
                              <img src={item.icon} alt="icon" height="35px" width="35px" />
                            </div>
                            <div className={classes.steps}>{item.label}</div>
                          </StepLabel>
                        </Step>
                      );
                    })
                  ) : (
                    stepsPickup.map((item) => {
                      return (
                        <Step key={item.label}>
                          <StepLabel StepIconComponent={QontoStepIcon}>
                            <div>
                              <img src={item.icon} alt="icon" height="35px" width="35px" />
                            </div>
                            <div className={classes.steps}>{item.label}</div>
                          </StepLabel>
                        </Step>
                      );
                    })

                  )}
                </Stepper>
                <div className={classes.orderDetails}>
                  <Typography
                    className={clsx(
                      classes.smallFontSize,
                      classes.paddingBottom2,
                      classes.bolderText
                    )}
                    variant="h6"
                  // component="h4"
                  >
                    Order Details
                  </Typography>
                  <div className={clsx(classes.flexContainer, classes.paddingBottom)}>
                    <div className={classes.iconWrapper}>
                      <img src={Stopwatch_Icon} alt="time" height="20px" width="20px" />
                    </div>
                    <div className={clsx(classes.flex, classes.smalleFontSize)}>
                      <Moment format='DD MMM YYYY hh:mm A'>
                        {scheduledDateTime}
                      </Moment>
                    </div>
                  </div>
                  <div className={clsx(classes.flexContainer, classes.paddingBottom2)}>
                    <div className={classes.iconWrapper}>
                      <img src={Marker_Icon} alt="icon" height="20px" width="20px" />
                    </div>
                    <div className={classes.smalleFontSize}>{orderType === "Delivery" || deliveryAddress ? `Deliver to ${deliveryAddress}` : `Pick up at ${storeName}`}</div>
                  </div>
                  {
                    orderType === ShoppingType.Delivery && driverName &&
                    <div className={clsx(classes.flexContainer, classes.paddingBottom)}>
                      <div className={classes.iconWrapper}>
                        <img src={Delivery_Icon} alt="icon" height="25px" width="25px" />
                      </div>
                      <div className={classes.flex}>
                        <div className={classes.smalleFontSize}>{driverName ? driverName : '-'}</div>
                        <div className={classes.smalleFontSize}>{driverPhone ? driverPhone : '-'}</div>
                      </div>
                    </div>
                  }
                </div>
                <OrderList
                  showItemsCount={false}
                  showImage={false}
                  hideEditButton={true}
                  items={orderDetails.map(p => (
                    {
                      ...p,
                      productId: p.orderDetailProductId,
                      price: p.subtotal / p.quantity,
                      isDisabled: p.outOfStock
                    }))} />
                <div className={classes.orderDetails}>
                  <Typography
                    className={clsx(
                      classes.smallFontSize,
                      classes.paddingBottom2,
                      classes.bolderText,
                    )}
                    variant="h3"
                    component="h2"
                  >
                    Cutlery Request
                  </Typography>
                  <div className={clsx(classes.flexContainer, classes.paddingBottom)}>
                    <div className={classes.iconWrapper}>
                      <img src={Fork_Icon} alt="fork" height="25px" width="25px" />
                    </div>
                    <div className={classes.flex}>
                      {" "}
                      <Typography
                        className={clsx(classes.smalleFontSize, classes.bolderText)}
                        variant="h3"
                        component="div"
                        gutterBottom
                      >
                        {requiredCutlery
                          ? "Cutlery Required"
                          : "No Cutlery Required"}
                      </Typography>
                      <Typography
                        className={clsx(classes.smallFontSize)}
                        variant="body2"
                        component="div"
                        style={{ lineHeight: "1rem" }}
                      >
                        {requiredCutlery
                          ? "Cutlery will be provided together with the order, subject to in-store availability"
                          : "Thank you for reducing plastic waste!"}
                      </Typography>
                    </div>
                  </div>
                </div>
                <div className={classes.orderDetails}>
                  <Typography
                    className={clsx(
                      classes.smallFontSize,
                      classes.paddingBottom2,
                      classes.bolderText,
                    )}
                    variant="h3"
                    component="h2"
                  >
                    Remarks
                  </Typography>
                  <div>{remarks}</div>
                </div>
                <div className={classes.summary}>
                  <div className={classes.flexContainer}>
                    <Typography
                      className={clsx(
                        classes.cardHeaderText,
                        classes.flex,
                        classes.smallFontSize,
                        classes.bolderText
                      )}
                      variant="h4"
                      component="h3"
                    >
                      Subtotal
                    </Typography>
                    <Typography
                      className={clsx(
                        classes.flexSmallerColumn,
                        classes.smallFontSize,
                        classes.bolderText
                      )}
                      variant="subtitle1"
                      component="div"
                    >
                      {formatCurrency(subtotal)}
                    </Typography>
                  </div>

                  {
                    orderType === ShoppingType.Delivery &&
                    <div className={classes.flexContainer}>
                      <Typography
                        className={clsx(
                          classes.flex,
                          classes.smallFontSize,
                          classes.summaryText
                        )}
                        variant="h4"
                        component="h3"
                      >
                        Delivery
                      </Typography>
                      <Typography
                        className={clsx(
                          classes.flexSmallerColumn,
                          classes.smallFontSize
                        )}
                        variant="subtitle1"
                        component="div"
                      >
                        {formatCurrency(deliveryFee)}
                      </Typography>
                    </div>
                  }
                  {
                    (orderType === ShoppingType.Delivery && deliverySurchargeAmount > 0) &&
                    <div className={classes.flexContainer}>
                      <Typography
                        className={clsx(
                          classes.flex,
                          classes.smallFontSize,
                          classes.summaryText
                        )}
                        variant="h4"
                        component="h3"
                      >
                        Peak Hour Delivery Surcharge
                      </Typography>
                      <Typography
                        className={clsx(
                          classes.flexSmallerColumn,
                          classes.smallFontSize
                        )}
                        variant="subtitle1"
                        component="div"
                      >
                        {formatCurrency(deliverySurchargeAmount)}
                      </Typography>
                    </div>
                  }
                  {!promoCode ? <></> :
                    <>
                      <div className={classes.flexContainer}>
                        <Typography className={clsx(classes.flex, classes.smallFontSize)} >
                          {`Promo Code (${promoCode})`}
                        </Typography>
                        <Typography className={clsx(classes.flexSmallerColumn, classes.smallFontSize)} variant="subtitle1" component="div">
                          {'- ' + formatCurrency(promoDiscount)}
                        </Typography>
                      </div>
                      <div className={classes.flexContainer}>
                        <Typography className={clsx(classes.flex, classes.smallerFontSize, classes.smallerPaddingBottom)} >
                          {promoCodeTitle}
                        </Typography>
                      </div></>
                  }
                  <div className={classes.flexContainer}>
                    <Typography
                      className={clsx(
                        classes.cardHeaderText,
                        classes.flex,
                        classes.smallFontSize,
                        classes.bolderText
                      )}
                      variant="h4"
                      component="h3"
                    >
                      Total (incl. tax)
                    </Typography>
                    <Typography
                      className={clsx(
                        classes.flexSmallerColumn,
                        classes.smallFontSize,
                        classes.bolderText
                      )}
                      variant="subtitle1"
                      component="div"
                    >
                      {formatCurrency(grandTotal)}
                    </Typography>
                  </div>
                </div>
              </>
            }
            <AlertDialog
              open={orderEnterFinalState}
              title={'Your order status has changed. Press OK to view your order.'}
              onConfirm={() => history.push(routes.order.replace(':id', orderId))}
              setOpen={setOrderEnterFinalState} />
            <Modal
            open={showQrModal}
            onClose={()=>setShowQrModal(false)}
            >
            <>
            <Paper className={classes.qrModal}>
            {/* <PageHeader>ORDER #{orderNumber}</PageHeader> */}
            <Typography className={classes.qrModalDescription}>Order #{orderNumber}</Typography>
            <QRCode value={orderNumber} size={150} style={{opacity: '0.7'}} />
            <Typography className={classes.qrModalDescription}>Show QR code to cashier for scanning to pick up your products</Typography>
            </Paper>
            <Fab className={classes.closeButton} onClick={()=>setShowQrModal(false)} aria-label="close">
            <CloseOutlinedIcon />
            </Fab>
            </>
            </Modal>
          </PullToRefresh>
        </div>
      }
    />
  );
};

export { OngoingOrderDetails };
