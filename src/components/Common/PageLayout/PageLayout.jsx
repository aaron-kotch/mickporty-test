import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import clsx from 'clsx';
import "./PageLayout.scss"
import { usePageContext } from "@Context/PageContext";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: '4.3rem',
    overflow:'auto',
    backgroundColor: 'white',
    height: '100%',
    // "&::after":{
    //   content: '" "',
    //   display: 'block',
    //   height: 'calc(1.25rem + 56px + 28px)',
    //   width: '100%'
    // }
  },
  rootHome: {
    paddingTop: '4.3rem',
    paddingRight: '0',
    paddingLeft: '0',
    overflow:'auto',
    backgroundColor: 'white',
    height: '100%',
  },
  bottomNavigatorSpacer: {
    // Bottom navigation padding-bottom + Bottom navigation height + fab half height (56px / 2)
    height: 'calc(1.25rem + 56px + 28px)'
  },
  container: {
    height: '100%',
  }
}));

const PageLayout = ({ className, containerFullHeigth, header, body, footer, PageName }) => {
  const classes = useStyles();
  const { saveScrollPosition, getScrollPosition } = usePageContext();
  const containerRef = useRef(null);

  // if(containerRef.current){
  //   console.log(containerRef.current);
  //   console.log('containerRef available, scrollHeight',containerRef.current.scrollHeight)
  // }else{
  //   console.log('containerRef not available')
  // }
  useEffect(()=>{
    if(PageName){
      const savedPos = getScrollPosition(PageName);
      // const { scrollTop, scrollHeight } = containerRef.current;
      // console.log('scrollTop, scrollHeight before scrolling:',scrollTop,scrollHeight);
      // console.log('scroll to',savedPos)
      containerRef.current.scrollTo(0, savedPos);
  
      const listenToScroll = (e) => {
        const { scrollTop } = containerRef.current;
        // console.log('when scrolling scrollHeight',containerRef.current.scrollHeight)
        // console.log(containerRef.current);
        saveScrollPosition(scrollTop, PageName);
      }
      setTimeout(() => {
        // console.log('add onscroll listener')
        if(containerRef.current)
        containerRef.current.addEventListener('scroll', listenToScroll);
      }, 1);
      const node = containerRef.current;
      return () => {
        node.removeEventListener('scroll', listenToScroll)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return <Container className={PageName === "home" ? clsx(classes.rootHome, [className]) : clsx(classes.root, [className])} ref={containerRef} id='page-layout-container'>
    {header}
    <div className={clsx({[classes.container]:containerFullHeigth})}>
      {body}
    </div>
    <div className={classes.footer}>
    {
      !!footer && <>
        <div className={classes.bottomNavigatorSpacer} />
        <div/>
        {footer}
      </>
    }
    </div>
  </Container>;
}

export { PageLayout };
