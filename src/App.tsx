import React, { useContext } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from './util/auth-context';
import Header from './components/header/header';
import Home from './pages/Home';
import View from './pages/View';
import Browse from './pages/Browse';
import Detail from './pages/Detail';
import './App.scss';

const App: React.FC = () => {
  const { user } = useContext(AuthContext);

  const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={ props => (
      user.authenticated === true ? (
        <Component {...props}/>
      ) : (
        <Redirect to={{
          pathname: '/',
          state: { from: props.location }
        }}/>
      )
    )}/>
  )

  return (
    <>
      <Header/>
      <Switch>
        <Route path="/" exact render={() => <Home/>}/>
        <PrivateRoute path="/view" exact component={View} />
        <PrivateRoute path="/browse" exact component={Browse}/>
        <PrivateRoute path="/detail" exact component={Detail}/>
      </Switch>
    </>
  );
}
export default App;

