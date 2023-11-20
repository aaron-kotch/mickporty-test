import React from 'react';
// Components
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import './Header.scss'


const Header = ({ leftSlot, centerSlot, rightSlot }) => {

  return (
    <AppBar id="appbar" className='header-container' color="secondary" position="fixed" elevation={1}>
      <Container>
        <Toolbar className='header-toolbar' disableGutters>
          <div className='header-left'>{leftSlot}</div>
          <div className='header-center'>{centerSlot}</div>
          <div className='header-right'>{rightSlot}</div>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export { Header };
