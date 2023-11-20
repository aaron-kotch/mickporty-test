import React from "react";
import Typography from "@material-ui/core/Typography";
import './PageHeader.scss'
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
  bold:{
    fontWeight: theme.typography.platformFontWeight,
  },
}));

const PageHeader = ({ children }) => {
  const classes = useStyles();

  return <Typography className={clsx('page_header-container', classes.bold)} component="h1">
    {children}
  </Typography>;
}

export { PageHeader };
