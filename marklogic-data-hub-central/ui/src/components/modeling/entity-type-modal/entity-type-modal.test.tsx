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

    const { getByText, getByPlaceholderText } = render(
      <EntityTypeModal 
        isVisible={true} 
        toggleModal={jest.fn()}
        newEntityAdded={jest.fn()}
      />);
    expect(getByText('Add Entity Type')).toBeInTheDocument();
    await userEvent.type(getByPlaceholderText('Enter name'), 'AnotherModel');
    await userEvent.type(getByPlaceholderText('Enter description'), 'Testing');

    await wait(() => {
      userEvent.click(getByText('Add'));
    });
  
    let url = "/api/models"
    let payload = {"name": "AnotherModel", "description": "Testing"};
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
  });

  test('Adding an invalid Entity name shows error message', async () => {
    const { getByText, getByPlaceholderText } = render(
      <EntityTypeModal 
        isVisible={true} 
        toggleModal={jest.fn()}
        newEntityAdded={jest.fn()}
      />);
    expect(getByText(/Add Entity Type/i)).toBeInTheDocument();

    await userEvent.type(getByPlaceholderText('Enter name'), '123-Box');
    await userEvent.type(getByPlaceholderText('Enter description'), 'Product entity desription');;

    await wait(() => {
      userEvent.click(getByText('Add'));
    });

    expect(getByText('Names must start with a letter, and can contain letters, numbers, hyphens, and underscores.')).toBeInTheDocument();
  });

  test('Creating duplicate entity shows error message', async () => {
    axiosMock.post.mockImplementationOnce(jest.fn(() => 
      Promise.reject({ response: {status: 400, data: createModelErrorResponse } })));

    const { getByText, getByPlaceholderText } =  render(
      <EntityTypeModal 
        isVisible={true} 
        toggleModal={jest.fn()}
        newEntityAdded={jest.fn()}
      />);
    expect(getByText('Add Entity Type')).toBeInTheDocument();

    await userEvent.type(getByPlaceholderText('Enter name'), 'Testing');
    await userEvent.type(getByPlaceholderText('Enter description'), '');

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

