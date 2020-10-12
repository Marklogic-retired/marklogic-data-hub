import React from 'react';
import { render } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import StructuredTypeModal from './structured-type-modal';
import { ModelingTooltips } from '../../../config/tooltips.config';
import { entityDefinitionsArray } from '../../../assets/mock-data/modeling';
import { ModelingContext } from '../../../util/modeling-context';
import { entityNamesArray } from '../../../assets/mock-data/modeling-context-mock';

describe('Structured Type Modal Component', () => {

  test('Modal is not visible', () => {
    const { queryByText } = render(
      <StructuredTypeModal
        isVisible={false}
        entityDefinitionsArray={[]}
        toggleModal={jest.fn()}
        updateStructuredTypesAndHideModal={jest.fn()}
      />);

    expect(queryByText('Add New Structured Property Type')).toBeNull();
  });

  test('can create structured property with valid name', () => {
    const toggleModal = jest.fn();
    const updateStructuredTypesAndHideModal = jest.fn();

    const { getByText, getByPlaceholderText } = render(
      <StructuredTypeModal
        isVisible={true}
        entityDefinitionsArray={entityDefinitionsArray}
        toggleModal={toggleModal}
        updateStructuredTypesAndHideModal={updateStructuredTypesAndHideModal}
      />);

    expect(getByText('Add New Structured Property Type')).toBeInTheDocument();
    userEvent.type(getByPlaceholderText('Enter name'), 'Product');

    userEvent.click(getByText('Add'));
    expect(updateStructuredTypesAndHideModal).toHaveBeenCalledTimes(1);
    expect(toggleModal).toHaveBeenCalledTimes(1);
  });

  test('can do error handling for duplicate name and name regex validation ', () => {
    const toggleModal = jest.fn();
    const updateStructuredTypesAndHideModal = jest.fn();

    const { getByText, getByLabelText } = render(
      <ModelingContext.Provider value={entityNamesArray}>
        <StructuredTypeModal
          isVisible={true}
          entityDefinitionsArray={entityDefinitionsArray}
          toggleModal={toggleModal}
          updateStructuredTypesAndHideModal={updateStructuredTypesAndHideModal}
        />
      </ModelingContext.Provider>
    );

    expect(getByText('Add New Structured Property Type')).toBeInTheDocument();
    userEvent.type(getByLabelText('structured-input-name'), 'Address');
    userEvent.click(getByText('Add'));
    expect(getByText('A structured type already exists with a name of Address')).toBeInTheDocument();

    userEvent.clear(getByLabelText('structured-input-name'));
    userEvent.type(getByLabelText('structured-input-name'), '123-Name');
    userEvent.click(getByText('Add'));
    expect(getByText(ModelingTooltips.nameRegex)).toBeInTheDocument();

    userEvent.clear(getByLabelText('structured-input-name'));
    userEvent.type(getByLabelText('structured-input-name'), 'address');
    userEvent.click(getByText('Add'));
    expect(getByText('A property type already exists with a name of address')).toBeInTheDocument();

    expect(updateStructuredTypesAndHideModal).toHaveBeenCalledTimes(0);
    expect(toggleModal).toHaveBeenCalledTimes(0);

    userEvent.click(getByText('Cancel'));
    expect(toggleModal).toHaveBeenCalledTimes(1);
  });
});

