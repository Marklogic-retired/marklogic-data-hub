import React from 'react';
import { Switch } from 'react-router';
import { Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import './App.scss';

const App: React.FC = () => {
  return (
    <div className="App">
      <Switch>
        <Route path="/" exact component={Home} />
      </Switch>
    </div>
  );
}

export default App;
