import React from 'react';
import { Loader } from "@Common/Loader";
import { Redirect, Route, Switch } from "react-router-dom";
import { routes } from "../constants/routes.constant";
import { useUserContext } from '@Context/UserContext';
import ConfirmDialog from '@Common/ConfirmDialog/ConfirmDialog';
import AlertDialog from '@Common/AlertDialog/AlertDialog';
import { useCartContext } from '@Context/CartContext';
import { useAlertContext } from '@Context/AlertContext';

const Home = React.lazy(() => import('@Pages/Home'));
const CategoryListing = React.lazy(() => import('@Pages/CategoryListing'));
const ProductListing = React.lazy(() => import('@Pages/ProductListing'));
const ProductDetails = React.lazy(() => import('@Pages/ProductDetails'));
const Cart = React.lazy(() => import('@Pages/Cart'));
const Orders = React.lazy(() => import('@Pages/Orders'));
const OrderDetails = React.lazy(() => import('@Pages/OrderDetails'));
const OngoingOrderDetails = React.lazy(() => import('@Pages/OngoingOrderDetails'));
const BannerDetails = React.lazy(() => import('@Pages/BannerDetails'));
const StoreLocator = React.lazy(() => import('@Pages/StoreLocator'));
const SingleStoreLocator = React.lazy(() => import('@Pages/SingleStoreLocator'));
const Search = React.lazy(() => import('@Pages/Search'));
const FavouriteAddresses = React.lazy(() => import('@Pages/FavouriteAddresses'));
const TnC = React.lazy(() => import('@Pages/TnC'));
const Privacy = React.lazy(() => import('@Pages/Privacy'));
const EditAddress = React.lazy(() => import('@Pages/EditAddress'));
const NotFound = React.lazy(() => import('./Common/NotFound'));
// const NoAccess = React.lazy(() => import('./Common/NoAccess'));
const submitEmail = React.lazy(()=> import('@Pages/SubmitEmail/SubmitEmail'));
const SignIn = React.lazy(()=> import('@Pages/SignIn'));

function App() {

  const { isUserLoading } = useUserContext();
  const { popUp, popPopUp, alertPopUps, popAlertPopUp } = useAlertContext();
  const { openLastItemConfirm, setOpenlastItemConfirm, removeLastItem } = useCartContext();
  const loader = <Loader />;

  return (
    <>
      <React.Suspense fallback={loader}>
        <Switch>
          <Redirect from="/" to={routes.home} exact />
          <Route exact path={routes.home} component={Home} />
          <Route exact path={routes.categoryListing} component={CategoryListing} />
          <Route exact path={routes.categoryListingBanner} component={CategoryListing} />
          <Route exact path={routes.productListing} component={ProductListing} />
          <Route exact path={routes.productListingBanner} component={ProductListing} />
          <Route exact path={routes.productDetails} component={ProductDetails} />
          <Route exact path={routes.cart} component={Cart} />
          <Route exact path={routes.search} component={Search} />
          <Route exact path={routes.storeLocator} component={StoreLocator} />
          <Route exact path={routes.singleStoreLocator} component={SingleStoreLocator} />
          <Route exact path={routes.orders} component={Orders} />
          <Route exact path={routes.order} component={OrderDetails} />
          <Route exact path={routes.ongoingOrder} component={OngoingOrderDetails} />
          <Route exact path={routes.banner} component={BannerDetails} />
          <Route exact path={routes.favouriteAddresses} component={FavouriteAddresses} />
          <Route exact path={routes.tnc} component={TnC} />
          <Route exact path={routes.privacy} component={Privacy} />
          <Route exact path={routes.editAddress} component={EditAddress} />
          <Route exact path={routes.submitEmail} component={submitEmail} />
          <Route exact path={routes.proceed} component={SignIn} />
          <Route exact path={routes.notFound} component={NotFound} />
          <Redirect from="*" to={routes.notFound} />
        </Switch>
      </React.Suspense>
      {
        isUserLoading && loader
      }
      {
        popUp && popUp.map((msg) => <ConfirmDialog 
          key={msg}
          open={true} 
          title={msg} 
          onConfirm={()=> {}}
          setOpen={()=> popPopUp()}/>
          )
      }
      {
        alertPopUps && alertPopUps.map((msg, index) => <AlertDialog 
          key={msg.title + index}
          open={true} 
          title={msg.title} 
          children={msg.content}
          setOpen={()=> popAlertPopUp()}/>
        )
      }
      <ConfirmDialog 
        open={openLastItemConfirm} 
        title={"Remove item"}
        children={"Are you sure you want to remove this item?"} 
        onConfirm={removeLastItem}
        confirmMessage={"Ok"}
        denyMessage={"Cancel"}
        setOpen={setOpenlastItemConfirm}/>
    </>
  );
}

export default App;
