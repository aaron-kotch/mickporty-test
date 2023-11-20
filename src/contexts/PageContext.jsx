import React, { useState } from 'react';

const PageContext = React.createContext({
  orders: {
    pendingOrders: [],
    historyOrders: [],
    scrollPosition: undefined,
  },
  selectedTab: undefined,
  setSelectedTab: () => {},
});

export const Pages = {
  orders: "orders",
  cart: "cart",
  home: "home",
}

const PageProvider = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [getAllOrders, setGetAllOrders] = useState(false);
  const [landingProducts, setLandingProducts] = useState([]);
  const [categoryMenu, setCategoryMenu] = useState([]);
  const [keyHighlights, setKeyHighlights] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviewedOrders, setReviewedOrders] = useState([]);
  const [query, setQuery] = useState("");

  const initialScrollPositionsObj = {}
  Object.keys(Pages).forEach(key => {
    initialScrollPositionsObj[key] = 0;
  })
  const [scrollPositions, setScrollPositions] = useState(initialScrollPositionsObj);

  const saveOrders = (pendingOrders, historyOrders) => {
    const obj = {
      pendingOrders,
      historyOrders
    };
    setOrders(obj);
  }

  // this will keep firing
  const saveScrollPosition = (scrollPosition, page) => {
    const temp = {...scrollPositions};
    temp[page] = scrollPosition;
    // console.log(`saving scroll position of ${page} page..`, temp);
    setScrollPositions(temp);
  }

  const getScrollPosition = (page) => {
    // console.log(`getting scroll position of ${page} page..`, scrollPositions[page]);
    return scrollPositions[page];
  }

  return (<PageContext.Provider value={{
    orders,
    selectedTab,
    setSelectedTab,
    saveOrders,
    saveScrollPosition,
    getScrollPosition,
    getAllOrders, 
    setGetAllOrders,
    landingProducts,
    setLandingProducts,
    categoryMenu,
    setCategoryMenu,
    keyHighlights,
    setKeyHighlights,
    reviewedOrders,
    setReviewedOrders,
    query,
    setQuery
  }}>{children}</PageContext.Provider>)
}

const usePageContext = () => {
  return React.useContext(PageContext);
}

export { PageProvider, usePageContext };