import { Box, List, ListItem, Typography, makeStyles } from "@material-ui/core";
import React from "react";
import clsx from "clsx";
import { useStoreContext } from "@Context/StoreContext";
import pickUpSVG from '@Assets/svgs/pickup.svg';
import deliverySVG from '@Assets/svgs/delivery.svg';

const useStyles = makeStyles((theme) => ({
  storeList: {
  },
  storeListItem: {
    // backgroundColor:"#F8FEFF"
    display: "block",
    padding: "12px 32px 0 32px",
    "& > div": {
      paddingBottom: 12,
    },
    "&:not(:last-child) > div": {
      borderBottom: "1px solid lightgrey",
    }
  },
  storeLabel: {
    fontSize: "0.8rem",
    fontWeight: theme.typography.platformFontWeight,
    // paddingBottom: 6,
    // color: theme.palette.text.secondary
  },
  operationHourText: {
    fontSize: '0.8rem',
    lineHeight: "1.4rem",
    color: theme.palette.text.secondary
  },
  distanceText: {
    fontSize: "0.8rem",
    fontWeight: theme.typography.platformFontWeight,
    width:'65px'
  },
  storeListItemIcon: {
    width: 18,
    height: 18,
    paddingRight: 8,
    verticalAlign: "top",
  },
  message:{
    width: "100%",
    height: "100%",
    textAlign: "center",
  }
}));

const CommonStoreList = ({
  classes,
  storeListItems = [],
  onItemClicked = (s) => (e) => { }
}) => {

  const defClasses = useStyles();
  const { userLocation } = useStoreContext();

  return (
    <List className={clsx(defClasses.storeList, classes?.storeList)}>
      {
        storeListItems.length === 0? <Typography className={defClasses.message}>No store found</Typography>:
        storeListItems.map((s) => {
          return <ListItem key={s.storeId} button onClick={onItemClicked(s)} className={clsx(defClasses.storeListItem, classes?.storeListItem)}>
            <div className={defClasses.storeListItemContent}>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography className={defClasses.storeLabel} gutterBottom variant="h2">{s.storeName}</Typography>
                </Box>
                {
                  !userLocation?
                  <></>:
                <Box width={50}>
                  {!!s.distance && !Number.isNaN(s.distance) && s.distance !== "NaN" && <Typography className={defClasses.distanceText} color="primary" variant="h2">{s.distance} KM</Typography>}
                </Box>
                }
              </Box>
              <div>
                <Typography className={defClasses.operationHourText} variant="body1">
                  <img src={pickUpSVG} alt='delivery' className={defClasses.storeListItemIcon} /> 
                  {s.storeOperatingHours}
                </Typography>
              </div>
              <div>
                <Typography className={defClasses.operationHourText} variant="body1">
                <img src={deliverySVG} alt='delivery' className={defClasses.storeListItemIcon} /> {s.ecomOperatingHours}
                </Typography>
              </div>
            </div>
          </ListItem>
        })
      }
    </List>
  )
}

export { CommonStoreList }