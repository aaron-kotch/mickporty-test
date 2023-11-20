import React, { useState, useEffect } from "react";
import { Header } from "@Common/Header";
import { MenuButton } from "@Common/MenuButton";
import { BottomNavigationBar } from "@Common/BottomNavigationBar";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { PageHeader } from "@Common/PageHeader/PageHeader";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { InputBase } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { getTrendingList, searchItem } from "@API/api";
import { SearchItem } from "./SearchItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import pickUpSVG from "@Assets/svgs/pickup.svg";
import { useCartContext } from "@Context/CartContext";
import { useStoreContext } from "@Context/StoreContext";
import { usePageContext } from "@Context/PageContext";
import { StoreSelectorModal } from "@Common/StoreSelector";

const useStyles = makeStyles((theme) => ({
  root: {
    scrollBehavior: "smooth",
  },
  searchBar: {
    display: "flex",
    borderRadius: "0.5rem",
    backgroundColor: `${theme.palette.primary.lighter}`,
    alignItems: "center",
    marginTop: "1rem",
    padding: "0.25rem 0.5rem 0.25rem 1rem",
    [theme.breakpoints.down("xs")]: {
      marginTop: "0.5rem",
    },
  },
  icon: {
    // flex: "0 0 2rem",
    paddingTop: "0.2rem",
    paddingBottom: "0.2rem",
    paddingRight: "0.5rem",
  },
  input: {
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: theme.palette.grey[800],
  },
  searchButton: {
    textTransform: "none",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: theme.typography.platformFontWeight,
    color: theme.palette.grey[800],
    padding: "0.5rem 0.1rem 0.3rem",
  },
  trendingList: {
    padding: "0.5rem 0",
  },
  trendingItem: {
    color: theme.palette.primary.main,
    paddingTop: "0.5rem",
    paddingLeft: "0.1rem",
  },
  productImage: (props) => ({
    display: "block",
    width: "100%",
    height: "100%",
    "object-fit": "cover",
  }),
  catalogItems: {
    // Fallback if browser doesn't support
    // display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    [theme.breakpoints.up("sm")]: {
      display: "grid",
      gridGap: 24,
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gridAutoRows: "300px",
    },
  },
  loader: {
    textAlign: "center",
    marginTop: "5rem",
    height: '100%'
  },
  storeListItemIcon: {
    width: 58,
    height: 58,
    verticalAlign: "top",
    marginTop: "5rem",
  },
  noResult: {
    paddingRight: "2.5rem",
    paddingLeft: "2.5rem",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
}));

const StyledSearchItem = withStyles((theme) => ({
  root: {
    display: "flex",
    flex: "0 0 42%",
    height: "calc(100vw / 1.9)",
    paddingBottom: 24,
    flexDirection: "column",
    flexWrap: "nowrap",
    paddingLeft: "4%",
    paddingRight: "4%",
    // overflowX: "hidden",
    [theme.breakpoints.up("sm")]: {
      // minHeight: "calc(100vw / 4 + (30vh / 50))",
      height: "auto",
      minHeight: "280px",
    },
  },
}))(SearchItem);

const Search = () => {
  const itemPerRow = 1;
  const classes = useStyles({
    itemPerRow,
  });
  const { formatProducts, shoppingType } = useCartContext();
  const { selectedStore, isSelectStoreModalOpened, setIsSelectStoreModalOpened} = useStoreContext();
  //store to context instead of page
  const { query,setQuery } = usePageContext();

  const [list, setList] = useState([]);
  const [result, setResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // whether user performing 'search' instead of looking at the trending list, to show trending list back when query === '' and user press search icon
  const [isLoading, setIsLoading] = useState(true);
  const [noResultQuery, setNoResultQuery] = useState('');


  useEffect(() => {
    getTrendingList().then((res) => {
      setList(res);
      setIsLoading(false);
    });
  }, []);

  useEffect(()=>{
    // get back previous search result
    onSearch()
  }, [])

  const onChange = (event) => {
    const value = event.target.value;
    setQuery(value); // the trending list will be shown again if query === ''
  };

  const onSearch = (event, trendingListQuery) => {
    setNoResultQuery('');
    if (query === "" && !trendingListQuery) {
      setIsSearching(false);
    } else {
      let searchQuery = query;
      if (trendingListQuery) {
        searchQuery = trendingListQuery;
        setQuery(trendingListQuery);
      }
      setIsSearching(true);
      setIsLoading(true);
      setResult([]);
      searchItem(searchQuery, shoppingType, selectedStore?.storeId).then((res) => {
        // res may return null if the searchQuery only have 1 character
        if (res) {
          const temp = res.item.map(p => {
            if (p.price === p.discountedPrice) {
              return {
                ...p,
                discountedPrice: null,
              }
            } else {
              return { ...p };
            }
          })
          setResult(formatProducts(temp));
          if (res.item.length === 0) {
            setNoResultQuery(searchQuery)
          }
        } else {
          setNoResultQuery(searchQuery)
          setResult([]);
        }
        setIsLoading(false);
      });
    }
  };

  return (
    <PageLayout
      header={
        <Header
          leftSlot={<MenuButton />}
          centerSlot={<PageHeader>SEARCH</PageHeader>}
        />
      }
      body={
        <>
          <div className={classes.searchBar}>
            <InputBase
              className={classes.input}
              placeholder={"Search"}
              onChange={onChange}
              value={query}
              inputProps={{ "aria-label": "search" }}
            />
            <IconButton
              disableRipple
              className={classes.icon}
              color="primary"
              aria-label="filter"
              component="span"
              onClick={onSearch}
            >
              <SearchIcon />
            </IconButton>
          </div>
          <div className={classes.trendingList}>
            <Typography className={classes.title}>
              {!isSearching ? "Trending" : "Search Result"}
            </Typography>
            {isLoading ? (
              <div className={classes.loader}>
                <CircularProgress />
              </div>
            ) : (
              <></>
            )}
            {!isSearching ? (
              list.map((item) => {
                return (
                  <Typography
                    className={classes.trendingItem}
                    key={item.trendingTextId}
                    onClick={(event) => {
                      onSearch(event, item.title);
                    }}
                  >
                    {item.title}
                  </Typography>
                );
              })
            ) : (
              <div className={classes.catalogItems}>
                {result.map((item) => {
                  return <StyledSearchItem key={item.productId} {...item} />;
                })}
              </div>
            )}
            {noResultQuery !== '' ? (
              <div className={classes.noResult}>
                <img
                  src={pickUpSVG}
                  alt=""
                  className={classes.storeListItemIcon}
                />
                <Typography>
                  {`We couldn't find a match for "${noResultQuery}".\nPlease try another search`}
                </Typography>
              </div>
            ) : (
              <></>
            )}
          </div>
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
      footer={<BottomNavigationBar />}
    />
  );
};

export { Search };
