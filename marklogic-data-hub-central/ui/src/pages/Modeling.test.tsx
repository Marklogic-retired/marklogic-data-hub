import React from 'react';
import { render, wait, screen, fireEvent } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from 'react-router-dom';

import Modeling from './Modeling';
import {AuthoritiesContext} from '../util/authorities';
import authorities from '../assets/mock-data/authorities.testutils';
import { ModelingContext } from '../util/modeling-context';
import { ModelingTooltips } from '../config/tooltips.config';
import { getEntityTypes } from '../assets/mock-data/modeling/modeling';
import { isModified, notModified } from '../assets/mock-data/modeling/modeling-context-mock';
import { primaryEntityTypes, updateEntityModels } from '../api/modeling';
import { ConfirmationType } from '../types/common-types';
import tiles from '../config/tiles.config';

jest.mock('../api/modeling');

const mockPrimaryEntityType = primaryEntityTypes as jest.Mock;
const mockUpdateEntityModels = updateEntityModels as jest.Mock;

const mockDevRolesService = authorities.DeveloperRolesService;
const mockOpRolesService = authorities.OperatorRolesService;
const mockHCUserRolesService = authorities.HCUserRolesService;

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

    expect(getByText(tiles.model.intro)).toBeInTheDocument(); // tile intro text

    expect(getByText('Entity Types')).toBeInTheDocument();
    expect(getByLabelText("add-entity")).toBeInTheDocument();
    expect(getByText('Instances')).toBeInTheDocument();
    expect(getByText('Last Processed')).toBeInTheDocument();
    expect(getByText(ModelingTooltips.entityEditedAlert)).toBeInTheDocument();

    userEvent.click(screen.getByTestId('AnotherModel-span'));
    expect(screen.getByText("Edit Entity Type")).toBeInTheDocument();

    userEvent.click(getByText('Add'));
    expect(getByText(/Add Entity Type/i)).toBeInTheDocument();

    userEvent.click(getByText('Save All'));
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.SaveAll}-yes`));
    expect(mockUpdateEntityModels).toHaveBeenCalledTimes(1);

    userEvent.click(getByText('Revert All'));
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.RevertAll}-yes`));
    expect(mockPrimaryEntityType).toHaveBeenCalledTimes(1);
  });

  test("Modeling: with mock data, no Alert component renders and operator role can not click add", async () => {
    mockPrimaryEntityType.mockResolvedValueOnce({ status: 200, data: getEntityTypes });

    const { getByText, getByLabelText, queryByLabelText, debug } = render(
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

    // test add, save, revert icons display correct tooltip when disabled
    fireEvent.mouseOver(getByText('Add'));
    await wait (() => expect(getByText(ModelingTooltips.noWriteAccess)).toBeInTheDocument());
    fireEvent.mouseOver(getByText('Save All'));
    await wait (() => expect(getByText(ModelingTooltips.noWriteAccess)).toBeInTheDocument());
    fireEvent.mouseOver(getByText('Revert All'));
    await wait (() => expect(getByText(ModelingTooltips.noWriteAccess)).toBeInTheDocument());

    expect(getByLabelText("save-all")).toBeDisabled();
    expect(queryByLabelText('entity-modified-alert')).toBeNull();
  });

  test("Modeling: can not see data if user does not have entity model reader role", async () => {
    mockPrimaryEntityType.mockResolvedValueOnce({ status: 200, data: getEntityTypes });

    const { queryByText, queryByLabelText } = render(
      <AuthoritiesContext.Provider value={mockHCUserRolesService}>
        <ModelingContext.Provider value={notModified}>
          <Router>
            <Modeling/>
          </Router>
        </ModelingContext.Provider>
      </AuthoritiesContext.Provider>
    );

    await wait(() => expect(mockPrimaryEntityType).toHaveBeenCalledTimes(0));
    expect(queryByText('Entity Types')).toBeNull();
    expect(queryByText('Instances')).toBeNull();
    expect(queryByText('Last Processed')).toBeNull();

    expect(queryByLabelText("add-entity")).toBeNull();
    expect(queryByLabelText("save-all")).toBeNull();
    expect(queryByLabelText('entity-modified-alert')).toBeNull();
  });
});


