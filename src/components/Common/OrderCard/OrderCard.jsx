import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Rating from '@material-ui/lab/Rating';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import clsx from 'clsx';
import Moment from 'react-moment';
import { formatDateToLocalISO, isWithinLast7Days } from '@Util/function';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
  card: {
    padding: '1rem',
    borderRadius: '0.8rem',
    marginBottom: '1rem',
  },
  cover: {
    height: '5rem',
    flex: '0 0 5rem',
    borderRadius: '0.8rem'
  },
  flex: {
    flex: 1
  },
  content: {
    padding: '0 0 0 1rem',
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
  rightAlign: {
    textAlign: 'right'
  },
  action: {
    fontSize: '0.8rem',
    padding: 0,
    textTransform: 'unset'
  },
  reorder: {
    color: theme.palette.primary.main,
    justifyContent: 'start',
    marginBottom: "0.4rem"
  },
  review: {
    color: theme.palette.success.main,
    textDecoration: "underline",
    justifyContent: 'flex-end'
  },
  icon: {
    flex: '0 0 2rem',
    marginLeft: '-0.5rem',
    color: theme.palette.grey[400]
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  textSize: {
    fontSize: '0.8rem',
    color: '#59595C'
  },
  textSizeBottom: {
    fontSize: '0.7rem',
    color: '#59595C'
  },
  address: {
    lineHeight: '1rem',
    [theme.breakpoints.up("sm")]: {
      lineHeight: 1.5,
    }
  },
  addressWrapper: {
    paddingBottom: '0',
  },
  rating: {
    color: theme.palette.primary.main,
  },
  bold:{
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
    color: theme.palette.grey[700],
  },
  red:{
    color: theme.palette.error.main,
  },
  outerContainer:{
    overflow:'visible',
  },
  oneRow: {
    display:'flex',
    justifyContent: 'space-between'
  },
  point:{
    color: theme.palette.primary.main,
  }
}));

const OrderCard = React.memo(function MyComponent(props) {
  const classes = useStyles();
  // rename props
  const { status, orderNumber: id, orderId, deliveryAddress: address, overallRating, storeName, showImage, totalOutOfStock, orderStatusMessage, totalOrderItems, reviewedOrders,pointEarned
  } = props;
  let {orderDate: createdAt, scheduledDateTime} = props;
  // if(totalOrderItems === 4){
  //   console.log('OrderCard reviewedOrders',reviewedOrders)
  //   console.log('OrderCard props',props)
  // }

  let updatedAt = scheduledDateTime;
  createdAt = formatDateToLocalISO(createdAt);
  updatedAt = formatDateToLocalISO(updatedAt);
  const createdAtMoment = moment(new Date(createdAt));
  // get the first product's image as thumbnail of order
  const image = !props.orderDetailProduct? '':props.orderDetailProduct[0].image;

  return <div className={classes.outerContainer}>
    <div className={clsx(classes.flexContainer, classes.outerContainer)}>
      <Typography color="textSecondary" className={clsx(classes.flex, classes.textSize)} style={{marginBottom: "10px"}}>
        <Moment format='DD MMM YYYY hh:mm A'>
          {createdAt}
        </Moment>
      </Typography>
      <Typography variant="subtitle1" className={clsx(classes.flex, classes.textSize, classes.rightAlign)}>
        <span className={classes.bold}>{status}</span>
      </Typography>
    </div>
    <Card className={clsx(classes.flexContainer, classes.card)} onClick={props.onClick}>
      {
        !showImage? <></> :
        <CardMedia
        className={classes.cover}
        image={process.env.REACT_APP_IMAGE_CLOUDFRONT+image.replace("JPG","jpg")}
        title={id}
        />
      }
      <CardContent className={clsx(!showImage? classes.noImageContent:classes.content, classes.flex)}>
          <div className={classes.flexContainer}>
          { (status === "Order Completed" || status === "Order Rejected" || status === "Order Cancelled") && <div className={classes.flex}>
              <Button className={clsx(classes.action, classes.reorder, classes.bold)} size="small" onClick={props.onReorder}>Reorder</Button>
            </div> }
        {
          !props.isPending && status === "Order Completed" &&
            <div className={clsx(classes.rightAlign, classes.flex)}>
                {
                  !!overallRating ? <Rating
                      className={classes.rating}
                      readOnly
                      defaultValue={overallRating}
                      precision={1}
                      emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    /> : <>
                    { // make sure order just reviewed not able to reviewed again
                      isWithinLast7Days(createdAtMoment) && !reviewedOrders.includes(orderId) &&
                      <Button className={clsx(classes.action, classes.review)} size="small" onClick={props.onReview}>Review</Button>
                    }
                    </>
                }
            </div>
        }
          </div>
        <div className={classes.oneRow}>
        <Typography variant="subtitle1" className={clsx(classes.textSize, classes.bold)} gutterBottom>
          Order #{id}
        </Typography>
        {pointEarned>=0? (
        <Typography variant="subtitle1" className={clsx(classes.textSize, classes.bold, classes.point)} gutterBottom>
          +{pointEarned} points
        </Typography>
        ): null}
        </div>
        <div style={{marginBottom: "7px"}}>
          <Typography className={classes.textSize} gutterBottom>
            {status === 'Order Completed' ? `${totalOrderItems - totalOutOfStock} item(s)` : `${totalOrderItems} item(s)`}
          </Typography>
        </div>
        {
          props.totalOutOfStock && status === "Order Completed"?
          <Typography variant="subtitle1" component="div" className={clsx(classes.textSize, classes.red, classes.bold)}>
          {`${totalOutOfStock} item(s) out of stock`}        
          </Typography> : <></>
        }
        {
          (status !== "Order Rejected" && status !== "Order Cancelled") ? (
            <div className={clsx(classes.addressWrapper, classes.flexContainer)}>
            <LocationOnOutlinedIcon fontSize="small" className={classes.icon} />
            <div className={classes.flex}>
              <Typography color="textSecondary" className={clsx(classes.textSize, classes.address)} gutterBottom>
                {address ? "Deliver to " + address : `Pick up at ${storeName}`}
              </Typography>
              <Typography color="textSecondary" className={classes.textSizeBottom}>
                <Moment format='DD MMM YYYY hh:mm A'>
                  {updatedAt}
                </Moment>
              </Typography>
              {
                !!orderStatusMessage && <Typography color="textSecondary" className={classes.textSizeBottom}>
                  {orderStatusMessage}
                </Typography>
              }
            </div>
          </div>
          ) : (
            <>
              <Typography color="textSecondary" className={classes.textSizeBottom}>
                  <Moment format='DD MMM YYYY hh:mm A'>
                    {updatedAt}
                  </Moment>
              </Typography>
              {
                !!orderStatusMessage && <Typography color="textSecondary" className={classes.textSizeBottom}>
                  {orderStatusMessage}
                </Typography>
              }
            </>
          )
          
        }
      
      </CardContent>
    </Card>
  </div>
});

export { OrderCard };
