import React from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 'calc(100vw - 10px)',
    maxWidth: '320px',
    maxHeight: '450px',
    overflowY: 'auto',
    [theme.breakpoints.up("sm")]: {
      maxHeight: 'calc(100% - 10rem)',
    },
    [theme.breakpoints.up("md")]: {
      top: '-4rem'
    },
    [theme.breakpoints.down("md")]: {
      top: '-1rem'
    }
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
  }
}));

const Modal = ({ className, onClose = () => {}, selectedValue, open, title, children,  noCloseBtn = false, ...props }) => {
  const classes = useStyles();
  
  const handleClose = (event, reason) => {
    if(noCloseBtn){
      if(reason === "escapeKeyDown" || reason === "backdropClick") return false;
      // else will run, but nothing to run too :p
    }else{
      onClose(selectedValue, reason);
    }
  };

  return <Dialog {...props} disableEscapeKeyDown={noCloseBtn} onClose={handleClose} aria-labelledby="simple-dialog-title" open={open} PaperProps={{ className: clsx(classes.root, className) }}>
    {!!title && <DialogTitle id="simple-dialog-title">{title}</DialogTitle>}
    {children}
    {
      !noCloseBtn &&
      <Fab className={classes.closeButton} onClick={handleClose} aria-label="close">
        <CloseOutlinedIcon />
      </Fab>
    }
  </Dialog>
};

export { Modal };
