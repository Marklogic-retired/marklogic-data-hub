import React, {useContext} from 'react';
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import TilesView from './TilesView';
import {AuthoritiesContext, AuthoritiesService} from '../util/authorities';
import axiosMock from 'axios';
import curateData from '../config/bench.config';
import authorities from '../config/authorities.config';
import data from "../config/bench.config";
import LoadData from "./LoadData";

jest.mock('axios');

describe('LoadData component', () => {
  test('Verify LoadData component cannot edit with only readIngestion authority', async () => {
      const authorityService = new AuthoritiesService();
      authorityService.setAuthorities(['readIngestion']);

      await curateData.setupMockAPIs(axiosMock);

      const { getByText, getByTitle, getByLabelText, getByTestId } = render(<AuthoritiesContext.Provider value={authorityService}><LoadData/></AuthoritiesContext.Provider>);

      expect(await(waitForElement(() => getByTitle('table')))).toBeInTheDocument();

      // Check for steps to be populated
      expect(axiosMock.get).toBeCalledWith('/api/steps/ingestion');
      expect(getByText('failedIngest')).toBeInTheDocument();

      // Check table layout
      await fireEvent.click(getByTitle('table'));

      await fireEvent.click(getByTestId('failedIngest-settings'));
      expect(await(waitForElement(() => getByText('Target Database:')))).toBeInTheDocument();

      expect(getByText('Save')).toBeDisabled();
      await fireEvent.click(getByText('Cancel'));
      // Check card layout
      await fireEvent.click(getByTitle('card'));

      await fireEvent.click(getByLabelText('icon: setting'));
      expect(await(waitForElement(() => getByText('Target Database:')))).toBeInTheDocument();
      expect(getByText('Save')).toBeDisabled();
      await fireEvent.click(getByText('Cancel'));
  });

    test('Verify LoadData component edit with readIngestion and writeIngestion authorities', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readIngestion','writeIngestion']);

        await curateData.setupMockAPIs(axiosMock);

        const { getByText, getByTitle, getByLabelText, getByTestId } = render(<AuthoritiesContext.Provider value={authorityService}><LoadData/></AuthoritiesContext.Provider>);

        expect(await(waitForElement(() => getByTitle('table')))).toBeInTheDocument();

        // Check for steps to be populated
        expect(axiosMock.get).toBeCalledWith('/api/steps/ingestion');
        expect(getByText('failedIngest')).toBeInTheDocument();

        // Check table layout
        await fireEvent.click(getByTitle('table'));

        await fireEvent.click(getByTestId('failedIngest-settings'));
        expect(await(waitForElement(() => getByText('Target Database:')))).toBeInTheDocument();

        expect(getByText('Save')).not.toBeDisabled();
        await fireEvent.click(getByText('Cancel'));
        // Check card layout
        await fireEvent.click(getByTitle('card'));

        await fireEvent.click(getByLabelText('icon: setting'));
        expect(await(waitForElement(() => getByText('Target Database:')))).toBeInTheDocument();
        expect(getByText('Save')).not.toBeDisabled();
        await fireEvent.click(getByText('Cancel'));
    });
});
