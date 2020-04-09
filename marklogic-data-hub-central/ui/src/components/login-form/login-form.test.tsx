import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import axiosMock from 'axios'
import LoginForm from './login-form';

jest.mock('axios');

describe('Login page test', () => {

  let hostField, userField, passField, loginBtn;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Verify login fields are rendered and can take input', async () => {
    axiosMock.get.mockImplementation(() => Promise.resolve({ status: 200, data: { isInitialized: false } }));
    const { getByPlaceholderText, getByText } = await render(<LoginForm />);
    hostField = getByPlaceholderText("Enter host name");
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText('Log In');
    expect(getByText('MarkLogic Host Name:')).toBeInTheDocument();
    expect(getByText('MarkLogic Credentials:')).toBeInTheDocument();

    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(hostField).toBeInTheDocument();
    expect(userField).toBeInTheDocument();
    expect(passField).toBeInTheDocument();
    expect(loginBtn).toBeInTheDocument();
    expect(loginBtn).toBeDisabled();

    fireEvent.change(hostField, { target: {value: 'localhost'} });
    expect(loginBtn).toBeDisabled();
    fireEvent.change(userField, { target: {value: 'user'} });
    expect(loginBtn).toBeDisabled();
    fireEvent.change(passField, { target: {value: 'pass'} });
    //Verifying that login button is enabled only when all three input fields are entered by user
    expect(loginBtn).toBeEnabled();

    expect(hostField).toHaveAttribute('value', 'localhost');
    expect(userField).toHaveAttribute('value', 'user');
    expect(passField).toHaveAttribute('value', 'pass');
  });

  test('Verify form error when input fields are empty', async () => {
    axiosMock.get.mockImplementation(() => Promise.resolve({ status: 200, data: { isInitialized: false } }));
    const { getByPlaceholderText, getByText } = await render(<LoginForm />);
    hostField = getByPlaceholderText("Enter host name");
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText('Log In');

    fireEvent.change(hostField, { target: {value: 'localhost'} });
    fireEvent.change(hostField, { target: {value: ''} });
    let hostnameError = getByText("Host name is required");
    expect(hostnameError).toBeInTheDocument();

    fireEvent.change(userField, { target: {value: 'user'} });
    fireEvent.change(userField, { target: {value: ''} });
    let usernameError = getByText("Username is required");
    expect(usernameError).toBeInTheDocument();

    fireEvent.change(passField, { target: {value: 'pass'} });
    fireEvent.change(passField, { target: {value: ''} });
    let passwordError = getByText("Password is required");
    expect(passwordError).toBeInTheDocument();
  });

  test('Verify host name field is not displayed if the environmentt is already intialized', async () => {
    axiosMock.get.mockImplementation(() => Promise.resolve({ status: 200, data: { isInitialized: true } }));
    await (() => {
      const { getByPlaceholderText, queryByPlaceholderText, getByText, queryByText } = render(<LoginForm />);
    
      expect(queryByPlaceholderText("Enter host name")).not.toBeInTheDocument();
      expect(queryByText('MarkLogic Host Name:')).not.toBeInTheDocument();
      expect(queryByText('MarkLogic Credentials:')).not.toBeInTheDocument();
      expect(getByPlaceholderText("Enter username")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter password")).toBeInTheDocument();
      expect(getByText('Log In')).toBeInTheDocument();
    });
  });

  test('Verify login with status==200', async () => {
    axiosMock.get.mockImplementation(() => Promise.resolve({ status: 200, data: { isInitialized: false } }));
    axiosMock.post.mockImplementationOnce(jest.fn(() => Promise.resolve({ status: 200, data: {} })));
    const { container, getByPlaceholderText, getByText } = await render(<LoginForm />);
    hostField = getByPlaceholderText("Enter host name");
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText('Log In');

    fireEvent.change(hostField, { target: {value: 'localhost'} });
    fireEvent.change(userField, { target: {value: 'validUser'} });
    fireEvent.change(passField, { target: {value: 'pass'} });
    await wait (()=> {
      fireEvent.submit(loginBtn);
    });
    let url = "/api/login"
    let payload = {"mlHost": "localhost", "password": "pass", "username": "validUser"};
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(container.querySelector('div .ant-alert-message')).not.toHaveValue();
  });

  test('Verify login with error status 400', async () => {
    axiosMock.get.mockImplementation(() => Promise.resolve({ status: 200, data: { isInitialized: false } }));
    axiosMock.post.mockImplementationOnce(jest.fn(() => Promise.reject({ response: {status: 400} })));
    
    let host = 'somehost'
    const { getByPlaceholderText, getByText } = await render(<LoginForm />);
    hostField = getByPlaceholderText("Enter host name");
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText('Log In');

    fireEvent.change(hostField, { target: {value: host} });
    fireEvent.change(userField, { target: {value: 'validUser'} });
    fireEvent.change(passField, { target: {value: 'pass'} });
    await wait (()=> {
      fireEvent.submit(loginBtn);
    });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(getByText('The host "' + host + '" was not found.')).toBeInTheDocument();
  });

  test('Verify login with error status 401', async () => {
    axiosMock.get.mockImplementation(() => Promise.resolve({ status: 200, data: { isInitialized: false } }));
    axiosMock.post.mockImplementationOnce(jest.fn(() => Promise.reject({ response: {status: 401} })));
    
    const { getByPlaceholderText, getByText } = await render(<LoginForm />);
    hostField = getByPlaceholderText("Enter host name");
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText('Log In');

    fireEvent.change(hostField, { target: {value: 'localhost'} });
    fireEvent.change(userField, { target: {value: 'validUser'} });
    fireEvent.change(passField, { target: {value: 'invalidPass'} });
    await wait (()=> {
      fireEvent.submit(loginBtn);
    });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(getByText('The username and password combination is not recognized by MarkLogic.')).toBeInTheDocument();
  });

  test('Verify login with error status 403', async () => {
    axiosMock.get.mockImplementation(() => Promise.resolve({ status: 200, data: { isInitialized: false } }));
    axiosMock.post.mockImplementationOnce(jest.fn(() => Promise.reject({ response: {status: 403} })));
    
    const { getByPlaceholderText, getByText } = await render(<LoginForm />);
    hostField = getByPlaceholderText("Enter host name");
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText('Log In');

    fireEvent.change(hostField, { target: {value: 'localhost'} });
    fireEvent.change(userField, { target: {value: 'invalidUser'} });
    fireEvent.change(passField, { target: {value: 'pass'} });
    await wait (()=> {
      fireEvent.submit(loginBtn);
    });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(getByText('User does not have the required permissions to run Data Hub.')).toBeInTheDocument();
  });

});