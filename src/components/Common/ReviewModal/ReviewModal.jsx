import React from "react";
import clsx from "clsx";
import { Modal } from '@Common/Modal';
import { makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Rating from '@material-ui/lab/Rating';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import EmojiEmotionsIcon from '../../../assets/svgs/Overall.svg';
import FastfoodIcon from '../../../assets/svgs/Products.svg';
import UnarchiveIcon from '../../../assets/svgs/product-availability-icon.svg';
import QueryBuilderIcon from '../../../assets/svgs/WaitingTime.svg';
import DirectionsBikeIcon from '../../../assets/svgs/StaffService.svg';
import DriverIcon from '../../../assets/images/food_panda_icon.png'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import { ShoppingType } from "@Context/CartContext";
import CameraIcon from '@Assets/svgs/camera.svg';
import { useAlertContext } from '@Context/AlertContext';

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    textAlign: 'center',
    // fontFamily: "DIN Regular Alternate"
  },
  orderText : {
    fontSize: "0.9rem",
  },
  bold:{
    fontFamily: 'din_bold, din_regular',
  },
  ratingFieldWrapper: {
    display: 'flex',
    width: '250px',
    color: theme.palette.primary.main,
    padding: '0 1rem 1rem',
    margin: 'auto',
    alignItems: 'center',
    justifyItems: 'center',
  },
  imageFieldWrapper: {
    display: 'flex',
    flexDirection: "column",
    color: theme.palette.primary.main,
    margin: '0 2rem',
    justifyItems: 'center',
    textAlign: "left"
  },
  label: {
    fontSize: '1rem',
    paddingBottom: '0.5rem',
    fontFamily: 'din_bold, din_regular',
  },
  iconWrapper: {
    flex: '0 0 3rem',
  },
  icon: {
    height: '100%',
    width: '100%',
  },
  ratingField: {
    paddingLeft: '1rem',
    flex: 1,
    textAlign: 'left'
  },
  rating: {
    color: theme.palette.primary.main,
  },
  commonField: {
    textAlign: 'left',
    margin: '0 2rem 1rem',
    width: 'calc(100% - 4rem)',
  },
  commentField: {
    fontSize: "0.8rem",
    '&::placeholder': {
      color: theme.palette.primary.main,
      opacity: 1,
    }
  },
  submitButton: {
    margin: '2rem 0 0',
    padding: '0.5rem 1.5rem',
    borderRadius: '2rem',
    // fontFamily: "DIN Regular Alternate"
  },
  form: {
    paddingBottom: "3rem"
  },
  input: {
    display: 'none',
  },
  cameraField: {
    display: 'flex',
    width: '250px',
    height: '50px',
    color: theme.palette.primary.main,
    margin: 'auto',
    alignItems: 'center',
    justifyItems: 'center',
    overflow: "hidden",
  },
  cameraIcon:{
    width: "80px",
    height: "80px",
  },
  cameraButton:{
    paddingRight: '16px',
    paddingLeft: '0',
  },
  cameraBorder: {
    border: "1px solid #75BEE4", 
    borderRadius: "5px", 
    width: "4rem", 
    height: "2.5rem",
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center",
    padding: "0.2rem"
  },
  cameraBorder2: {
    border: "1px solid #75BEE4", 
    borderRadius: "5px", 
    width: "1.3rem", 
    display: "flex", 
    justifyContent: "center", 
    padding: "0.2rem 0.6rem"
  },
  imgAdded:{
    maxWidth:'100%',
  },
}));

const ReviewModal = ({ order, onSubmit, reviewData, review, setReview, images, setImages, ...props }) => {
  const orderReviewed = !!reviewData;
  const { pushAlertPopUp } = useAlertContext();
  
  const classes = useStyles();
  
  const getFields = () => {
    const tempFields = [
      { name: 'overallRating', label: 'Overall', icon: EmojiEmotionsIcon },
      { name: 'foodRating', label: 'Product Quality', icon: FastfoodIcon },
      { name: 'productAvailabilityRating', label: 'Product Availability', icon: UnarchiveIcon },
      { name: 'waitingTimeRating', label: 'Waiting Time', icon: QueryBuilderIcon },
      { name: 'driverServiceRating', label: 'Rider\'s Service', icon: DriverIcon },
    ];
    if(order && order.orderType === ShoppingType.PickUp){
      tempFields[4] = { name: 'staffServiceRating', label: 'Staff\'s Service', icon: DirectionsBikeIcon };
    }
    return tempFields;
  }

  const onFieldChange = (event) => {
    // console.log('[event.target.name]',[event.target.name])
    // console.log('[event.target.value]',event.target.value)
    setReview({
      ...review,
      [event.target.name]: event.target.value
    });
  };

  const onFormSubmit = () => {
    onSubmit(review, images);
  };

  const onAddImage = (index) => {
    if(orderReviewed) return;
    try{
      // eslint-disable-next-line no-undef
      my.chooseImage({
        count: 1,
        success: (res) => {
          const temp = [...images];
          temp[index] = res.apFilePaths[0];
          setImages(temp);
        },
        fail: (res) => {
          // console.log("chooseImage failed -> res", res)
          pushAlertPopUp('chooseImage failed', JSON.stringify(res))
        }
      });
    }catch(error){
      // console.log(error);
    }
  }

  React.useEffect(() => {
    setReview(reviewData || {});
    if(orderReviewed && reviewData.attachment){
      setImages(reviewData.attachment)
    }else{
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderReviewed, reviewData]);

  return <Modal
    {...props}
    className={classes.root}
    title={<div className={clsx(classes.root, classes.bold)}>
      <div>Share Your Experience</div>
      <div className={classes.orderText}>Order #{order?.orderNumber}</div>
      </div>}
  >
    <form className={clsx(classes.root, classes.form)}>
      {
        getFields().map((field, index) => {
          return <div key={index} className={classes.ratingFieldWrapper}>
            <div className={classes.iconWrapper}>
              {field.name === "quality" ? (
                <img src={field.icon} alt={field.name} width="50px" height="60px" style={{marginLeft: "-0.2rem"}}/>
              ) : (
                <img src={field.icon} alt={field.name} width="40px" height="40px"/>
              )}
            </div>
            <div className={classes.ratingField}>
              <Typography className={clsx(classes.label)} component="legend">{field.label}</Typography>
              <Rating
                className={classes.rating}
                value={Number(review[field.name]) || 0}
                name={field.name}
                defaultValue={0}
                readOnly={!!reviewData}
                precision={1}
                onChange={onFieldChange}
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
              /> 
            </div>
          </div>
        })
      }
      <FormControl fullWidth className={classes.commonField} variant="filled">
        <Typography className={classes.label} component="legend">COMMENTS (OPTIONAL)</Typography>
        <TextField
          multiline
          id="filled-adornment-amount"
          name="comment"
          InputProps={{
            readOnly: !!reviewData,
            classes: {
              input: classes.commentField
            }
          }}
          value={review.comment}
          placeholder="Leave some feedback to let us know how we are doing"
          variant="outlined"
          rows={4}
          readOnly={!!reviewData}
          onChange={onFieldChange}
        />
      </FormControl>
      <div className={classes.imageFieldWrapper}>
        <Typography className={classes.label} component="legend">ATTACHMENTS (OPTIONAL)</Typography>
        
        <div className={classes.cameraField}>
          {
            [0,1,2].map(number => {
              return <Button
              key={number}
              variant="contained"
              color="secondary"
              component="span"
              className={classes.cameraIcon}
              onClick={() => onAddImage(number)}
              disableElevation
              disableFocusRipple
              disableRipple
              classes={{ root: classes.cameraButton }}
          >
            {
              images[number] ? 
              <img src={images[number]} alt="first item" className={ clsx(classes.cameraBorder, classes.imgAdded)}/> :
              <div className={classes.cameraBorder}><img src={CameraIcon} alt="icon" width="45px" height="45px" /></div>
            }
          </Button>
            })
          }
          {/* <input accept="image/*" className={classes.input} id="icon-button-file-3" type="file" onChange={handleImageChange}/>
          <label htmlFor="icon-button-file-3">
            <Button color="primary" aria-label="upload picture" component="span">
              {
                images[0]?
                <img src={URL.createObjectURL(images[0])} alt="first item" className={ clsx(classes.cameraBorder, classes.imgAdded)}/> :
                <div className={classes.cameraBorder2}><img src={CameraIcon} alt="icon" width="35px" height="35px"  /></div>
              }
            </Button>
          </label> */}
        </div>
      </div>
      {
        !reviewData && <Button variant="contained" className={classes.submitButton} color="primary" onClick={onFormSubmit}>
          Submit review
        </Button>
      }
    </form>
  </Modal>
};

export { ReviewModal };
