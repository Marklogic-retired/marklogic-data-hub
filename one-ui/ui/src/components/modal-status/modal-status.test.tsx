import React from 'react';
import { render } from '@testing-library/react';
import ModalStatus from './modal-status';

describe('Modal Status Component', () => {
  test('Modal session status renders', () => {
    const { getByTestId } = render( <ModalStatus visible={true} />);
      expect(getByTestId('inactivity')).toBeInTheDocument();
  })
});


