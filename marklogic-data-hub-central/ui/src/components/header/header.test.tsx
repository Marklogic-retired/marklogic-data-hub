import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../util/user-context';
import Header from './header';
import data from '../../assets/mock-data/system-info.data';
import { userAuthenticated } from '../../assets/mock-data/user-context-mock';
import { Application } from '../../config/application.config';

describe('Header component', () => {

  afterEach(cleanup);

  test('should render correctly when a user is not logged in', () => {

    const { getByText, getByLabelText, queryByText } = render(
      <Router>
        <Header environment={data.environment}/>
      </Router>
    );
    
    expect(getByLabelText('header-logo')).toBeInTheDocument();
    expect(getByText(Application.title)).toBeInTheDocument();
    expect(getByLabelText('icon: question-circle')).toBeInTheDocument();
    expect(queryByText('icon: user')).not.toBeInTheDocument();
    //unauthenticated users get sent to default Marklogic docs 
    expect(document.querySelector('#help-link')).toHaveAttribute('href', 'https://docs.marklogic.com/datahub/');
  });

  test('should render correctly when a user is logged in', async () => {

    const { getByText, getByLabelText, rerender } = render(
      <Router>
        <UserContext.Provider value={userAuthenticated}>
          <Header environment = {{...data.environment, dataHubVersion: '5.3-SNAPSHOT'}}/>
        </UserContext.Provider>
      </Router>
    );
    expect(getByLabelText('header-logo')).toBeInTheDocument();
    expect(getByText(Application.title)).toBeInTheDocument();
    expect(getByText(data.environment.serviceName)).toBeInTheDocument();
    // expect(getByLabelText('icon: search')).toBeInTheDocument();
    expect(getByLabelText('icon: question-circle')).toBeInTheDocument();
    expect(getByLabelText('icon: user')).toBeInTheDocument();
    // expect(getByLabelText('icon: setting')).toBeInTheDocument();


    //verify correct version specific link when environment hub version data is set to '5.3-SNAPSHOT'
    expect(document.querySelector('#help-link')).toHaveAttribute('href', 'https://docs.marklogic.com/datahub/5.3');

    //verify correct version specific link given specific dataHub release version
    rerender(
      <Router>
        <UserContext.Provider value={userAuthenticated}>
          <Header environment = {{...data.environment, dataHubVersion: '5.2.1'}}/>
        </UserContext.Provider>
      </Router>
    );
    expect(document.querySelector('#help-link')).toHaveAttribute('href', 'https://docs.marklogic.com/datahub/5.2');

    //verify correct version specific link given multi-digit dataHub versions
    rerender(
      <Router>
        <UserContext.Provider value={userAuthenticated}>
          <Header environment = {{...data.environment, dataHubVersion: '5.64.123456'}}/>
        </UserContext.Provider>
      </Router>
    );
    expect(document.querySelector('#help-link')).toHaveAttribute('href', 'https://docs.marklogic.com/datahub/5.64');

  });

});
