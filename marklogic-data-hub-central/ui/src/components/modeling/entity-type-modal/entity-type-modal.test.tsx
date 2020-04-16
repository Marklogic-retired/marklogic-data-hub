import React from 'react';
import axiosMock from 'axios'
import { render, wait } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import EntityTypeModal from './entity-type-modal';
import { createModelErrorResponse, createModelResponse } from '../../../assets/mock-data/modeling';

jest.mock('axios');

describe('EntityTypeModal Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Modal is not visible', () => {
    const { queryByText } =  render(
    <EntityTypeModal 
      isVisible={false} 
      toggleModal={jest.fn()}
      newEntityAdded={jest.fn()}
    />);

    expect(queryByText('Add Entity Type')).toBeNull();
  });

  test('Valid Entity name is used', async () => {
    axiosMock.post.mockImplementationOnce(jest.fn(() => Promise.resolve({status: 201, data: createModelResponse})));

    const { getByTestId, getByText, debug } = render(
      <EntityTypeModal 
        isVisible={true} 
        toggleModal={jest.fn()}
        newEntityAdded={jest.fn()}
      />);
    expect(getByText('Add Entity Type')).toBeInTheDocument();
    await userEvent.type(getByTestId('name-input'), 'AnotherModel');
    expect(getByTestId('name-input')).toHaveAttribute('value', 'AnotherModel');

    await userEvent.type(getByTestId('description-input'), 'Testing');
    expect(getByTestId('description-input')).toHaveAttribute('value', 'Testing');

    await wait(() => {
      userEvent.click(getByText('Add'));
    });
  
    let url = "/api/models"
    let payload = {"name": "AnotherModel", "description": "Testing"};
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
  });

  test('Invalid Entity name disables add button', async () => {
    const { getByTestId, getByText } = render(
      <EntityTypeModal 
        isVisible={true} 
        toggleModal={jest.fn()}
        newEntityAdded={jest.fn()}
      />);
    expect(getByText(/Add Entity Type/i)).toBeInTheDocument();

    await userEvent.type(getByTestId('name-input'), '123-Box');
    expect(getByTestId('name-input')).toHaveAttribute('value', '123-Box');

    await userEvent.type(getByTestId('description-input'), 'Product entity desription');
    expect(getByTestId('description-input')).toHaveAttribute('value', 'Product entity desription');

    expect(getByText('Add')).toBeDisabled();
  });

  test('Creating duplicate entity shows error message', async () => {
    axiosMock.post.mockImplementationOnce(jest.fn(() => 
      Promise.reject({ response: {status: 400, data: createModelErrorResponse } })));

    const { getByTestId, getByText } =  render(
      <EntityTypeModal 
        isVisible={true} 
        toggleModal={jest.fn()}
        newEntityAdded={jest.fn()}
      />);
    expect(getByText('Add Entity Type')).toBeInTheDocument();

    await userEvent.type(getByTestId('name-input'), 'Testing');
    expect(getByTestId('name-input')).toHaveAttribute('value', 'Testing');

    await userEvent.type(getByTestId('description-input'), '');
    expect(getByTestId('description-input')).toHaveAttribute('value', '');

    await wait(() => {
      userEvent.click(getByText('Add'));
    });
  
    let url = "/api/models"
    let payload = {"name": "Testing", "description": ""};
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);

    expect(getByText('An entity type already exists with a name of Testing')).toBeInTheDocument();
  });
});

