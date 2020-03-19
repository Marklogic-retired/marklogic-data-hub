import React from 'react';
import { render } from '@testing-library/react'
import InstallForm from './install-form';
import {BrowserRouter} from "react-router-dom";


describe('Install page', () => {

  test('login fields renders ', () => {
      const { container } = render(<BrowserRouter><InstallForm /></BrowserRouter>);

      expect(container.querySelector('.anticon-check-circle')).toBeInTheDocument();
      expect(container.querySelector('#directory')).toBeInTheDocument();
  });

});
