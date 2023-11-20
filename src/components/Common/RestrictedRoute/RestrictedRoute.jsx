import { useUserContext } from "@Context/UserContext";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import { routes } from "src/constants/routes.constant";

const RestrictedRoute = (props) => {
  const { isLoggedIn } = useUserContext();
  return isLoggedIn ? <Route {...props} /> : <Redirect to={routes.noAccess} />
};

export { RestrictedRoute };
