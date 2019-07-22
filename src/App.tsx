import React from 'react';
import { Switch } from 'react-router';
import { Route, Link } from 'react-router-dom';
import { Menu } from 'antd';
import Home from './pages/Home';
import Example from './pages/Example';
import './App.scss';

const App: React.FC = () => {
  // const [key, setKey] = useState('/');

  return (
    <div>
      <Menu mode="horizontal">
        <Menu.Item key="home">
          Home
          <Link to="/"/>
        </Menu.Item>
        <Menu.Item key="example">
          Entity Payload
          <Link to="/example"/>
        </Menu.Item>
      </Menu>

      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/example" exact component={Example} />
      </Switch>
    </div>
  );
}

export default App;
