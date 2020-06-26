import React from 'react';
import { render } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import ConfirmationModal from './confirmation-modal';
import { ConfirmationType } from '../../types/modeling-types';

describe('Confirmation Modal Component', () => {

  test('can render identifier type confirmation', () => {
    let currentIdentifier = 'userId';
    let newIdentifier = 'customId';
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const { queryByText, getByText, getAllByText, rerender } =  render(
      <ConfirmationModal 
        isVisible={false}
        type={ConfirmationType.Identifer}
        boldTextArray={[currentIdentifier, newIdentifier]} 
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByText('Confirmation')).toBeNull();

    rerender(<ConfirmationModal 
      isVisible={true}
      type={ConfirmationType.Identifer}
      boldTextArray={[currentIdentifier, newIdentifier]} 
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getByText('Confirmation')).toBeInTheDocument();
    expect(getAllByText(currentIdentifier)).toHaveLength(3);
    expect(getByText(newIdentifier)).toBeInTheDocument();
    expect(getByText(/Each entity type is allowed a maximum of one identifier/i)).toBeInTheDocument();
    expect(getByText(/Are you sure you want to change the identifier from/i)).toBeInTheDocument();

    userEvent.click(getByText('Yes'));
    expect(confirmAction).toBeCalledTimes(1);

    userEvent.click(getByText('No'));
    expect(toggleModal).toBeCalledTimes(1);
  });

  test('can render delete type confirmation', () => {
    let entityName = 'Product';
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const { queryByText, getByText, getAllByText, rerender } =  render(
      <ConfirmationModal 
        isVisible={false}
        type={ConfirmationType.DeleteEntity}
        boldTextArray={[entityName]} 
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByText('Confirmation')).toBeNull();

    rerender(<ConfirmationModal 
      isVisible={true}
      type={ConfirmationType.DeleteEntity}
      boldTextArray={[entityName]} 
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getByText('Confirmation')).toBeInTheDocument();
    expect(getByText(entityName)).toBeInTheDocument();
    expect(getByText(/Permanently delete/i)).toBeInTheDocument();

    userEvent.click(getByText('Yes'));
    expect(confirmAction).toBeCalledTimes(1);

    userEvent.click(getByText('No'));
    expect(toggleModal).toBeCalledTimes(1);
  });

  test('can render delete type relationship warn confirmation', () => {
    let entityName = 'Product';
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const { queryByText, getByText, getAllByText, rerender } =  render(
      <ConfirmationModal 
        isVisible={false}
        type={ConfirmationType.DeleteEntityRelationshipWarn}
        boldTextArray={[entityName]} 
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByText('Confirmation')).toBeNull();

    rerender(<ConfirmationModal 
      isVisible={true}
      type={ConfirmationType.DeleteEntityRelationshipWarn}
      boldTextArray={[entityName]} 
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getByText('Confirmation')).toBeInTheDocument();
    expect(getAllByText(entityName)).toHaveLength(3);
    expect(getByText('Existing entity type relationships.')).toBeInTheDocument();

    userEvent.click(getByText('Yes'));
    expect(confirmAction).toBeCalledTimes(1);

    userEvent.click(getByText('No'));
    expect(toggleModal).toBeCalledTimes(1);
  });

  test('can render delete type step warn confirmation', () => {
    let entityName = 'PersonXML';
    let stepValues = ['Person-Mapping-XML']
    let toggleModal = jest.fn();
    let confirmAction = jest.fn();

    const { queryByText, getByText, getAllByText, rerender, getByLabelText } =  render(
      <ConfirmationModal 
        isVisible={false}
        type={ConfirmationType.DeleteEntityStepWarn}
        boldTextArray={[entityName]} 
        stepValues={stepValues}
        toggleModal={toggleModal}
        confirmAction={confirmAction}
      />
    );

    expect(queryByText('Delete: Entity Type in Use')).toBeNull();

    rerender(<ConfirmationModal 
      isVisible={true}
      type={ConfirmationType.DeleteEntityStepWarn}
      boldTextArray={[entityName]} 
      stepValues={stepValues}
      toggleModal={toggleModal}
      confirmAction={confirmAction}
    />);

    expect(getByText('Delete: Entity Type in Use')).toBeInTheDocument();
    expect(getAllByText(entityName)).toHaveLength(1);
    expect(getByText('Entity type is used in one or more steps.')).toBeInTheDocument();
    expect(getByText('Show Steps...')).toBeInTheDocument();
    expect(queryByText('Hide Steps...')).toBeNull();

    userEvent.click(getByLabelText('toggle-steps'));
    expect(getByText('Hide Steps...')).toBeInTheDocument();
    expect(queryByText('Show Steps...')).toBeNull();
    expect(getByText(stepValues[0])).toBeInTheDocument();

    userEvent.click(getByLabelText('toggle-steps'));
    expect(getByText('Show Steps...')).toBeInTheDocument();
    expect(queryByText('Hide Steps...')).toBeNull();

    userEvent.click(getByText('Close'));
    expect(toggleModal).toBeCalledTimes(1);
  });
});

