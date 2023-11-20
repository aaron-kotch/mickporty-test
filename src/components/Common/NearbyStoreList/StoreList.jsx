import { Box, List, ListItem, Typography, makeStyles } from "@material-ui/core";
import React from "react";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  storeList: {
    // fontFamily: "DIN Regular Alternate",
  },
  storeListItem: {
    display: "block",
    padding: "0.5rem 1rem",
    backgroundColor: "#ffffff", 
    border: '0.05rem solid #bbb',
    marginBottom: '1rem',
    borderRadius: '0.5rem'
  },
  storeListItemContent: {
    display: "flex",
    flexDirection: "column",
    width: "85%"
  },
  storeListItemButton: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "15%"
  },
  storeLabel: {
    fontSize: "0.8rem",
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
    color: "#6D6E71"
  },
  operationHourText: {
    fontSize: '0.8rem',
    lineHeight: "1.4rem",
    display: 'inline-block',
    color: "#1E91CF",
  },
  distanceText: {
    marginLeft: '0.7rem',
    fontSize: "0.8rem",
    display: 'inline-block',
    color: "#1E91CF",
    position: 'relative',
    '&::before': {
      content: '" "',
      height: '0.25rem',
      width: '0.25rem',
      background: "#1E91CF",
      borderRadius: '50%',
      position: 'absolute',
      top: '40%',
      left: '-0.5rem'
    }
  },
  storeStatusText: {
    fontSize: "0.8rem",
    color: "#59595C",
    whiteSpace: "nowrap"
  },
  storeListItemIcon: {
    width: 18,
    height: 18,
    paddingRight: 8,
    verticalAlign: "top"
  },
  storeListItemDarkGray:{
    backgroundColor: "#EAEAEA"
  },
  dot: {
    height: "1.5rem",
    width: "1.5rem",
    backgroundColor: "#fff",
    border: "1px solid #bbb",
    borderRadius: "50%",
    display: "inline-block",
  }
}));

const StoreList = ({
  classes = {},
  storeListItems = [],
  onItemClicked = (s) => (e) => { }
}) => {

  const defClasses = useStyles()
  // console.log('storeListItems',storeListItems)
  
  return (
    <List className={clsx(defClasses.storeList, classes?.storeList)}>
      {
        storeListItems.map((s) => {
          let message = ""
          if(s.storeStatus !== 'Open'){
            message = s.ecomOperatingHours
          } else if (s.ecomOperatingHours === "12:00AM - 11:59PM"){
            message = "Online Store opens for 24 hours"
          } else if (s.storeStatusMsg && s.storeStatusMsg !== "") {
            message = s.storeStatusMsg
          } else {
            let hours = s.ecomOperatingHours.split("-")
            let closeHour = hours[1].trim()
            message =  "Last order at " + closeHour
          }
          
          return (
          <ListItem key={s.storeId} button disabled={s.storeStatus !== 'Open'} onClick={onItemClicked(s)} className={clsx(defClasses.storeListItem, 
          {[defClasses.storeListItemDarkGray]: s.storeStatus !== 'Open' })} >
            <div style={{display: "flex", flexDirection: "row"}}>
              <div className={defClasses.storeListItemContent}>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography className={defClasses.storeLabel} gutterBottom variant="h2">{s.storeName}</Typography>
                  </Box>
                </Box>
                <div>
                  <Typography className={defClasses.operationHourText} variant="body1">
                    {s.operatingHours} 
                  </Typography>
                  {
                    !!s.distance &&
                    <Typography className={defClasses.distanceText} component="div" variant="body1">{s.distance} KM</Typography>
                  }
                </div>
                <div>
                <Typography className={defClasses.storeStatusText} gutterBottom variant="caption">
                    {message}
                  </Typography>
                </div>
              </div>
              {/* the circle icon */}
              {/* <div className={defClasses.storeListItemButton}>
              { s.storeStatus === 'Open' && <div className={defClasses.dot}></div> }
              </div> */}
            </div>
         
          </ListItem>
        )}
        )
      }
    </List>
  )
}

export { StoreList };
