import React from 'react';
import { fireEvent, render } from "@testing-library/react";
import Sidebar from './sidebar';
import searchPayloadFacets from "../../assets/mock-data/explore/search-payload-facets";
import {entityFromJSON, entityParser} from "../../util/data-conversion";
import modelResponse from "../../assets/mock-data/explore/model-response";
import userEvent from "@testing-library/user-event";

describe("Sidebar createdOn face time window dropdown", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const parsedModelData = entityFromJSON(modelResponse);
    const entityDefArray = entityParser(parsedModelData);

    test('Verify createdOn dropdown is rendered', () => {
        const { getByText } = render(<Sidebar
            entityDefArray={entityDefArray}
            facets={searchPayloadFacets}
            selectedEntities={[]}
            facetRender = {jest.fn()}
            checkFacetRender = {jest.fn()}
        />);
        expect(getByText("Select time")).toBeInTheDocument();
    });

    test('Verify createdOn dropdown is selected', () => {
        const { getByText, getByTestId, getByPlaceholderText } = render(<Sidebar
            entityDefArray={entityDefArray}
            facets={searchPayloadFacets}
            selectedEntities={[]}
            facetRender = {jest.fn()}
            checkFacetRender = {jest.fn()}
        />);
        expect(getByText("Select time")).toBeInTheDocument();
        userEvent.click(getByText('select time'));
        expect(getByText("Custom")).toBeInTheDocument();
        fireEvent.click(getByText("Custom"));
        expect(getByPlaceholderText("Start date")).toBeInTheDocument();
        expect(getByPlaceholderText("End date")).toBeInTheDocument();
    });

    test('Verify that hub properties is expanded by default', () => {
        const { getByText } = render(<Sidebar
            entityDefArray={entityDefArray}
            facets={searchPayloadFacets}
            selectedEntities={[]}
            facetRender = {jest.fn()}
            checkFacetRender = {jest.fn()}
        />);
        expect(document.querySelector('#hub-properties div')).toHaveAttribute('aria-expanded','true');
        userEvent.click(getByText('Hub Properties'));
        expect(document.querySelector('#hub-properties div')).toHaveAttribute('aria-expanded','false');
    });

    test('Verify that entity properties is expanded when entity is selected', () => {
        const { getByText } = render(<Sidebar
            entityDefArray={entityDefArray}
            facets={searchPayloadFacets}
            selectedEntities={['Customer']}
            facetRender = {jest.fn()}
            checkFacetRender = {jest.fn()}
        />);
        expect(document.querySelector('#entity-properties div')).toHaveAttribute('aria-expanded','true');
        expect(document.querySelector('#hub-properties div')).toHaveAttribute('aria-expanded','false');
        userEvent.click(getByText('Entity Properties'));
        userEvent.click(getByText('Hub Properties'));
        expect(document.querySelector('#entity-properties div')).toHaveAttribute('aria-expanded','false');
        expect(document.querySelector('#hub-properties div')).toHaveAttribute('aria-expanded','true');
    });

    test('Verify entity properties, marked as facetable in entityModel, are rendered properly as facets', () => {
        const { getByText, getByTestId } = render(<Sidebar
            entityDefArray={entityDefArray}
            facets={searchPayloadFacets}
            selectedEntities={['Customer']}
            facetRender = {jest.fn()}
            checkFacetRender = {jest.fn()}
        />);
        expect(getByText("Entity Properties")).toBeInTheDocument(); //Checking if Entity Properties label is available

        //Validate if gender property and its values
        expect(getByTestId("gender-facet")).toBeInTheDocument();
        expect(getByText("F")).toBeInTheDocument();
        expect(getByText("454")).toBeInTheDocument(); //Count of documents with gender as F
        expect(getByText("M")).toBeInTheDocument();
        expect(getByText("546")).toBeInTheDocument(); //Count of documents with gender as M

        //Validate if sales_region property and its values
        expect(getByTestId("sales_region-facet")).toBeInTheDocument();
        expect(getByText("Alabama")).toBeInTheDocument();
        expect(getByText("18")).toBeInTheDocument(); //Count of documents with sales region as Alabama
        expect(getByText("Alaska")).toBeInTheDocument();
        expect(getByText("15")).toBeInTheDocument(); //Count of documents with sales region as Alaska
    });

    test('Verify onclick is called for final/staging buttons', () => {
        const { getByText } = render(
            <Sidebar
                entityDefArray={entityDefArray}
                facets={searchPayloadFacets}
                selectedEntities={['Customer']}
                facetRender={jest.fn()}
                checkFacetRender={jest.fn()}
                database='final'
                setDatabasePreferences={jest.fn()}
            />
        );

        const finalDatabaseButton = getByText('Final');
        const stagingDatabaseButton = getByText('Staging');
        finalDatabaseButton.onclick = jest.fn();
        stagingDatabaseButton.onclick = jest.fn();
        fireEvent.click(finalDatabaseButton);
        expect(finalDatabaseButton.onclick).toHaveBeenCalledTimes(1);
        fireEvent.click(stagingDatabaseButton);
        expect(stagingDatabaseButton.onclick).toHaveBeenCalledTimes(1);
    });

    test("Collapse/Expand carets render properly for database and hub properties", () => {
        const { getByText } = render(
            <Sidebar
                entityDefArray={entityDefArray}
                facets={searchPayloadFacets}
                selectedEntities={[]}
                facetRender={jest.fn()}
                checkFacetRender={jest.fn()}
                database='final'
                setDatabasePreferences={jest.fn()}
            />
        );
        expect(document.querySelector('#database [data-icon=down]')).toBeInTheDocument();
        expect(document.querySelector('#database [data-icon=down]')).not.toHaveStyle('transform: rotate(-90deg);');
        userEvent.click(getByText('Database'));
        expect(document.querySelector('#database [data-icon=down]')).toHaveStyle('transform: rotate(-90deg);');

        expect(document.querySelector('#hub-properties [data-icon=down]')).toBeInTheDocument();
        expect(document.querySelector('#hub-properties [data-icon=down]')).not.toHaveStyle('transform: rotate(-90deg);');
        userEvent.click(getByText('Hub Properties'));
        expect(document.querySelector('#hub-properties [data-icon=down]')).toHaveStyle('transform: rotate(-90deg);');
    });

    test("Collapse/Expand carets render properly for database, entity and hub properties", () => {
        const { getByText } = render(
            <Sidebar
                entityDefArray={entityDefArray}
                facets={searchPayloadFacets}
                selectedEntities={['Customer']}
                facetRender={jest.fn()}
                checkFacetRender={jest.fn()}
                database='final'
                setDatabasePreferences={jest.fn()}
            />
        );
        expect(document.querySelector('#database [data-icon=down]')).toBeInTheDocument();
        expect(document.querySelector('#database [data-icon=down]')).not.toHaveStyle('transform: rotate(-90deg);');
        userEvent.click(getByText('Database'));
        expect(document.querySelector('#database [data-icon=down]')).toHaveStyle('transform: rotate(-90deg);');
        expect(document.querySelector('#entity-properties [data-icon=down]')).toBeInTheDocument();
        expect(document.querySelector('#entity-properties [data-icon=down]')).not.toHaveStyle('transform: rotate(-90deg);');
        userEvent.click(getByText('Entity Properties'));
        expect(document.querySelector('#entity-properties [data-icon=down]')).toHaveStyle('transform: rotate(-90deg);');
        expect(document.querySelector('#hub-properties [data-icon=down]')).toBeInTheDocument();
        expect(document.querySelector('#hub-properties [data-icon=down]')).toHaveStyle('transform: rotate(-90deg);');
        userEvent.click(getByText('Hub Properties'));
        expect(document.querySelector('#hub-properties [data-icon=down]')).not.toHaveStyle('transform: rotate(-90deg);');
    });


});
