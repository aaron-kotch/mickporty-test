import React, {useEffect} from "react";
import { BackButton } from "@Common/BackButton";
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from "clsx";
import { useCurrency } from "@Hook/useCurrency";
import { getHomePageBannerDetail } from "@API/api";
import { useParams, useHistory } from "react-router-dom";
import { Loader } from "@Common/Loader";
import { routes } from "src/constants/routes.constant";
import Moment from 'react-moment';
import './BannerDetails.scss';

const useStyles = makeStyles(theme => ({
  bannerCardHeaderText:{
    fontWeight: theme.typography.platformFontWeightMedium,
  },
  bold:{
    fontWeight: theme.typography.platformFontWeight,
  },
}));

const BannerDetails = () => {
  const classes = useStyles();
  const { formatCurrency } = useCurrency();
  const [itemData, setItemData] = React.useState(null);
  const { id } = useParams();
  const history = useHistory();

  // Call API to get product details
  useEffect(()=>{
    // console.log('get banner details based on id', id);
    getHomePageBannerDetail(id).then(res => {
      // console.log(res);
      setItemData(res);
    })
  },[id])

  if(itemData === null){
    return <Loader />;
  }

  const onOrderNow = () => {
    if(itemData.promoType === 'Department'){
      history.push({ pathname: routes.categoryListingBanner.replace(':id', itemData.landingPageBannerId) });
    }else{
      history.push({ pathname: routes.productListingBanner.replace(':id', itemData.landingPageBannerId) });
    } 
  }

  const buttonNotExists = !itemData.promoEntityId || itemData.promoType === '';
  return (
    <Container className='banner-container'>
      <div className='banner-product-image' style={{ backgroundImage: `url('${process.env.REACT_APP_IMAGE_CLOUDFRONT}${itemData.image}')`}}>
        <BackButton className={'backButton-withoutHeader'}/>
      </div>
      {
        !!itemData.discount && <div className='banner-discount_tag'>{itemData.discount} discount</div>
      }

      <Card className='banner-details-card'>
        <CardContent className={buttonNotExists? "banner-details-no-button": "banner-details-button"}>
          <div className="banner-date_container">
          <Typography className={clsx('banner-card-header-text', 'banner-inlineText', classes.bannerCardHeaderText)} gutterBottom variant="body2" component="h2">
              <Moment format='DD MMM YYYY hh:mm A'>{itemData.effectiveStart}</Moment>
            </Typography>
          </div>
          <div className="banner-title_container">
            {/* <FavoriteBorderIcon className={clsx('banner-card_Header_icon', 'banner-inlineText')} /> */}
            <Typography className={clsx('banner-card-header-text', 'banner-inlineText', classes.bold)} gutterBottom variant="body2" component="h2">
              {itemData.title}
            </Typography>
          </div>
          <div>
            {
              itemData.price &&
              <Typography className={clsx('banner-inlineText', classes.bold)} variant="body1" component="p">
                {formatCurrency(itemData.price)}
              </Typography>
            }
            {
              !!itemData.priceBefore && <Typography className={clsx('banner-inlineText', 'banner-original-price')} variant="body1" color="primary" component="p">
                {formatCurrency(itemData.priceBefore)}
              </Typography>
            }
          </div>
          <Typography className='banner-description' variant="body2" color="textSecondary" component="div">
            <div dangerouslySetInnerHTML={{ __html: itemData.description }}  />
          </Typography>
        </CardContent>
          {
            buttonNotExists ? <></>:
          <Button className={clsx('banner-nav_button', classes.bold)}  variant="contained" color="primary" onClick={onOrderNow} fullWidth>{itemData.buttonLabel}
          </Button>
          }
      </Card>
    </Container>
  );
};

export { BannerDetails };
