import React from 'react';
import Sidebar from './sidebar';
import { entityFromJSON, entityParser } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';
import searchPayloadFacets from '../../assets/mock-data/search-payload-facets';
import { render, fireEvent } from '@testing-library/react';
import userEvent from "@testing-library/user-event";


describe("Sidebar component", () => {
  const parsedModelData = entityFromJSON(modelResponse);
  const entityDefArray = entityParser(parsedModelData);

  it("Collapse/Expand carets render properly for database and hub properties", () => {
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
    )
    expect(document.querySelector('#database [data-icon=down]')).toBeInTheDocument();
    expect(document.querySelector('#database [data-icon=down]')).not.toHaveStyle('transform: rotate(180deg);');
    userEvent.click(getByText('Database'));
    expect(document.querySelector('#database [data-icon=down]')).toHaveStyle('transform: rotate(180deg);');

    expect(document.querySelector('#hub-properties [data-icon=down]')).toBeInTheDocument();
    expect(document.querySelector('#hub-properties [data-icon=down]')).not.toHaveStyle('transform: rotate(180deg);');
    userEvent.click(getByText('Hub Properties'));
    expect(document.querySelector('#hub-properties [data-icon=down]')).toHaveStyle('transform: rotate(180deg);');
  });

  it("Collapse/Expand carets render properly for database, entity and hub properties", () => {
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
    )
    expect(document.querySelector('#database [data-icon=down]')).toBeInTheDocument();
    expect(document.querySelector('#database [data-icon=down]')).not.toHaveStyle('transform: rotate(180deg);');
    userEvent.click(getByText('Database'));
    expect(document.querySelector('#database [data-icon=down]')).toHaveStyle('transform: rotate(180deg);');
    expect(document.querySelector('#entity-properties [data-icon=down]')).toBeInTheDocument();
    expect(document.querySelector('#entity-properties [data-icon=down]')).not.toHaveStyle('transform: rotate(180deg);');
    userEvent.click(getByText('Entity Properties'));
    expect(document.querySelector('#entity-properties [data-icon=down]')).toHaveStyle('transform: rotate(180deg);');
    expect(document.querySelector('#hub-properties [data-icon=down]')).toBeInTheDocument();
    expect(document.querySelector('#hub-properties [data-icon=down]')).toHaveStyle('transform: rotate(180deg);');
    userEvent.click(getByText('Hub Properties'));
    expect(document.querySelector('#hub-properties [data-icon=down]')).not.toHaveStyle('transform: rotate(180deg);');
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
    )

    const finalDatabaseButton = getByText('Final');
    const stagingDatabaseButton = getByText('Staging');
    finalDatabaseButton.onclick = jest.fn();
    stagingDatabaseButton.onclick = jest.fn();
    fireEvent.click(finalDatabaseButton);
    expect(finalDatabaseButton.onclick).toHaveBeenCalledTimes(1);
    fireEvent.click(stagingDatabaseButton);
    expect(stagingDatabaseButton.onclick).toHaveBeenCalledTimes(1);
});

})
