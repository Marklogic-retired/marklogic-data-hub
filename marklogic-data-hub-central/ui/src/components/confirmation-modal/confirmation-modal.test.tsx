import React from 'react';
import { render } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import ConfirmationModal from './confirmation-modal';
import { ConfirmationType } from '../../types/modeling-types';

describe('Confirmation Modal Component', () => {

  test('can render identifier confirmation', () => {
    let currentIdentifier = 'userId';
    let newIdentifier = 'customId';
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const { queryByText, getByText, getAllByText, rerender } =  render(
      <ConfirmationModal 
        isVisible={false}
        type={ConfirmationType.identifer}
        boldTextArray={[currentIdentifier, newIdentifier]} 
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByText('Confirmation')).toBeNull();

    rerender(<ConfirmationModal 
      isVisible={true}
      type={ConfirmationType.identifer}
      boldTextArray={[currentIdentifier, newIdentifier]} 
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getAllByText(currentIdentifier)).toHaveLength(3);
    expect(getByText(newIdentifier)).toBeInTheDocument();
    expect(getByText(/Each entity type is allowed a maximum of one identifier/i)).toBeInTheDocument();
    expect(getByText(/Are you sure you want to change the identifier from/i)).toBeInTheDocument();

    userEvent.click(getByText('Yes'));
    expect(confirmAction).toBeCalledTimes(1);

    userEvent.click(getByText('No'));
    expect(toggleModal).toBeCalledTimes(1);
  });
});

