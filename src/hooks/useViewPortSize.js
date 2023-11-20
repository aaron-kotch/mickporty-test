import { useLayoutEffect, useState, useRef } from "react";

const useViewPortSize = () => {

  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const resizeTimeoutRef = useRef();

  const getWindowInnerHeight = () => {
    clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = setTimeout(() => {
      const vpWidth = window.innerWidth;
      const vpHeight = window.innerHeight;
      setWidth(vpWidth);
      setHeight(vpHeight);
    }, 500);
  }

  useLayoutEffect(() => {
    window.addEventListener("resize", getWindowInnerHeight);

    return () => {
      window.removeEventListener("resize", getWindowInnerHeight);
    }
  }, [])

  return [width, height] 
}

export default useViewPortSize;
