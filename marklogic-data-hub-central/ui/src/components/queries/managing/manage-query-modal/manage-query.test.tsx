import React from 'react';
import { fireEvent, render } from "@testing-library/react";
import ManageQuery from './manage-query';


describe('Query Modal Component', () => {

    test('Modal is not visible', () => {
      const { queryByTestId } =  render(<ManageQuery />);

      expect(queryByTestId('manage-queries-modal')).toBeNull();
    });

    test('Modal is visible', () => {
        const { getByTestId } =  render(<ManageQuery />);    

        expect(getByTestId('manage-queries-modal-icon')).toBeInTheDocument();
        fireEvent.click(getByTestId('manage-queries-modal-icon'));
        expect(getByTestId('manage-queries-modal')).toBeInTheDocument();
      });

});