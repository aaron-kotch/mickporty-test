import React from "react";
import { Modal } from "@Common/Modal";
import { makeStyles, Box, Paper } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { useStoreContext } from "@Context/StoreContext";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2rem 1rem",
    maxWidth: "90%"
  },
  modalTitle: {
    textAlign: "center"
  },
  navSelector: {
    flex: "0 0 30%",
    textAlign: "center",
    padding: "18px 12px",
  },
  navName: {
    fontSize: "1rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.7rem",
    }
  }
}));

const NavigationModal = ({ title, selectedLocation, ...props }) => {

  const classes = useStyles();
  const { userLocation } = useStoreContext();
  // console.log(userLocation);
  // console.log(selectedLocation);
  // comgooglemaps://?saddr=&daddr=\(lat),\(lon)&directionsmode=driving
  // waze://?ll=\(lat),\(lon)&navigate=yes
  // waze://?ll=101.23,34.00&navigate=yes
  const onWazeClicked = (event) => {
    window.location.assign(`https://www.waze.com/ul?ll=${selectedLocation.latitude}%2C${selectedLocation.longitude}&navigate=yes&zoom=17`);
  }
  const onGoogleMapClicked = (event) => {
    if(userLocation){
      window.location.assign(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat}%2C${userLocation.lng}&destination=${selectedLocation.latitude}%2C${selectedLocation.longitude}&travelmode=driving`);
    }else{
      window.location.assign(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude}%2C${selectedLocation.longitude}&travelmode=driving`);
    }
  }

  return <Modal
    {...props}
    className={classes.root}
    title={
      <div className={classes.modalTitle}>
        <Typography color="primary">
          {title}
        </Typography>
      </div>}
  >
    <Box display="flex" justifyContent="space-evenly">
      <Paper className={classes.navSelector} onClick={onWazeClicked}>
        <img src="https://www.waze.com/webcms/static/compiled/eab8d17c745136dfb5b5c40fb8b2564a.svg" height={32} alt={'Waze'}/>
        <Typography className={classes.navName} color="textPrimary">Waze</Typography>
      </Paper>
      <Paper className={classes.navSelector} onClick={onGoogleMapClicked}>
        <img src="https://lh3.googleusercontent.com/L37ZRAGZYmp35EP7HcddnvG5XOrjAqfSOZYbHyl_6nuPdHvrv7BAsKx_JxUp4D6PAkE=w133" height={32} alt={'Google Maps'}/>
        <Typography className={classes.navName} color="textPrimary">Google Maps</Typography>
      </Paper>
    </Box>
  </Modal>
}

export { NavigationModal };