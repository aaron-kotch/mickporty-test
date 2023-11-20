import React, { useEffect } from "react";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { Typography, makeStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button';
import { useHistory } from "react-router-dom";
import './SignIn.scss';
import clsx from "clsx";
import { routes } from "src/constants/routes.constant";
import fmTngLogo from '@Assets/svgs/fmtnglogo.svg'
import { useUserContext } from "@Context/UserContext";

const useStyles = makeStyles((theme) => ({
  bold:{
    fontWeight: theme.typography.platformFontWeight,
  },
}));

const SignIn = () => {
  const classes = useStyles();
  const history = useHistory();
  const { setCanCallCallback, canCallCallback } = useUserContext();

  useEffect(()=>{
    // user cannot click phone's back button to go back
    window.onpopstate = () => {
      if(canCallCallback){
        // allow user to go back if in any case callback called before
        // so user will not stuck in this page
        // cuz proceed button do nothing and they cant go back
      }else{
        history.go(1);
      }
    };
    return () => { window.onpopstate = () => {} }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return (
    <PageLayout
      header={""}
      body={
        <>
          <div className={'signIn-container'}>
            <img src={fmTngLogo} alt="FamilyMart"/>

            <Typography variant="h5" className={'signIn-title'}>FamilyMart</Typography>
            <div className={'signIn-content'}>
              {`To proceed the transaction, we need access to your user information and register as FamilyMart Member.`}
            <div>
              {`By clicking the Proceed button, I agree to register as a FamilyMart Member and agree to its `}
              <Typography 
                className={clsx('signIn-tncLink')}
                onClick={() => history.push(({ pathname: routes.tnc}))} component={'span'}
                >{'T&C'}
              </Typography>
            </div>
            </div>
            <Button className={clsx('signIn-button', classes.bold)} variant="contained" color="primary" 
            onClick={() => setCanCallCallback(true)} 
            fullWidth>{"Proceed"}
            </Button>
          </div>
        </>
      }
    />
  );
};

export { SignIn };
