import React from "react";
import {render, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import EntityTypeDisplaySettingsModal from "./entity-type-display-settings-modal";
import {BrowserRouter as Router} from "react-router-dom";
import {entityDefinitionsArray, hubCentralConfig} from "../../../assets/mock-data/modeling/modeling";

describe("Entity type display settings modal", () => {

  afterEach(cleanup);

  test("Render entity type display settings modal", () => {
    const {getByLabelText} = render(
      <Router>
        <EntityTypeDisplaySettingsModal toggleModal={jest.fn()} isVisible={true} hubCentralConfig={hubCentralConfig} entityDefinitionsArray={entityDefinitionsArray}/>
      </Router>
    );
    expect(getByLabelText("Customer-entityType")).toBeInTheDocument();
    expect(getByLabelText("Customer-color")).toBeInTheDocument();
    expect(getByLabelText("edit-Customer-color")).toBeInTheDocument();
    expect(getByLabelText("Customer-icon")).toBeInTheDocument();
    expect(getByLabelText("edit-Customer-icon")).toBeInTheDocument();
    expect(getByLabelText("Customer-label-select-dropdown")).toBeInTheDocument();
    expect(getByLabelText("Customer-propertiesOnHover")).toBeInTheDocument();
  });

});