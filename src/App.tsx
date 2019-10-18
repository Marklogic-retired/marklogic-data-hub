import React, { useContext, useEffect } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { AuthContext } from './util/auth-context';
import SearchProvider from './util/search-context';
import Header from './components/header/header';
import Home from './pages/Home';
import View from './pages/View';
import Browse from './pages/Browse';
import Detail from './pages/Detail';
import './App.scss';

interface Props extends RouteComponentProps<any> {}

const App: React.FC<Props> = ({history, location}) => {
  const { user } = useContext(AuthContext);

  document.title = 'Explorer'

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

  useEffect(() => {
    if (user.authenticated) {
      if (location.state) {
        history.push(location.state.from.pathname);
      } else {
        history.push('/view');
      }
    }
  }, [user]);

  return (
    <>
      <Header/>
      <SearchProvider>
        <Switch>
          <Route path="/" exact render={() => <Home/>}/>
          <PrivateRoute path="/view" exact component={View} />
          <PrivateRoute path="/browse" exact component={Browse}/>
          <PrivateRoute path="/detail/:pk/:uri" component={Detail}/>
        </Switch>
      </SearchProvider>
    </>
  );
}
export default withRouter(App);

