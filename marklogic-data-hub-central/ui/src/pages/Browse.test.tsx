import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {MemoryRouter} from "react-router-dom";
import Browse from "./Browse";
import { SearchContext } from "../util/search-context";

jest.mock('axios');
jest.setTimeout(30000);


describe('Explorer Browse page tests ', () => {
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Verify collapsible side bar', async () => {
        const { getByLabelText } = render(<MemoryRouter>
            <SearchContext.Provider value={{searchOptions: defaultSearchOptions,
                greyedOptions: defaultSearchOptions,
                setEntity: jest.fn(),
                applySaveQuery: jest.fn()}}>
                <Browse/>
            </SearchContext.Provider></MemoryRouter>);

        expect(document.querySelector('[data-icon="angle-double-left"]')).toBeInTheDocument();
        await fireEvent.click(getByLabelText('expanded'));
        expect(document.querySelector('[data-icon="angle-double-right"]')).toBeInTheDocument();
        await fireEvent.click(getByLabelText('collapsed'));
        expect(document.querySelector('[data-icon="angle-double-left"]')).toBeInTheDocument();
    });
});
