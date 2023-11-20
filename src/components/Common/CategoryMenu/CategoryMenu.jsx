import React from 'react';
import clsx from 'clsx';
import { makeStyles, lighten } from '@material-ui/core/styles';
import { BottomSheet } from 'react-spring-bottom-sheet';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import 'react-spring-bottom-sheet/dist/style.css';
import { useHistory } from 'react-router-dom';
import { routes } from 'src/constants/routes.constant';
import { getAllCategories } from "@API/api";
import './CategoryMenu.scss';
import { usePageContext } from '@Context/PageContext';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '1rem 0',
    textAlign: 'center',
  },
  category: {
    textAlign: 'center',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  moreIcon: {
    margin: 'auto',
    color: theme.palette.success.main,
    flex: 1
  },
  moreIconWrapper: {
    backgroundColor: `${lighten(theme.palette.primary.light, 0.5)}`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    height: '3.5rem',
    width: '3.5rem',
    margin: 'auto',
    marginBottom: '0.5rem',
    '&>img': {
      width: '100%',
      height: '100%'
    }
  },
  label: {
    fontWeight: theme.typography.platformFontWeight,
    fontSize: '1rem',
    height: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.grey[700],
    [theme.breakpoints.down("xs")]: {
      fontSize: '0.7rem',
    }
  },
  bottomSheetWrapper: {
    padding: '0.5rem 1rem',
  },
  bottomSheetHeader: {
    fontWeight: theme.typography.platformFontWeight,
    color: theme.palette.customGrey.medium,
    paddingTop: '0.8rem',
    paddingLeft: '0.5rem',
    fontSize: '1.4rem',
  },
  paper:{
    backgroundColor: `rgb(0,0,0,0)`,
  },
  bold:{
    fontWeight: theme.typography.platformFontWeight,
  },
  boldMedium:{
    fontWeight: theme.typography.platformFontWeightMedium,
  },
}));

const CategoryMenu = ({ refreshData=false, presetCategories }) => {
  const classes = useStyles();
  const defaultDisplayCounts = React.useMemo(() => 7, []);
  const history = useHistory();
  const { categoryMenu, setCategoryMenu } = usePageContext();

  const [open, setOpen] = React.useState(false);
  const [isActionAllowed, setIsActionAllowed] = React.useState(true);
  const [categories, setCategories] = React.useState([]);
  const [displayCategories, setDisplayCategories] = React.useState([{},{},{},{},{},{},{}]);

  const goToCategory = (id) => {
    if(id)
    isActionAllowed && history.push({ pathname: routes.categoryListing.replace(':id', id) });
  }

  const toggleBottomSheet = () => {
    setOpen(() => {
      // setIsActionAllowed(false);
      return true;
    })
  }

  const loadCategories = React.useCallback((categoryMenuCache, presetCategories) => {
    if(presetCategories){
      setCategories(() => {
        setDisplayCategories(presetCategories);
        return null;
      });
    }else if (categoryMenuCache && categoryMenuCache.length > 0) {
      setCategories(() => {
        setDisplayCategories(categoryMenuCache.slice(0, defaultDisplayCounts));
        return categoryMenuCache;
      });
    } else {
      getAllCategories().then(result => {
        const categories = result.data.getLandingMenuList;
        setCategoryMenu(categories);
        // console.log(categories);
        setCategories(() => {
          setDisplayCategories(categories.slice(0, defaultDisplayCounts));
          return categories;
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    loadCategories(categoryMenu, presetCategories);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (refreshData === true){
      loadCategories([], presetCategories);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

  React.useEffect(() => {
    setTimeout(() => setIsActionAllowed(!open), 200); // delay action click to avoid dismissing and redirection happen at the same time
  }, [open]);

  return <>
    <div className='category_menu-container'>
      {
        // isLoading ? <CircularProgress /> :
        <Grid container spacing={3}>
          {
            displayCategories.map((item, index) => <Grid className='category_menu-category ' item key={index} xs={3} onClick={() => goToCategory(item?.actionId)}>
              <Paper elevation={0} className='category_menu-paper'>
                <div className='category_menu-icon'>
                  <img src={item.image?process.env.REACT_APP_IMAGE_CLOUDFRONT+item.image:""} alt={item?.title} />
                </div>
                <div className={clsx('category_menu-label', classes.boldMedium)}>{item?.title}</div>
              </Paper>
            </Grid>)
          }
          {
            !presetCategories && <Grid className='category_menu-category ' item xs={3} onClick={toggleBottomSheet}>
              <Paper elevation={0} className='category_menu-paper'>
                <div className={clsx('category_menu-icon', 'category_menu-more_icon_container')}>
                  <MoreHorizIcon className='category_menu-more_icon'/>
                </div>
                <div className={clsx('category_menu-label', classes.boldMedium)}>More</div>
              </Paper>
            </Grid>
          }
        </Grid>
      }
    </div>
    {
      !presetCategories && <BottomSheet
        open={open}
        blocking
        onDismiss={() => setOpen(false)}
        snapPoints={({ maxHeight }) => {
          return [
            maxHeight * 0.67,
          ]
        }}
      >
        <div className={classes.bottomSheetWrapper}>
          <Typography className={classes.bottomSheetHeader}>Explore FamilyMart</Typography>
          <CategoryMenu presetCategories={categories} />
        </div>
      </BottomSheet>
    }
  </>
}

export { CategoryMenu };
