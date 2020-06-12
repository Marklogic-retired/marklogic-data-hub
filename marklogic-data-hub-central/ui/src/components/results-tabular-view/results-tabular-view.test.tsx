import React from 'react';
import { render, fireEvent, waitForElement } from '@testing-library/react';
import {entitySearch, entityPropertyDefinitions, selectedPropertyDefinitions, entityDefArray} from "../../assets/mock-data/entity-search";
import ResultsTabularView from "./results-tabular-view";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from 'react-router-dom';

describe("Results Table view component", () => {
    test('Results table with data renders', async () => {
        const {  getByText, getByTestId } = render(
            <Router>
                <ResultsTabularView
                    data={entitySearch.results}
                    entityPropertyDefinitions={entityPropertyDefinitions}
                    selectedPropertyDefinitions={selectedPropertyDefinitions}
                    entityDefArray={entityDefArray}
                    columns={[]}
                    hasStructured={false}
                />
                </Router>
        )

        // Check table column headers are rendered
        expect(getByText('customerId')).toBeInTheDocument();
        expect(getByText('name')).toBeInTheDocument();
        expect(getByText('nicknames')).toBeInTheDocument();
        expect(getByText('shipping')).toBeInTheDocument();
        expect(getByText('billing')).toBeInTheDocument();
        expect(getByText('Detail View')).toBeInTheDocument();


        //check table data is rendered correctly
        expect(getByText('101')).toBeInTheDocument();
        expect(getByText('Carmella Hardin')).toBeInTheDocument();
        userEvent.click(getByText('shipping'));
        expect(getByText('Whitwell Place')).toBeInTheDocument();
        expect(getByText('Whitwell Place2')).toBeInTheDocument();
        expect(getByText('Ellerslie')).toBeInTheDocument();
        expect(getByText('Ellerslie2')).toBeInTheDocument();
        expect(getByTestId('101-detailOnSeparatePage')).toBeInTheDocument();
        expect(getByTestId('101-sourceOnSeparatePage')).toBeInTheDocument();
        
        //Check if the tooltip on 'Detail on separate page' icon works fine.
        fireEvent.mouseOver(getByTestId('101-detailOnSeparatePage'))
        await(waitForElement(() => (getByText('Show detail on a separate page'))))

        //Check if the tooltip on 'source on separate page' icon works fine.
        fireEvent.mouseOver(getByTestId('101-sourceOnSeparatePage'))
        await(waitForElement(() => (getByText('Show source on a separate page'))))

        //Validation of routing to detail page needs to be done in e2e tests

    });

    test('Result table with no data renders', () => {
        const { getByText } = render(
            <Router>
                 <ResultsTabularView
                    data={[]}
                    entityPropertyDefinitions={[]}
                    selectedPropertyDefinitions={[]}
                    entityDefArray={[]}
                    columns={[]}
                    hasStructured={false}
                />
                </Router>
        )
        // Check for Empty Table
        expect(getByText(/No Data/i)).toBeInTheDocument();
    });
})
