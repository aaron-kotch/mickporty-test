import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import clsx from 'clsx';
import "./PageLayout.scss"
// Components
import AppBar from '@material-ui/core/AppBar';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: '4.5rem',
    overflow:'auto',
    backgroundColor: 'white',
    height: '100%',
    paddingLeft: '0',
    paddingRight: '0',
  },
  rootWithPadding: {
    paddingTop: '4.5rem',
    overflow:'auto',
    backgroundColor: 'white',
    height: '100%',
  },
  bottomNavigatorSpacer: {
    // Bottom navigation padding-bottom + Bottom navigation height + fab half height (56px / 2)
    height: 'calc(1.25rem + 56px + 28px)'
  },
  container: {
    height: '100%',
  },
  stickyContainer: {
    position: "fixed", 
    top: "3.5rem", 
    // backgroundColor: "aquamarine", 
    height: "30%", 
    width: "93%", 
    zIndex: "1",
    // [theme.breakpoints.up("lg")]: {
    //   width: "75%", 
    // },
    [theme.breakpoints.down("sm")]: {
      width: "92%", 
    },
  }
}));

const StickyHeaderPageLayout = ({ className, containerFullHeigth, header, body1, type=null, itemTotal=null, body2, footer }) => {
  const classes = useStyles();
  return (
    <>
    <Container className={clsx(type ? classes.rootWithPadding : classes.root, [className])} id='sticky-container'>
        {header}
        <div>
          <AppBar elevation={0} id="appbar" color="secondary" position="fixed" style={{top: "3.5rem", zIndex: "1"}}>
            <Container style={{paddingTop: "1rem", paddingBottom: type ? "0rem" : null}}>
                  {body1}
              </Container>
            </AppBar>
        </div>    
        <div style={{paddingTop: type ? "2.5rem" : "8.5rem"}}>{body2}</div>
        <div className={classes.footer}>
        {
        !!footer && <>
            <div className={classes.bottomNavigatorSpacer} />
            {footer}
        </>
        }
        </div>
    </Container>
  </>
  )
}

export { StickyHeaderPageLayout };
