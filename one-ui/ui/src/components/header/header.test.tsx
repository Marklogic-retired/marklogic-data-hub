import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from '../../util/auth-context';
import Header from './header';

describe('Header component', () => {
  let wrapper;

  describe('when a user is not logged in', () => {
    const context = {
      user: {
        name: '',
        authenticated: false
      },
      userAuthenticated: jest.fn(),
      userNotAuthenticated: jest.fn()
    }

    beforeEach(() => {
      wrapper = mount(
        <Router>
          <AuthContext.Provider value={context}>
            <Header/>
          </AuthContext.Provider>
        </Router>
      )
    });

    it('should render correctly', () => {
      expect(wrapper.exists('#title')).toBe(true);
      expect(wrapper.exists('.anticon-user')).toBe(false);
    });
  });


  describe('when a user is logged in', () => {
    const context = {
      user: {
        name: 'admin',
        authenticated: true
      },
      userAuthenticated: jest.fn(),
      userNotAuthenticated: jest.fn()
    }

    beforeEach(() => {
      wrapper = mount(
        <Router>
          <AuthContext.Provider value={context}>
            <Header/>
          </AuthContext.Provider>
        </Router>
      )
    });

    it('should render correctly', () => {
      expect(wrapper.exists('#title')).toBe(true);
      expect(wrapper.exists('.anticon-user')).toBe(true);
    });
  });
});