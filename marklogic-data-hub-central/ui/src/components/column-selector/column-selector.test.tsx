import React from 'react';
import ColumnSelector from './column-selector';
import { render, fireEvent } from '@testing-library/react';
import {entityPropertyDefinitions, selectedPropertyDefinitions} from "../../assets/mock-data/entity-search";

let columns = ['id', 'firstName', 'lastName', 'age', 'phoneNumber.work']

describe('Column selector component', () => {

  test('Verify popover is visible', () => {
    const { queryByTestId } = render(<ColumnSelector popoverVisibility={true} setPopoverVisibility={jest.fn()} entityPropertyDefinitions={entityPropertyDefinitions} selectedPropertyDefinitions={selectedPropertyDefinitions} setColumnSelectorTouched={jest.fn()} columns={columns}/>);
    expect(queryByTestId('column-selector-popover')).toBeInTheDocument();
  });

  test('Verify entity properties render', () => {
    const { getByText } = render(<ColumnSelector popoverVisibility={true} setPopoverVisibility={jest.fn()} entityPropertyDefinitions={entityPropertyDefinitions} selectedPropertyDefinitions={selectedPropertyDefinitions} setColumnSelectorTouched={jest.fn()} columns={columns}/>);
    expect(getByText('name')).toBeInTheDocument();
  });

  test('Verify entity property is searchable', () => {
    const { getByPlaceholderText, getByText } = render(<ColumnSelector popoverVisibility={true} setPopoverVisibility={jest.fn()} entityPropertyDefinitions={entityPropertyDefinitions} selectedPropertyDefinitions={selectedPropertyDefinitions} setColumnSelectorTouched={jest.fn()} columns={columns}/>);
    const searchInput = getByPlaceholderText('Search') as HTMLInputElement;
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'customerSince' } })
    expect(searchInput.value).toBe('customerSince')
    expect(getByText('customerSince')).toBeInTheDocument();
  });

  test('Verify cancel button closes popover', () => {
    const { getByText } = render(<ColumnSelector popoverVisibility={true} setPopoverVisibility={jest.fn()} entityPropertyDefinitions={entityPropertyDefinitions} selectedPropertyDefinitions={selectedPropertyDefinitions} setColumnSelectorTouched={jest.fn()} columns={columns}/>);
    const cancelButton = getByText('Cancel');
    cancelButton.onclick = jest.fn();
    fireEvent.click(cancelButton);
    expect(cancelButton.onclick).toHaveBeenCalledTimes(1);
  });

  test('Verify apply button closes popover', () => {
    const { getByText } = render(<ColumnSelector popoverVisibility={true} setPopoverVisibility={jest.fn()} entityPropertyDefinitions={entityPropertyDefinitions} selectedPropertyDefinitions={selectedPropertyDefinitions} setColumnSelectorTouched={jest.fn()} columns={columns}/>);
    const applyButton = getByText('Apply');
    applyButton.onclick = jest.fn();
    fireEvent.click(applyButton);
    expect(applyButton.onclick).toHaveBeenCalledTimes(1);
  });
});

