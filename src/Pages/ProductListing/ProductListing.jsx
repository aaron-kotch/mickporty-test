import React, { useState, useMemo } from "react";
import { Header } from "@Common/Header";
import { BackButton } from "@Common/BackButton";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { StickyHeaderPageLayout } from "@Common/PageLayout/StickyHeaderPageLayout";
import { InfiniteScroller } from "@Common/InfiniteScroller/InfiniteScroller";
import { CatalogGrid } from "@Common/Catalogs/CatalogGrid";
import { CatalogHeader } from "@Common/Catalogs/CatalogHeader";
import { useParams } from "react-router-dom";
import { CartButton } from "@Common/CartButton/CartButton";
import { makeStyles } from "@material-ui/core";
import { StoreSelectorModal } from "@Common/StoreSelector";
import {
  getAllCatalogItemsByCategoryOrCatalogId,
  getAllCatalogItemsByCatalogId,
  getAllCatalogItemsByProductTaggingId,
  getRecommendations,
  getHomePageBannerDetail
} from "@API/api";
import { useCartContext, ShoppingType } from "@Context/CartContext";
import { useStoreContext } from "@Context/StoreContext";
import { usePageContext } from "@Context/PageContext";
import { Logo } from "@Common/Logo";

// const getData = async (catalog, pageIndex, take) => {
//   const fromIndex = pageIndex * take;
//   return delay({
//     data: catalog.items.slice(fromIndex, fromIndex + take),
//     count: catalog.itemCount,
//   }); 
// };

const useStyles = makeStyles((theme) => ({
  cartButton: {
    position: "fixed",
    right: "0",
    top: "5rem",
    zIndex: 1,
    boxShadow: "unset",
  },
  cartButton2: {
    position: "fixed",
    right: "0",
    top: "3.7rem",
    zIndex: 1,
    boxShadow: "unset",
  },
  categoryTitle: {
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: theme.typography.platformFontWeight,
    fontSize: "18px",
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    // display: "block"
    [theme.breakpoints.up('374')]: {
      marginLeft: '10%',
      width: '80%'
    },
    [theme.breakpoints.down('374')]: {
      marginLeft: '13%',
      width: '76%'
    },
    [theme.breakpoints.down('363')]: {
      marginLeft: '17%',
      width: '66%'
    },
    [theme.breakpoints.down('320')]: {
      marginLeft: '20%',
      width: '60%'
    },
    [theme.breakpoints.down('301')]: {
      marginLeft: '22%',
      width: '56%'
    },
    [theme.breakpoints.down('283')]: {
      marginLeft: '25%',
      width: '50%'
    },
  }
}));

const ProductListing = (props) => {
  const classes = useStyles();
  const { state } = props.location;
  const isBanner = window.location.href.includes("banner")
  const { id } = useParams();
  const { shoppingType, formatProducts, cart } = useCartContext();
  const { selectedStore, isSelectStoreModalOpened, setIsSelectStoreModalOpened } = useStoreContext();
  const { landingProducts } = usePageContext();

  const [data, setData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  // total number of items
  const [totalDataSize, setTotalDataSize] = useState(0);
  const [title, setTitle] = useState('');
  const [bannerRes, setBannerRes] = useState();

  const loadNextPage = async (pageIndex) => {
    // 5 possible listing: department products, tagged products, banner department products, banner tagged products, and recommendations
    setIsDataLoading(true);
    let catalogId;
    let isProductTaggingId = false;
    const currentStoreId = selectedStore ? selectedStore.storeId : "";
    let tempCurrentProducts = []
    let bannerDetails;
    // if not mistaken, now will not enter recommendation listing
    if (id === "recommendations") {
      let orderType = 'Delivery';
      const storeIdValue = selectedStore ? selectedStore.storeId : "";
      if (shoppingType === ShoppingType.PickUp) { orderType = "PickUp"; }
      await getRecommendations(orderType, storeIdValue).then((res) => {
        setTitle('Recommendations');
        const temp = formatProducts(res);
        setData((d) => [...d, ...temp]);
        setTotalDataSize(res.length);
        setIsDataLoading(false);
      });
      return;
    }
    if (isBanner) {
      bannerDetails = await getHomePageBannerDetail(id).then(res => {
        setBannerRes(res);
        return res;
      })
      isProductTaggingId = bannerDetails.promoType === 'Product Tagging' ? true : false;
      setTitle(bannerDetails.promoTitle);
      catalogId = bannerDetails.promoEntityId;
      let result = [];
      if (isProductTaggingId) {
        result = await getOneTaggedProductPage(catalogId, pageIndex, currentStoreId)
      } else {
        result = await getOneDepartmentProductPage(catalogId, pageIndex, currentStoreId);
      }
      return setResult(result);
    }
    // if not recommendation or banner
    // console.log(`state`, state);
    const catalogType = state ? state.type === 'productTaggingId' ? 'productTaggingId' : 'departmentId' : 'departmentId'
    await getAllCatalogItemsByCategoryOrCatalogId(id, catalogType, shoppingType, currentStoreId).then(
      async (res) => {
        // only 1 object in an array will be returned which is that particular catalog
        // console.log('getAllCatalogItemsByCategoryOrCatalogId', res)
        if (res.length > 0) {
          if (res[0] && res[0].departmentId) {
            // If this is a department
            catalogId = res[0].departmentId;
            // console.log('This is a department');
            let result = await getOneDepartmentProductPage(catalogId, pageIndex, currentStoreId);
            // console.log('result is', result);
            setTitle(res[0].title);
            return setResult(result);
          } else {
            catalogId = res[0].productTaggingId;
            isProductTaggingId = true;
          }

          const temp = res.map(c => {
            return {
              ...c,
              items: formatProducts(c.items)
            }
          });
          tempCurrentProducts = temp

          setTitle(res[0].title);
        }
      }
    );

    let result = [];
    let resultArr = [];
    // if enter from home page View More
    if (tempCurrentProducts.length > 0) {
      // console.log('tempCurrentProducts.length > 0')
      tempCurrentProducts.forEach((product) => {
        if (product.catalogId === id) {
          resultArr = product
        }
      });
      setTitle(resultArr.title);
      if (resultArr) {
        result = getOnePageData(
          resultArr,
          pageIndex,
          formatProducts
        );
      }
    } else if (landingProducts.length > 0) {
      // get value from page context instead of calling api
      landingProducts.forEach((catalog) => {
        if (catalog.catalogId === id) {
          resultArr = catalog;
        }
      });
      if (!!resultArr) {
        setTitle(resultArr.title);
        result = getOnePageData(
          resultArr,
          pageIndex,
          formatProducts
        );
      }
    }
    return setResult(result);
  };

  const getOneTaggedProductPage = async (catalogId, pageIndex, currentStoreId) => {
    let result = []
    await getAllCatalogItemsByProductTaggingId(catalogId, pageIndex, shoppingType, currentStoreId).then(
      (res) => {
        if (res.length > 0) {
          result = getOnePageData(
            res[0],
            pageIndex,
            formatProducts
          );
        }
      }
    );
    return result;
  }

  const getOneDepartmentProductPage = async (catalogId, pageIndex, currentStoreId) => {
    let result = [];
    await getAllCatalogItemsByCatalogId(catalogId, pageIndex, shoppingType, currentStoreId).then((res) => {
      // console.log("getAllCatalogItemsByCatalogId", res);
      if (res.length > 0) {
        result = getOnePageData(
          res[0],
          pageIndex,
          formatProducts
        );
      }
    });
    return result;
  }

  const setResult = (result) => {
    if (result.data && result.data.length > 0) {
      // console.log('append this array', result);
      setData((d) => [...d, ...result.data]);
      setTotalDataSize(result.count);
    }
    setIsDataLoading(false);
  }

  const getOnePageData = (catalog, pageIndex, formatProducts) => {
    if (!catalog) catalog = {}
    const tempItem = formatProducts(catalog.items);
    return {
      // data: tempItem.slice(fromIndex, fromIndex + take),
      data: tempItem,
      count: catalog.totalCount,
    };
  };

  const finalTitle = state?.title || title;
  const renderProducts = useMemo(() => {
    if (!data || !data.length) return null;
    return <CatalogGrid state={state || null} title={finalTitle} catalogItems={data} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, finalTitle]);

  return (
    <>
      {state && state.type === "departmentId" ? (
        <StickyHeaderPageLayout
          header={<Header leftSlot={<BackButton />} centerSlot={<Logo />} />}
          body1={
            <div>
              <CatalogHeader title={finalTitle} />
              {cart.length > 0 ? <CartButton className={classes.cartButton2} isSquare /> : null}
            </div>
          }
          type={state.type}
          body2={
            <InfiniteScroller
              loadNextPage={loadNextPage}
              hasNextPage={data.length < totalDataSize}
              isNextPageLoading={isDataLoading}
              component={renderProducts}
              totalDataSize={totalDataSize}
              bannerTitle={bannerRes?.promoTitle}
            />
          }
        />
      ) : (
        <PageLayout
          header={
            <>
              <Header
                leftSlot={<BackButton />}
                centerSlot={finalTitle ? (
                  <div className={classes.categoryTitle}>
                    {finalTitle}
                  </div>
                ) : (
                  <Logo />
                )}
              />
            </>
          }
          body={
            <>
              {cart.length > 0 ? <CartButton className={classes.cartButton} isSquare /> : null}
              <InfiniteScroller
                loadNextPage={loadNextPage}
                hasNextPage={data.length < totalDataSize}
                isNextPageLoading={isDataLoading}
                component={renderProducts}
                totalDataSize={totalDataSize}
                bannerTitle={bannerRes?.promoTitle}
              />
              {
                isSelectStoreModalOpened &&
                <StoreSelectorModal
                  open={isSelectStoreModalOpened}
                  setIsSelectStoreModalOpened={setIsSelectStoreModalOpened}
                  onClose={() => setIsSelectStoreModalOpened(false)}
                />
              }
            </>
          }
        />
      )}
    </>
  );
};

export { ProductListing };
