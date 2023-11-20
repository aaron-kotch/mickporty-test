import React from 'react';
import { makeStyles } from "@material-ui/core/styles";
import { useCartContext } from "@Context/CartContext";
import clsx from "clsx";
import { ShoppingType } from "@Context/CartContext";
import Stopwatch_Icon from "@Assets/svgs/stopwatch.svg"
import {SelectButton} from '@View/Button/Button'
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  iconWrapper: {
    flex: '0 0 2rem',
    alignSelf: 'start',
    marginRight: '0.5rem'
  },
  sectionWrapper: {
    margin: '0.5rem 0',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '0.25rem',
    padding: '0.5rem'
  },
  sectionHeader: {
    // fontWeight: theme.typography.platformFontWeight,
    fontFamily: 'din_bold, din_regular',
    color: theme.palette.grey[700]
  },
  sectionContent: {
    fontSize: '0.8rem',
    color: theme.palette.grey[500]
  },
  sectionContentButton: {
    flex: '0 0 4rem',
    alignSelf: 'center'
  },
  input: {
    padding: '0.5rem'
  },
  label: {
    width: '100%'
  },
  section: {
    paddingTop: '1rem'
  },
  dropdown: { 
    opacity: 0,
    height: '2rem',
    zIndex: 1,
    position: 'absolute',
  }
}));

const DeliveryTime = ({ orderType, selectedStore, timeLabel, setTimeLabel }) => {
  const classes = useStyles();
  const { shoppingType, deliveryInfo, setDeliveryInfo } = useCartContext();

  const deliveryTimes = React.useMemo(() => {
    if(!selectedStore) return [];
    if(shoppingType === 'Delivery'){
      return [{label: 'ASAP', value: 'asap'}];
    }
    const { minDeliveryDuration, minFoodPreparationDuration, eCommerceLastOrder } = selectedStore;

    function generateSelections (eCommerceLastOrder, minFoodPreparationDuration, minDeliveryDuration) {
      const items = [];
  
      // the nearest may be before asap if choose delivery
      let minDuration = minFoodPreparationDuration;
      if(orderType === 'Delivery'){
        minDuration += minDeliveryDuration; 
      }
      const start = moment().add(minDuration);
      // add ASAP
      items.push(start.format('h:mm A'));
      // console.log('start',start);
      const end = moment(new Date());
      let remainder = 30 - (start.minute() % 30);
      let endRemainder = 30 - (end.minute() % 30);
      // if start ==== 12:01, nearest time is 1:00
      // else if start === 12:00, nearest time is 12:30
      if(remainder !== 0) remainder = remainder + 30;
      if(endRemainder !== 0) endRemainder = endRemainder + 30;
  
      // construct the Moment based on eCommerceLastOrder
      var time = moment(eCommerceLastOrder, ["h:mm A"]).format("HH:mm");
      var day = moment().utcOffset('8');
      var splitTime = time.split(/:/)
      day.hours(parseInt(splitTime[0])).minutes(parseInt(splitTime[1].substring(0,2))).seconds(0).milliseconds(0);
      // console.log(day);
      const nearestMomentAfterASAP = moment(start).add(remainder, "minutes");
      const lastestMoment = moment(day).subtract(endRemainder, "minutes");
      // console.log('nearestTimeAfterASAP',nearestMomentAfterASAP);
      // console.log('lastestMoment',lastestMoment);
      // add until lastestTime
      items.push(nearestMomentAfterASAP.format('h:mm A'));
      let theMoment = nearestMomentAfterASAP;
      // console.log('theMoment.isBefore(lastestMoment)',theMoment.isBefore(lastestMoment));
      while (theMoment.isBefore(lastestMoment)) {
        theMoment = theMoment.add(30, "minutes");
        const temp = theMoment.format('h:mm A');
        items.push(temp);
      }
      return items;
    }
    const arr = generateSelections(eCommerceLastOrder, minFoodPreparationDuration, minDeliveryDuration, orderType).map(time => ({
      label: time, value: time
    }));
    
    arr[0]['label'] = `ASAP`;
    arr[0]['value'] = "asap";
    // console.log(arr);
    return arr;
    
  }, [orderType, selectedStore, shoppingType]);

  const handleChange = event => {
    setDeliveryInfo({ ...deliveryInfo, time: event.target.value });
  };
  
  React.useEffect(() => {
    if(!selectedStore) return;
    const { minDeliveryDuration, minFoodPreparationDuration } = selectedStore;

    const theLabel = deliveryTimes.find((item) => item.value === deliveryInfo.time);
    let minDuration = minFoodPreparationDuration;
    if(orderType === 'Delivery'){
      minDuration += minDeliveryDuration; 
    }
    const label = `ASAP (${minDuration} minutes)`;
    
    if(theLabel.label.includes('ASAP')){
      theLabel['label'] = label;
      setTimeLabel(theLabel);
    } else {
      setTimeLabel(theLabel);
    }
  }, [deliveryInfo, deliveryTimes, orderType, selectedStore, setTimeLabel]);
  
  return <div className={clsx(classes.flexContainer, classes.sectionWrapper)}>
    <div className={classes.iconWrapper}>
    <img src={Stopwatch_Icon} alt="icon"height="25px" width="25px" />
       {/* <TimerTwoToneIcon /> */}
    </div>
    <div className={classes.flex}>
      <div className={classes.flexContainer}>
        <div className={classes.flex}>
          <div className={classes.sectionHeader}>{shoppingType === ShoppingType.PickUp ? "Pick up time" : "Delivery time"}</div>
          <div className={classes.sectionContent}>
            {timeLabel?.label || ""}
          </div>
        </div>
        <div className={classes.sectionContentButton}>
          <SelectButton
          title={'Change'}
          handleChange={handleChange}
          value={deliveryInfo.time}
          selection={deliveryTimes}
          />
        </div>
      </div>
    </div>
  </div>;
};

export { DeliveryTime };
