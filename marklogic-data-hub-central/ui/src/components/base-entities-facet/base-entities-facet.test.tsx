import React from "react";
import {render, cleanup, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import BaseEntitiesFacet from "./base-entities-facet";

describe("Base Entities Facet", () => {

  afterEach(cleanup);

  test("Render base entities", () => {

    const {getByLabelText} = render(
      <BaseEntitiesFacet setCurrentBaseEntities={() => {}}/>
    );
    const dropdown = getByLabelText("base-entities-dropdown-list");
    expect(dropdown).toBeInTheDocument();
  });

  test("Render base entities dropdown options", () => {
    const {getByLabelText} = render(
      <BaseEntitiesFacet setCurrentBaseEntities={() => {}}/>
    );
    const dropdown = getByLabelText("base-entities-dropdown-list");
    fireEvent.keyDown(dropdown, {key: "ArrowDown"});
    expect(getByLabelText("base-option-All Entities")).toBeInTheDocument();
  });

});
