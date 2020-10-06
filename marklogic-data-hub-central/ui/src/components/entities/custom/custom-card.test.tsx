import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {fireEvent, render, wait, waitForElement} from '@testing-library/react';
import CustomCard from './custom-card';
import axiosMock from 'axios';
import data from "../../../assets/mock-data/curation/flows.data";
import {act} from "react-dom/test-utils";
import { AuthoritiesService, AuthoritiesContext } from '../../../util/authorities';
import mocks from '../../../api/__mocks__/mocks.data';
import {AdvCustomTooltips} from "../../../config/tooltips.config";


jest.mock('axios');

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

describe("Custom Card component", () => {
    beforeEach(() => {
        mocks.curateAPI(axiosMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Custom card does not allow edit', async () => {
        let customData = data.customSteps.data.stepsWithEntity[0].artifacts;
        let queryAllByText, getByRole, queryAllByRole, getAllByLabelText, getByText;
        await act(async () => {
            const renderResults = render(
                <Router><CustomCard data={customData}
                                    canReadOnly={true}
                                    canReadWrite={false}/></Router>);
            queryAllByText = renderResults.queryAllByText;
            getByRole = renderResults.getByRole;
            queryAllByRole = renderResults.queryAllByRole;
            getAllByLabelText=renderResults.getAllByLabelText;
            getByText=renderResults.getByText;
        });

        expect(getByRole("edit-custom")).toBeInTheDocument();
        expect(getByRole("settings-custom")).toBeInTheDocument();
        expect(queryAllByRole('delete-custom')).toHaveLength(0);

        let tipIconSetting  = getAllByLabelText('icon: setting');
        fireEvent.mouseOver(tipIconSetting[0]);
        await waitForElement(() => getByText(AdvCustomTooltips.settings));

        let tipIconView  = getAllByLabelText('icon: edit');
        fireEvent.mouseOver(tipIconView[0]);
        await waitForElement(() => getByText(AdvCustomTooltips.viewCustom));
    });

    test('Open advanced settings', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readCustom']);
        let customData = data.customSteps.data.stepsWithEntity[0].artifacts;
        const {getByText,getAllByLabelText, getByPlaceholderText, getByTestId} = render(
            <Router><AuthoritiesContext.Provider value={authorityService}>
                <CustomCard data={customData}
                           canReadOnly={true}
                           canReadWrite={false}
                          /></AuthoritiesContext.Provider></Router>);
        await wait(() => {
            fireEvent.click(getByTestId("customJSON-settings"));
        });

        expect(getByText("Please select source database")).toBeInTheDocument();
        expect(getByText("db1")).toBeInTheDocument();

        expect(getByText("Please select target database")).toBeInTheDocument();
        expect(getByText("db2")).toBeInTheDocument();
        expect(getByText("Target Permissions")).toBeInTheDocument();
        expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("role1,read,role2,update");
        expect(getByText('Save')).toBeDisabled();

        expect(getByPlaceholderText("Please enter additional settings")).toBeInTheDocument();
        expect(getByText('{ "dummy": "value" }')).toBeInTheDocument();
        let tipIcons  = getAllByLabelText('icon: question-circle');
        fireEvent.mouseOver(tipIcons[tipIcons.length -1]);
        await waitForElement(() => getByText(AdvCustomTooltips.additionalSettings));

    });

});
