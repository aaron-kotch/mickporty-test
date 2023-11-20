import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { routes } from "src/constants/routes.constant";
import { useHistory } from "react-router-dom";
import { useCurrency } from "@Hook/useCurrency";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    display: "flex",
    // flex: "0 0 22%",
    height: "72px",
    width: "72px",
    minWidth:'72px',
    border: `0.05rem solid ${theme.palette.primary.main}`,
    borderRadius: '10px',
    overflow: 'hidden'
  },
  productImage: {
    display: "block",
    // width: "100%",
    // height: "100%",
    // minHeight: 0,
    "object-fit": "contain",
    minWidth:'100%',
  },
  desc: {
    paddingLeft: 4,
    paddingTop: 4,
    fontSize: "1rem",
    color: theme.palette.primary.main,
    display: "-webkit-box",
    "-webkit-line-clamp": 2,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "normal",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.8rem",
    },
  },
  descContainer:{
    paddingLeft: '0.7rem',
  },
  priceSection: {
    fontSize: "1rem",
    paddingTop: 2,
    color: theme.palette.grey[700],
    paddingLeft: 4,
  },
  price: {
    fontSize: "0.9rem",
    fontWeight: theme.typography.platformFontWeightMedium,
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.8rem",
    },
  },
  originalPrice: {
    fontSize: "0.8rem",
    lineHeight: "1rem",
    textDecoration: "line-through",
    marginLeft: "0.7em",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.6rem",
    },
  },
  catalogItem: {
    display: "flex",
    width: "100%",
    paddingTop: "0.5rem",
  },
}));

const SearchItem = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { formatCurrency } = useCurrency();
  const {
    image,
    title,
    productId,
    price: oriPrice,
    discountedPrice,
  } = props;
  const curPrice = discountedPrice?? oriPrice;

  const navigateToProductDetails = () => {
    history.push({
      pathname: routes.productDetails.replace(':id', productId)
    });
  };

  return (
    <div className={classes.catalogItem} onClick={navigateToProductDetails}>
      <div className={classes.imageContainer}>
        <img
          className={classes.productImage}
          src={
            process.env.REACT_APP_IMAGE_CLOUDFRONT +
            image.replace("JPG","jpg")
          }
          alt={title}
        />
      </div>
      <div className={classes.descContainer}>
        <div className={classes.desc}>
          <strong>
            {title}
          </strong>
        </div>
        <div className={classes.priceSection}>
          <Typography
            className={clsx(classes.inlineText, classes.price)}
            variant="body1"
            component="span"
            >
            {formatCurrency(curPrice)}
          </Typography>
            {discountedPrice && (
              <Typography
                className={clsx(classes.inlineText, classes.originalPrice)}
                variant="body1"
                color="primary"
                component="span"
              >
                {formatCurrency(oriPrice)}
              </Typography>
            )}
        </div>
      </div>
    </div>
  );
};

export { SearchItem };
