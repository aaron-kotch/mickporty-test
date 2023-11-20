import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { StoreSelectorModal } from "@Common/StoreSelector";
import { useStoreContext } from '@Context/StoreContext';
import { useEffect } from 'react';
import { useCartContext } from '@Context/CartContext';
import { ShoppingType } from '@Context/CartContext';
import pickUpSVG from '@Assets/svgs/pickup.svg';
import deliverySVG from '@Assets/svgs/delivery.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    borderRadius: '0.8rem',
    backgroundColor: `${theme.palette.primary.lighter}`,
    alignItems: 'center',
    marginTop: '1rem',
    padding: '0rem 0.2rem',
    height: "2.8rem",
    [theme.breakpoints.down("xs")]: {
      marginTop: '0.5rem'
    }
  },
  rootHome: {
    display: 'flex',
    borderRadius: '0.8rem',
    backgroundColor: `${theme.palette.primary.lighter}`,
    alignItems: 'center',
    marginTop: '1rem',
    marginLeft: '0.8rem',
    marginRight: '0.8rem',
    padding: '0rem 0.2rem',
    height: "2.8rem",
    [theme.breakpoints.down("xs")]: {
      marginTop: '0.5rem'
    }
  },
  icon: {
    // flex: '0 0 0.5rem',
    height: '1.2rem'
  },
  placeholder: {
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.grey[600]
  },
  searchButton: {
    flex: '0 0 5rem',
    textTransform: "none",
    fontWeight: theme.typography.platformFontWeightMedium,
    // textDecoration: "underline",
  },
  circle: {
    'borderRadius': '50%',
    width: '2rem',
    height: '2rem',
    marginRight: '0.5rem',
    marginLeft: '0.5rem',
    // backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: "center",
  }
}));

const StoreSelector = (props) => {
  const { page } = props;
  const classes = useStyles();
  const { shoppingType } = useCartContext();
  const { selectedStore, setSelectedStore, isSelectStoreModalOpened, setIsSelectStoreModalOpened } = useStoreContext();
  const [value, setValue] = React.useState('Select store');

  // const handleChange = (event, newValue) => {
  //   setValue(newValue);
  // };

  const onStoreSelectBtnClicked = () => {
    setIsSelectStoreModalOpened(true);
  }

  useEffect(() => {
    setValue(!!selectedStore ? `${shoppingType === ShoppingType.Delivery ? 'Deliver from' : 'Pick Up from'} ${selectedStore?.storeName}` : 'Select store');
  }, [selectedStore, shoppingType]);

  return (
    <div className={page === "home" ? classes.rootHome : classes.root}>
      <div className={classes.circle}>
        <img src={!!selectedStore ? shoppingType === ShoppingType.Delivery ? deliverySVG : pickUpSVG : pickUpSVG} alt="" className={classes.icon} />
      </div>
      <Typography variant="body2" className={classes.placeholder}>
        {value}
      </Typography>
      <Button className={classes.searchButton} color="primary" size="small" onClick={onStoreSelectBtnClicked}>{!!selectedStore ? 'Change' : 'Select'}</Button>
      {
        isSelectStoreModalOpened &&
        <StoreSelectorModal
          open={isSelectStoreModalOpened}
          setIsSelectStoreModalOpened={setIsSelectStoreModalOpened}
          onClose={() => {
              setSelectedStore(undefined)
              setIsSelectStoreModalOpened(false)
            }
          }
        />
      }
    </div>
  );
}

export { StoreSelector };
