import React from 'react';
import { Switch } from 'react-router';
import { Route } from 'react-router-dom';
import Header from './components/header/header';
import Home from './pages/Home';
import View from './pages/View';
import Browse from './pages/Browse';
import './App.scss';

const App: React.FC = () => {
  return (
    <>
      <Header/>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/view" exact component={View} />
        <Route path="/browse" exact component={Browse} />
      </Switch>
    </>
  );
}

export default App;
