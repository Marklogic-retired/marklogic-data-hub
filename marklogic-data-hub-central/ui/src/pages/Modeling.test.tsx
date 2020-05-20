import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import Modeling from './Modeling';
import {AuthoritiesContext} from '../util/authorities';
import authorities from '../config/authorities.config';

jest.mock('../api/modeling');

const mockDevRolesService = authorities.DeveloperRolesService;

describe("Modeling Page", () => {
  test("Modeling page renders with mock data", async (done) => {
      const { getByTestId, getByText } = render(<AuthoritiesContext.Provider value={mockDevRolesService}><Modeling/></AuthoritiesContext.Provider>);

      await act(async () => {
        setTimeout(() => {
          expect(getByText(/Entity Types/i)).toBeInTheDocument();
          expect(getByTestId("add-btn")).toBeInTheDocument();
          expect(getByTestId("entity-type-table")).toBeInTheDocument();
          done();
          // Add entity modal opens
          userEvent.click(getByText('Add'));
          expect(getByText(/Add Entity Type/i)).toBeInTheDocument();
        })
      });
  });
});


