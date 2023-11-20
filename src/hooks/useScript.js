import { useEffect, useState } from 'react';

// Track if other component is using the script before removing from body
let scriptSubscriber = {};

const useScript = (url, scriptObjectName) => {

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {

    // Check if the library has already loaded, we don't want to load multiple times
    if (!!scriptObjectName && !!window[scriptObjectName]) {
      return;
    }

    const script = document.createElement('script');

    script.src = url;
    script.async = true;
    script.onload = () => setHasLoaded(true);

    document.body.appendChild(script);
    
    if (!scriptSubscriber[scriptObjectName]) {
      scriptSubscriber[scriptObjectName] = 1;
    } else {
      scriptSubscriber[scriptObjectName] = scriptSubscriber[scriptObjectName] + 1;
    }

    return () => {
      scriptSubscriber[scriptObjectName] = scriptSubscriber[scriptObjectName] - 1;
      if (scriptSubscriber[scriptObjectName] < 1) {
        document.body.removeChild(script);
        window[scriptObjectName] = undefined;
      }
        
    }
  }, [scriptObjectName, url]);

  return [ hasLoaded ]
};

export default useScript;