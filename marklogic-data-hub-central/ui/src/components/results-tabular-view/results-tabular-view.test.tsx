import React from 'react';
import { render } from '@testing-library/react';
import {entitySearch, entityPropertyDefinitions, selectedPropertyDefinitions} from "../../assets/mock-data/entity-search";
import ResultsTabularView from "./results-tabular-view";
import userEvent from "@testing-library/user-event";

describe("Results Table view component", () => {
    test('Results table with data renders', () => {
        const {  getByText } = render(
                <ResultsTabularView
                    data={entitySearch.results}
                    entityPropertyDefinitions={entityPropertyDefinitions}
                    selectedPropertyDefinitions={selectedPropertyDefinitions}
                    columns={[]}
                    hasStructured={false}
                />
        )
        // Check table column headers are rendered
        expect(getByText('customerId')).toBeInTheDocument();
        expect(getByText('name')).toBeInTheDocument();
        expect(getByText('nicknames')).toBeInTheDocument();
        expect(getByText('shipping')).toBeInTheDocument();
        expect(getByText('billing')).toBeInTheDocument();


        //check table data is rendered correctly
        expect(getByText('101')).toBeInTheDocument();
        expect(getByText('Carmella Hardin')).toBeInTheDocument();
        userEvent.click(getByText('shipping'));
        expect(getByText('Whitwell Place')).toBeInTheDocument();
        expect(getByText('Whitwell Place2')).toBeInTheDocument();
        expect(getByText('Ellerslie')).toBeInTheDocument();
        expect(getByText('Ellerslie2')).toBeInTheDocument();
    });

    test('Result table with no data renders', () => {
        const { getByText } = render(
                 <ResultsTabularView
                    data={[]}
                    entityPropertyDefinitions={[]}
                    selectedPropertyDefinitions={[]}
                    columns={[]}
                    hasStructured={false}
                />
        )
        // Check for Empty Table
        expect(getByText(/No Data/i)).toBeInTheDocument();
    });

    test('Array data renders properly', () => {
        const {  getByText, queryByText } = render(
                <ResultsTabularView
                    data={entitySearch.results}
                    entityPropertyDefinitions={entityPropertyDefinitions}
                    selectedPropertyDefinitions={selectedPropertyDefinitions}
                    columns={[]}
                    hasStructured={false}
                />
        )

        expect(queryByText('Carmdin')).toBeNull();
        expect(queryByText('Carm din')).toBeNull();
        expect(getByText('Carm')).toBeInTheDocument();
        expect(getByText('din')).toBeInTheDocument();
        expect(getByText('Carm')).toContainHTML('<div style="text-overflow: ellipsis; overflow: hidden;">Carm</div>');
        expect(getByText('din')).toContainHTML('<div style="text-overflow: ellipsis; overflow: hidden;">din</div>');
        expect(getByText('Carm').closest('td')).toEqual(getByText('din').closest('td'))
    });
})
