import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from "@material-ui/core";
import { routes } from "src/constants/routes.constant";
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined';
import Chip from '@material-ui/core/Chip';


const useStyles = makeStyles(theme => ({
  imageCart: {
    width: '100%',
    position: "relative",
    overflow: 'hidden',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '5%',
  },
  imageCartOverlay: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  chipLabel: {
    position: "absolute",
    top: 6,
    left: "5%",
    width: "90%",
  },
  cartIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: theme.palette.grey[600],
    width: 32,
    height: 32,
    color: "white",
    borderRadius: 0,
    borderTopLeftRadius: '25%',
    "&:hover": {
      backgroundColor: theme.palette.grey[600],
      color: "white",
    }
  },
  desc: {
    paddingLeft: 4,
    paddingTop: 8,
    fontSize: '0.8rem',
    color: theme.palette.grey[700],
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    [theme.breakpoints.down("xs")]: {
      fontSize: '0.6rem',
    }
  },
  priceSection: {
    fontSize: '1rem',
    paddingTop: 8,
    color: theme.palette.grey[700],
    paddingLeft: 4,
  },
  price: {
    fontSize: '0.9rem',
    fontWeight: theme.typography.platformFontWeight,
    [theme.breakpoints.down("xs")]: {
      fontSize: '0.7rem',
    }
  },
  originalPrice: {
    fontSize: '0.7rem',
    lineHeight: "1rem",
    textDecoration: "line-through",
    marginLeft: "0.25em",
    [theme.breakpoints.down("xs")]: {
      fontSize: '0.5rem',
    }
  },
  inlineText: {
    display: 'inline',
  },
}));

const CatalogItem = ({ className, ...props }) => {
  const classes = useStyles();
  const history = useHistory();
  const { id, desc, price, priceBefore, chipLabel, productImageUrl, onBottomLeftIconClicked } = props;

  const navigateToProductDetails = () => {
    history.push({
      pathname: routes.productDetails.replace(':id', id)
    });
  };

  return (
    <Box key={id} flexGrow={0} flexShrink={0} className={className} onClick={navigateToProductDetails}>
      <div className={classes.imageCart}>
        <div className={classes.imageCartOverlay}>
          { !!chipLabel && <Chip className={classes.chipLabel} label={chipLabel} variant="default" size="small" color="primary" /> }
          <IconButton className={classes.cartIcon} size="small" onClick={onBottomLeftIconClicked}>
            <ShoppingCartOutlinedIcon style={{ fontSize: 20 }} />
          </IconButton>
        </div>
        <img width='100%' src={productImageUrl} alt={desc} />
      </div>
      <div className={classes.desc}>

      </div>
      <div className={classes.priceSection}>
        
      </div>
    </Box>
  )
};

export { CatalogItem };
