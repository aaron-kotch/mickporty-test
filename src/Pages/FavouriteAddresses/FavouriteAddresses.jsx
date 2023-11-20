import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Header } from "@Common/Header";
import Card from '@material-ui/core/Card';
import { PageLayout } from "@Common/PageLayout/PageLayout";
import { PageHeader } from '@Common/PageHeader/PageHeader';
import { BackButton } from '@Common/BackButton';
import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { routes } from 'src/constants/routes.constant';
import { useAddressContext } from '@Context/AddressContext';
import { useUserContext } from '@Context/UserContext';
import OverlayAddressSelector from '@View/OverlayAddressSelector';
import { addUserFavAddressList } from '@API/api';
import { PullToRefresh } from "react-js-pull-to-refresh";
import { CustomRefreshContent } from '@Common/RefreshContent'
import { useAlertContext } from '@Context/AlertContext';
import { OverlayLoader } from "@Common/Loader";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: '1rem',
    position: 'relative',
    borderRadius: '1rem',
    // marginBottom: '2rem'
  },
  item: {
    display: "flex",
    "&:not(:last-of-type)": {
      borderBottom: `1px solid ${theme.palette.grey[300]}`,
      paddingBottom: '1rem',
      marginBottom: '1rem',
    },
    "&:hover": {
      cursor: "pointer"
    }
  },
  icon: {
    flex: "0 0 2.5rem",
    paddingTop: '0.5rem'
  },
  details: {
    flex: 1,
    color: theme.palette.grey[600],
    fontSize: '0.8rem',
    overflow: 'hidden'
  },
  itemHeader: {
    fontWeight: theme.typography.platformFontWeight,
    color: theme.palette.grey[800],
    textTransform: "uppercase",
    fontSize: '1rem'
  },
  address: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  addAddressBtn: {
    borderRadius: '2rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    marginTop: '2rem',
    fontWeight: theme.typography.platformFontWeight,
  },
}));

const FavouriteAddresses = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useUserContext();
  const { addresses, getFavAddr, generateValuesForAddAddr, addAddress } = useAddressContext();
  const { pushAlertPopUp } = useAlertContext();
  // const geocoderRef = useRef(null);

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);

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
  // call to get users' addresses if they got any in FM app
  useEffect(() => {
    if (user.token) {
      getFavAddr(user.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (refreshData === true && user.token) {
      getFavAddr(user.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData])

  const edit = (id) => () => {
    history.push({ pathname: routes.editAddress.replace(':id', id) });
  }

  const onAddBtnClick = () => {
    setShowAddAddressModal(true);
  }

  const onSelectAddressViewClosed = () => {
    setShowAddAddressModal(false);
  }

  const onNewAddressAdded = async (addr) => {
    setAddingAddress(true);

    const values = generateValuesForAddAddr(addr, user);
    // console.log('and the place', addr.place);
    await addUserFavAddressList(values).then(async res => {
      const objWithIdFromBackend = { ...values, customerFavouriteAddressId: res.customerFavouriteAddressId };
      addAddress(objWithIdFromBackend, () => setShowAddAddressModal(false));
      pushAlertPopUp(res.message);
    }).catch((err) => {
      pushAlertPopUp(`Problem connecting to server. Please try again later`);
    })
      .then(() => setAddingAddress(false));
  }
  if (addingAddress) return <OverlayLoader />;
  return <PageLayout
    className={'greyBg'}
    header={
      <Header
        leftSlot={<BackButton />}
        centerSlot={<PageHeader>Favourite Addresses</PageHeader>}
      />
    }
    body={
      <>
        <PullToRefresh
          // pullDownContent={<PullDownContent />}
          // releaseContent={<ReleaseContent />}
          pullDownThreshold={0}
          onRefresh={onRefresh}
          triggerHeight={300}
          startInvisible={true}>
          <>
            {
              addresses.length !== 0 &&
              <Card className={classes.card}>
                {
                  addresses.map((item) => <div key={item.id} className={classes.item} onClick={edit(item.id)}>
                    <HomeRoundedIcon color="primary" className={classes.icon} />
                    <div className={classes.details}>
                      <div className={classes.itemHeader}>{item.title}</div>
                      <div className={classes.address}>{item.address}</div>
                      {item.address2 && <div>{item.address2}</div>}
                    </div>
                  </div>)
                }
              </Card>
            }
            <Button className={classes.addAddressBtn} variant="contained" color="primary" onClick={onAddBtnClick} fullWidth>
              Add Favourite Address
            </Button>
            {refreshData ? (
              <CustomRefreshContent />
            ) : null}
          </>
        </PullToRefresh>
        {
          showAddAddressModal
          &&
          <OverlayAddressSelector
            title={"ADD NEW ADDRESS"}
            onBackButtonClicked={onSelectAddressViewClosed}
            onUseAddressClicked={onNewAddressAdded}
          />
        }
      </>
    }
  />
};

export { FavouriteAddresses };
