import React, { useState, useEffect } from "react";
import { Header } from "@Common/Header";
import { Logo } from "@Common/Logo";
import { MenuButton } from '@Common/MenuButton';
import { BottomNavigationBar } from "@Common/BottomNavigationBar";
import { CategoryMenu } from "@Common/CategoryMenu";
import { StoreSelector } from "@Common/StoreSelector";
import { KeyHighlights } from "@Common/KeyHighlights";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { FeaturedCatalogs } from "@Common/FeaturedCatalogs/FeaturedCatalogs";
import { OrderAlerts } from "@Common/OrderAlerts/OrderAlerts";
import { PullToRefresh } from "react-js-pull-to-refresh";
import { CustomRefreshContent } from '@Common/RefreshContent'
import { Pages } from "@Context/PageContext";

const Home = () => {

  const [refreshData, setRefreshData] = useState(false)
  const onRefresh = () => {
    return new Promise((resolve) => {
      setRefreshData(true)
      setTimeout(() => {
        setRefreshData(false)
        resolve();
      }, 3000)
    });
  }

  useEffect(() => {
    try{
      // inform MP to change navigation bar title
      // eslint-disable-next-line no-undef
      my.postMessage({ action: "setTitle", title: "FamiDelivery" });
      // eslint-disable-next-line no-undef
      return () => my.postMessage({ action: "setTitle", title: "FamilyMart" });
    } catch(err){
      console.error(err);
    }
  }, [])

  return (
    <PageLayout
      header={
        <Header
          leftSlot={<MenuButton />}
          centerSlot={<Logo />}
        />
      }
      body={
        <PullToRefresh
          pullDownThreshold={0}
          onRefresh={onRefresh}
          triggerHeight={300}
          // backgroundColor='white'
          startInvisible={true}>
          {refreshData ? (
            <CustomRefreshContent />
          ) : null}
          <>
            <StoreSelector page={"home"} />
            <OrderAlerts refreshData={refreshData} />
            <CategoryMenu refreshData={refreshData} />
            <KeyHighlights refreshData={refreshData} />
            <FeaturedCatalogs refreshData={refreshData} />
          </>
        </PullToRefresh>
      }
      footer={<BottomNavigationBar />}
      refresh={refreshData}
      PageName={Pages.home}
    />
  );
};

export { Home };
