import React from 'react';
import { render, fireEvent, waitForElement } from '@testing-library/react';
import SearchResult from './search-result';
import { BrowserRouter as Router } from 'react-router-dom';
import { entityFromJSON, entityParser } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';
import searchPayloadResults from '../../assets/mock-data/search-payload-results';
import { SearchContext } from "../../util/search-context";


describe("Search Result view component", () => {
    const parsedModelData = entityFromJSON(modelResponse);
    const entityDefArray = entityParser(parsedModelData);

    const defaultSearchOptions = {
        query: '',
        entityTypeIds: [],
        nextEntityType: '',
        start: 1,
        pageNumber: 1,
        pageLength: 20,
        pageSize: 20,
        selectedFacets: {},
        maxRowsPerPage: 100,
        selectedQuery: 'select a query',
        zeroState: false,
        manageQueryModal: false,
        selectedTableProperties: [],
        view: null,
        sortOrder: []
    };

    test('Source and instance tooltips render', async () => {
        const { getByText, getByTestId } = render(
            <Router>
                <SearchResult
                    entityDefArray={entityDefArray}
                    item={searchPayloadResults[0]}
                    tableView={false}
                />
            </Router>
        );
        expect(getByTestId('source-icon')).toBeInTheDocument();
        expect(getByTestId('instance-icon')).toBeInTheDocument();

        fireEvent.mouseOver(getByTestId('source-icon'));
        await (waitForElement(() => (getByText('Show the complete JSON'))));

        fireEvent.mouseOver(getByTestId('instance-icon'));
        await (waitForElement(() => (getByText('Show the processed data'))));
    });

    test('Verify expandable icon closes if page number changes', async () => {
        const { container, rerender, getByTestId } = render(
                <SearchContext.Provider value={{searchOptions: defaultSearchOptions}}>
                    <Router>
                        <SearchResult
                            entityDefArray={entityDefArray}
                            item={searchPayloadResults[0]}
                            tableView={false}
                        />
                    </Router>
                </SearchContext.Provider>
        );
        expect(getByTestId('expandable-icon')).toBeInTheDocument();
        expect(container.querySelector('[data-testid=expandable-icon] > svg')).not.toHaveStyle('transform: rotate(90deg);');
        fireEvent.click(getByTestId('expandable-icon'));
        expect(container.querySelector('[data-testid=expandable-icon] > svg')).toHaveStyle('transform: rotate(90deg);');

        rerender(
            <SearchContext.Provider value={{searchOptions: { ...defaultSearchOptions, pageNumber: 2 }}}>
                <Router>
                    <SearchResult
                        entityDefArray={entityDefArray}
                        item={searchPayloadResults[0]}
                        tableView={false}
                    />
                </Router>
            </SearchContext.Provider>
            );

        expect(container.querySelector('[data-testid=expandable-icon] > svg')).not.toHaveStyle('transform: rotate(90deg);');
    });
});
