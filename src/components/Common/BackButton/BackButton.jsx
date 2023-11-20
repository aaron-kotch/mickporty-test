import React from "react";
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import './BackButton.scss'
import BackButton_Icon from "@Assets/svgs/back-btn.svg"

const BackButton = ({ 
  className,
  onBackClicked,
}) => {
  const history = useHistory();
  const goBack = history.goBack;
  
  return <>
    {/* pass props className= 'backButton-withoutHeader' for backbutton without header */}
    <IconButton className={className? className: 'backButton'} edge="start" color="inherit" aria-label="back" onClick={!!onBackClicked ? onBackClicked : goBack}>
    <img src={BackButton_Icon} alt="pic"/>
    </IconButton>
  </>;
}

export { BackButton };
