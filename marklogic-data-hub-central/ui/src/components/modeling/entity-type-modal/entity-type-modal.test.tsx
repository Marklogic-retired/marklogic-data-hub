import React from 'react';
import axios from 'axios';
import { render, wait } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import EntityTypeModal from './entity-type-modal';
import { ModelingTooltips } from '../../../config/tooltips.config';
import { createModelErrorResponse, createModelResponse } from '../../../assets/mock-data/modeling/modeling';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('EntityTypeModal Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Modal is not visible', () => {
    const { queryByText } = render(
      <EntityTypeModal
        isVisible={false}
        toggleModal={jest.fn()}
        updateEntityTypesAndHideModal={jest.fn()}
        isEditModal={false}
        name={''}
        description={''}
      />);

    expect(queryByText('Add Entity Type')).toBeNull();
  });

  test('Valid Entity name is used', async () => {
    axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve({status: 201, data: createModelResponse})));

    const { getByText, getByPlaceholderText } = render(
      <EntityTypeModal
        isVisible={true}
        toggleModal={jest.fn()}
        updateEntityTypesAndHideModal={jest.fn()}
        isEditModal={false}
        name={''}
        description={''}
      />);
    expect(getByText('Add Entity Type')).toBeInTheDocument();
    userEvent.type(getByPlaceholderText('Enter name'), 'AnotherModel');
    userEvent.type(getByPlaceholderText('Enter description'), 'Testing');

    await wait(() => {
      userEvent.click(getByText('Add'));
    });

    let url = "/api/models";
    let payload = { "name": "AnotherModel", "description": "Testing" };
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
  });

  test('Adding an invalid Entity name shows error message', async () => {
    const { getByText, getByPlaceholderText } = render(
      <EntityTypeModal
        isVisible={true}
        toggleModal={jest.fn()}
        updateEntityTypesAndHideModal={jest.fn()}
        isEditModal={false}
        name={''}
        description={''}
      />);
    expect(getByText(/Add Entity Type/i)).toBeInTheDocument();

    userEvent.type(getByPlaceholderText('Enter name'), '123-Box');
    userEvent.type(getByPlaceholderText('Enter description'), 'Product entity desription');

    await wait(() => {
      userEvent.click(getByText('Add'));
    });

    expect(getByText(ModelingTooltips.nameRegex)).toBeInTheDocument();
  });

  test('Creating duplicate entity shows error message', async () => {
    axiosMock.post['mockImplementationOnce'](jest.fn(() =>
      Promise.reject({ response: {status: 400, data: createModelErrorResponse } })));

    const { getByText, getByPlaceholderText } = render(
      <EntityTypeModal
        isVisible={true}
        toggleModal={jest.fn()}
        updateEntityTypesAndHideModal={jest.fn()}
        isEditModal={false}
        name={''}
        description={''}
      />);
    expect(getByText('Add Entity Type')).toBeInTheDocument();

    userEvent.type(getByPlaceholderText('Enter name'), 'Testing');
    userEvent.type(getByPlaceholderText('Enter description'), '');

    await wait(() => {
      userEvent.click(getByText('Add'));
    });

    let url = "/api/models";
    let payload = { "name": "Testing", "description": "" };
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);

    expect(getByText('An entity type already exists with a name of Testing')).toBeInTheDocument();
  });

  test('Edit modal is not visible', () => {
    const { queryByText } = render(
      <EntityTypeModal
        isVisible={false}
        toggleModal={jest.fn()}
        updateEntityTypesAndHideModal={jest.fn()}
        isEditModal={true}
        name={'ModelName'}
        description={'Model description'}
      />);

    expect(queryByText('Edit Entity Type')).toBeNull();
  });

  test('Edit modal is visible', () => {
    const { getByText, getByDisplayValue, queryByText } = render(
      <EntityTypeModal
        isVisible={true}
        toggleModal={jest.fn()}
        updateEntityTypesAndHideModal={jest.fn()}
        isEditModal={true}
        name={'ModelName'}
        description={'Model description'}
      />);

    expect(getByText('Edit Entity Type')).toBeInTheDocument();
    expect(queryByText('*')).toBeNull();
    expect(getByText('ModelName')).toBeInTheDocument();
    expect(getByDisplayValue('Model description')).toBeInTheDocument();
  });

  test('Entity description is updated', async () => {
    axiosMock.put['mockImplementationOnce'](jest.fn(() => Promise.resolve({ status: 200 })));

    const { getByText, getByPlaceholderText } = render(
      <EntityTypeModal
        isVisible={true}
        toggleModal={jest.fn()}
        updateEntityTypesAndHideModal={jest.fn()}
        isEditModal={true}
        name={'ModelName'}
        description={'Model description'}
      />);

    userEvent.clear(getByPlaceholderText('Enter description'));
    userEvent.type(getByPlaceholderText('Enter description'), 'Updated Description');

    await wait(() => {
      userEvent.click(getByText('OK'));
    });

    let url = "/api/models/ModelName/info";
    let payload = { "description": "Updated Description" };
    expect(axiosMock.put).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.put).toHaveBeenCalledTimes(1);
  });
});

