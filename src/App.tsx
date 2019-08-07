import React, { useContext } from 'react';
import { Switch } from 'react-router';
import { Route } from 'react-router-dom';
import Header from './components/header/header';
import Home from './pages/Home';
import View from './pages/View';
import Browse from './pages/Browse';
import AuthProvider, { AuthContext } from './util/auth-context';
import './App.scss';

const App: React.FC = () => {
  const { user } = useContext(AuthContext);

  return (
    <AuthProvider>
      <Header/>
      <Switch>
        <Route path="/" exact component={Home}/>
        <Route path="/view" exact component={View}/>
        <Route path="/browse" exact component={Browse}/>
        {/* {user.authenticated ? (
          <>
            <Route path="/view" exact component={View}/>
            <Route path="/browse" exact component={Browse}/>
          </>
        ) : <Redirect to="/" />} */}
      </Switch>
    </AuthProvider>
  );
}
export default App;

