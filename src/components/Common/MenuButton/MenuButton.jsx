import React, { useEffect } from "react";
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
// import MenuIcon from '@material-ui/icons/Menu';
import MenuIcon from "@Assets/svgs/menu.svg"
import { useHistory } from 'react-router-dom';
import { useUserContext } from "@Context/UserContext";
import { useAction } from "@Hook/useAction";
import { routes } from 'src/constants/routes.constant';
import './MenuButton.scss'


const MenuButton = () => {
  const { user, isLoggedIn, isNeedEmail } = useUserContext();
  const { checkIsActionCallable } = useAction();
  const mainMenu = require('@Mock/mainmenu.json').result;
  const secondaryMenu = require('@Mock/secondarymenu.json').result;
  const [open, setOpen] = React.useState(false);
  const [userFirstName, setUserFirstName] = React.useState(user.FirstName);
  const history = useHistory();

  useEffect(() => {
    setUserFirstName(user.FirstName);
  }, [user]);

  const triggerNavigation = (_, path) => {
    if (path.guarded) {
      checkIsActionCallable(() => {

        if (isNeedEmail) {
          history.push(({ pathname: routes.submitEmail }))
        } else {
          redirect(path.route);
        }

      });
    } else {
      redirect(path.route);
    }
  }

  const redirect = (pathname) => {
    history.push({ pathname });
  };

  const onClickHelpCenter = () => {
    checkIsActionCallable((token) => {

      if (isNeedEmail) {
        history.push(({ pathname: routes.submitEmail }))
      } else {
        try {
          const tokenToPass = user.token && user.token !== "" ? user.token : token;
          // eslint-disable-next-line no-undef
          my.postMessage({ action: "navigate", token: tokenToPass });
        } catch (err) {
          // ;
        }
      }

    });
  }

  return <>
    <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
      <img src={MenuIcon} alt="fork" height="18px" width="18px" />
    </IconButton>
    <Drawer open={open} onClose={() => setOpen(false)}>
      <div className='menu_button-list' role="presentation">
        <List>
          <ListItem>
            <ListItemText
              classes={{ primary: 'menu_button-highlight_text' }}
              primary={<div>Hello, <strong>{isLoggedIn ? userFirstName : "Guest"}</strong></div>}
            />
          </ListItem>
          {mainMenu.map((item) => (
            <ListItem button key={item.name} onClick={item.route ? (ev) => triggerNavigation(ev, item) : null}>
              <ListItemText classes={{ primary: 'menu_button-common_list_text' }} primary={item.name} />
            </ListItem>
          ))}
          <ListItem button onClick={onClickHelpCenter}>
            <ListItemText classes={{ primary: 'menu_button-common_list_text' }} primary={"Help Center"} />
          </ListItem>
          {secondaryMenu.map((item) => (
            <ListItem button key={item.name} onClick={item.route ? (ev) => triggerNavigation(ev, item) : null}>
              <ListItemText classes={{ primary: 'menu_button-common_list_text' }} primary={item.name} />
            </ListItem>
          ))}
          <ListItem className='menu_button-logo_wrapper'>
            <img className='menu_button-logo' src="https://assets.sunwayvelocitymall.com/shops/302c2480de9f0dff5a3ad37b435f32f4/w768.png" alt="logo-square" />
          </ListItem>
        </List>
        <div className="menu_ver-number">
          ver 1.0.0
        </div>
      </div>
    </Drawer>
  </>;
}

export { MenuButton };
