import React from 'react';
import './Button.scss'
import { Button, Box, Link, styled, MenuItem, Select, makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  dropdownSelected: {
    color: '#1E91CF'
  },
  bold:{
    fontWeight: theme.typography.platformFontWeight,
  },
  secondaryButton:{
    fontFamily: 'din_bold, din_regular',
  },
}));

export default function PrimaryButton(props){
    const {handleClick,title} = props;
    const classes = useStyles();

    return(
        <div className='button-container'>
            <Button
                variant="contained"
                className={clsx('primary-btn', classes.bold)}
                onClick={handleClick}>
                {title}
            </Button>
        </div>
    )
}
export function SecondaryButton(props){
    const ViewAllButton = styled(Link)``;
    const {handleClick,title} = props;
    const classes = useStyles();

    return(
        <>
        <Box className='secondary-btn-box' onClick={handleClick}>
        <ViewAllButton className={clsx('secondary-btn', classes.secondaryButton)} onClick={handleClick}>{title}</ViewAllButton>
      </Box>
      </>
    )
}
export function SelectButton(props){

    const ViewAllButton = styled(Link)``;
    const {label=null, title,selection,value,handleChange, type, isEdit=null} = props
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
      setOpen(false);
    };
  
    const handleOpen = () => {
      setOpen(true);
    };
    
    return(
        <>
        <Box className={type==='available'?'secondary-btn-box-dynamic':'secondary-btn-box'}>    
          {label && <span>{label}</span>}
        <ViewAllButton className={type==='available'?'secondary-btn-dynamic':'secondary-btn'}  onClick={() => setOpen(!open)}>{title}
          <Select
            open={open}
            value={value}
            onChange={handleChange}
            onClose={handleClose}
            onOpen={handleOpen}
            className={type === 'available' ? isEdit ? 'hidden-dropdown-slide-left' :  clsx('hidden-dropdown-dynamic', classes.select) : clsx('hidden-dropdown', classes.select)}
            >

              {selection.map((item, key) => {
              return (
                  <MenuItem 
                      name={item.name ? item.name : item.label}
                      value={item.value}
                      key={key}
                      selected={value === item.value ? true : false}
                      classes={{ selected: classes.dropdownSelected }}
                      >
                      {item.description ? item.description : item.label}
                  </MenuItem>
              )
            })}
          </Select>
        </ViewAllButton>
        
      </Box>
      </>
    )
}

