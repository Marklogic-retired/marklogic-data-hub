import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router} from "react-router-dom";
import App from "./App";
import UserProvider from "./util/user-context";

import * as serviceWorker from "./serviceWorker";

import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(
  <Router basename={process.env.PUBLIC_URL}>
    <UserProvider>
      <App />
    </UserProvider>
  </Router>, document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
