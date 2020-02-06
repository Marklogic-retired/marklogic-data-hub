import React, { useContext, useEffect,useState, useReducer } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { UserContext } from './util/user-context';
import SearchProvider from './util/search-context';
import Header from './components/header/header';
import Home from './pages/Home';
import View from './pages/View';
import Browse from './pages/Browse';
import Detail from './pages/Detail';
import NoMatchRedirect from './pages/no-match-redirect'
import { Modal } from 'antd';
import './App.scss';

interface Props extends RouteComponentProps<any> {}

const App: React.FC<Props> = ({history, location}) => {
  document.title = 'Explorer';
  const { user, clearErrorMessage, clearRedirect } = useContext(UserContext);
  const [asyncError, setAsyncError] = useState(false);

  const PrivateRoute = ({ children, ...rest }) => (
    <Route {...rest} render={ props => (
      user.authenticated === true ? (
        children
      ) : (
        <Redirect push={true} to={{
          pathname: '/',
          state: { from: props.location }
        }}/>
      )
    )}/>
  )

  useEffect(() => {
    if (user.authenticated && user.redirect ){
      clearRedirect();
      history.push(user.pageRoute);
    }
    if (user.authenticated && location.pathname === '/' ){
      history.push(user.pageRoute);
    }
    if (user.authenticated && location.state && !user.redirect && user.error.type === '') {
      if (location.state.hasOwnProperty('from')) {
        history.push(location.state['from']['pathname']);
      }
    }
    if (user.redirect && user.error.type !== '') {
      clearRedirect();
      history.push('/error');
    }
    if (user.error.type === 'MODAL') {
      setAsyncError(true);
    } else {
      setAsyncError(false);
    }
  }, [user]);

  const onOk = () => {
    clearErrorMessage();
    setAsyncError(false);
  }
  const onCancel = () => {
    setAsyncError(false);
    history.push('/error');
  }

  return (
    <>
      <Header/>
      <SearchProvider>
      { !asyncError && (
        <Switch>
          <Route path="/" exact component={Home}/>
          <PrivateRoute path="/view" exact>
            <View/>
          </PrivateRoute>
          <PrivateRoute path="/browse" exact>
            <Browse/>
          </PrivateRoute>
          <PrivateRoute path="/detail/:pk/:uri">
            <Detail/>
          </PrivateRoute>
          <Route component={NoMatchRedirect}/>
        </Switch> 
      )}
      </SearchProvider>
      <Modal visible={asyncError} title={user.error.title} onCancel={() => onCancel()} onOk={() => onOk()}>
        <p data-cy="async-error-message">{user.error.message}</p>
      </Modal>
    </>
  );
}
export default withRouter(App);

