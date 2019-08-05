import React, { useState } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect, withRouter } from 'react-router-dom';
import Header from './components/header/header';
import Home from './pages/Home';
import View from './pages/View';
import Browse from './pages/Browse';
import './App.scss';
const App: React.FC = () => {

 const [name, setName] = useState('');
 const [authentication, setAuthentication] = useState(false);
 
 const ProtectedRoute = ({ isAllowed, ...props }: any ) =>
   isAllowed ? <Route {...props}/> : <Redirect to="/"/>;

 const checkLogin = (username: string, password: string) => {
   console.log('test login username', username);
   console.log('test login pw', password);
   if(username === 'admin' && password === 'admin'){
    setAuthentication(true);
    console.log('logged in', authentication);
    setName(username);
    return(<Redirect to='/view'/>);
   }
 }

 const logout = () => {
   setAuthentication(false);
   console.log('logged out:', authentication);
   return(<Redirect to='/'/>);
}
 
 return (
   <>
     <Header auth={authentication} user={name} logout={logout}/>
     <Switch>
       <Route path="/" exact component={()=> <Home checkLogin={checkLogin}/>} />
       <ProtectedRoute
         isAllowed={authentication}
         path="/view"
         exact
         component={View}
       />
       <ProtectedRoute
         isAllowed={authentication}
         path="/browse"
         exact
         component={Browse}
       />
     </Switch>
   </>
 );
}
export default App;

