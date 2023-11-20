import React from "react";
import { MenuItem, Select, makeStyles} from "@material-ui/core";
import clsx from "clsx";
import './Selection.scss';

const useStyles = makeStyles((theme) => ({
    dropdownSelected: {
      color: '#1E91CF',
    }, 
    dropdown:{
      minHeight: '1rem',
      fontSize: "0.8rem"
    },
}));

const Selection = (props) => {

    const { selectionList, currentSelectionValue, handleFilterChange, componentClass=null } = props
    const classes = useStyles();

    return (
        <Select
            value={currentSelectionValue}
            onChange={handleFilterChange}
            className={componentClass ? clsx(componentClass) : classes.select}
            >

            {selectionList.map((item, key) => {
            return (
                <MenuItem 
                    name={item.name ? item.name : item.label}
                    value={item.value}
                    key={key}
                    selected={currentSelectionValue === item.value ? true : false}
                    classes={{ selected: classes.dropdownSelected, root: classes.dropdown }}
                    >
                    {item.description ? item.description : item.label}
                </MenuItem>
          )
        })}
        </Select>
    );
};

export { Selection };
