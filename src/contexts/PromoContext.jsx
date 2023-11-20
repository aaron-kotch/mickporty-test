import React, { useState } from "react";
import { useAlertContext } from "./AlertContext";

// default values
const PromoContext = React.createContext({
  isPromoCodeApplying: false,
  promoCode: '',
  promoCodeInfo: {
    totalPromoDiscount: 0,
    promoTitle: '',
  },
  setPromoCode: () => {},
  setIsPromoCodeApplying: () => {},
  setPromoCodeInfo: () => {},
  removePromoCode: () => {},
  checkPromoStatus: () => {},
  freeItemCart: [],
  setFreeItemCart: () => {}
});

const PromoProvider = ({ children }) => {
  const { pushAlertPopUp } = useAlertContext();
  const [promoCode, setPromoCode] = useState('');
  const [isPromoCodeApplying, setIsPromoCodeApplying] = useState(false);
  const [hasPromoCodeApplied, setHasPromoCodeApplied] = useState(false);
  const [promoCodeInfo, setPromoCodeInfo] = useState({
    totalPromoDiscount: 0,
    promoTitle: '',
    promoCode: ''
  });
  const [freeItemCart, setFreeItemCart] = useState([]);

  const checkPromoStatus = (errorMessage, promoCode, promoTitle, totalPromoDiscount, isFreeProductDiscountType, returnedProducts) => {

    if(errorMessage === "Promo code has been applied successfully"){
      // if first time applying promocode OR current latest promocode diff with previously applied promocode 
      setIsPromoCodeApplying(true);
      // if promo type is Discount on Transaction
      setPromoCodeInfo({
        totalPromoDiscount: parseFloat(totalPromoDiscount),
        promoTitle: promoTitle,
        promoCode: promoCode
      });
      if(!isPromoCodeApplying){
        pushAlertPopUp('Promo code has been applied successfully');
        if(isFreeProductDiscountType){
          let tempReturnedProducts = [...returnedProducts];
          tempReturnedProducts = tempReturnedProducts.filter(p => p.isFreeItem);
          
          tempReturnedProducts = tempReturnedProducts.map(p => {
            return {
              discountedPrice: p.discountedPrice,
              image: p.image,
              productImage: p.image,
              mandatoryItem: p.mandatoryItem,
              price: p.price,
              productId: p.customerCartProductId,
              quantity: p.quantity,
              sku: p.sku,
              title: p.title,
              isFreeItem: p.isFreeItem,
              id: p.productId, 
              productName: p.title, 
              isDisabled: p.status !== "Valid"
            }
          });
          setFreeItemCart(tempReturnedProducts)
        }
      }
      return true;
    }else{
      // console.log('instead errorMessage get: ',errorMessage);
      if(errorMessage){
      pushAlertPopUp(`${errorMessage}`);
      }
      removePromoCode();
      return false;
    }
  }

  const removePromoCode = (event) => {
    setIsPromoCodeApplying(false);
    setPromoCode("");
    setPromoCodeInfo({
      totalPromoDiscount: 0,
      promoTitle: '',
      promoCode: ''
    });
    setFreeItemCart([]);
  }

  return (
    <PromoContext.Provider
      value={{
        isPromoCodeApplying,
        promoCode,
        promoCodeInfo,
        setIsPromoCodeApplying,
        setPromoCode,
        setPromoCodeInfo,
        removePromoCode,
        checkPromoStatus,
        freeItemCart,
        setFreeItemCart,
        hasPromoCodeApplied,
        setHasPromoCodeApplied
      }}
    >
      {children}
    </PromoContext.Provider>
  );
};

const usePromoContext = () => {
  return React.useContext(PromoContext);
};

export { PromoProvider, usePromoContext };
