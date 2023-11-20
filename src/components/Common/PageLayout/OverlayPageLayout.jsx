import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles(() => ({
  root: {
    paddingTop: '4rem',
    maxWidth: 'unset',
    paddingLeft: 6,
    paddingRight: 6,
    position: 'fixed',
    background: 'white',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2000
  },
}));

const OverlayPageLayout = ({ header, body, footer }) => {
  const classes = useStyles();
  return <Container className={classes.root}>
    {header}
    <div>
      {body}
    </div>
  </Container>;
}

export { OverlayPageLayout };
