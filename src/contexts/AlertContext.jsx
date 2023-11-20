import React from "react";

const AlertContext = React.createContext({
  popUp: undefined,
  pushPopUp: () => { },
  popPopUp: () => { },
  alertPopUps: undefined,
  pushAlertPopUp: () => { },
  popAlertPopUp: () => { },
});

const AlertProvider = ({ children }) => {
  const [popUp, setPopUp] = React.useState([]); // control ConfirmDialog in App.js
  const [alertPopUps, setAlertPopUps] = React.useState([]); // control AlertDialog in App.js

  const pushPopUp = (popUpMsg) => {
    setPopUp((messages) => {
      const temp = [...messages];
      temp.push(popUpMsg);
      return temp;
    });
  }
  const popPopUp = () => {
    setPopUp((messages) => {
      const temp = [...messages];
      temp.pop();
      return temp;
    });
  }
  const pushAlertPopUp = (popUpMsgTitle, content) => {
    setAlertPopUps((messages) => {
      if (messages.length > 0 && popUpMsgTitle === messages[messages.length - 1].title) return messages;
      const temp = [...messages];
      const msgObj = { title: popUpMsgTitle, content: content }
      temp.push(msgObj);
      return temp;
    });
  }
  const popAlertPopUp = () => {
    setAlertPopUps((messages) => {
      const temp = [...messages];
      temp.pop();
      return temp;
    });
  }
  const tngGetStorage = (key, onSuccess) => {
    try {
      // eslint-disable-next-line no-undef
      my.getStorage({
        key: key,
        success: function (res) {
          // eslint-disable-next-line no-undef
          // my.alert({ title: "get key: " + key, content: res });
          if (!!res.data)
            onSuccess(res.data);
        },
        fail: function (res) {
          // eslint-disable-next-line no-undef
          // my.alert({ content: res.errorMessage });
        }
      });
    } catch (err) {

      // eslint-disable-next-line no-undef
      // my.alert({
      //   title: "err",
      //   content: `${err}`
      // })
    }
  }
  const tngSetStorage = (key, data) => {
    try {
      // eslint-disable-next-line no-undef
      my.setStorage({
        key: key,
        data: data,
        success: function () {
          // eslint-disable-next-line no-undef
          // my.alert({ title: "set key successfully: " + key });
        }
      });
    } catch (err) {
      ;
      // eslint-disable-next-line no-undef
      // my.alert({
      // title: "err",
      // content: `${err}`
      // })
    }
  }

  return (<><AlertContext.Provider value={{ popUp, pushPopUp, popPopUp, alertPopUps, pushAlertPopUp, popAlertPopUp, tngGetStorage, tngSetStorage }}>
    {children}
  </AlertContext.Provider></>)
};

const useAlertContext = () => {
  return React.useContext(AlertContext);
};

export { AlertProvider, useAlertContext };
