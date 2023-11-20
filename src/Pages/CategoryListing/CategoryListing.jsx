import React, { useState, useEffect } from "react";
import { StickyHeaderPageLayout } from "@Common/PageLayout/StickyHeaderPageLayout";
import { Header } from "@Common/Header";
import { Logo } from "@Common/Logo";
import { StoreSelector } from "@Common/StoreSelector";
import { useHistory } from "react-router-dom";
import { LazyCatalogs } from "@Common/Catalogs";
import { CatalogHorizontal } from "@Common/Catalogs/CatalogHorizontal";
import { routes } from "src/constants/routes.constant";
// import useSWR from "swr";
import { BackButton } from "@Common/BackButton";
import { Loader } from "@Common/Loader";
import { useParams } from "react-router-dom";
import { Chip, makeStyles, Typography, IconButton } from "@material-ui/core";
import { ReactComponent as FilterIcon } from '@Assets/svgs/filter.svg';
import { CartButton } from "@Common/CartButton/CartButton";
import { Selection } from "@Common/Selection";
import { EmptyState } from "@Common/EmptyState/EmptyState";
import {
  getAllCategories,
  getAllCatalogItemsByCategoryOrCatalogId,
  getAllCatalogItemsByCatalogId,
  getHomePageBannerDetail
} from "@API/api";
import { useCartContext } from "@Context/CartContext";
import { useStoreContext } from "@Context/StoreContext";
import clsx from "clsx";
import './CategoryListing.scss'
import { useAlertContext } from "@Context/AlertContext";

const useStyles = makeStyles((theme) => ({
  select: {
    borderRadius: "25px",
  },
  dropdownSelected: {
    color: '#1E91CF'
  },
  chip: {
    marginTop: "0.5rem",
    marginRight: "0.5rem",
    fontWeight: theme.typography.platformFontWeight,
  },
  chipInActive: {
    color: theme.palette.grey[700],
    borderColor: theme.palette.grey[300]
  },
  categoryListingTitle: {
    // fontWeight: theme.typography.platformFontWeight
    fontFamily: 'din_bold, din_regular',
  }
}));

const CategoryListing = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { shoppingType, cart } = useCartContext();
  const { selectedStore } = useStoreContext();
  const { pushAlertPopUp } = useAlertContext();

  // catalog refers to the catagory that is selected and will displayed as main page title
  const [category, setCategory] = useState(undefined);
  const [sortOption, setSortOption] = useState('');
  // catalogs refers to the product listing under the above category
  // act as a store, load the data from this state when needed
  const [catalogs, setCatalogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // the catagory that is chosen among tabs
  const [activeCategory, setActiveCategory] = useState(0);
  let { id } = useParams();
  const selections = [
    {
      "name": "lowToHigh",
      "value": "lowToHigh",
      "description": "Price: Lowest to Highest",
    },
    {
      "name": "HighToLow",
      "value": "HighToLow",
      "description": "Price: Highest to Lowest",
    }
  ]

  useEffect(() => {
    let catergoryDetails;
    let storeId = null
    if (selectedStore !== undefined) {
      storeId = selectedStore.storeId
    }
    getHomePageBannerDetail(id).then(res => {
      // console.log("getHomePageBannerDetail", res);
      catergoryDetails = res;

      setIsLoading(true);
      getAllCategories().then((returnedData) => {
        if (catergoryDetails != null) {
          // set catalog (catagory like Bread) based on id
          let catergoryDetail = returnedData.data.getLandingMenuList.find(
            (action) => action.actionId === catergoryDetails.promoEntityId
          )
          if (catergoryDetail != null) {
            setCategory(catergoryDetail);
          } else {
            let details = { 'title': catergoryDetails.promoTitle }
            setCategory(details)
          }
          // use the category id to get all product listing info like title of this catalog
          return getAllCatalogItemsByCategoryOrCatalogId(catergoryDetails.promoEntityId, 'departmentId', shoppingType, storeId)
        } else {
          // set catalog (catagory like Bread) based on id
          let catergoryDetail = returnedData.data.getLandingMenuList.find(
            (action) => action.actionId === id
          )
          if (catergoryDetail != null) {
            setCategory(catergoryDetail);
          }
          // use the category id to get all product listing info like title of this catalog
          return getAllCatalogItemsByCategoryOrCatalogId(id, 'departmentId', shoppingType, storeId)
        }
      }).then(ret => {
        if (!ret) ret = []
        setCatalogs(ret)
      })
        .catch(err => {
          pushAlertPopUp(`Problem connecting to server. Please try again later`);
          // 
        }).then(() => setIsLoading(false));;
    }).catch(err => {
      pushAlertPopUp(`Problem connecting to server. Please try again later`);
      // 
    })

    // get all categories then identify the one on current page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedStore, shoppingType]);

  const scrollToCategory = (index, catalogTitle, catalogsLength) => {
    var element = document.getElementById(catalogTitle.toLowerCase().replace(" ", "_"));
    var stickyContainer = document.getElementById('sticky-container');
    // console.log('stickyContainer',stickyContainer)
    if (index === catalogsLength - 1) {
      element.scrollIntoView({ block: "end" });
    } else {
      element.scrollIntoView({ block: "center" });
      stickyContainer.scrollBy(0, -36);
    }
    // OR
    // element.scrollIntoView({behavior: 'smooth', block: "center"});
    // stickyContainer.scrollBy({behavior: 'smooth', left:0, top:-36 });
    setActiveCategory(index)
  };

  const navigateToProductListing = (catalog) => () => {
    history.push({
      pathname: routes.productListing.replace(":id", catalog.catalogId),
      state: {
        title: catalog.title,
        type: "departmentId"
      }
    });
  };

  // fetch the data for one catalog only when in view
  const [currentVisibleIndices, setCurrentVisibleIndices] = useState([]);
  const [currentAddedIndices, setCurrentAddedIndices] = useState([]);

  // A general function to call all catalogs APIs which are in user view
  function getCatalogs() {
    // get all catalogs that need to call API
    const toBeAddedIndices = [];
    let storeId = null
    if (selectedStore !== undefined) {
      storeId = selectedStore.storeId
    }
    // repeat code within foundNotCalled
    const toBeCalled = catalogs.filter((_, index) => {
      const found =
        currentVisibleIndices.includes(index) &&
        !currentAddedIndices.includes(index);
      // indices needed for onCatalogInView
      if (found) toBeAddedIndices.push(index);
      return found;
    });
    if (toBeCalled.length !== 0) {
      // console.log("get specific catalog because its in view");
      // return the index of the catalog to help populate the data in correct index
      const finalPromise = Promise.all(toBeCalled.map((catalog, idx) => {
        setCurrentAddedIndices((indices) => [...indices, ...toBeAddedIndices]);
        // get catalog items for one catalog
        return getAllCatalogItemsByCatalogId(catalog.departmentId, 0, shoppingType, storeId).then((ret) => {
          setCatalogs((prevCatalog) => {
            const catalogsCopy = [...prevCatalog];
            // toBeCalled and toBeAddedIndices have the same length
            catalogsCopy[toBeAddedIndices[idx]] = ret[0];
            return catalogsCopy;
          });
        });
      }));
      finalPromise.catch(err => {
        pushAlertPopUp(`Problem connecting to server. Please try again later`);
      });
    }
  }

  // When the catalog is in view, call to get more detailed json
  // loop through the array to check if one element is in view but API not called
  const foundNotCalled = () => {
    // console.log("found not called");
    return (
      catalogs.filter((_, index) => {
        return (
          currentVisibleIndices.includes(index) &&
          !currentAddedIndices.includes(index)
        );
      }).length !== 0
    );
  };
  if (catalogs !== undefined && foundNotCalled()) getCatalogs();

  const onCatalogInView = (index, _) => {
    setCurrentVisibleIndices((vi) => [index, ...vi]);
  };

  const ascending = (itemA, itemB) => {
    if (itemA.price < itemB.price) return -1;  // put A in front
    else if (itemA.price > itemB.price) return 1;  // put B in front
    else return 0;
  }
  const descending = (itemA, itemB) => {
    if (itemA.price < itemB.price) return 1;  // put A in front
    else if (itemA.price > itemB.price) return -1;  // put B in front
    else return 0;
  }

  const handleFilterChange = (event) => {
    setSortOption(event.target.value);
    if (event.target.value === 'lowToHigh') {
      const tempCatalogs = catalogs.map(c => {
        if (c.items) {
          const tempItems = c.items.map(i => { return { ...i }; });
          tempItems.sort(ascending);
          return { ...c, items: tempItems };
        } else {
          return { ...c };
        }
      });
      setCatalogs(tempCatalogs);
    } else {
      const tempCatalogs = catalogs.map(c => {
        if (c.items) {
          const tempItems = c.items.map(i => { return { ...i }; });
          tempItems.sort(descending);
          return { ...c, items: tempItems };
        } else {
          return { ...c };
        }
      });
      setCatalogs(tempCatalogs);
    }
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return <Loader />;
  }
  const totalCount = catalogs.reduce((acc, curr) => {
    return acc + parseInt(curr.totalCount);
  }, 0);

  // console.log("catalogs: ", catalogs)
  return (
    <StickyHeaderPageLayout
      header={<Header leftSlot={<BackButton />} centerSlot={<Logo />} />}
      body1={
        <>
          <StoreSelector page={"category-listing"} />
          {cart.length > 0 ? <CartButton className='categoryListing-cart_button' isSquare /> : null}
          <div className='categoryListing-category_container'>
            <div className='categoryListing-header'>
              <Typography className={clsx('categoryListing-title', classes.categoryListingTitle)}>
                {category?.title}
              </Typography>
              {
                totalCount > 1 ? (
                  <Typography className='categoryListing-subtitle'>
                    {totalCount} Products available
                  </Typography>
                ) : (
                  <Typography className='categoryListing-subtitle'>
                    {totalCount} Product available
                  </Typography>
                )
              }

            </div>
            <div className='categoryListing-filter'>
              <Selection
                componentClass="categoryListing-filter_dropdown"
                selectionList={selections}
                currentSelectionValue={sortOption}
                handleFilterChange={handleFilterChange}
              />
              <IconButton
                disableRipple
                className='categoryListing-filer_icon'
                color="default"
                aria-label="filter"
                component="span"
              >
                <FilterIcon />
              </IconButton>
            </div>
          </div>
          <div className="categoryListing-category_chip">
            {catalogs.map((catalog, index) => {
              const isActive = activeCategory === index;
              return (
                <Chip
                  key={index}
                  variant={isActive ? "default" : "outlined"}
                  color={isActive ? "primary" : "default"}
                  label={catalog.title}
                  onClick={() => scrollToCategory(index, catalog.title, catalogs.length)}
                  className={isActive ? clsx(classes.chip) : clsx(classes.chip, classes.chipInActive)}
                />
              );
            })}
          </div>
        </>
      }
      itemTotal={catalogs.length}
      body2={
        <>
          {
            // isLoading? 
            // <Loader/> :
            <>
              {catalogs.length > 0 ? (
                <LazyCatalogs onCatalogInView={onCatalogInView}>
                  {catalogs.map((c, i) => (
                    <CatalogHorizontal
                      key={c.title.toLowerCase().replace(" ", "_")}
                      id={c.title.toLowerCase().replace(" ", "_")}
                      title={c.title}
                      catalogItems={c?.items}
                      onViewAll={!!c ? navigateToProductListing(c) : undefined}
                      onViewMoreClicked={
                        !!c ? navigateToProductListing(c) : undefined
                      }
                    />
                  ))}
                </LazyCatalogs>
              ) : (
                <div className={"empty-state-container"}>
                  <EmptyState description="No product available" />
                </div>
              )}
            </>
          }
        </>
      }
    />
  );
};

export { CategoryListing };
