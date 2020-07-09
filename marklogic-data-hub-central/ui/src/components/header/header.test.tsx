import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../util/user-context';
import Header from './header';
import data from '../../assets/mock-data/system-info.data';
import { userAuthenticated, userNotAuthenticated } from '../../assets/mock-data/user-context-mock';
import { Application } from '../../config/application.config';

describe('Header component', () => {

  afterEach(cleanup);

  test('should render correctly when a user is not logged in', () => {

    const { getByText, getByLabelText, queryByText } = render(
      <Router>
        <UserContext.Provider value={userNotAuthenticated}>
          <Header environment={data.environment}/>
        </UserContext.Provider>
      </Router>
    )

    expect(getByLabelText('header-logo')).toBeInTheDocument();
    expect(getByText(Application.title)).toBeInTheDocument();
    expect(getByLabelText('icon: question-circle')).toBeInTheDocument();
    expect(queryByText('icon: user')).not.toBeInTheDocument();

  });

  test('should render correctly when a user is logged in', async () => {

    const { getByText, getByLabelText } = render(
      <Router>
        <UserContext.Provider value={userAuthenticated}>
          <Header environment={data.environment}/>
        </UserContext.Provider>
      </Router>
    )

    expect(getByLabelText('header-logo')).toBeInTheDocument();
    expect(getByText(Application.title)).toBeInTheDocument();
    expect(getByText(data.environment.serviceName)).toBeInTheDocument();
    // expect(getByLabelText('icon: search')).toBeInTheDocument();
    expect(getByLabelText('icon: question-circle')).toBeInTheDocument();
    // expect(getByLabelText('icon: setting')).toBeInTheDocument();
    expect(getByLabelText('icon: user')).toBeInTheDocument();
  });

});
