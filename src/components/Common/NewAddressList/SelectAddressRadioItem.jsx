import { makeStyles, Radio } from "@material-ui/core";
import React from "react";
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    margin: '0.25rem 0',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    boxSizing: 'border-box'
  },
  iconWrapper: {
    flex: '0 0 2rem',
    alignSelf: 'start',
    marginRight: '0.5rem'
  },
  label: {
    width: '100%'
  },
  sectionHeader: {
    fontWeight: theme.typography.platformFontWeight,
    color: theme.palette.grey[700]
  },
  sectionContent: {
    fontSize: '0.8rem',
    color: theme.palette.grey[500],
    display: '-webkit-box',
    '-webkit-line-clamp': 1,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: "normal",
  },
}));

const SelectAddressRadioItem = ({
  addressItem,
  onLabelClicked: propOnLabelClicked = (props) => {}
}) => {

  const classes = useStyles();
  const onLabelClicked = () => {
    propOnLabelClicked(addressItem);
  }

  return (
    <FormControlLabel
      className={classes.root}
      classes={{ label: classes.label }}
      value={addressItem.id}
      control={<Radio color="primary" icon={<RadioButtonUncheckedIcon /> } checkedIcon={<CheckCircleIcon />} name="checked" />}
      label={
        <div onClick={onLabelClicked}>
          <div className={classes.sectionHeader}>{addressItem.title}</div>
          <div className={classes.sectionContent}>
            {addressItem.address}
          </div>
        </div>
      }
      labelPlacement="start"
    />
  )
}

export { SelectAddressRadioItem }