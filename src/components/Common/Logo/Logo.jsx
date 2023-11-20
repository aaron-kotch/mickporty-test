import React from "react";
import './Logo.scss';

const Logo = () => {
  return <div className='logo-container'>
    <img className='logo' src={"https://logodix.com/logo/2111280.png"} alt={"AppConfig.title"}/>
  </div>;
}

export { Logo };
