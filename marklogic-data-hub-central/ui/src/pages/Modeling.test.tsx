import React from 'react';
import { render, wait, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from 'react-router-dom';

import Modeling from './Modeling';
import {AuthoritiesContext} from '../util/authorities';
import authorities from '../assets/authorities.testutils';
import { ModelingContext } from '../util/modeling-context';
import { ModelingTooltips } from '../config/tooltips.config';
import { getEntityTypes } from '../assets/mock-data/modeling';
import { isModified, notModified } from '../assets/mock-data/modeling-context-mock';
import { primaryEntityTypes, updateEntityModels } from '../api/modeling';
import { ConfirmationType } from '../types/modeling-types';

jest.mock('../api/modeling');

const mockPrimaryEntityType = primaryEntityTypes as jest.Mock;
const mockUpdateEntityModels = updateEntityModels as jest.Mock;

const mockDevRolesService = authorities.DeveloperRolesService;
const mockOpRolesService = authorities.OperatorRolesService;

describe("Modeling Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Modeling: with mock data, renders modified Alert component and Dev role can click add, edit, and save all", async () => {
    mockPrimaryEntityType.mockResolvedValueOnce({ status: 200, data: getEntityTypes });
    mockUpdateEntityModels.mockResolvedValueOnce({ status: 200 });
  
    const { getByText, getByLabelText, queryByText, debug } = render(
      <AuthoritiesContext.Provider value={mockDevRolesService}>
        <ModelingContext.Provider value={isModified}>
          <Router>
            <Modeling/>
          </Router>
        </ModelingContext.Provider>
      </AuthoritiesContext.Provider>
    );

    await wait(() => expect(mockPrimaryEntityType).toHaveBeenCalledTimes(1));

    expect(getByText('Entity Types')).toBeInTheDocument()
    expect(getByLabelText("add-entity")).toBeInTheDocument();
    expect(getByText('Instances')).toBeInTheDocument();
    expect(getByText('Last Processed')).toBeInTheDocument();
    expect(getByText(ModelingTooltips.entityEditedAlert)).toBeInTheDocument();

    userEvent.click(screen.getByTestId('AnotherModel-span'));
    expect(screen.getByText("Edit Entity Type")).toBeInTheDocument();

    userEvent.click(getByText('Add'));
    expect(getByText(/Add Entity Type/i)).toBeInTheDocument();

    userEvent.click(getByText('Save All'));
    expect(screen.getByText(/Confirmation/i)).toBeInTheDocument();
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.SaveAll}-yes`));
    expect(mockUpdateEntityModels).toHaveBeenCalledTimes(1)
  });

  test("Modeling: with mock data, no Alert component renders and operator role can not click add", async () => {
    mockPrimaryEntityType.mockResolvedValueOnce({ status: 200, data: getEntityTypes });
  
    const { getByText, getByLabelText, queryByText, debug } = render(
      <AuthoritiesContext.Provider value={mockOpRolesService}>
        <ModelingContext.Provider value={notModified}>
          <Router>
            <Modeling/>
          </Router>
        </ModelingContext.Provider>
      </AuthoritiesContext.Provider>
    );

    await wait(() => expect(mockPrimaryEntityType).toHaveBeenCalledTimes(1));
    expect(getByText('Entity Types')).toBeInTheDocument();
    expect(getByText('Instances')).toBeInTheDocument();
    expect(getByText('Last Processed')).toBeInTheDocument();

    expect(getByLabelText("add-entity")).toBeDisabled();
    expect(getByLabelText("save-all")).toBeDisabled();
    expect(queryByText('You have edited some of the entity types and/or properties.')).toBeNull();
  });
});


