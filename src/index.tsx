import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import AuthProvider from './util/auth-context';
import SearchProvider from './util/search-context';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <Router>   
    <AuthProvider>  
      <SearchProvider>
        <App/>
      </SearchProvider>
    </AuthProvider>
  </Router>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
