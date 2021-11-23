import React from "react";
import {render, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import RelatedEntitiesFacet from "./related-entities-facet";

const CUSTOMERS = {name: "Customers", color: "#D5D3DD", amount: 100, filter: 1};

describe("Related Entities Facet", () => {

  afterEach(cleanup);

  test("Render base entities", () => {
    const currentRelatedEntities = new Map<string, any>([["Customer", CUSTOMERS]]);
    const setCurrentRelatedEntities = () => {};
    const {getByLabelText} = render(
      <RelatedEntitiesFacet currentRelatedEntities={currentRelatedEntities} setCurrentRelatedEntities={setCurrentRelatedEntities} onSettingCheckedList={() => {}}/>
    );
    const dropdown = getByLabelText("related-entities-list");
    expect(dropdown).toBeInTheDocument();
    const option = getByLabelText("related-entity-check-Customers");
    expect(option).toBeInTheDocument();
  });
});
