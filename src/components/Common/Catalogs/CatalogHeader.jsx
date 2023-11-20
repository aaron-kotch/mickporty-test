import React from "react";
import { Box, Link, styled } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import './Catalogs.scss';

const ViewAllButton = styled(Link)``;

const useStyles = makeStyles(theme => ({
  boldMax:{
    fontWeight: theme.typography.platformFontWeightMax,
  },
  boxSpace: props => ({
    padding: props.noLeftPadding? "0 1rem 0 0" : "0 1rem"
  })
}));

const CatalogHeader = ({
  title,
  onViewAll,
  component=null,
  noLeftPadding = false
}) => {

  const classes = useStyles({noLeftPadding});

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="baseline" className={component === "CatalogHorizontal" ? classes.boxSpace : null}>
        <div className={clsx('catalogs-header', noLeftPadding && 'catalogs-header--no-padding')}>{title}</div>
        {
          !!onViewAll
          &&
          <Box className='catalogs-header_view_more' onClick={onViewAll}>
            <ViewAllButton className={clsx('catalogs-view_all_text')} onClick={onViewAll}>View all</ViewAllButton>
          </Box>
        }
      </Box>
    </div>
  )
}

export { CatalogHeader }