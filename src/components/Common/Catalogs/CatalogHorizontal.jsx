import React from "react";
import { withStyles } from '@material-ui/core/styles';
import { CatalogItem, CatalogTextItem } from '@Common/CatalogItem';
import { CatalogHeader } from "./CatalogHeader";
import CircularProgress from '@material-ui/core/CircularProgress';
import './Catalogs.scss';
import clsx from 'clsx';
// const LOADING_TILE_COUNT = 5;

const sharedCatalogItemStyle = (theme) => ({
  root: {
    display: "inline-block",
    verticalAlign: "top",
    width: 200,
    marginRight: '1rem',
    '&:last-child': {
      marginRight: 0,
      paddingRight: "0.8rem"
    },
    [theme.breakpoints.down("xs")]: {
      width: "40%",
      height: "80%",
    }
  },
  imageCart: {
    aspectRatio: 1,
  },
  productImage: {
    // minHeight: 200,
    objectFit: "cover",
    [theme.breakpoints.down("xs")]: {
      minHeight: "calc(100vw / 2.7)",
    }
  }
})

const StyledCatalogItem = withStyles(theme => sharedCatalogItemStyle(theme))(CatalogItem);
const StyledCatalogTextItem = withStyles(theme => sharedCatalogItemStyle(theme))(CatalogTextItem);

const NoCatalogItemsElement = () => {
  // seems like not used
  return (
    <div className='catalog-spinner'>
      <CircularProgress />
    </div>
  )
}

// Fetch should return array of catalog item's prop
const CatalogHorizontal = ({
  title,
  catalogItems = [],
  onViewAll,
  onBottomLeftIconClicked,
  noCatalogItemsElement = null,
  showViewMoreAtItemIndex = 4,
  onViewMoreClicked = () => {},
  noLeftPadding = false
}, ref) => {

  if (catalogItems.length > showViewMoreAtItemIndex)
    catalogItems.length = showViewMoreAtItemIndex + 1;

  return (
    <div className='catalogs-container'>
      <CatalogHeader component="CatalogHorizontal" title={title} onViewAll={onViewAll} noLeftPadding={noLeftPadding} />
      <div className={clsx('catalogs-contain_container', noLeftPadding && 'catalogs-contain_container--no-padding')}>
        {
          catalogItems.length > 0
            ?
            <div className='catalogs-catalog_items' >
              {
                catalogItems.map((cItem, i) => {
                  // console.log(cItem);
                  if(title.toLowerCase() !== 'people also ordered'){
                    if(i !== showViewMoreAtItemIndex){
                      const itemData = { ...cItem };
                      itemData["id"] = itemData["productId"];
                      itemData["productName"] = itemData["title"];
                      return <StyledCatalogItem
                        key={cItem.productId}
                        onBottomLeftIconClicked={onBottomLeftIconClicked}
                        {...itemData}
                    />
                    }else{
                      return <StyledCatalogTextItem
                        key={cItem.productId}
                        text={"View More"}
                        image={cItem.image}
                        onClick={() => onViewMoreClicked()}
                      />
                    }
                  }else{
                    const itemData = { ...cItem };
                    itemData["id"] = itemData["productId"];
                    itemData["productName"] = itemData["title"];
                    return <StyledCatalogItem
                      key={cItem.productId}
                      onBottomLeftIconClicked={onBottomLeftIconClicked}
                      {...itemData}
                    />
                  }
                  
              }
                )
              }
            </div>
            :
            noCatalogItemsElement || <NoCatalogItemsElement />
        }
      </div>
    </div>
  );
}

export { CatalogHorizontal };