import React from "react";
import { withStyles } from '@material-ui/core/styles';
import { CatalogItem } from '@Common/CatalogItem';
import { CatalogHeader } from "./CatalogHeader";
import './Catalogs.scss';

const StyledCatalogItem = withStyles(theme => ({
  root: {
    display: "flex",
    flex: "0 0 46%",
    // height: "calc(100vw / 1.9)",
    paddingBottom: 24,
    flexDirection: "column",
    flexWrap: "nowrap",
    // paddingLeft: "4%",
    // paddingRight: "4%",
    // overflowX: "hidden",
    // "@media(max-width: 455px)":{
    //   width:"65%",
    //   margin:"auto",
    // },
    "@media(max-width: 336px)":{
      width:"90%",
      margin:"0",
    },
    [theme.breakpoints.up("sm")]: {
      // minHeight: "calc(100vw / 4 + (30vh / 50))",
      height: "auto",
      minHeight: "280px",
    }
  },
  imageCart: {
    flex: "1 0 calc(100% - 60px)",
    aspectRatio: 1,
  },
  desc: {
    flex: "0 0 28px",
    [theme.breakpoints.up("sm")]: {
      flex: "0 0 32px",
    }
  },
  productImage: {
    objectFit: "cover",
  }
}))(CatalogItem);

const CatalogGrid = ({ state=null, title, catalogItems, onViewAll, onBottomLeftIconClicked, itemPerRow = 2 }) => {
  return (
    <div className='catalogs_grid-container'>
      {state && state.type === "departmentId" ? null : (
        <CatalogHeader title={title} onViewAll={onViewAll} /> 
      )}
      <div className='catalogs_grid-catalog-items'>
        {
          catalogItems.map(catalogItem => (
            <StyledCatalogItem 
              key={catalogItem.productId} 
              // onBottomLeftIconClicked={onBottomLeftIconClicked} 
              {...catalogItem} 
            />
          ))
        }
      </div>
    </div>
  );
}

export { CatalogGrid };