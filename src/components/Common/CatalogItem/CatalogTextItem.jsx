import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from "@material-ui/core";
import clsx from 'clsx';
import './CatalogTextItem.scss'
const useStyles = makeStyles(theme => ({
  root: {},
}));

// For "View More"
const CatalogTextItem = ({ classes: propClasses, ...props }) => {
  const classes = useStyles();
  const { text, image, onClick } = props;

  return (
    <Box flexGrow={0} flexShrink={0} className={clsx(classes.root, propClasses?.root)} onClick={onClick}>
      <div className='catalog_text_item-item_frame'>
        <div className='catalog_text_item-item_overlay'>
          <Typography className='catalog_text_item-text' color="secondary" component="p">{text}</Typography>
        </div>
        <img className={clsx('catalog_text_item-product_item', propClasses?.productImage)} src={process.env.REACT_APP_IMAGE_CLOUDFRONT+image.replace("JPG","jpg")} alt={text}/>
      </div>
    </Box>
  )
};

export { CatalogTextItem };
