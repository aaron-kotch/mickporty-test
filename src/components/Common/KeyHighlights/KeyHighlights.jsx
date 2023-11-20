import React, { useState, useEffect } from "react";
// import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import { getHomePageBanner } from "@API/api";
import { useHistory } from "react-router-dom";
import { routes } from "src/constants/routes.constant";
import './KeyHighlights.scss'
import { usePageContext } from '@Context/PageContext';
import clsx from 'clsx';
import { useAlertContext } from "@Context/AlertContext";

const compare = (bannerA, bannerB) => {
  if (bannerA.sequenceOrder < bannerB.sequenceOrder) return -1;
  // put A in front
  else if (bannerA.sequenceOrder > bannerB.sequenceOrder) return 1;
  // put B in front
  else return 0;
};

const KeyHighlights = (props) => {
  const { refreshData } = props;
  const history = useHistory();
  const { keyHighlights, setKeyHighlights } = usePageContext();
  const { pushAlertPopUp } = useAlertContext();

  const [banners, setBanners] = useState([{}]);

  useEffect(() => {
    getHomePageBannerData(keyHighlights);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (refreshData === true) {
      getHomePageBannerData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

  const getHomePageBannerData = (keyHighlights) => {
    if (keyHighlights && keyHighlights.length > 0) {
      setBanners(keyHighlights);
    } else {
      getHomePageBanner().then((res) => {
        if(!res) res = []
        res.sort(compare);
        setBanners(res);
        setKeyHighlights(res);
      }).catch((err) => {
        // console.log("error", error)


        pushAlertPopUp(`Problem connecting to server. Please try again later`);
      });
    }
  }

  const onHighlightClicked = (landingPageBannerId) => {
    if (landingPageBannerId)
      history.push({
        pathname: routes.banner.replace(":id", landingPageBannerId),
      });
  };

  return (
    <div className='key_highlights-container'>
      {/* <div className={clsx('key_highlights-header', classes.boldMax)}> */}
      <div className={clsx('key_highlights-header')}>
        Key Highlights
      </div>
      <div className='key_highlights-cards_wrapper'>
        {
          banners.map((item, index) => (
            <Card
              className='key-hightlight-card'
              key={index}
              onClick={() => onHighlightClicked(item?.landingPageBannerId)}
            >
              <CardMedia
                className='key-hightlight-cover'
                image={
                  item.image ? process.env.REACT_APP_IMAGE_CLOUDFRONT + item.image : ""
                }
                component="img"
              // title={item.title}
              />
            </Card>
          ))
        }
      </div>
    </div>
  );
};

export { KeyHighlights };
