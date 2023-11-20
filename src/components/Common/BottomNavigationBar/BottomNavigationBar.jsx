import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useLocation, useHistory } from 'react-router-dom';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import DescriptionIcon from '@material-ui/icons/Description';
import RestaurantIcon2 from '@Assets/svgs/menu-icon.svg';
import RestaurantIcon from '@Assets/images/ic_food.png'
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { CartButton } from '@Common/CartButton/CartButton';
import { routes } from 'src/constants/routes.constant';
import SearchIcon from '@material-ui/icons/Search';
import { useAction } from '@Hook/useAction';
import './BottomNavigationBar.scss'
import { useUserContext } from '@Context/UserContext';
const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: '100%',
    borderTop: `1px solid ${theme.palette.grey[400]}`,
    zIndex: 2,
    // paddingBottom: '1.25rem',
    '&::before': {
      content: '" "',
      height: '4rem',
      position: "absolute",
      top: '-2.1rem',
      borderRadius: '50%',
      width: '4rem',
      border: `1px solid ${theme.palette.grey[400]}`,
      borderBottomColor: 'transparent',
      borderLeftColor: 'transparent',
      transform: 'rotate(135deg)',
    },
    "& .MuiBottomNavigationAction-root": {
      "@media (max-width: 768px)": {
        minWidth: "70px",
        padding: "6px 2px"
      }
    },
    '&::after': {
      content: '" "',
      height: '2rem',
      top: '-1px',
      borderBottomLeftRadius: 'calc(4rem * 2)',
      borderBottomRightRadius: 'calc(4rem * 2)',
      position: 'absolute',
      width: '4rem',
      background: "rgba(0,0,0,0)",
      zIndex: 0
    },
  },
  divider: {
    flex: '0 0 1rem',
    '@media (max-width: 330px)': {
      display: 'none',
    }
  },
  fab: {
    position: 'fixed',
    left: '50%',
    marginLeft: '-1.75rem',
    bottom: '2rem',
    zIndex: 2,
  },
}));

const BottomNavigationBar = () => {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const { checkIsActionCallable } = useAction();
  const { isNeedEmail } = useUserContext();

  const handleChange = (event, pathname) => {
    if (pathname === routes.orders) {
      checkIsActionCallable(() => {
        if (isNeedEmail) {
          history.push(({ pathname: routes.submitEmail }))
        } else {
          history.replace({ pathname });
        }
      });
    } else {
      history.replace({ pathname });
    }
  };

  return (
    <>
      <BottomNavigation value={location.pathname} onChange={handleChange}
        className={classes.root}
      >
        <BottomNavigationAction value={routes.home} icon={location.pathname === routes.home ? <img src={RestaurantIcon} alt="menu" height="25px" width="25px" /> : <img src={RestaurantIcon2} alt="menu" height="25px" width="25px" />} className={classes.icon} />
        <BottomNavigationAction value={routes.search} icon={<SearchIcon
        />} className={classes.icon} />
        <BottomNavigationAction className={classes.divider} disabled/>
        <BottomNavigationAction value={routes.storeLocator} icon={<LocationOnIcon
        />} className={classes.icon} />
        <BottomNavigationAction value={routes.orders} icon={<DescriptionIcon
        />} className={classes.icon} />
      </BottomNavigation>
      <CartButton className={classes.fab} />
    </>
  );
}

export { BottomNavigationBar };
