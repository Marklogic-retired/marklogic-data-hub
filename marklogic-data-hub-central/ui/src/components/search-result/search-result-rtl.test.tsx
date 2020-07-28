import React from 'react';
import { render, fireEvent, waitForElement } from '@testing-library/react';
import SearchResult from './search-result';
import { BrowserRouter as Router } from 'react-router-dom';
import { entityFromJSON, entityParser } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';
import searchPayloadResults from '../../assets/mock-data/search-payload-results';

describe("Search Result view component", () => {
    const parsedModelData = entityFromJSON(modelResponse);
    const entityDefArray = entityParser(parsedModelData);

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
        await(waitForElement(() => (getByText('Show the complete JSON'))));

        fireEvent.mouseOver(getByTestId('instance-icon'));
        await(waitForElement(() => (getByText('Show the processed data'))));

    });
})
