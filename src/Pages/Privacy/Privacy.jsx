import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Header } from "@Common/Header";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { PageHeader } from '@Common/PageHeader/PageHeader';
import { BackButton } from "@Common/BackButton";

const useStyles = makeStyles((theme) => ({
  frame: {
    'padding-left': 0,
    'padding-right': 0,
    'padding-top': '56px', // min-height of material-ui AppBar
  },
  iframe:{
    height: 'calc(100vh - 60px)',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  outerContainer: {
    backgroundColor: "#0000001A"
  },
  innerContainer: {
    padding: "1rem 0.3rem", 
    backgroundColor: "white", 
    borderRadius: "5px",
    border: "2px solid #00000029",
  }
}));

const Privacy = () => {
  const classes = useStyles();
  return (<PageLayout
    header={
      <Header
      leftSlot={<BackButton />}
      centerSlot={<PageHeader>{'Privacy Policy'}</PageHeader>}
      />
    }
    className={classes.outerContainer}
    body={
      <div className={classes.innerContainer}>
        <iframe 
          className={classes.iframe}
          title='Help-Center'
          width="100%" 
          frameBorder="0"
          src={`${process.env.REACT_APP_IMAGE_CLOUDFRONT}static-html/Privacy-Policy.html`} 
          >
        </iframe>
      </div>
    }
    />
  );
};

export { Privacy };
