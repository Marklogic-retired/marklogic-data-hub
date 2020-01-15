import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { mount } from 'enzyme';
import Header from './header';
import { UserContext } from '../../util/user-context';

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
          <UserContext.Provider value={context}>
            <Header/>
          </UserContext.Provider>
        </Router>
      )
    });

    it('should render correctly with no user logged in', () => {
      expect(wrapper.exists('#logo')).toBe(true);
      expect(wrapper.exists('#title')).toBe(true);
      expect(wrapper.exists('#help-icon')).toBe(true);
      expect(wrapper.exists('#menu-links')).toBe(false);
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
          <UserContext.Provider value={context}>
            <Header/>
          </UserContext.Provider>
        </Router>
      )
    });

    it('should render correctly with a user logged in', () => {
      expect(wrapper.exists('#logo')).toBe(true);
      expect(wrapper.exists('#title')).toBe(true);
      expect(wrapper.exists('#help-icon')).toBe(true);
      expect(wrapper.exists('#menu-links')).toBe(true);
      expect(wrapper.find('#username').text()).toContain(context.user.name);
    });
  });
});