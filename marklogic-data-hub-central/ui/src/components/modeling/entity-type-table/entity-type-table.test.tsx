import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, wait, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import EntityTypeTable from './entity-type-table';

import { 
  entityReferences,
  deleteEntity,
} from '../../../api/modeling';

import { 
  getEntityTypes,
  referencePayloadEmpty,
  referencePayloadRelationships,
  referencePayloadSteps 
} from '../../../assets/mock-data/modeling';

import { ConfirmationType } from '../../../types/modeling-types';

jest.mock('../../../api/modeling');

const mockEntityReferences = entityReferences as jest.Mock;
const mockDeleteEntity = deleteEntity as jest.Mock;

describe('EntityTypeModal Component', () => {

  afterEach(() => {
    jest.clearAllMocks();
  })

  test('Table renders with empty array prop', () => {
    const { getByText } =  render(
      <Router>
        <EntityTypeTable 
          allEntityTypesData={[]}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=''
          editEntityTypeDescription={jest.fn()}
          updateEntities={jest.fn()}
        />
      </Router>);

    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('Instances')).toBeInTheDocument();
    expect(getByText('Last Processed')).toBeInTheDocument();
  });

  test('Table renders with mock data, no writer role', () => {
    const { getByText, getByTestId, getAllByRole, getByLabelText } =  render(
      <Router>
        <EntityTypeTable 
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={false}
          autoExpand=''
          editEntityTypeDescription={jest.fn()}
          updateEntities={jest.fn()}
        />
      </Router>);

    expect(getByText(/Customer/i)).toBeInTheDocument();
    expect(getByText(/1,000/i)).toBeInTheDocument();
    expect(getByTestId('Customer-last-processed')).toBeInTheDocument();

    expect(getByTestId('Customer-save-icon')).toHaveClass('iconSaveReadOnly');
    expect(getByTestId('Customer-revert-icon')).toHaveClass('iconRevertReadOnly');
    expect(getByTestId('Customer-trash-icon')).toHaveClass('iconTrashReadOnly');

    expect(getByText(/Order/i)).toBeInTheDocument();
    expect(getByText(/2,384/i)).toBeInTheDocument();
    expect(getByTestId('Order-last-processed')).toBeInTheDocument();

    // Verify sorting doesn't crash the component
    userEvent.click(getByText('Name'));
    userEvent.click(getByText('Last Processed'));
    userEvent.click(getByText('Instances'));

    userEvent.click(getAllByRole('img')[0]);

    expect(getByLabelText('AnotherModel-add-property')).toBeDisabled();
  });

  test('Table renders with mock data, with writer role, with auto expanded entity, and can click edit', () => {
    const editMock = jest.fn();
    const { getByTestId, getByLabelText } =  render(
      <Router>
        <EntityTypeTable 
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand='Order'
          editEntityTypeDescription={editMock}
          updateEntities={jest.fn()}
        />
      </Router>);

    // Add back once functionality is added
    // expect(getByTestId('Order-save-icon')).toHaveClass('iconSave');
    // expect(getByTestId('Order-revert-icon')).toHaveClass('iconRevert');
    expect(getByTestId('Order-trash-icon')).toHaveClass('iconTrash');

    userEvent.click(getByTestId('Order-span'));
    expect(editMock).toBeCalledTimes(1);
  });

  test('Table can mock delete entity', async () => {
    mockEntityReferences.mockResolvedValueOnce({ status: 200, data: referencePayloadEmpty });
    mockDeleteEntity.mockResolvedValueOnce({ status: 200 });

    const updateMock = jest.fn();

    const { getByTestId, getByLabelText, getByText, debug } =  render(
      <Router>
        <EntityTypeTable 
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=''
          editEntityTypeDescription={jest.fn()}
          updateEntities={updateMock}
        />
      </Router>);

      userEvent.click(getByTestId('Order-trash-icon'));
      expect(mockEntityReferences).toBeCalledWith('Order');
      expect(mockEntityReferences).toBeCalledTimes(1);

      await wait(() =>
        expect(screen.getByText('Confirmation')).toBeInTheDocument(),
      )
      userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeleteEntity}-yes`));
      expect(mockDeleteEntity).toBeCalledTimes(1);
  });

  test('Table can mock delete relationship entity', async () => {
    mockEntityReferences.mockResolvedValueOnce({ status: 200, data: referencePayloadRelationships });
    mockDeleteEntity.mockResolvedValueOnce({ status: 200 });

    const updateMock = jest.fn();

    const { getByTestId, getByLabelText, getByText } =  render(
      <Router>
        <EntityTypeTable 
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=''
          editEntityTypeDescription={jest.fn()}
          updateEntities={updateMock}
        />
      </Router>);

      userEvent.click(getByTestId('Product-trash-icon'));
      expect(mockEntityReferences).toBeCalledWith('Product');
      expect(mockEntityReferences).toBeCalledTimes(1);

      await wait(() =>
        expect(screen.getByText('Confirmation')).toBeInTheDocument()
      )
      expect(screen.getByText('Existing entity type relationships.')).toBeInTheDocument();
      userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeleteEntityRelationshipWarn}-yes`));
      expect(mockDeleteEntity).toBeCalledTimes(1);
  });

  test('can show confirm modal for delete steps', async () => {
    mockEntityReferences.mockResolvedValueOnce({ status: 200, data: referencePayloadSteps });
    mockDeleteEntity.mockResolvedValueOnce({ status: 200 });

    const updateMock = jest.fn();

    const { getByTestId, getByLabelText, getByText } =  render(
      <Router>
        <EntityTypeTable 
          allEntityTypesData={getEntityTypes}
          canReadEntityModel={true}
          canWriteEntityModel={true}
          autoExpand=''
          editEntityTypeDescription={jest.fn()}
          updateEntities={updateMock}
        />
      </Router>);

      userEvent.click(getByTestId('Product-trash-icon'));
      expect(mockEntityReferences).toBeCalledWith('Product');
      expect(mockEntityReferences).toBeCalledTimes(1);

      await wait(() =>
        expect(screen.getByText('Delete: Entity Type in Use')).toBeInTheDocument()
      )
      expect(screen.getByText('Entity type is used in one or more steps.')).toBeInTheDocument();
      userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeleteEntityStepWarn}-close`));
      expect(mockDeleteEntity).toBeCalledTimes(0);
  });
});

