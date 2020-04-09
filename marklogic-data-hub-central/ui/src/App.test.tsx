import React from 'react';
import { shallow } from 'enzyme';
import App from './App';

describe('App component', () => {
  it('should render correctly', () => {
    shallow(<App />);
  });
});