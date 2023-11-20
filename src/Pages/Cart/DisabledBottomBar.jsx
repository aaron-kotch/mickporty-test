import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import clsx from "clsx";
import { useAlertContext } from "@Context/AlertContext";

const useStyles = makeStyles((theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  textAlignCenter: {
    textAlign: 'center'
  },
  placeOrderButton: {
    padding: '0.8rem 1.6rem',
    borderRadius: '2rem',
  },
  total: {
    fontWeight: theme.typography.platformFontWeight,
  },
  disabledTotal: {
    color: theme.palette.grey[700]
  },
  greyText: {
    color: theme.palette.grey[500],
    fontWeight: theme.typography.platformFontWeight,
  },
  whiteText: {
    color: theme.palette.primary.contrastText,
  },
  footer: {
    justifyItems: 'center',
    position: 'fixed',
    bottom: 0,
    left: '1.5rem',
    padding: '1rem',
    width: 'calc(100vw - 4.5rem)',
    background: theme.palette.customGrey.lighter,
    borderTopLeftRadius: '1rem',
    borderTopRightRadius: '1rem',
    zIndex: 1,
    [theme.breakpoints.down("xs")]: {
      width: 'calc(100% - 2rem)',
      left: 0,
    }
  },
  bold:{
    fontWeight: theme.typography.platformFontWeight
  },
  primary:{
    backgroundColor: theme.palette.primary.main
  }
}));

export default function DisabledBottomBar({total, noItemInCart}) {
  const classes = useStyles();
  const { pushAlertPopUp } = useAlertContext();
  const onClick = () => {
    if(noItemInCart){
      pushAlertPopUp('No item in cart');
    }
  }

  return (
    <div className={clsx(classes.flexContainer, classes.footer)}>
    <Typography component="div" variant="h6" className={clsx(classes.total, classes.flex, classes.disabledTotal)}>
      <div>Total</div>
      <div>{total}</div>
    </Typography>
    <div className={clsx(classes.textAlignCenter, classes.flex)}>
      <Button className={clsx(classes.placeOrderButton, noItemInCart && classes.primary)} variant="contained" onClick={onClick} disableElevation disableFocusRipple disableRipple>
        <span className={clsx(classes.bold, noItemInCart ? classes.whiteText: classes.greyText)} >Place order</span>
      </Button>
    </div>
  </div>
  )
}
