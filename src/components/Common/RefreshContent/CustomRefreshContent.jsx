import React from 'react';
import { CircularProgress } from '@material-ui/core';


const CustomRefreshContent = ({topCoordinate="3%"}) => {
    return (
      <div style={{position: "absolute", left: "50%", top: topCoordinate, backgroundColor: "white", borderRadius: "50%", width: "35px", height: "35px"}} >
          <CircularProgress size={30} style={{color: "black"}}/>
      </div>
    )
}

export { CustomRefreshContent };