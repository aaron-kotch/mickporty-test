import React, { useState } from 'react';
import { Header } from "@Common/Header";
import { MenuButton } from '@Common/MenuButton';
import { BottomNavigationBar } from "@Common/BottomNavigationBar";
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { PageHeader } from '@Common/PageHeader/PageHeader';
import { Tabs, Tab, makeStyles } from "@material-ui/core";
import { ViewMap } from './ViewMap';
import { StoreListing } from './StoreListing';
import './StoreLocator.scss';
import clsx from 'clsx';
import { useStoreContext } from "@Context/StoreContext";
import { StoreSelectorModal } from "@Common/StoreSelector";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    // top: 56, 
    // left: 16, 
    // width: "calc(100% - 32px)",
    // overflow: "hidden"
  },
  tabs: {
    borderRadius: '0.5rem'
  },
  tabsIndicator: {
    display: 'none',
    minHeight: '10px',
  },
  chipLabel: {
    flex: "0 0 32%",
    textTransform: "uppercase",
  }, bold: {
    fontWeight: theme.typography.platformFontWeight,
  },
}));

const StoreLocator = () => {

  const { isSelectStoreModalOpened, setIsSelectStoreModalOpened } = useStoreContext();
  const classes = useStyles();

  const [selectedTab, setSelectedTab] = useState(0);

  const onTabChange = (_, value) => {
    setSelectedTab(value);
  }

  return <PageLayout
    header={
      <Header
        leftSlot={<MenuButton />}
        centerSlot={<PageHeader > <p className={clsx('store_locator-header', classes.bold)} >Store Locator</p></PageHeader>}
      />
    }
    body={
      <>
        <div className='store_locator-container'>
          <Tabs
            value={selectedTab}
            onChange={onTabChange}
            className='store_locator-tabs'
            aria-label="store location tab"
            TabIndicatorProps={{ className: classes.tabsIndicator }}
            textColor="primary"
            variant="fullWidth"
          >
            <Tab className={clsx('store_locator-tab_title', classes.bold)} label="View Map" />
            <Tab className={clsx('store_locator-tab_title', classes.bold)} label="Store List" />
          </Tabs>
          {
            <>
              <div style={{
                display: selectedTab === 0 ? "block" : "none",
              }}>
                <ViewMap />
              </div>
              <div style={{ display: selectedTab === 1 ? "block" : "none" }}>
                <StoreListing />
              </div>
            </>
          }
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
};

export { StoreLocator };
