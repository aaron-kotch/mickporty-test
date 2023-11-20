import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from '@material-ui/core/CardContent';
import { getUserPendingOrder } from "@API/api";
import { useHistory } from "react-router-dom";
import { routes } from "src/constants/routes.constant";
import { useUserContext } from "@Context/UserContext";
import { ReactComponent as BellIcon } from '@Assets/svgs/bell-icon.svg';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
// import mock from '@Mock/pending-orders.json';
import { useAlertContext } from "@Context/AlertContext";

const useStyles = makeStyles((theme) => ({
  root: {
    // padding: "0.25rem 0.5rem",
  },
  cardsWrapper: {
    overflowX: "auto",
    "-ms-overflow-style": "none" /* IE and Edge */,
    scrollbarWidth: "none" /* Firefox */,
    "&::-webkit-scrollbar": {
      display: "none",
    },
    whiteSpace: "nowrap",
    marginTop: "1rem",
    paddingLeft: "1rem",
    paddingRight: "1rem"
  },
  card: {
    // boxShadow: "unset",
    // width: "15rem",
    // height: "3rem",
    // borderRadius: "1rem",
    borderRadius: "10px",
    display: "inline-block",
    marginRight: "1rem",
    [theme.breakpoints.up("sm")]: {
      width: "20rem",
      height: "12.5rem",
    },
  },
  cardContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    // width: "15rem",
    height: "3rem",
    alignItems: "center",
    padding: '0',
    "&:last-child": {
      paddingBottom: 0
    }
  },
  bell: {
    backgroundColor: "#F3FDFF",
    height: "100%",
    padding: '0 0.8rem',
    display: 'flex',
    alignItems: "center",
  },
  notification: {
    height: "100%",
    padding: '0 0.8rem',
    display: 'flex',
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    fontSize: '0.8rem',
    fontWeight: theme.typography.platformFontWeight,
  },
  content: {
    fontSize: '0.7rem',
  },
  noPadding: {
    padding: 0,
  },
  iconButton: {
    padding: '0.6rem 0.4rem 0 0',
    color: theme.palette.primary.main,
  },
  icon: {
    fontSize: '0.7rem',
  },
  bellIcon: {
    fontSize: '1.2rem',
  },
  iconDiv: {
    height: "100%"
  }
}));

const OrderAlerts = (props) => {
  const { refreshData } = props
  const classes = useStyles();
  const history = useHistory();
  const { user } = useUserContext();
  const { pushAlertPopUp } = useAlertContext();

  const [pendingOrders, setPendingOrders] = useState([]);
  const didMountRef = useRef(false);

  const queryPendingOrder = () => {
    getUserPendingOrder(user.token)
      .then((res) => {
        // res.sort(compare);
        if (res !== null && Array.isArray(res) && didMountRef.current) {
          // console.log(res);
          const pendingTngOrder = res.filter(o => o.orderNumber.startsWith('TNG'))
          setPendingOrders(pendingTngOrder);
        } else {
          // console.log('get null from getUserPendingOrder');
        }
      }).catch((err) => {
        // console.log("error", error)
        pushAlertPopUp(`Problem connecting to server. Please try again later`);
      });
  }

  useEffect(() => {
    didMountRef.current = true;
    if (!!user.token && user.token !== "") {
      queryPendingOrder();
    }
    return () => { didMountRef.current = false; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (refreshData === true && !!user.token && user.token !== "") {
      queryPendingOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);


  const onHighlightClicked = (order) => {
    history.push({
      pathname: routes.ongoingOrder.replace(":id", order.orderId),
    });
  };

  const removeCard = (event, index) => {
    const temp = [...pendingOrders];
    temp.splice(index, 1);
    setPendingOrders(temp);
    event.stopPropagation();
  }

  return (
    <>
      {
        user.token && pendingOrders.length !== 0 ?
          <div className={classes.root}>
            <div className={classes.cardsWrapper}>
              {pendingOrders.length !== 0 ? pendingOrders.map((item, index) => (
                <Card
                  className={classes.card}
                  key={index}
                  onClick={() => onHighlightClicked(item)}
                  elevation={20}
                  variant="outlined"
                >
                  <CardContent className={classes.cardContent}>
                    <div className={classes.bell}>
                      <BellIcon className={classes.bellIcon} />
                    </div>
                    <div className={classes.notification}>
                      <Typography variant="body1" color="textSecondary" component="p" className={classes.title}>
                        {item.status + ` [${item.orderType}]`}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" component="p" className={classes.content}>
                        {'Click to view your order.'}
                      </Typography>
                    </div>
                    <div className={classes.iconDiv}>
                      <CardActions disableSpacing className={classes.noPadding}>
                        <IconButton
                          aria-label="remove card"
                          disableFocusRipple
                          disableRipple
                          className={classes.iconButton}
                          onClick={(event) => removeCard(event, index)}
                        >
                          <CloseIcon className={classes.icon} />
                        </IconButton>
                      </CardActions>
                    </div>
                  </CardContent>
                </Card>
              )) : <></>
              }
            </div>
          </div> : <></>
      }
    </>
  );
};

export { OrderAlerts };
