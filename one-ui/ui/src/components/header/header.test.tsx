import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../util/user-context';
import Header from './header';

describe('Header component', () => {
  let wrapper;

  describe('when a user is not logged in', () => {
    const context = {
      user: {
        name: '',
        authenticated: false,
        redirect: false,
        error: jest.fn(),
        tableView: false
      },
      userAuthenticated: jest.fn(),
      userNotAuthenticated: jest.fn(),
      loginAuthenticated: jest.fn(),
      sessionAuthenticated: jest.fn(),
      handleError: jest.fn(),
      clearErrorMessage: jest.fn(),
      clearRedirect: jest.fn(),
      setTableView: jest.fn()
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

    it('should render correctly', () => {
      expect(wrapper.exists('#title')).toBe(true);
      expect(wrapper.exists('.anticon-question-circle')).toBe(true);
      expect(wrapper.exists('.anticon-user')).toBe(false);
    });
  });


  describe('when a user is logged in', () => {
    const context = {
      user: {
        name: 'admin',
        authenticated: true,
        redirect: false,
        error: jest.fn(),
        tableView: false
      },
      userAuthenticated: jest.fn(),
      userNotAuthenticated: jest.fn(),
      loginAuthenticated: jest.fn(),
      sessionAuthenticated: jest.fn(),
      handleError: jest.fn(),
      clearErrorMessage: jest.fn(),
      clearRedirect: jest.fn(),
      setTableView: jest.fn()
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

    it('should render correctly', () => {
      expect(wrapper.exists('#title')).toBe(true);
      expect(wrapper.exists('.tour')).toBe(true);
      expect(wrapper.exists('.anticon-search')).toBe(true);
      expect(wrapper.exists('.anticon-question-circle')).toBe(true);
      expect(wrapper.exists('.anticon-setting')).toBe(true);
      expect(wrapper.exists('.anticon-user')).toBe(true);
    });
  });
});
