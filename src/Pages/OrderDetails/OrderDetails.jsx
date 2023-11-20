import React, { useEffect } from "react";
import { makeStyles, lighten } from '@material-ui/core/styles';
import { BackButton } from "@Common/BackButton";
import Card from '@material-ui/core/Card';
import { OrderList } from "@Common/OrderList/OrderList";
import { useCurrency } from "@Hook/useCurrency";
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import clsx from "clsx";
import { Header } from "@Common/Header";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { PageHeader } from '@Common/PageHeader/PageHeader';
import { ReviewModal } from '@Common/ReviewModal/ReviewModal';
import { useParams, useHistory } from "react-router-dom";
import { submitOrderReview, sendOrderReceipt, getOrderDetailList, getOrderReviewList } from '@API/api';
import { CircularProgress } from '@material-ui/core';
import useViewPortSize from '@Hook/useViewPortSize';
import { useUserContext } from "@Context/UserContext";
import { ShoppingType } from "@Context/CartContext";
import Fork_Icon from "@Assets/svgs/fork.svg"
import Marker_Icon from "@Assets/svgs/marker.svg";
import Stopwatch_Icon from "@Assets/svgs/stopwatch.svg";
import Moment from 'react-moment';
import { routes } from "src/constants/routes.constant";
import { useAlertContext } from '@Context/AlertContext';
import deliverySVG from '@Assets/svgs/delivery.svg';
import { getS3Link } from '@Util/function.js';
import { formatDateToLocalISO } from '@Util/function';
import { usePageContext } from "@Context/PageContext";

const useStyles = makeStyles((theme) => ({
  layout: {
    paddingTop: '3.5rem'
  },
  root: {
    background: theme.palette.grey[100],
    minHeight: '100vh',
    position: 'relative',
    marginLeft: '-1rem',
    marginRight: '-1rem',
    padding: '1.5rem 0 2rem',
    backgroundColor: "#F4F9FC",
  },
  productImage: {
    width: '100%',
    height: '40rem',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    "&>img": {
      width: '100%',
      height: 'auto',
    },
    [theme.breakpoints.down("xs")]: {
      height: '250px',
    }
  },
  card: {
    width: 'calc(100% - 1.4rem)',
    margin: '0 auto 0',
    borderRadius: '1rem',
    color: theme.palette.grey[700],
    // [theme.breakpoints.down("xs")]: {
    //   width: '20rem',
    // }
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'flex-start'
  },
  flex: {
    flex: 1,
  },
  flexBiggerColumn: {
    flex: 1.5,
  },
  flexMediumColumn: {
    flex: '0 0 4rem',
    textAlign: 'right'
  },
  flexSmallerColumn: {
    flex: '0 0 6rem',
    textAlign: 'right'
  },
  smallerFontSize: {
    fontSize: '0.8rem'
  },
  mediumSmallFontSize: {
    fontSize: '0.9rem'
  },
  smallFontSize: {
    fontSize: '1rem'
  },
  mediumFontSize: {
    fontSize: '1.1rem'
  },
  status: {
    fontFamily: 'din_bold, din_regular',
    marginTop: '1rem'
  },
  cardHeaderIcon: {
    marginRight: '1rem',
    verticalAlign: 'sub',
    color: theme.palette.primary.main,
  },
  cardHeaderText: {
    lineHeight: '1.5rem',
    fontFamily: 'din_bold, din_regular',
    color: theme.palette.grey[700],
  },
  orderDetails: {
    margin: '1rem 0',
    // backgroundColor: `${lighten(theme.palette.primary.light, 0.5)}`,
    backgroundColor: `#F4F9FC`,
    borderRadius: '1rem',
    padding: '1rem 1rem 0.5rem'
  },
  summary: {
    margin: '1rem 0',
    backgroundColor: '#FAFAFA',
    borderRadius: '1rem',
    padding: '1rem'
  },
  paddingBottom: {
    paddingBottom: '1rem'
  },
  smallerPaddingBottom: {
    paddingBottom: '0.6rem'
  },
  paddingTop: {
    paddingTop: '1rem'
  },
  smallerPaddingTop: {
    paddingTop: '0.3rem'
  },
  iconWrapper: {
    flex: '0 0 2rem',
    alignSelf: 'start',
    marginRight: '0.5rem'
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
    backgroundColor: `${lighten(theme.palette.primary.light, 0.5)}`,
    color: theme.palette.primary.main
  },
  itemNumber: {
    margin: '0 2rem',
    display: 'inline',
  },
  addToCartButton: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '2rem'
  },
  review: {
    color: theme.palette.success.main,
    textDecoration: "underline",
    justifyContent: 'flex-end',
    "&:hover": {
      cursor: 'pointer'
    }
  },
  loader:{
    height: (props) => `calc(${props.height}px )`,
    width: "100%",
    display: "flex",
    flex: "1",
    justifyContent: "center",
    alignItems: "center"
  },
  bold:{
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
    // color: theme.palette.grey[700],
  },
}));

// Strucutre of data is the same with OngoingOrderDetails.jsx
const OrderDetails = () => {
  const history = useHistory();
  const [, vpHeight] = useViewPortSize();
  const height = vpHeight - 200;
  const classes = useStyles({height,});
  const { formatCurrency } = useCurrency();
  const { id } = useParams();
  const { user } = useUserContext();
  const { pushAlertPopUp } = useAlertContext();
  const { setReviewedOrders } = usePageContext();

  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [review, setReview] = React.useState({});
  const [images, setImages] = React.useState([]);
  const [prevReview, setPrevReview] = React.useState(null);

  useEffect(()=> {
    getOrderDetailList(user.token, id).then(res => {
      setData(res);
    });
    getOrderReviewList(user.token,id).then(res => {
      if(res && !res.driverServiceRating){
        res = {...res, driverServiceRating: res.staffServiceRating }
      }
      setPrevReview(res);
    })
    window.onpopstate = e => {
      const newPageUrl = document.location.href;
      if(newPageUrl.includes("ongoing-order")){
        history.replace(routes.orders);
      } else if(!newPageUrl.includes(routes.orders)){
        history.replace(routes.home);
      }
    }
    return () => { window.onpopstate = () => {} }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const onReceiptRequest = () => {
    sendOrderReceipt(user.token, id).then(res => {
      pushAlertPopUp('The order receipt has sent to your email address');
    })
  }

  const submitImagesAndReview = async (review, images) => {
    if(!(data && data.order)) return;
    let {productAvailabilityRating, overallRating, foodRating, driverServiceRating, waitingTimeRating, staffServiceRating} = review;
    if(driverServiceRating) staffServiceRating = driverServiceRating;
    if(!staffServiceRating || !productAvailabilityRating || !overallRating || !foodRating || !waitingTimeRating){
      pushAlertPopUp('Please select at least 1 star for each rating');
      return;
    }
    // run parallelly
    let imagepath = `review/${user.AccountNo}/${
      data.order.orderNumber
    }`;
    const filePathArr = [];
    for (let i = 0; i < 3; i++) {
      if(images[i]){
        let fileName = `image${i+1}.jpg`;
        filePathArr.push(`${imagepath}/${fileName}`)
        getS3Link(i, imagepath, images, user.token, pushAlertPopUp, fileName);
      }
    }
    submitOrderReview(id, review, user.token, filePathArr).then((res) => {
      setReviewedOrders(prevState => {
        const temp = [...prevState];
        temp.push(id);
        return temp;
      })
      setPrevReview({...review});
      setReview({});
      setImages(images.filter(image => !!image));
      pushAlertPopUp(`${res.message}`);
      setOpen(false);
    }).catch(err => {
      pushAlertPopUp('Fail to place your review. Please try again');
    });
  }
  // , deliveryFee = 0;
  if(!data)
  return <div className={classes.loader}><CircularProgress/></div>;
  
  let subtotal = data.orderDetails.reduce((acc, product) => {
    return acc + (product.subtotal);
  },0);
  // deliveryFee = data.grandTotal - subtotal;

  const { order, orderDetails } = data;
  const { orderNumber, status, cancelReason, orderType, scheduledDateTime, deliveryAddress, storeName, driverName, driverPhone, remarks, grandTotal, orderStatusMessage, promoCode, promoCodeTitle, promoDiscount, deliveryFee, partialFulfilmentAmount, requiredCutlery, orderDate, deliverySurchargeAmount = 0 } = order;

  let totalItemCount = 0;
  if(status === 'Order Completed'){
    totalItemCount = orderDetails.filter(p => !p.outOfStock).map(p => p.quantity).reduce((prev, curr) => prev+curr);
  }else{
    totalItemCount = orderDetails.map(p => p.quantity).reduce((prev, curr) => prev+curr);
  } 
  const createdAt = formatDateToLocalISO(scheduledDateTime)

  
  const currentDate  = new Date();
  const orderDateTime = new Date(Date.parse(orderDate));
  const isMoreThan7Days = currentDate.getTime() - orderDateTime.getTime() > 604800000
  

  return (
    <>
      <PageLayout
        className={classes.layout}
        header={
          <Header
            leftSlot={<BackButton onBackClicked={()=>history.push(routes.orders)}/>}
            centerSlot={<PageHeader>ORDER #{orderNumber}</PageHeader>}
          />
        }
        body={
          <div className={classes.root}>
            {
              <>
            <Card className={classes.card}>
              <CardContent>
                <div className={classes.flexContainer}>
                  <Typography className={clsx(classes.cardHeaderText, classes.flex, classes.smallFontSize)} variant="h4" component="h3">
                    Order #{orderNumber}
                  </Typography>
                  <Typography className={clsx(classes.flexSmallerColumn, classes.smallFontSize)} variant="subtitle1" component="div">
                  {totalItemCount} item(s)
                  </Typography>
                </div>
                <div>
                  <Typography className={clsx(classes.mediumFontSize, classes.status)} color="primary" variant="h3" component="h2">
                    {status.toUpperCase()}
                  </Typography>
                  <Typography className={clsx(classes.smallFontSize, classes.smallerPaddingTop)} variant="h3" component="div">
                    {orderStatusMessage}
                  </Typography>
                </div>

                {
                  (status === "Order Completed" && !isMoreThan7Days) && (
                  <div className={classes.flexContainer}>
                    <Typography className={clsx(classes.flex, classes.smallerFontSize)} variant="subtitle1" component="div">
                      {/* {new Date(scheduledDateTime).toLocaleString()} */}
                    </Typography>
                    <Typography className={clsx(classes.flexSmallerColumn, classes.smallerFontSize, classes.review, classes.bold)} variant="subtitle1" component="div" onClick={() => setOpen(true)}>
                      Review
                    </Typography>
                  </div>
                  )
                }

                <div className={classes.orderDetails}>
                  <Typography className={clsx(classes.mediumFontSize, classes.paddingBottom, classes.bold)} variant="h3" component="h2">
                    Order Details
                  </Typography>
                  <div className={clsx(classes.flexContainer, classes.smallerPaddingBottom)}>
                    <div className={classes.iconWrapper}>
                      <img src={Stopwatch_Icon} alt="Stopwatch" height="25px" width="25px" />
                    </div>
                    <div className={classes.flex}>
                      <Moment format='DD MMM YYYY hh:mm A'>
                        {createdAt}
                      </Moment>
                    </div>
                  </div>
                  <div className={clsx(classes.flexContainer, classes.smallerPaddingBottom)}>
                    <div className={classes.iconWrapper}>
                    <img src={Marker_Icon} alt="Location" height="25px" width="25px" />
                    </div>
                    <div className={classes.flex}>
                      {deliveryAddress ? `Deliver to ${deliveryAddress}`: `Pick up at ${storeName}`}
                    </div>
                  </div>
                  {
                    orderType === ShoppingType.Delivery && driverName &&
                    <div className={clsx(classes.flexContainer, classes.paddingBottom)}>
                      <div className={classes.iconWrapper}>
                        <img src={deliverySVG} alt="Driver" height="25px" width="25px" />
                      </div>
                      <div className={classes.flex}>
                        <div>{driverName ? `${driverName}`: '-'}</div>
                        <div>{driverPhone ? `${driverPhone}` : '-'}</div>
                      </div>
                    </div>
                  }
                  {
                    status !== "Order Completed" && cancelReason ? 
                    <div className={classes.smallerPaddingBottom} style={{marginTop: "-10px"}} >
                      <Typography className={clsx(classes.mediumFontSize, classes.status)}  variant="h3" component="h2" gutterBottom>
                        {"Order Rejected Reason"}
                      </Typography>
                      <Typography component="div">
                        {cancelReason}
                      </Typography>
                    </div> : <></>
                  }
                </div>

                <OrderList items={orderDetails.map(p=>(
                  {...p, 
                  productId: p.orderDetailProductId, 
                  price: p.subtotal/p.quantity,
                  isDisabled: p.outOfStock
                  }))} showImage={false} />

                <div className={classes.orderDetails}>
                  <Typography className={clsx(classes.smallFontSize, classes.smallerPaddingBottom, classes.bold)} variant="h3" component="h2">
                    Cutlery Request
                  </Typography>
                  <div className={clsx(classes.flexContainer, classes.smallerPaddingBottom)}>
                    <div className={classes.iconWrapper}>
                      <img src={Fork_Icon} alt="Fork" height="25px" width="25px" />
                    </div>
                    <div className={classes.flex}>
                      <Typography className={clsx(classes.mediumSmallFontSize, classes.bold)} variant="h3" component="div">
                      {requiredCutlery
                    ? "Cutlery Required"
                    : "No Cutlery Required"}
                      </Typography>
                      <Typography className={clsx(classes.smallFontSize)} variant="body2" component="div">
                      {requiredCutlery
                    ? "Cutlery will be provided together with the order, subject to in-store availability"
                    : "Thank you for reducing plastic waste!"}
                      </Typography>
                    </div>
                  </div>
                </div>
                <div className={clsx(classes.orderDetails, classes.smallerPaddingBottom)}>
                  <Typography className={clsx(classes.smallFontSize,  classes.smallerPaddingBottom, classes.bold)} variant="h3" component="h2">
                    Remarks
                  </Typography>
                  <div>
                    {remarks}
                  </div>
                </div>

                <div className={classes.summary}>
                  <div className={classes.flexContainer}>
                    <Typography className={clsx(classes.flexBiggerColumn, classes.smallFontSize)} variant="h4" component="h3">
                      <span className={classes.bold}>Subtotal</span>
                    </Typography>
                    <Typography className={clsx(classes.flexMediumColumn, classes.smallFontSize, classes.bold)} variant="subtitle1" component="div">
                      {formatCurrency(subtotal)}
                    </Typography>
                  </div>

                  {
                    orderType === ShoppingType.Delivery &&
                    <div className={classes.flexContainer}>
                      <Typography className={clsx(classes.flexBiggerColumn, classes.smallFontSize)}>
                        Delivery Fees
                      </Typography>
                      <Typography className={clsx(classes.flexMediumColumn, classes.smallFontSize)} variant="subtitle1" component="div">
                        {formatCurrency(deliveryFee)}
                      </Typography>
                    </div>
                  }

                  {
                    (orderType === ShoppingType.Delivery && deliverySurchargeAmount > 0) && 
                    <div className={classes.flexContainer}>
                      <Typography className={clsx(classes.flexBiggerColumn, classes.smallFontSize)}>
                      Peak Hour Delivery Surcharge
                      </Typography>
                      <Typography className={clsx(classes.flexMediumColumn, classes.smallFontSize)} variant="subtitle1" component="div">
                        {formatCurrency(deliverySurchargeAmount)}
                      </Typography>
                    </div>
                  }
                  {!promoCode? <></> :
                  <>
                  <div className={classes.flexContainer}>
                    <Typography className={clsx(classes.flex, classes.smallFontSize)} >
                      {`Promo Code (${promoCode})`} 
                    </Typography>
                    <Typography className={clsx(classes.flexSmallerColumn, classes.smallFontSize)} variant="subtitle1" component="div">
                      {'- '+formatCurrency(promoDiscount)}
                    </Typography>
                  </div>
                  <div className={classes.flexContainer}>
                    <Typography className={clsx(classes.flex, classes.smallerFontSize, classes.smallerPaddingBottom)} >
                      {promoCodeTitle} 
                    </Typography>
                  </div></>
                  }

                  <div className={classes.flexContainer}>
                    <Typography className={clsx(classes.cardHeaderText, classes.flex, classes.smallFontSize)} variant="h4" component="h3">
                      Total (incl. tax)
                    </Typography>
                    <Typography className={clsx(classes.flexSmallerColumn, classes.cardHeaderText, classes.smallFontSize)} variant="subtitle1" component="div">
                      {formatCurrency(grandTotal)}
                    </Typography>
                  </div>
                  {
                    !partialFulfilmentAmount? <></>:
                    <>
                    <div className={classes.paddingBottom}></div>
                    <div className={classes.flexContainer}>
                      <Typography className={clsx(classes.flex, classes.smallFontSize)}>
                        Refund
                      </Typography>
                      <Typography className={clsx(classes.flexSmallerColumn, classes.smallFontSize)} variant="subtitle1" component="div">
                        {formatCurrency(partialFulfilmentAmount)}
                      </Typography>
                    </div>
                    <div className={classes.flexContainer}>
                      <Typography className={clsx(classes.smallerFontSize)} variant="subtitle1" component="div">
                        {'*refund will be credited to your account within 7 - 14 days'}
                      </Typography>

                    </div>
                    </>
                    }
                  </div>
                  {
                    (partialFulfilmentAmount || status === 'Order Completed') &&
                    <Button className={clsx(classes.addToCartButton, classes.bold)} variant="contained" color="primary" onClick={onReceiptRequest} fullWidth>
                      Request receipt
                    </Button>
                  }
              </CardContent>
            </Card>
            </>
            }
          </div>
        }
      />
      <ReviewModal
        open={open}
        order={data.order}
        reviewData={prevReview? prevReview : null}
        onSubmit={submitImagesAndReview}
        onClose={() => setOpen(false)}
        review={review}
        setReview={setReview}
        images={images}
        setImages={setImages}
      />
    </>
  );
};

export { OrderDetails };
