import React from "react";
import Typography from '@material-ui/core/Typography';
import pickUpSVG from '@Assets/svgs/Store4Strip.svg';
import './EmptyState.scss';

const EmptyState = ({ title, description }) => {
  return <div className='empty_state-container'>
    <div className='empty_state-flex_item'>
      <img src={pickUpSVG} alt="" className='empty_state-icon' />
      <Typography variant="h6" className='empty_state-title' gutterBottom>{title}</Typography>
      <div className="empty_state-description-container">
      <Typography component="p" gutterBottom  className="empty_state-description">
        {description}
      </Typography>
      </div>
    </div>
  </div>
}

export { EmptyState };
