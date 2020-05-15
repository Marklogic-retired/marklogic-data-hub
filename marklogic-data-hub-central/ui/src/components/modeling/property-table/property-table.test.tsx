import React from 'react';
import { render, wait } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import PropertyTable from './property-table';

import { propertyTableEntities } from '../../../assets/mock-data/modeling';

describe('Entity Modeling Property Table Component', () => {
  test('Property Table renders an Entity with no properties', () => {
    let entityName = 'NewEntity';
    let definitions = { NewEntity : { properties: {} } };
    const { getByText } =  render(
      <PropertyTable entityName={entityName} definitions={definitions}/>
    )

    expect(getByText('Add Property')).toBeInTheDocument();
    expect(getByText('Property Name')).toBeInTheDocument();
    expect(getByText('Multiple')).toBeInTheDocument();
    expect(getByText('Sort')).toBeInTheDocument();
    expect(getByText('Advanced Search')).toBeInTheDocument();
  });

  test('Property Table renders with basic datatypes', () => {
    let entityName = propertyTableEntities[0].entityName;
    let definitions = propertyTableEntities[0].model.definitions;
    const { getByText, getByTestId } =  render(
      <PropertyTable entityName={entityName} definitions={definitions}/>
    )

    expect(getByTestId('identifier-concept_name')).toBeInTheDocument();
    expect(getByTestId('multiple-synonyms')).toBeInTheDocument();
    expect(getByTestId('pii-source_concept_code')).toBeInTheDocument();

    expect(getByText('invalid_reason')).toBeInTheDocument();
    expect(getByText('vocabulary')).toBeInTheDocument();
    expect(getByText('synonyms')).toBeInTheDocument();
    expect(getByText('unsignedLong')).toBeInTheDocument();
  });

  test('Property Table renders with structured and external datatypes', async () => {
    let entityName = propertyTableEntities[2].entityName;
    let definitions = propertyTableEntities[2].model.definitions;
    const { getByText, getByTestId, getAllByText, getAllByTestId, getAllByRole } =  render(
      <PropertyTable entityName={entityName} definitions={definitions}/>
    )

    expect(getByTestId('identifier-customerId')).toBeInTheDocument();
    expect(getByTestId('multiple-orders')).toBeInTheDocument();
    expect(getAllByTestId('add-struct-Address')).toHaveLength(2); 

    expect(getByText('Order')).toBeInTheDocument();
    expect(getByText('integer')).toBeInTheDocument();
    expect(getByText('date')).toBeInTheDocument();
    expect(getByText('billing')).toBeInTheDocument();
    expect(getByText('shipping')).toBeInTheDocument();

    expect(getAllByText('string')).toHaveLength(1);
    expect(getAllByText('Address')).toHaveLength(2);
    
    // Table expansion shipping property -> Address Structure type
    await wait(() => {
      userEvent.click(getAllByRole('button')[1]);
    });

    expect(getByTestId('add-struct-Zip')).toBeInTheDocument();
    expect(getAllByText(/zip/i)).toHaveLength(2);
    expect(getAllByText('street')).toHaveLength(1);
    expect(getAllByText('state')).toHaveLength(1);

    // Table expansion for shipping property -> Zip structure type
    await wait(() => {
      userEvent.click(getAllByRole('button')[2]);
    });

    expect(getByText('fiveDigit')).toBeInTheDocument();
    expect(getByText('plusFour')).toBeInTheDocument();

    // Table expansion for billing property, Address structure type
    await wait(() => {
      userEvent.click(getAllByRole('button')[3]);
    });

    expect(getAllByTestId('add-struct-Zip')).toHaveLength(2); 
    expect(getAllByText(/zip/i)).toHaveLength(4);
    expect(getAllByText('street')).toHaveLength(2);
    expect(getAllByText('state')).toHaveLength(2);

    // Table expansion for billing property -> Zip structure type
    await wait(() => {
      userEvent.click(getAllByRole('button')[4]);
    });

    expect(getAllByText('fiveDigit')).toHaveLength(2);
    expect(getAllByText('plusFour')).toHaveLength(2);
    expect(getAllByText('string')).toHaveLength(11);
  });
});

