import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import reportWebVitals from "./reportWebVitals";
import { HashRouter as Router } from "react-router-dom";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { UserProvider } from "@Context/UserContext";
import { CartProvider } from "@Context/CartContext";
import { AddressProvider } from "@Context/AddressContext";
import smoothscroll from "smoothscroll-polyfill";
import { StoreProvider } from "@Context/StoreContext";
import { PromoProvider } from "@Context/PromoContext";
import { PageProvider } from "@Context/PageContext";
import { grey } from "@material-ui/core/colors";
import ErrorBoundary from "./ErrorBoundary";
import { AlertProvider } from "@Context/AlertContext";
// import { getMobileOperatingSystem } from '@Util/function';

// kick off the polyfill!
smoothscroll.polyfill();

const theme = createMuiTheme({
  typography: {
    color: "#59595C",
    // platformFontWeight: getMobileOperatingSystem() === 'iOS' ? '900' : '700',
    // platformFontWeightMedium: getMobileOperatingSystem() === 'iOS' ? '700' : '500',
    // platformFontWeightLight: getMobileOperatingSystem() === 'iOS' ? '500' : '300',
    platformFontWeightMax: '900',
    platformFontWeight: '700',
    platformFontWeightMedium: '500',
    platformFontWeightLight: '300',
    fontFamily: 'din_regular, din_bold, din_light, din_medium, din_pro_bold, "DINBold-Bold"',
  },
  palette: {
    primary: {
      main: "#1E91CF",
      light: "#cfe4e9",
      lighter: "#F4F9FC",
      contrastText: "#fff",
    },
    secondary: {
      main: "#fff",
    },
    success: {
      main: "#00a041",
    },
    backdrop: {
      main: "#00000000",
    },
    discount: {
      main: "#F96232",
    },
    customGrey: {
      dark: "#59595C",
      medium: "#6D6E71",
      light: "#A6A8AC",
      lighter: "#F2F2F7",
    },
  },
  overrides: {
    MuiInputBase: {
      root: {
        height: "100%",
      },
    },
    MuiCard: {
      root: {
        boxShadow: `0 0 5px ${grey[300]}`,
      },
    },
    MuiButton: {
      contained: {
        boxShadow: "none",
      },
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <ThemeProvider theme={theme}>
          <AlertProvider>
            <AddressProvider>
              <PromoProvider>
                <CartProvider>
                  <StoreProvider>
                    <UserProvider>
                      <PageProvider>
                        <App />
                      </PageProvider>
                    </UserProvider>
                  </StoreProvider>
                </CartProvider>
              </PromoProvider>
            </AddressProvider>
          </AlertProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
