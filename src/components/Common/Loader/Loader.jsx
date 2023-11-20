import React from 'react';
import { CircularProgress } from '@material-ui/core';
import './Loader.scss'

function Loader(){
  // const classes = useStyles();
  return <div className='loader-container'>
    <CircularProgress size="5rem" />
  </div>;
}

export { Loader };