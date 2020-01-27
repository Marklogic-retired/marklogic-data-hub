import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from '../../util/auth-context';
import ProjectInfoHeader from './project-info-header';

describe('Project Info Header component', () => {
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
          <AuthContext.Provider value={context}>
            <ProjectInfoHeader/>
          </AuthContext.Provider>
        </Router>
      )
    });

    it('should render correctly', () => {
      expect(wrapper.exists('#title')).toBe(false);
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
          <AuthContext.Provider value={context}>
            <ProjectInfoHeader/>
          </AuthContext.Provider>
        </Router>
      )
    });

    it('should render correctly', () => {
      expect(wrapper.exists('#title')).toBe(true);
    });
  });
});