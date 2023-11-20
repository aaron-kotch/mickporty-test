import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import { LazyCatalogs } from "@Common/Catalogs";
import { CatalogHorizontal } from "@Common/Catalogs/CatalogHorizontal";
import { routes } from "src/constants/routes.constant";
import { getLandingProductListing } from "@API/api";
import { Loader } from "@Common/Loader";
import { useCartContext } from "@Context/CartContext";
import { useStoreContext } from "@Context/StoreContext";
import { usePageContext } from "@Context/PageContext";
import { useAlertContext } from "@Context/AlertContext";

const FeaturedCatalogs = (props) => {
  const { refreshData } = props
  const history = useHistory();
  const { formatProducts, shoppingType } = useCartContext();
  const { selectedStore } = useStoreContext();
  const { landingProducts, setLandingProducts } = usePageContext();
  const { pushAlertPopUp } = useAlertContext();
  // catalogs refers to the product listing under the above category
  // act as a store, load the data from this state when needed
  const [catalogs, setCatalogs] = useState(landingProducts);
  const didMountRef = useRef(false);

  const getLandingProducts = useCallback((orderType, storeId) => {
    getLandingProductListing(orderType, storeId).then((ret) => {
      // console.log(ret);
      try {
        if(!ret) ret = []
        // catch when AWS is not opened yet
        const temp = ret.map(c => {
          return {
            ...c,
            items: formatProducts(c.items)
          }
        });
        if (didMountRef.current) {
          setCatalogs(temp);
          setLandingProducts(temp);
        }
      } catch (err) {


        pushAlertPopUp(`Problem connecting to server. Please try again later`);
        // ;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (didMountRef.current)
      getLandingProducts(shoppingType, selectedStore?.storeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingType, selectedStore])

  useEffect(() => {
    // if on first render but got a copy of catalog in context
    didMountRef.current = true;
    if (catalogs.length > 0) {
      // console.log('ady got products, no need to query again');
    } else {
      // console.log('get products')
      getLandingProducts(shoppingType, selectedStore?.storeId);
    }
    return () => { didMountRef.current = false; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (refreshData === true) {
      getLandingProducts(shoppingType, selectedStore?.storeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData])

  const navigateToProductListing = (category) => () => {
    history.push({
      pathname: (category.departmentId
        ? routes.categoryListing
        : routes.productListing
      ).replace(":id", category.departmentId
        ? category.departmentId
        : category.catalogId),
      state: {
        title: category.title,
        type: (category.departmentId
          ? 'departmentId'
          : 'productTaggingId')
      }
    });
  };

  // fetch the data for one catalog only when in view
  // const [currentVisibleIndices, setCurrentVisibleIndices] = useState([]);
  const onCatalogInView = (index, _) => {
    // setCurrentVisibleIndices((vi) => [index, ...vi]);
  };
  if (!catalogs) {
    return <Loader />;
  }

  return (
    <LazyCatalogs onCatalogInView={onCatalogInView}
      children={catalogs.map((c, i) => {
        return <CatalogHorizontal
          key={c.title.toLowerCase().replace(" ", "_")}
          id={c.title.toLowerCase().replace(" ", "_")}
          title={c.title}
          catalogItems={c?.items}
          onViewAll={!!c ? navigateToProductListing(c) : undefined}
          onViewMoreClicked={!!c ? navigateToProductListing(c) : undefined}
        />
      })}
    />
  );
};

export { FeaturedCatalogs };
