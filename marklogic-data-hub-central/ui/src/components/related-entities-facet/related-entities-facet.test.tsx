import React from "react";
import {render, cleanup, fireEvent, screen} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import RelatedEntitiesFacet from "./related-entities-facet";

const CUSTOMERS = {name: "Customers", color: "#D5D3DD", amount: 100, filter: 1};

const entityIndicatorData = {
  max: 10,
  entities: {
    "Customers": {
      filter: 2,
      amount: 5,
    },
  },
};

describe("Related Entities Facet", () => {
  afterEach(cleanup);

  test("Render base entities", async () => {
    const currentRelatedEntities = new Map<string, any>([["Customer", CUSTOMERS]]);
    const setCurrentRelatedEntities = () => {};
    const setActiveRelatedEntities = () => {};
    const setEntitySpecificPanel = () => {};
    const {getByLabelText} = render(
      <RelatedEntitiesFacet
        currentRelatedEntities={currentRelatedEntities}
        setCurrentRelatedEntities={setCurrentRelatedEntities}
        setActiveRelatedEntities={setActiveRelatedEntities}
        setEntitySpecificPanel={setEntitySpecificPanel}
        onSettingCheckedList={() => {}}
        entityIndicatorData={entityIndicatorData}
      />,
    );
    const dropdown = getByLabelText("related-entities-list");
    expect(dropdown).toBeInTheDocument();
    const option = getByLabelText("related-entity-check-Customers");
    expect(option).toBeInTheDocument();

    //To test tooltip over related entities in explore sideView panel
    fireEvent.mouseOver(option);
    expect(await screen.findAllByLabelText("relatedEntityToolTip")).toHaveLength(1);
  });

  test("Should render filter and quantity bar", () => {
    const currentRelatedEntities = new Map<string, any>([["Customer", CUSTOMERS]]);
    const setCurrentRelatedEntities = () => {};
    const setActiveRelatedEntities = () => {};
    const setEntitySpecificPanel = () => {};
    const {getByLabelText} = render(
      <RelatedEntitiesFacet
        currentRelatedEntities={currentRelatedEntities}
        setCurrentRelatedEntities={setCurrentRelatedEntities}
        setActiveRelatedEntities={setActiveRelatedEntities}
        setEntitySpecificPanel={setEntitySpecificPanel}
        onSettingCheckedList={() => {}}
        entityIndicatorData={entityIndicatorData}
      />,
    );
    expect(getByLabelText("related-entity-Customers-filter")).toBeInTheDocument();
    expect(getByLabelText("related-entity-Customers-filter")).toHaveTextContent("5");
    expect(getByLabelText("related-entity-Customers-amountbar")).toBeInTheDocument();
  });
});
