// index.js
import { AuthProvider } from "react-oidc-context";
import React from "react";
import ReactDOM from "react-dom/client";
import store from "./redux/store";
import { Provider } from "react-redux";
import App from "./App";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.ca-central-1.amazonaws.com/ca-central-1_11wzZqvpp",
    client_id: "1kqpsrdup21vkh711qti1dtrj7",
    redirect_uri: "http://localhost:3000/home",
    response_type: "code",
    scope: "email openid phone",
    automaticSilentRenew: true,
  };

const root = ReactDOM.createRoot(document.getElementById("root"));

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>  {/* Wrap the app in Redux Provider */}
      <AuthProvider {...cognitoAuthConfig}>  {/* Wrap the app in Cognito's AuthProvider */}
        <App />
      </AuthProvider>
    </Provider>
  );