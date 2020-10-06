import React from 'react';
import Sidebar from './sidebar';
import { entityFromJSON, entityParser } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';
import searchPayloadFacets from '../../assets/mock-data/search-payload-facets';
import { render, fireEvent } from '@testing-library/react';


describe("Sidebar component", () => {
  const parsedModelData = entityFromJSON(modelResponse);
  const entityDefArray = entityParser(parsedModelData);

  it("Collapse/Expand carets render properly for hub properties", () => {
    const { getByTestId } = render(
      <Sidebar
        entityDefArray={entityDefArray}
        facets={searchPayloadFacets}
        selectedEntities={[]}
        facetRender={jest.fn()}
        checkFacetRender={jest.fn()}
      />
    );
    expect(document.querySelector('#hub-properties [data-icon=down]')).toBeInTheDocument();
    expect(document.querySelector('#hub-properties [data-icon=down]')).not.toHaveStyle('transform: rotate(180deg);');
    fireEvent.click(getByTestId('toggle'));
    expect(document.querySelector('#hub-properties [data-icon=down]')).toHaveStyle('transform: rotate(180deg);');
  });

  it("Collapse/Expand carets render properly for entity and hub properties", () => {
    const { getAllByTestId } = render(
      <Sidebar
        entityDefArray={entityDefArray}
        facets={searchPayloadFacets}
        selectedEntities={['Customer']}
        facetRender={jest.fn()}
        checkFacetRender={jest.fn()}
      />
    );
    expect(document.querySelector('#entity-properties [data-icon=down]')).toBeInTheDocument();
    expect(document.querySelector('#entity-properties [data-icon=down]')).not.toHaveStyle('transform: rotate(180deg);');
    fireEvent.click(getAllByTestId('toggle')[0]);
    expect(document.querySelector('#entity-properties [data-icon=down]')).toHaveStyle('transform: rotate(180deg);');
    expect(document.querySelector('#hub-properties [data-icon=down]')).toBeInTheDocument();
    expect(document.querySelector('#hub-properties [data-icon=down]')).toHaveStyle('transform: rotate(180deg);');
    fireEvent.click(getAllByTestId('toggle')[1]);
    expect(document.querySelector('#hub-properties [data-icon=down]')).not.toHaveStyle('transform: rotate(180deg);');
  });
});
