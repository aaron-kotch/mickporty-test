import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Typography, makeStyles } from '@material-ui/core';

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
    height: "30px",
    width: "105px"
  },
  paperClassName: {
    borderRadius: "20px",
  }
}));

const ConfirmDialog = (props) => {
  const classes = useStyles();
  const { title, children, open, setOpen, onConfirm, confirmMessage = "Yes", denyMessage = "No" } = props;

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
      <DialogTitle id="confirm-dialog" className={classes.dialogTitle}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <   DialogContentText id="alert-dialog-description" className={classes.dialogContent}>
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.dialogButton}>
        <Button
          variant="outlined"
          onClick={() => setOpen(false)}
          color="primary"
          className={classes.dialogButtonText}
        >
          {denyMessage}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          color="primary"
          className={classes.dialogButtonText}
        >
          {confirmMessage}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default ConfirmDialog;