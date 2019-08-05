import React, { useState } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect } from 'react-router-dom';
import Header from './components/header/header';
import Home from './pages/Home';
import View from './pages/View';
import Browse from './pages/Browse';
import './App.scss';
const App: React.FC = () => {
 const [authentication, setAuthentication] = useState(false);

 const ProtectedRoute = ({ isAllowed, ...props }: any ) =>
   isAllowed ? <Route {...props}/> : <Redirect to="/"/>;
 const checkLogin = (username: string, password: string) => {
   console.log('test login username', username);
   console.log('test login pw', password);
   setAuthentication(true)  
 }

 const logout = () => {
   setAuthentication(false);
   console.log('logged out');
 }
 
 return (
   <>
     <Header/>
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

