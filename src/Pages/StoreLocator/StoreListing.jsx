import React, { useState } from "react";
import { Paper, InputBase, IconButton, makeStyles, withStyles, lighten, Box, Typography, List, ListItem } from '@material-ui/core';
import { ReactComponent as SearchIcon }from '@Assets/svgs/search-icon.svg';
import { ReactComponent as FilterIcon }from '@Assets/svgs/filter.svg';
import { EmptyState } from "@Common/EmptyState";
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import AddIcon from '@Assets/svgs/plus-item-blue.svg';
import RemoveIcon from '@Assets/svgs/minus-item-blue.svg';
import { CommonStoreList } from "@Common/CommonStoreList/CommonStoreList";
import { useHistory } from "react-router-dom";
import { routes } from "src/constants/routes.constant";
import { useStoreContext } from "@Context/StoreContext";
import { useEffect } from "react";
import clsx from "clsx";
import grey from "@material-ui/core/colors/grey";

const useStyles = makeStyles((theme) => ({
  filterBar: {
    padding: '0 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: "100%",
    height: "100%",
    backgroundColor: `${lighten(theme.palette.primary.light, 0.75)}`,
    border: 0,
  },
  input: {
    marginLeft: theme.spacing(1),
    width: "100%"
  },
  searchButton: {
    textAlign: "right",
    padding: 10,
    // color: theme.palette.secondary.dark,
    color: theme.palette.text.secondary,
  },
  searchIcon:{
    fill: 'red !important',
  },
  filterPaper: {
    float: "right"
  },
  filterIconButton: {
    border: `1px solid ${theme.palette.customGrey.medium}`,
    borderRadius: 6,
  },
  accordionRoot: {
    border: "0 !important"
  },
  expandIconButton: {
    // backgroundColor: `${lighten(theme.palette.primary.light, 0.5)} !important`,
    padding:'0rem',
  },
  stateName: {
    fontSize: "1.2rem",
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.platformFontWeight,
  },
  dropdown: { 
    opacity: 0,
    // width: '100%',   // uncomment this to have extra width to trigger UI bug
    height: '3rem',
    width: '3rem',
    zIndex: 1,
    position: 'absolute',
  },
  filterIconWrapper: {
    flex: "0 0 3rem",
    textAlign: "right",
  },
  overlayFilterSection: {
    position: "absolute",
    right: "calc(5px)", // Minus half width
    width: 120,
    background: "white",
    borderRadius: 6,
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    boxShadow: `0 0 5px ${grey[300]}`,
    zIndex: 2,
  },
  alignItemsCenter:{
    alignItems: 'center',
    // display:'flex', 
    // justifyContent:'flex-end'
    padding:'0px'
  },
  textPrimary:{
    color: theme.palette.primary.main
  },
  body1:{
    fontSize:"11px",
    textAlign:'center'
  },
  filterListItem:{
    textAlign:'center',
    width:'fit-content',
    margin:'auto'
  }
}));

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles(theme => ({
  root: {
    top: 0,
    backgroundColor: "white",
    zIndex: 1,
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
    [theme.breakpoints.down("sm")]: {
      top: 0,
    }
  },
  content: {
    display: "block",
    '&$expanded': {
      margin: '6px 0',
    },
  },
  expanded: {},
}))(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    display: "block",
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: lighten(theme.palette.primary.light, 0.8)
  },
}))(MuiAccordionDetails);

const StyledStoreList = withStyles((theme) => ({
  storeList: {
    padding: 0
  },
  storeListItem: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  }
}))(CommonStoreList);

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const StoreListing = () => {

  const history = useHistory();
  const classes = useStyles();
  const { stores } = useStoreContext();
  const [ groupedStores, setGroupedStores ] = useState(groupBy(stores, "state"));
  const [expandItemName, setExpandItemName] = useState(undefined);
  const [filters, setFilters] = useState([]);
  const [openFilters, setOpenFilters] = useState(false);
  const [isSearch,setIsSearch] = useState(false)

  useEffect(() => {
    const ret = groupBy(stores, "state");
    setGroupedStores(ret);
  }, [stores])

  const handleExpand = (itemName) => (e) => {
    let newTarget = undefined;
    setExpandItemName(prev => {
      if (prev !== undefined && prev === itemName)
        return undefined;

      newTarget = itemName;
      return itemName;
    });

    if (!newTarget)
      return;

    function keepScrollUntilItSatisfied(offsetTop) {
      // Sometimes currentOffsetTop will return null due to madness, null check please.
      const currentOffsetTop = () => document.getElementById(`sl_anchor_of_${itemName}`)?.offsetTop;
      const currentOffsetTopValue = currentOffsetTop();

      const containerEle = document.getElementById('page-layout-container');
      if (currentOffsetTopValue)
        containerEle.scrollTo({ top: currentOffsetTopValue + 20, left: 0, behavior: 'smooth' });

      setTimeout(() => {
        const justChangedOffsetTop = currentOffsetTop();
        if (!!justChangedOffsetTop && justChangedOffsetTop !== offsetTop) {
          keepScrollUntilItSatisfied(justChangedOffsetTop);
        }
      }, 100)

      return;
    }

    // If comment this out, the page not affected eh?
    setTimeout(() => {
      const theEle = document.getElementById(`sl_anchor_of_${itemName}`);
      const eleOffsetTop = theEle.offsetTop;
      keepScrollUntilItSatisfied(eleOffsetTop?? 0)
    }, 200);
  }

  const navigateToStoreDetail = (store) => () => {
    history.push({
      pathname: routes.singleStoreLocator.replace(':id', store.storeId)
    });
  };

  const onChange = (event) => {
    const query = event.target.value;
    const storesResult = stores.filter(s => {
      return s.storeName.replace("JPG","jpg").includes(query.replace("JPG","jpg"));
    });
    if(query === '' || query == null){
      setIsSearch(false)
    }else{
      setIsSearch(true)
    }
    if(storesResult.length === 0 && query === ''){ 
      setGroupedStores(groupBy(stores, "state")); 
    }else{ 
      setGroupedStores(groupBy(storesResult, "state")); }
  };

  const texts = ['24 Hours', 'Seating Area'];

  const filterStores = (text) => {
    const currentIndex = filters.indexOf(text);
    const newFilters = [...filters];

    if (currentIndex === -1) {
      newFilters.push(text);
    } else {
      newFilters.splice(currentIndex, 1);
    }
    setFilters(newFilters);
    
    // filter the stores based on hasSeatingArea isOnline24Hour
    const filteredStores = stores.filter(s => {
      // check for isOnline24Hour && hasSeatingArea
      if(newFilters.indexOf(texts[0]) !== -1 && newFilters.indexOf(texts[1]) !== -1){
        if(s.isOnline24Hour && s.hasSeatingArea){
          return true;
        }
      }else{
        // check for isOnline24Hour
        if(newFilters.indexOf(texts[0]) !== -1){
          if(s.isOnline24Hour === true){
            return s.isOnline24Hour;
          }
        }
        // check for hasSeatingArea
        if(newFilters.indexOf(texts[1]) !== -1){
          if(s.hasSeatingArea === true){
            return s.hasSeatingArea;
          }
        }
      }
      return false;
    });
    if(filteredStores.length !== 0){
      setGroupedStores(groupBy(filteredStores, "state"));
    }else{
      // both option not chosen
      setGroupedStores(groupBy(stores, "state"));
    }
  }

  const onFilterBoxClick = () => {
    if(openFilters) setOpenFilters(false);
    else setOpenFilters(true);
  }

  return (
    <div>
      <Box display="flex">
        <Box flexShrink={0} flexGrow={1}>
          <Paper elevation={0} component="div" className={classes.filterBar}>
            <InputBase
              className={classes.input}
              placeholder="e.g. Name, Location"
              inputProps={{ 'aria-label': 'search store' }}
              onChange={onChange}
            />
            <IconButton type="submit" className={classes.searchButton} aria-label="search" component="span">
              <SearchIcon className={classes.searchIcon}/>
            </IconButton>
          </Paper>
        </Box>
        <Box flexShrink={0} width={75}>
          <Paper elevation={0} component="div" className={classes.filterPaper} >
            {/* Refer ViewMap */}
            <IconButton disableRipple className={classes.filterIconButton} aria-label="filter" component="span" onClick={onFilterBoxClick}>
              <FilterIcon />
            </IconButton>
            {
              openFilters &&
              <div className={classes.overlayFilterSection}>
                <List dense className={classes.alignItemsCenter}>
                  {
                    texts.map(text => {
                      return <ListItem button className={classes.filterListItem} key={text}>
                        <Typography className={clsx({[classes.textPrimary]: filters.indexOf(text) !== -1 },classes.body1)} onClick={() => filterStores(text)}>{text}</Typography>
                      </ListItem>;
                    })
                  }
                </List>
              </div>
            }
          </Paper>
        </Box>
      </Box>
      <br />
      {
        groupedStores.length < 1
          ?
          <EmptyState title={"No store found!"} description={""} />
          :
          <div>
            {!isSearch &&
              Object.keys(groupedStores).map(k => (
                    <Accordion key={k} id={`sl_anchor_of_${k}`} className={classes.accordionRoot} square expanded={expandItemName === k} onChange={handleExpand(k)}>
                    <AccordionSummary aria-controls={`${k.replace(" ", "_")}-content`} id={`${k.replace(" ", "_")}_accordion_item`}>
                      <Box display="flex" justifyContent={"space-between"} alignItems={"center"}>
                        <Typography className={classes.stateName} component="div" style={{flex: "1 0 auto"}}>{k}</Typography>
                        <IconButton className={classes.expandIconButton} style={{flex: "0 0 40px"}} aria-label="expand-icon">
                          {expandItemName !== k ? 
                          <img src={AddIcon} alt="icon"height="45px" width="45px" /> : 
                          <img src={RemoveIcon} alt="icon"height="45px" width="45px" />}
                        </IconButton>
                      </Box>
                    </AccordionSummary>
                      <AccordionDetails>
                        <StyledStoreList onItemClicked={navigateToStoreDetail} storeListItems={groupedStores[k]} />
                      </AccordionDetails>
                    </Accordion>
              ))
            }
            {isSearch &&
              Object.keys(groupedStores).map(k => (
                <AccordionDetails>
                  <StyledStoreList onItemClicked={navigateToStoreDetail} storeListItems={groupedStores[k]} />
                </AccordionDetails>
              ))
            }
          </div>
      }
          </div>
  )
}

      export {StoreListing}