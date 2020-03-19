import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './login-form';

test('Login Form renders', async () => {
  const { getByTestId } = render(
    <LoginForm/>,
  )

  let username = getByTestId('username');
  let password = getByTestId('password');

  await userEvent.type(username, 'user-explorer');
  await userEvent.type(password, 'password-explorer');

  expect(username).toHaveAttribute('value', 'user-explorer');
  expect(password).toHaveAttribute('value', 'password-explorer');
});