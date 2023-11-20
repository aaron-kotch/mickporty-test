import React, { useRef } from "react";
import { tNGCheckMember, userGetProfile } from "@API/api";
import { useAddressContext } from "./AddressContext";
import { useAlertContext } from "@Context/AlertContext";
import { routes } from "src/constants/routes.constant";
import { useHistory } from "react-router-dom";

const UserContext = React.createContext({
  user: { token: "" },
  isLoggedIn: false,
  isLoading: false,
  isNeedEmail: false,
  login: () => {},
  updateProfile: () => {},
});

const UserProvider = ({ children }) => {
  const history = useHistory();
  const { getFavAddr } = useAddressContext();
  const { pushAlertPopUp } = useAlertContext();
  const [user, setUser] = React.useState({
    token: "",
  });
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isUserLoading, setIsUserLoading] = React.useState(false);
  const loggingInRef = useRef(false);
  const [callback, setCallback] = React.useState(null);
  const [isNeedEmail, setIsNeedEmail] = React.useState(false);
  const [canCallCallback, setCanCallCallback] = React.useState(true);
  const setIsLoading = (value) => {
    setIsUserLoading(value);
  };

  // only used once after login
  React.useEffect(() => {
    if (loggingInRef.current && callback && canCallCallback) {
      loggingInRef.current = false;
      callback();
      setCallback(null);
    }
  }, [callback, canCallCallback, pushAlertPopUp]);

  const login = (callback, email = null) => {
    setIsLoading(true);
    setIsNeedEmail(false);
    try {
      // eslint-disable-next-line no-undef
      my.postMessage({ action: "login" });
      // eslint-disable-next-line no-undef
      my.onMessage = function (e) {
        if (e.error) {
          // user click back button
          setIsLoading(false);
        }
        if (e.action === "login") {
          // first assume user ady a FM user
          const email = "";
          return tNGCheckMember(e.authCode.authCode, email)
            .then((res) => {
              // check if the firstUserLogin === "TNGFirstAttempt"
              // if true, direct them to signIn page
              // call callbacks contain history.push except applying promocode
              // so we need to append history.push after those callback with history.push
              // redirect to signIn page
              // to test this: fake that the firstUserLogin === "TNGFirstAttempt" is true
              if (res.SignedToken) {
                let tempUser = { token: res.SignedToken };
                setUser(tempUser);
                setIsLoggedIn(true);
                getFavAddr(res.SignedToken);
                // call to get user profile info
                return userGetProfile(res.SignedToken)
                  .then((response) => {
                    setIsLoading(false);
                    // console.log('response.PrimaryEmail',response.PrimaryEmail)
                    loggingInRef.current = true;

                    // check if this is user first time using FM on TnG
                    if (res.firstUserLogin === "TNGFirstAttempt") {
                      setCanCallCallback(false);
                      history.push(routes.proceed);
                    }
                    setCallback(() => {
                      return () =>
                        callback(res.SignedToken, response.PrimaryEmail);
                    }); // set callback here wont have bug but at line 77 will trigger bug of not redirecting to orders page
                    const fulfilledValue = { ...tempUser, ...response };
                    setUser((tempUser) => fulfilledValue);
                    return fulfilledValue;
                  })
                  .catch((err) => {
                    pushAlertPopUp(
                      `Problem connecting to server. Please try again later`
                    );
                    setIsLoggedIn(true);
                    callback(tempUser.token);
                  });
              } else {
                my.postMessage({ action: "login error", error: err });
                pushAlertPopUp(
                  `Problem connecting to server. Please try again later`
                );
                throw new Error("SignedToken is null. Res from tNGCheckMember");
              }
            })
            .catch((err) => {
              // eslint-disable-next-line no-undef
              my.postMessage({ action: "login error", error: err });
              // if (err && err.Message.includes('No email is found')) {
              //   setIsNeedEmail(true)
              // }
            })
            .then(() => setIsLoading(false));
        } else if (e.action === "uploadFile") {
          if (e.body.statusCode !== "200") {
            if (e.body.error === 12) {
              pushAlertPopUp(`Failed! Image size exceeds 15 MB.`);
            } else {
              pushAlertPopUp(`Failed to upload image. Please try again`);
            }
          }
        }
      };
    } catch (error) {
      setIsLoading(false);
      let tempUser = {
        name: "Alia Arina",
        token:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1bmlxdWVfbmFtZSI6IiIsIm5hbWVpZCI6IjE5MDAwMTQ3NiIsIm5iZiI6MTY3MTQwOTg2MCwiZXhwIjoxNjc5MTg1ODYwLCJpYXQiOjE2NzE0MDk4NjAsImlzcyI6InNlbGYiLCJhdWQiOiJodHRwczovL2ZtZWNvbW1hZG1pbi5xbC5jb20ubXkvIn0.cc6AQoeHON5vMXKg4EgPsPa-uR72pZJsyrLa9Lvv5sY",
      };
      console.log(`Logged in as ${tempUser.name}.`);

      getFavAddr(tempUser.token);
      userGetProfile(tempUser.token).then((response) => {
        setUser({ ...tempUser, ...response });
      });
      setIsLoggedIn(true);
      // return error;
    }
  };

  const updateProfile = (value) => {
    // setIsLoading(true);
  };

  return (
    <>
      <UserContext.Provider
        value={{
          user,
          isLoggedIn,
          isNeedEmail,
          isUserLoading,
          login,
          updateProfile,
          setCanCallCallback,
          canCallCallback,
        }}
      >
        {children}
      </UserContext.Provider>
    </>
  );
};

const useUserContext = () => {
  return React.useContext(UserContext);
};

export { UserProvider, useUserContext };
