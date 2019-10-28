import React, { useContext, useEffect,useState } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { AuthContext } from './util/auth-context';
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

  const { user, clearErrorMessage, clearRedirect } = useContext(AuthContext);

  document.title = 'Explorer';
  const [asyncError, setAsyncError] = useState(false);
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
    if (user.authenticated && location.pathname === '/'){
      history.push('/view');
    }

    if (user.authenticated && user.redirect) {
      clearRedirect();
      if (location.state ) {
        history.push(location.state.from.pathname);
      } else {
        history.push('/view');
      }
    }

    if (user.error.type === 'MODAL') {
      setAsyncError(true);
    } else {
      setAsyncError(false);
    }
  }, [user]);

  const destroyModal = () => {
    clearErrorMessage();
    setAsyncError(false);
  }

  return (
    <>
      <Header/>
      <SearchProvider>
      { !asyncError && (
        <Switch>
          <Route path="/" exact component={Home}/>
          <PrivateRoute path="/view" exact component={View} />
          <PrivateRoute path="/browse" exact component={Browse}/>
          <PrivateRoute path="/detail/:pk/:uri" component={Detail}/>
          <Route component={NoMatchRedirect}/>
        </Switch> 
        )}
        <Modal visible={asyncError} title={user.error.title} onCancel={() => destroyModal()} onOk={() => destroyModal()}>
          <p>{user.error.message}</p>
        </Modal>
      </SearchProvider>
    </>
  );
}
export default withRouter(App);

