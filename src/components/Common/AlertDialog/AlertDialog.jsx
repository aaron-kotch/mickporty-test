import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    textAlign: "center",
    // fontFamily: "DIN Regular Alternate",
  },
  dialogTitle: {
    marginTop: "0.5rem",
    marginBottom: "-0.7rem",
  },
  dialogContent: {
    fontSize: "14px"
  },
  dialogButton: {
    display: "flex", 
    justifyContent: "center",
    marginBottom: "0.5rem",
  },
  dialogButtonText: {
    borderRadius: "25px", 
    textTransform: "capitalize", 
    height: "40px", 
    width: "125px"
  },
  paperClassName:{
    borderRadius: "20px", 
    minHeight: "150px",
    minWidth: "200px",
    display: "flex",
    justifyContent: "center"
  }
}));

const AlertDialog = (props) => {
  const classes = useStyles();

  // onConfirm needed for Pop Up in ongoingOrderDetails page
  const { title, children, open, setOpen, onConfirm = ()=>{} } = props;
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
      className={classes.root}
      PaperProps={{
        className: classes.paperClassName,
      }}
    >
      <DialogTitle>
        <Typography>
          {title}
        </Typography>
      </DialogTitle>
      {
        children &&
        <DialogContent>{children}</DialogContent>
      }
      <DialogActions className={classes.dialogButton}>
        <Button
          variant="outlined"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          color="primary"
          className={classes.dialogButtonText}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AlertDialog;