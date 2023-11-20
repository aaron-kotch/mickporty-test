import React, { memo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { OrderListItem } from "./OrderListItem";
import {SecondaryButton} from '@View/Button/Button'

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    display: 'flex'
  },
  title: {
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
    color: theme.palette.grey[700],
    marginBottom: "1rem",
  },
  subtitle: {
    fontWeight: theme.typography.platformFontWeightMedium,
    marginLeft: '0.25rem'
  },
  button: {
    flex: 1,
    textAlign: 'right',
    color: theme.palette.primary.main
  },
  delete: {
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.error.main,
    display: 'flex',
    alignItems: 'center'
  },
  orderListText: {
    marginRight: "0.5rem",
    fontSize: '1.1rem'
  }
}));

const OrderList = memo(({ items = [], showItemsCount = false, showImage = true, hideEditButton = false, isReadOnly = true }) => {
  const classes = useStyles();
  const [activeDeleteItem, setActiveDeleteItem] = React.useState();
  const [isEdit, setIsEdit] = React.useState(false);
  // find the total number of items by combining quantity of each product
  const totalItems = React.useMemo(() => items.reduce((acc, { quantity }) => acc + quantity, 0), [items]);
  // const totalItems = 2

  return <div>
    <div className={classes.titleContainer}>
    <Typography className={classes.title}>
        <span className={classes.orderListText}>Order List</span>
        { showItemsCount &&  
          <>
          {/* <span style={{marginRight: "1rem"}}>&bull; </span> */}
          {totalItems === 1 ? (
            <span className={classes.subtitle}>{totalItems} item</span>
          ) : (
            <span className={classes.subtitle}>{totalItems} items</span>
          )}
          </>
          }
      </Typography>
      {
        showItemsCount &&  !hideEditButton && <div className={classes.button}>
          {/* <Button color="primary" size="small" onClick={() => setIsEdit(!isEdit)}>{isEdit ? "Close" : "Edit"}
          </Button> */}
          <SecondaryButton
          handleClick={() => setIsEdit(!isEdit)}
          // title={isEdit ? "Close" : "Edit"}
          title={"Edit"}
          />
        </div>
      }
    </div>
    {items.map((item,index) => <OrderListItem
      {...item}
      hideEditButton={hideEditButton}
      key={item.productId + index}
      isEdit={isEdit}
      isActive={activeDeleteItem?.id === item.id}
      isReadOnly={isReadOnly}
      onDeleteToggle={(isToggled) => isToggled && setActiveDeleteItem(item)}
      showImage={showImage}
    />)}
  </div>
});

export { OrderList };
