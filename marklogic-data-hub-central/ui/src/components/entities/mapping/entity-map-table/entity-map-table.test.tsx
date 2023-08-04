import React from "react";
import {render, screen} from "@testing-library/react";
import EntityMapTable from "./entity-map-table";
import {environmentMock, mockEntityMapTable} from "../../../../assets/mock-data/mapping/entityMapTable";
import userEvent from "@testing-library/user-event";

describe("Test for entity map table", () => {
  it("Verify version in info links", async () => {
    let localStorageMock = (function () {
      let store = {
        environment: environmentMock,
      };
      return {
        getItem: function (key) {
          return store[key];
        },
      };
    })();
    Object.defineProperty(window, "localStorage", {value: localStorageMock});

    render(
      <EntityMapTable
        setScrollRef={mockEntityMapTable.setScrollRef}
        executeScroll={mockEntityMapTable.executeScroll}
        mapResp={mockEntityMapTable.mapResp}
        mapData={mockEntityMapTable.mapData}
        setMapResp={mockEntityMapTable.setMapResp}
        mapExpTouched={mockEntityMapTable.mapExpTouched}
        setMapExpTouched={mockEntityMapTable.setMapExpTouched}
        flatArray={mockEntityMapTable.flatArray}
        saveMapping={mockEntityMapTable.saveMapping}
        dummyNode={mockEntityMapTable.dummyNode}
        getInitialChars={mockEntityMapTable.getInitialChars}
        canReadWrite={mockEntityMapTable.canReadWrite}
        entityTypeTitle={mockEntityMapTable.entityTypeTitle}
        entityModel={mockEntityMapTable.entityModel}
        checkedEntityColumns={mockEntityMapTable.checkedEntityColumns}
        entityTypeProperties={mockEntityMapTable.entityTypeProperties}
        entityMappingId={mockEntityMapTable.entityMappingId}
        relatedMappings={mockEntityMapTable.relatedEntitiesSelected}
        entityExpandedKeys={mockEntityMapTable.entityExpandedKeys}
        setEntityExpandedKeys={mockEntityMapTable.setEntityExpandedKeys}
        allEntityKeys={mockEntityMapTable.allEntityKeys}
        setExpandedEntityFlag={mockEntityMapTable.setExpandedEntityFlag}
        initialEntityKeys={mockEntityMapTable.initialEntityKeys}
        tooltipsData={mockEntityMapTable.tooltipsData}
        updateStep={mockEntityMapTable.updateStep}
        relatedEntityTypeProperties={mockEntityMapTable.relatedEntityTypeProperties}
        relatedEntitiesSelected={mockEntityMapTable.relatedEntitiesSelected}
        setRelatedEntitiesSelected={mockEntityMapTable.setRelatedEntitiesSelected}
        isRelatedEntity={mockEntityMapTable.isRelatedEntity}
        tableColor="#EAE9EE"
        firstRowTableKeyIndex={mockEntityMapTable.firstRowTableKeyIndex}
        filterStr={mockEntityMapTable.filterStr}
        setFilterStr={mockEntityMapTable.setFilterStr}
        allRelatedEntitiesKeys={mockEntityMapTable.allEntityKeys}
        setAllRelatedEntitiesKeys={mockEntityMapTable.setAllRelatedEntitiesKeys}
        mapFunctions={mockEntityMapTable.mapFunctions}
        mapRefs={mockEntityMapTable.mapRefs}
        savedMappingArt={mockEntityMapTable.savedMappingArt}
        deleteRelatedEntity={mockEntityMapTable.deleteRelatedEntity}
        labelRemoved={mockEntityMapTable.labelRemoved}
        entityLoaded={mockEntityMapTable.entityLoaded}
      />,
    );
    userEvent.hover(screen.getAllByTestId("XPathInfoIcon")[0]);
    expect((await screen.findAllByLabelText("Custom-Functions"))[0]).toHaveAttribute(
      "href",
      "https://docs.marklogic.com/datahub/6.0/flows/create-custom-mapping-functions.html",
    );

    expect((await screen.findAllByLabelText("Mapping-Functions"))[0]).toHaveAttribute(
      "href",
      "https://docs.marklogic.com/datahub/6.0/flows/dhf-mapping-functions.html",
    );

    userEvent.hover(screen.getAllByTestId("relatedInfoIcon")[0]);
    expect((await screen.findAllByLabelText("link-Documentation"))[0]).toHaveAttribute(
      "href",
      "https://docs.marklogic.com/datahub/6.0/flows/about-mapping.html",
    );
  });
});
