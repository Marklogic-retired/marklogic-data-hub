import React from 'react';
import axiosMock from 'axios'
import { render } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import Modeling from './Modeling';
import {AuthoritiesContext} from '../util/authorities';
import authorities from '../config/authorities.config';
import { ModelingContext } from '../util/modeling-context';
import { ModelingTooltips } from '../config/tooltips.config';
import { getEntityTypes } from '../assets/mock-data/modeling';
import {
  isModified,
  notModified
} from '../assets/mock-data/modeling-context-mock';

jest.mock('axios');

const mockDevRolesService = authorities.DeveloperRolesService;
const mockOpRolesService = authorities.OperatorRolesService;

describe("Modeling Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Modeling: with mock data, renders modified Alert component and Dev role can click add", () => {
    axiosMock.get['mockImplementation']( jest.fn(() => Promise.resolve({status: 200, data: getEntityTypes})));
  
    const { getByText, getByLabelText, queryByText } = render(
      <AuthoritiesContext.Provider value={mockDevRolesService}>
        <ModelingContext.Provider value={isModified}>
          <Modeling/>
        </ModelingContext.Provider>
      </AuthoritiesContext.Provider>
    );

    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(getByText('Entity Types')).toBeInTheDocument();
    expect(getByLabelText("add-entity")).toBeInTheDocument();
    expect(getByText('Instances')).toBeInTheDocument();
    expect(getByText('Last Processed')).toBeInTheDocument();
    expect(getByText(ModelingTooltips.entityEditedAlert)).toBeInTheDocument();
    // Add entity modal opens
    userEvent.click(getByText('Add'));
    expect(getByText(/Add Entity Type/i)).toBeInTheDocument();
  });

  test("Modeling: with mock data, no Alert component renders and operator role can not click add", () => {
    axiosMock.get['mockImplementation']( jest.fn(() => Promise.resolve({status: 200, data: getEntityTypes})));
  
    const { getByText, getByLabelText, queryByText } = render(
      <AuthoritiesContext.Provider value={mockOpRolesService}>
        <ModelingContext.Provider value={notModified}>
          <Modeling/>
        </ModelingContext.Provider>
      </AuthoritiesContext.Provider>
    );

    expect(getByText('Entity Types')).toBeInTheDocument();
    expect(getByText('Instances')).toBeInTheDocument();
    expect(getByText('Last Processed')).toBeInTheDocument();

    expect(getByLabelText("add-entity")).toBeDisabled();
    expect(queryByText('You have edited some of the entity types and/or properties.')).toBeNull();
  });
});


