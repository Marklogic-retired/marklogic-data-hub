import React from 'react';
import { fireEvent, render } from "@testing-library/react";
import Sidebar from './sidebar';
import searchPayloadFacets from "../../assets/mock-data/search-payload-facets";
import {entityFromJSON, entityParser} from "../../util/data-conversion";
import modelResponse from "../../assets/mock-data/model-response";
import userEvent from "@testing-library/user-event";

describe("Sidebar createdOn face time window dropdown", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Verify createdOn dropdown is rendered', () => {
        const parsedModelData = entityFromJSON(modelResponse);
        const entityDefArray = entityParser(parsedModelData);
        const { getByText } = render(<Sidebar
            entityDefArray={entityDefArray}
            facets={searchPayloadFacets}
            selectedEntities={[]}
            facetRender = {jest.fn()}
            checkFacetRender = {jest.fn()}
        />);
        userEvent.click(getByText('Hub Properties'));
        expect(getByText("Select time")).toBeInTheDocument();
    });

    test('Verify createdOn dropdown is selected', () => {
        const parsedModelData = entityFromJSON(modelResponse);
        const entityDefArray = entityParser(parsedModelData);
        const { getByText, getByTestId, getByPlaceholderText } = render(<Sidebar
            entityDefArray={entityDefArray}
            facets={searchPayloadFacets}
            selectedEntities={[]}
            facetRender = {jest.fn()}
            checkFacetRender = {jest.fn()}
        />);
        userEvent.click(getByText('Hub Properties'));
        expect(getByText("Select time")).toBeInTheDocument();
        userEvent.click(getByText('select time'));
        expect(getByText("Custom")).toBeInTheDocument();
        fireEvent.click(getByText("Custom"));
        expect(getByPlaceholderText("Start date")).toBeInTheDocument();
        expect(getByPlaceholderText("End date")).toBeInTheDocument();
    });
});