// Standardise the way to make API calls
// reuse request object
var myHeaders = new Headers();
myHeaders.append("x-api-key", process.env.REACT_APP_API_KEY + process.env.REACT_APP_API_2_KEY);
myHeaders.append("Content-Type", "application/json");
myHeaders.append('X-Frame-Options', 'SAMEORIGIN');
myHeaders.append('Content-Security-Policy', 'default-src self');

const myRequest = new Request(
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.includes("vfs.cloud9.ap-southeast-1.amazonaws.com")
    ? 'https://4pkgwg6cefdwtgbdhunlcpsvja.appsync-api.ap-southeast-1.amazonaws.com/graphql'
    : process.env.REACT_APP_APPSYNC,
  {
    method: "POST",
    headers: myHeaders,
    // body: graphql, // to be replaced
    redirect: "follow",
  }
);
function timeout(delay) {
  return new Promise(res => setTimeout(res, delay));
}

// User Detail
const userGetProfile = async (token) => {
  var graphql = JSON.stringify({
    query:
      `query MyQuery {\n  userGetProfile(token: "${token}") {\n    AccountNo\n  Race\n    LastName\n    FirstName\n    PrimaryEmail\n    MobileNumber\n    Nationality\n    DateOfBirth\n    Country\n    Gender\n  }\n}\n\n\n`,
    variables: {},
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((res) => res.data.userGetProfile)
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const getFavAddressList = (token) => {
  var graphql = JSON.stringify({
    query: `query MyQuery {\n  getFavAddressList(token: "${token}") {\n    address\n    address2\n      city\n    country\n    isPrimary\n    longitude\n    latitude\n    title\n    notes\n     customerFavouriteAddressId\n    postal\n      state\n  }\n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      return result.data.getFavAddressList;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const addUserFavAddressList = (values) => {
  const { address, title, longitude, latitude, country, city, state, postal, token, address2 = "", notes = "" } = values;
  var graphql = JSON.stringify({
    query: `mutation MyMutation {\n  addUserFavAddressList(address: "${address}", address2: "${address2}", title: "${title}", longitude: "${longitude}", latitude: "${latitude}", country: "${country}", city: "${city}", state: "${state}", postal: "${postal}", token: "${token}", notes: "${notes}") {\n    message\n    status\n    statusCode\n    customerFavouriteAddressId\n  }\n}`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("addUserFavAddressList result", result.data.addUserFavAddressList);
      return result.data.addUserFavAddressList;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const updateUserFavAddressList = (values, customerFavouriteAddressId) => {
  const { address, address2 = "", title, longitude, latitude, country, city, state, postal, token, notes = "" } = values;
  let updatedNotes = notes === null ? "" : notes;
  let updatedAddress2 = address2 === null ? "" : address2;
  var graphql = JSON.stringify({
    query: `mutation MyMutation {\n  updateUserFavAddressList(address: "${address}", address2: "${updatedAddress2}", city: "${city}", country: "${country}", customerFavouriteAddressId: "${customerFavouriteAddressId}", latitude: "${latitude}", longitude: "${longitude}", notes: "${updatedNotes}", postal: "${postal}", state: "${state}", title: "${title}", token: "${token}") {\n    customerFavouriteAddressId\n    message\n    status\n    statusCode\n  }\n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    }).then((result) => {
      return result.data.updateUserFavAddressList;
    }).catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const removeUserFavAddressList = (token, customerFavouriteAddressId) => {
  var graphql = JSON.stringify({
    query: `mutation MyMutation {\n  removeUserFavAddressList(token: "${token}", customerFavouriteAddressId: "${customerFavouriteAddressId}") {\n    message\n
      status\n      statusCode\n     customerFavouriteAddressId\n  }\n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("removeUserFavAddressList result", result.data.removeUserFavAddressList);
      return result.data.removeUserFavAddressList;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
// used in ProductDetails.jsx only
const getCatalogItemByProductId = async (id, orderType, storeId) => {
  var graphql = !storeId ? JSON.stringify({
    query: `query MyQuery {\n  getProductRecord(orderType:"${orderType}", productId: "${id}") {\n    description\n    discount\n    discountedPrice\n    ecommerceMaximumQuantity\n     pickupMaximumQuantity\n    image\n    isDisabled\n    price\n     discountedPrice\n    productId\n      promotionDescription\n    sku\n   title\n  }\n}\n`,
    variables: {},
  }) : JSON.stringify({
    query: `query MyQuery {\n  getProductRecord(orderType:"${orderType}", productId: "${id}", storeId: "${storeId}") {\n    description\n    discount\n    discountedPrice\n    ecommerceMaximumQuantity\n     pickupMaximumQuantity\n    image\n    isDisabled\n    price\n     discountedPrice\n    productId\n      promotionDescription\n    sku\n   title\n  }\n}\n`,
    variables: {},
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((res) => res.data.getProductRecord)
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};

// Example returned data: All catalogs like Bun under Bread catagory if category ID passed
// else, it return data about one catalog
// shud hv minimal amount of data, only general data needed
const getAllCatalogItemsByCategoryOrCatalogId = (departmentId, type, orderType, storeId = null) => {
  let graphql;
  let storeIdStr = "";
  if (storeId !== null) {
    storeIdStr = `, storeId: "${storeId}"`
  }
  graphql = JSON.stringify({
    query: `query MyQuery {\n  getProductListing(${type}: "${departmentId}", orderType: "${orderType}", pageSize: 10 ${storeIdStr}) {\n    products {\n      departments\n      description\n      discountPercentage\n      discount\n      discountedPrice\n      image\n      isDisabled\n      price\n      productId\n     promotionDescription\n      title\n      sku\n}\n    departmentId\n    productTaggingId\n    title\n    totalCount\n}   \n}\n`,
    variables: {},
  });

  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      return formatCategoryDetails(result.data.getProductListing)
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};

// Product
// to display product for 1 catalog in secondary menu
const formatCategoryDetails = function (data) {
  // only 1 catalog called
  // console.log(data);
  return data.map((product, i) => {
    const category = {
      catalogId: product.departmentId ?? product.productTaggingId,
      departmentId: product.departmentId,
      productTaggingId: product.productTaggingId,
      title: product.title,
      items: product.products,
      totalCount: product.totalCount,
    };
    // console.log(category)
    return category;
  });
};

// Example returned data: One catalog data like Bun ONLY under Bread catagory
// more info are requested from this API
// and dont need to wait for this call so async removed
const getAllCatalogItemsByCatalogId = (departmentId, page = 0, orderType, storeId = null) => {
  let graphql;
  let storeIdStr = "";
  if (storeId !== null) {
    storeIdStr = `, storeId: "${storeId}"`
  }
  graphql = JSON.stringify({
    query: `query MyQuery {\n  getProductListing(departmentId: "${departmentId}" ${storeIdStr}, page: ${page}, pageSize: 10, orderType: "${orderType}") {\n    products {\n            description\n      discount\n      discountedPrice\n      ecommerceMaximumQuantity\n      pickupMaximumQuantity\n     image\n      isDisabled\n      price\n      productId\n      promotionDescription\n       title\n      sku\n}\n    departmentId\n    productTaggingId\n     title\n     totalCount\n}   \n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log(departmentId, page);
      // console.log(result);
      const productsInCorrectForm = formatCategoryDetails(
        result.data.getProductListing
      );
      return productsInCorrectForm;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
// for tagged products such as featured products at home page
const getAllCatalogItemsByProductTaggingId = (departmentId, page = 0, orderType, storeId = null) => {
  let graphql;
  let storeIdStr = "";
  if (storeId !== null) {
    storeIdStr = `, storeId: "${storeId}"`
  }
  graphql = JSON.stringify({
    query: `query MyQuery {\n  getProductListing(productTaggingId: "${departmentId}" ${storeIdStr}, page: ${page},  pageSize: 10, orderType: "${orderType}") {\n    products {\n      departments\n      description\n      discountPercentage\n      discount\n      discountedPrice\n      image\n      isDisabled\n      price\n      productId\n     promotionDescription\n      title\n      sku\n}\n    departmentId\n    productTaggingId\n    title\n    totalCount\n}   \n}\n`,
    variables: {},
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      const productsInCorrectForm = formatCategoryDetails(
        result.data.getProductListing
      );
      return productsInCorrectForm;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const getLandingProductListing = (orderType, storeId) => {
  // console.log('orderType, storeId',orderType, storeId)
  if (!storeId) storeId = '';
  var graphql = JSON.stringify({
    query:
      `query MyQuery {\n  getLandingProductListing (orderType: "${orderType}", storeId: "${storeId}") {\n    departmentId\n    lastEvaluatedKey\n    productTaggingId\n    title\n    products {\n      departments\n      image\n      description\n      dimension\n      isDisabled\n     isAvailable\n      itemCategoryCode\n     ecommerceMaximumQuantity\n    pickupMaximumQuantity\n      name\n      price\n     discountedPrice\n      productId\n     promotionDescription\n      taggings\n      title\n    }\n  }\n}`,
    variables: {},
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      const productsInCorrectForm = formatCategoryDetails(
        result.data.getLandingProductListing
      );
      return productsInCorrectForm;
    })
    .catch((error) => {
      console.log("error", error);
      return error;
    });
};
const getAllCategories = async () => {
  var graphql = JSON.stringify({
    query:
      "query MyQuery {\n  getLandingMenuList {\n    actionId\n    actionType\n    image\n    title\n  }\n}\n",
    variables: {},
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};

// Stores
const getAllStoresInfo = async () => {
  var graphql = JSON.stringify({
    query:
      'query MyQuery {\n  searchStoreList(keyword: "ALL STORES") {\n    address\n    eCommerceLastOrder\n    minDeliveryDuration\n     minFoodPreparationDuration\n   latitude\n    longitude\n    operatingHours\n    storeName\n    storeStatus\n    hasSeatingArea\n    isOnline24Hour\n    storeId\n    state\n    distance\n    deliveryServiceAvailable\n    storeOperatingHours\n    ecomOperatingHours\n  }\n}\n\n',
    variables: {},
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((res) => res.data.searchStoreList)
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const searchStoresInfoOnPickUp = async (keyword) => {
  var graphql = JSON.stringify({
    query:
      `query MyQuery {\n  searchStoreList(keyword: "${keyword}", orderType: "PickUp") {\n    address\n    eCommerceLastOrder\n    minDeliveryDuration\n     minFoodPreparationDuration\n    latitude\n    longitude\n    operatingHours\n    storeName\n    storeStatus\n    hasSeatingArea\n    isOnline24Hour\n    storeId\n    state\n    distance\n    deliveryServiceAvailable\n    storeOperatingHours\n    ecomOperatingHours\n  }\n}\n\n`,
    variables: {},
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((res) => res.data.searchStoreList)
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const getNearbyStores = async (orderType, lat, lng) => {
  var graphql = JSON.stringify({
    query: `query MyQuery {\n  getNearbyStoreList(latitude: "${lat}", longitude: "${lng}", orderType: "${orderType}") {\n    address\n    city\n    deliveryFee\n    deliveryServiceAvailable\n    distance\n    eCommerceLastOrder\n    minDeliveryDuration\n     minFoodPreparationDuration\n    storeStatus\n    storeStatusMsg\n    storeOperatingHours\n    storeName\n    storeId\n    storeCode\n    state\n    postalCode\n    pickupServiceAvailable\n    operatingHours\n    minPurchaseAmount\n    maxOrderQty\n    longitude\n    latitude\n    isOnline24Hour\n    isOffline24Hour\n    isDisabled\n    hasSeatingArea\n    freeDeliveryWithMinPurchase\n    ecomOperatingHours\n    acceptOrderWithMinPurchase\n  }\n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((res) => res.data.getNearbyStoreList)
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};

// Order
// generic function for below 2 APIs
const generateGetOrderQuery = (token, status) => {
  const addedString = status === "Completed" ? "overallRating" : "";
  return `query MyQuery {\n  getUserOrderList(token: "${token}", status: "${status}") {\n    message\n    nextToken\n    order {\n      ${addedString}\n      orderStatusMessage\n      reasonCode\n      partialFulfilmentAmount\n
    totalOutOfStock\n      totalOrderItems\n
    pointEarned\n   refundAmount\n   cancelReason\n      isRefunded\n    isReviewAvailable\n      deliveryFee\n      orderDate\n      orderId\n      scheduledDateTime\n      deliveryAddress\n     deliveryAddressLatitude\n
    deliveryAddressLongitude\n      deliveryStatus\n      driverName\n     driverPhone\n     orderNumber\n      grandTotal\n      status\n      storeName\n      orderCompleteDateTime\n     remarks\n     requiredCutlery\n       orderType\n      orderDetailProduct {\n        image\n        price\n        quantity\n        title\n        productId\n     ecommerceMaximumQuantity\n      pickupMaximumQuantity\n      discountedPrice\n      mandatoryItem\n      sku\n     outOfStock\n      }\n    }\n  }\n}\n`;
};
const getUserCompletedOrder = async (token) => {
  var graphql = JSON.stringify({
    query: generateGetOrderQuery(token, "Completed"),
    variables: {},
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      // console.log("getUserCompletedOrder", response);
      return response.json();
    })
    .then((res) => {
      // console.log('res.data.getUserOrderList', res.data.getUserOrderList);
      return res.data.getUserOrderList.order;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const getUserPendingOrder = async (token) => {
  var graphql = JSON.stringify({
    query: generateGetOrderQuery(token, "Pending"),
    variables: {},
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((res) => res.data.getUserOrderList.order)
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const submitOrderReview = async (orderId, review, token, filePathArr) => {
  let { productAvailabilityRating, comment = "", overallRating, foodRating, driverServiceRating, waitingTimeRating, staffServiceRating } = review;
  if (driverServiceRating) staffServiceRating = driverServiceRating;
  var graphql = JSON.stringify({
    query: `mutation MyMutation {\n  submitOrderReview(comment: "${comment}", foodRating: ${foodRating}, orderId: "${orderId}", overallRating: ${overallRating}, productAvailabilityRating: ${productAvailabilityRating}, staffServiceRating: ${staffServiceRating}, waitingTimeRating: ${waitingTimeRating}, token: "${token}", attactment: ${JSON.stringify(filePathArr)}) {\n    message\n    statusCode\n  }\n}\n`,
    variables: {}
  })
  // return Promise.resolve(graphql);
  const request = new Request(myRequest, { body: graphql });

  return (
    fetch(request)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(res => res.data.submitOrderReview)
      .catch((error) => {
        // console.log("error", error);
        return error;
      })
  );
};

const sendOrderReceipt = (token, orderId) => {
  var graphql = JSON.stringify({
    query: `mutation MyMutation {\n  sendOrderReceipt(orderId: "${orderId}", token: "${token}") {\n    message\n    statusCode\n  }\n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("sendOrderReceipt result", result.data.sendOrderReceipt);
      return result.data.sendOrderReceipt;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const getOrderDetailList = async (token, orderId) => {
  var graphql = JSON.stringify({
    query: `query MyQuery {\n  getOrderDetailList(orderId: "${orderId}", token: "${token}") {\n    order {\n      orderId\n   deliverySurchargeAmount\n   partialFulfilmentAmount\n     requiredCutlery\n     driverName\n      driverPhone\n      cancelReason\n      collectedDateTime\n      deliveryAddress\n      deliveryFee\n      grandTotal\n      isRefunded\n      noteToRider\n      orderCompleteDateTime\n      orderDate\n      orderNumber\n      orderType\n      overallRating\n      scheduledDateTime\n      storeName\n      totalOrderItems\n      remarks\n      status\n      promoCode\n      promoCodeReturned\n      promoCodeTitle\n      promoDiscount\n      refundAmount\n     orderStatusMessage\n    }\n    orderDetails {\n      isFreeItem\n      mandatoryItem\n      outOfStock\n      orderDetailProductId\n      productDescription\n      productImage\n      productName\n      promoDiscount\n      quantity\n      subtotal\n      voucherDiscount\n      discount\n      itemStatus\n    }\n  }\n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((res) => {
      // console.log('getOrderDetailList',res.data.getOrderDetailList.order);
      return res.data.getOrderDetailList
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const getOrderReviewList = async (token, orderId) => {
  var graphql = JSON.stringify({
    query: `query MyQuery {\n    getOrderReviewList(orderId: "${orderId}", token: "${token}") {\n    driverServiceRating\n    foodRating\n    overallRating\n    productAvailabilityRating\n    staffServiceRating\n    waitingTimeRating\n    attachment\n    comment\n  }\n}`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((res) => {
      // console.log('getOrderDetailList',res.data.getOrderReviewList);
      return res.data.getOrderReviewList
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};


// Banner
const getHomePageBanner = async () => {
  var graphql = JSON.stringify({
    query: "query MyQuery {\n  getLandingPageBannerList (platform: \"TnG\"){\n    image\n    landingPageBannerId\n    sequenceOrder\n      promoType\n  }\n}\n",
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((res) => {
      return res.data.getLandingPageBannerList;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const getHomePageBannerDetail = (landingPageBannerId) => {
  var graphql = JSON.stringify({
    query: `query MyQuery {\n  getLandingPageBanner(landingPageBannerId: "${landingPageBannerId}") {\n   landingPageBannerId\n  buttonLabel\n   image\n    title\n    description\n    platform\n   promoEntityId\n    promoType\n    promoTitle\n  effectiveStart\n  effectiveEnd\n  }\n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("getLandingPageBanner result", result.data.getLandingPageBanner);
      return result.data.getLandingPageBanner;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};

// Recommendation
const getRecommendations = (orderType, storeId) => {
  // console.log(orderType, storeId);
  const storeIdText = storeId === "" ? "" : `, storeId: "${storeId}"`;  // getRecommendations will return null if storeId is empty string, 
  // if storeId field removed getRecommendations will return something instead
  var graphql = JSON.stringify({
    query: `query MyQuery {\n  getRecommendations(orderType: "${orderType}" ${storeIdText}) {\n    departments\n    description\n    discount\n    discountEndDate\n    discountedPrice\n    discountPercentage\n    ecommerceMaximumQuantity\n    pickupMaximumQuantity\n    image\n    isDisabled\n    price\n    productId\n    title\n  }\n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("getRecommendations result", result.data.getRecommendations);
      return result.data.getRecommendations;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const getCartRecommendations = (orderType, storeId) => {
  var graphql = JSON.stringify({
    query: `query MyQuery {\n  getCartRecommendations(orderType: "${orderType}", storeId: "${storeId}") {\n    departments\n    description\n    discount\n   discountStartDate\n    discountEndDate\n    discountedPrice\n    discountPercentage\n    ecommerceMaximumQuantity\n     pickupMaximumQuantity\n    image\n    isDisabled\n    price\n    productId\n    title\n   sku\n   name\n    price\n   promotionDescription\n   category\n   categories\n    taggings\n    minFoodPreparationDuration\n    minDeliveryDuration\n    isAvailable\n   isDisabled\n    description\n   uom\n   dimension\n   temperature\n   itemCategoryCode\n    promoCode\n   priceGroupId\n    productUOMId\n    productUOMPriceGroupId\n  }\n}\n`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("getRecommendations result", result.data.getRecommendations);
      return result.data.getCartRecommendations;
    })
    .catch((error) => {
      // console.log(" Cart Recomendation error", error);
      return error;
    });
};

// Search
const searchItem = (keyword, orderType, storeId) => {
  let params = `keyword: "${keyword}", orderType: "${orderType}"`;
  if (storeId) params = `keyword: "${keyword}", orderType: "${orderType}", storeId: "${storeId}"`;
  var graphql = JSON.stringify({
    query: `query MyQuery {\n  searchItem(${params}) {\n    item {\n      departments\n      description\n      discount\n      discountPercentage\n      discountedPrice\n      image\n      isDisabled\n      price\n      productId\n      title\n     ecommerceMaximumQuantity\n      pickupMaximumQuantity\n      sku\n    }\n  }\n}\n`,
    variables: {}
  });
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("searchItem result", result.data.searchItem);
      return result.data.searchItem;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};
const getTrendingList = () => {
  var graphql = JSON.stringify({
    query: "query MyQuery {\n  getTrendingList {\n    title\n    trendingTextId\n    sequenceOrder\n  }\n}\n",
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("getTrendingList result", result);
      return result.data.getTrendingList;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};

// Place order and payment
const placeUserOrderSqs = async (values) => {
  const { productList, scheduledDateTime, isAdvancedOrder, deliveryAddress, token, storeId, noteToRider, miscellaneousInfo, floorOrUnit, promoCode } = values;
  const { address, address2, latitude, longitude } = deliveryAddress;
  let customerAddress = address
  if (address2 !== null && address2 !== ""){
    customerAddress = address2 + ", " + address
  }
  const lat = latitude;
  const lng = longitude;
  const { deliveryFee, isCulteryRequested, remarks } = miscellaneousInfo;
  const obj = {
    query: "mutation MyMutation {\n  placeUserOrderSqs(deliveryAddress: \"" + customerAddress
      + "\", token: \"" + token
      + "\", storeId: \"" + storeId
      + "\", remarks: \"" + remarks
      + "\", paymentMethod: \"TNGMP\", orderType: \"Delivery\", noteToRider: \"" + noteToRider
      + "\", floorOrUnit: \"" + floorOrUnit
      + "\",  deliveryLatitude: \"" + lat
      + "\", deliveryLongitude: \"" + lng
      + "\", deliveryFee: " + deliveryFee
      + ", floorOrUnit: \"\", requiredCutlery: " + isCulteryRequested
      + ", promoCode: \"" + promoCode
      + "\", scheduledDateTime: \"" + scheduledDateTime + "\""
      + ", isAdvancedOrder: " + Boolean(isAdvancedOrder)
      // +"\", productList: \""+productList.replaceAll('"', "\\\"")
      + ", productList: \"" + productList.replace(/"/g, "\\\"")
      + "\") {\n    msgId\n    message\n    httpMethod\n    body\n    orderId\n    paymentUrl\n    promoCodeMessage\n    status\n    statusCode\n  }\n}\n",
    variables: {}
  };
  var graphql = JSON.stringify(obj)
  const request = new Request(myRequest, { body: graphql });
  // 1 sec delay before place order to avoid delay rendering error
  await timeout(1000)
  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("placeUserOrderSqs result", result);
      // console.log(JSON.stringify(obj.query).replaceAll("\\n", "").replaceAll("\\", "").replaceAll('\\"', '"'));
      return result.data.placeUserOrderSqs;
    })
    .catch((error) => error);
};
const placeUserOrderSqsPickUp = async (values) => {
  const { productList, scheduledDateTime, isAdvancedOrder, token, storeId, noteToRider, miscellaneousInfo, promoCode } = values;
  const { deliveryFee, isCulteryRequested, remarks } = miscellaneousInfo;

  var graphql = JSON.stringify({
    query: "mutation MyMutation {\n  placeUserOrderSqs(deliveryAddress: \""
      + "\", token: \"" + token
      + "\", storeId: \"" + storeId
      + "\", remarks: \"" + remarks
      + "\", paymentMethod: \"TNGMP\", orderType: \"PickUp\", noteToRider: \"" + noteToRider
      + "\", deliveryLatitude: \""
      + "\", deliveryLongitude: \""
      + "\", deliveryFee: " + deliveryFee
      + ", floorOrUnit: \""
      + "\", requiredCutlery: " + isCulteryRequested
      + ", promoCode: \"" + promoCode
      + "\", scheduledDateTime: \"" + scheduledDateTime + "\""
      + ", isAdvancedOrder: " + Boolean(isAdvancedOrder)
      // +"\", productList: \""+productList.replaceAll('"', "\\\"")
      + ", productList: \"" + productList.replace(/"/g, "\\\"")
      + "\") {\n    msgId\n    message\n    httpMethod\n    body\n    orderId\n    paymentUrl\n    promoCodeMessage\n    status\n    statusCode\n  }\n}\n",
    variables: {}
  });
  const request = new Request(myRequest, { body: graphql });

  // 1 sec delay before place order to avoid delay rendering error
  await timeout(1000)
  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("placeUserOrderSqsPickUp result", result.data.placeUserOrderSqs);
      return result.data.placeUserOrderSqs;
    })
    .catch((error) => error);
};
const getPlaceUserOrderMessage = (msgId, token) => {
  var graphql = JSON.stringify({
    query: `query MyQuery {\n  getPlaceUserOrderMessage(msgId: "${msgId}", token: "${token}") {\n    status\n    body\n    httpMethod\n    message\n    msgId\n    orderId\n    paymentUrl\n    promoCodeMessage\n    statusCode\n  }\n}`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("getPlaceUserOrderMessage result", result);
      return result.data.getPlaceUserOrderMessage;
    })
    .catch((error) => error);
};
// call checkCart before calling placeUserOrderSqsPickUp to check product availabilit y, delivery fee (for Delivery) and price (for PickUp)
const checkCart = (values) => {
  // console.log(`values`, values);
  const { productList, scheduledDateTime, deliveryAddress, token, storeId, orderType, distance, promoCode } = values;

  let obj, graphql;
  let _promocode = promoCode === '' ? '' : "\", promoCode: \"" + promoCode
  if (orderType === 'Delivery') {
    const { address, latitude, longitude } = deliveryAddress;
    const lat = latitude;
    const lng = longitude;
    if (productList !== null && typeof productList === 'string') {
      obj = {
        query: "query MyQuery {\n  checkCart(paymentType: \"TNGMP\", productList: \"" +
          productList.replace(/"/g, "\\\"")
          // productList.replaceAll('"', "\\\"")
          + "\", orderType: \"" + orderType
          + _promocode
          + "\", scheduledDateTime: \"" + scheduledDateTime
          + "\", storeId: \"" + storeId
          + "\", distance: " + distance
          + ", token: \"" + token
          + "\", deliveryAddress: \"" + address
          + "\", addressLongitude: \"" + lng
          + "\", addressLatitude: \"" + lat
          + "\") {\n    freeDeliveryMessage\n     deliverySurchargeAmount\n     basketValue\n     deliveryDiscountAmount\n    deliveryFee\n    errorMessage\n  statusCode\n    promoTitle\n    totalPromoDiscount\n    products {\n      price\n     discountedPrice\n      title\n    isOutOfStock\n     status\n    customerCartProductId\n     quantity\n    pickupMaximumQuantity\n        mandatoryItem\n        image\n        ecommerceMaximumQuantity\n   isFreeItem\n }\n  }\n}",
        variables: {}
      };
    }
    graphql = JSON.stringify(obj);
  } else {
    if (productList !== null && typeof productList === 'string') {
      obj = {
        query: "query MyQuery {\n  checkCart(paymentType: \"TNGMP\", productList: \"" +
          productList.replace(/"/g, "\\\"")
          // productList.replaceAll('"', "\\\"")
          + "\", orderType: \"" + orderType
          + _promocode
          + "\", scheduledDateTime: \"" + scheduledDateTime
          + "\", storeId: \"" + storeId
          + "\", distance: " + distance
          + ", token: \"" + token
          + "\", deliveryAddress: \""
          + "\", addressLongitude: \""
          + "\", addressLatitude: \""
          + "\") {\n     deliveryFee\n    errorMessage\n  statusCode\n   promoTitle\n    totalPromoDiscount\n    products {\n      price\n      title\n    isOutOfStock\n     status\n     discountedPrice\n    customerCartProductId\n     quantity\n    pickupMaximumQuantity\n        mandatoryItem\n        image\n        ecommerceMaximumQuantity\n   isFreeItem\n }\n  }\n}",
        variables: {}
      };
    }
    graphql = JSON.stringify(obj);
  }

  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log('values passed into checkCart',values);
      // const text = JSON.stringify(obj.query).replaceAll("\\n", "").replaceAll("\\", "").replaceAll('\\"', '"');
      // const addBackslash = (text) => {
      //   return text.replaceAll('"', '\"')
      // }
      // console.log(addBackslash(text));
      // console.log("checkCart result", result.data.checkCart);
      return result.data.checkCart;
    })
    .catch((error) => error);
};

// Login
const tNGCheckMember = (authCode, email) => {
  var graphql = JSON.stringify({
    query: `mutation MyMutation {\n  tNGCheckMember(authCode: "${authCode}", email:"${email}") {\n    SignedToken\n    Status\n    Token\n    isFreeItem\n    otpRequired\n    promoDiscount\n    sessionID\n    Message\n    firstUserLogin\n  }\n}`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("tNGCheckMember result", result.data.tNGCheckMember);
      return result.data.tNGCheckMember;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};

// Upload Image
const generateS3UploadLink = (params) => {
  const { fileName, folderName, token } = params
  var graphql = JSON.stringify({
    query: `mutation MyMutation {\n  generateS3UploadLink(fileName: "${fileName}", folderName: "${folderName}", token: "${token}", platform: "tngmp")\n}`,
    variables: {}
  })
  const request = new Request(myRequest, { body: graphql });

  return fetch(request)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((result) => {
      // console.log("generateS3UploadLink result", result.data.generateS3UploadLink);
      return result.data.generateS3UploadLink;
    })
    .catch((error) => {
      // console.log("error", error);
      return error;
    });
};


export {
  getCatalogItemByProductId,
  getAllCategories,
  getAllCatalogItemsByCategoryOrCatalogId,
  getAllCatalogItemsByCatalogId,
  getAllCatalogItemsByProductTaggingId,
  getLandingProductListing,

  getAllStoresInfo,
  searchStoresInfoOnPickUp,
  getNearbyStores,

  getUserCompletedOrder,
  getUserPendingOrder,
  getOrderDetailList,
  getOrderReviewList,

  userGetProfile,
  getFavAddressList,
  removeUserFavAddressList,
  addUserFavAddressList,
  updateUserFavAddressList,

  submitOrderReview,
  sendOrderReceipt,

  getHomePageBanner,
  getHomePageBannerDetail,

  getRecommendations,
  getCartRecommendations,

  searchItem,
  getTrendingList,

  placeUserOrderSqs,
  getPlaceUserOrderMessage,
  checkCart,
  placeUserOrderSqsPickUp,
  tNGCheckMember,

  generateS3UploadLink,
};
