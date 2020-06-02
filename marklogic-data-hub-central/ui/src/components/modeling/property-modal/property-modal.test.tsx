import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import PropertyModal from './property-modal';
import { definitionsParser } from '../../../util/data-conversion';
import { propertyTableEntities } from '../../../assets/mock-data/modeling';
import { ModelingTooltips } from '../../../config/tooltips.config';
import { ModelingContext } from '../../../util/modeling-context';
import { entityNamesArray } from '../../../assets/mock-data/modeling-context-mock';

describe('Property Modal Component', () => {
  test('Modal is not visible', () => {
    const { queryByText } =  render(
    <PropertyModal 
      entityName=''
      entityDefinitionsArray={[]}
      isVisible={false} 
      toggleModal={jest.fn()}
      addPropertyToDefinition={jest.fn()}
    />);

    expect(queryByText('Add Property')).toBeNull();
  });

  test('Add a basic property type and duplicate name validation', async () => {
    let entityType = propertyTableEntities.find( entity => entity.entityName === 'Customer' );
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let mockAdd = jest.fn();

    const { getByLabelText, getByPlaceholderText, getByText, queryByLabelText } =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal 
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true} 
          toggleModal={jest.fn()}
          addPropertyToDefinition={mockAdd}
        />
      </ModelingContext.Provider>
    );

    await userEvent.type(getByLabelText('input-name'), 'name');
    userEvent.click(getByText('Add'));
    expect(getByText('A property already exists with a name of name')).toBeInTheDocument();

    userEvent.clear(getByLabelText('input-name'));
    await userEvent.type(getByLabelText('input-name'), 'new-property-name');

    userEvent.click(getByPlaceholderText('Select the property type'));
    userEvent.click(getByText('string'));
    
    const identifierRadio = screen.getByLabelText('identifier-yes')
    fireEvent.change(identifierRadio, { target: { value: "yes" } });
    expect(identifierRadio['value']).toBe('yes');

    const multipleRadio = screen.getByLabelText('multiple-yes')
    fireEvent.change(multipleRadio, { target: { value: "yes" } });
    expect(multipleRadio['value']).toBe('yes');

    const piiRadio = screen.getByLabelText('pii-no')
    fireEvent.change(piiRadio, { target: { value: "no" } });
    expect(piiRadio['value']).toBe('no');

    const advancedSearchCheckbox = screen.getByLabelText('Advanced Search')
    fireEvent.change(advancedSearchCheckbox, { target: { checked: true } });
    expect(advancedSearchCheckbox).toBeChecked();

    userEvent.click(getByText('Add'));
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  test('Add a Property with relationship type', async () => {
    let entityType = propertyTableEntities.find( entity => entity.entityName === 'Customer' );
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let mockAdd = jest.fn();

    const { getByLabelText, getByPlaceholderText, getByText, queryByLabelText } =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal 
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true} 
          toggleModal={jest.fn()}
          addPropertyToDefinition={mockAdd}
        />
      </ModelingContext.Provider>
    );

    await userEvent.type(getByPlaceholderText('Enter the property name'), 'Entity-Property');

    userEvent.click(getByPlaceholderText('Select the property type'));
    userEvent.click(getByText('Relationship'));
    userEvent.click(getByText('Concept'));

    expect(screen.queryByLabelText('identifier-yes')).toBeNull();
    expect(screen.queryByLabelText('pii-yes')).toBeNull();
    expect(screen.queryByLabelText('Sort')).toBeNull();
    expect(screen.queryByLabelText('Facet')).toBeNull();
    expect(screen.queryByLabelText('Advanced Search')).toBeNull();
  
    const multipleRadio = screen.getByLabelText('multiple-no')
    fireEvent.change(multipleRadio, { target: { value: "no" } });
    expect(multipleRadio['value']).toBe('no');

    userEvent.click(getByText('Add'));
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  test('can display error message for property name and type inputs and press cancel', async () => {
    let entityType = propertyTableEntities.find( entity => entity.entityName === 'Customer' );
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let mockAdd = jest.fn();

    const { getByLabelText, getByText, getByPlaceholderText } =  render(
      <PropertyModal 
        entityName={entityType?.entityName}
        entityDefinitionsArray={entityDefninitionsArray}
        isVisible={true} 
        toggleModal={jest.fn()}
        addPropertyToDefinition={mockAdd}
      />);

    await userEvent.type(getByLabelText('input-name'), '123-name');
    userEvent.click(getByText('Add'));
    expect(getByText(ModelingTooltips.nameRegex)).toBeInTheDocument();
    userEvent.clear(getByLabelText('input-name'));

    await userEvent.type(getByLabelText('input-name'), 'name2');
    userEvent.click(getByText('Add'));
    expect(getByText('Type is required')).toBeInTheDocument();

    userEvent.click(getByPlaceholderText('Select the property type'));
    userEvent.click(getByText('More string types'));
    userEvent.click(getByText('hexBinary'));

    userEvent.click(getByText('Cancel'));
    expect(mockAdd).toHaveBeenCalledTimes(0);
  });
});

