import React from "react";
import {fireEvent, render, cleanup, act} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import EntityTypeDisplaySettingsModal from "./entity-type-display-settings-modal";
import {BrowserRouter as Router} from "react-router-dom";
import {entityDefinitionsArray, hubCentralConfig} from "../../../assets/mock-data/modeling/modeling";
import {HubCentralConfigContext} from "@util/hubCentralConfig-context";

const entityType = "Customer";
const entityTypeProperty = "name";
const entityTypeColor = "#FFF0A3";

const defaultContextOptions = {
  hubCentralConfig,
  setHubCentralConfig: jest.fn(),
  getHubCentralConfigFromServer: jest.fn(),
  updateHubCentralConfigOnServer: jest.fn(),
};

describe("Entity type display settings modal", () => {

  afterEach(cleanup);

  test("Render entity type display settings modal", () => {
    const {getByLabelText} = render(
      <Router>
        <HubCentralConfigContext.Provider value={defaultContextOptions}>
          <EntityTypeDisplaySettingsModal toggleModal={jest.fn()} isVisible={true} entityDefinitionsArray={entityDefinitionsArray}/>
        </HubCentralConfigContext.Provider>
      </Router>
    );
    expect(getByLabelText(`${entityType}-entityType`)).toBeInTheDocument();
    expect(getByLabelText(`${entityType}-color-button`)).toBeInTheDocument();
    expect(getByLabelText(`${entityType}-icon-picker`)).toBeInTheDocument();
    expect(getByLabelText(`${entityType}-label-select-dropdown`)).toBeInTheDocument();
    expect(getByLabelText(`${entityType}-propertiesOnHover`)).toBeInTheDocument();
  });

  test("Open color and icon picker, choose a color and save", () => {
    const {getByLabelText, queryByLabelText, getByText, getByTitle} = render(
      <Router>
        <HubCentralConfigContext.Provider value={defaultContextOptions}>
          <EntityTypeDisplaySettingsModal toggleModal={jest.fn()} isVisible={true} entityDefinitionsArray={entityDefinitionsArray}/>
        </HubCentralConfigContext.Provider>
      </Router>
    );

    //Open color picker
    fireEvent.click(getByLabelText(`${entityType}-color-button`));
    expect(queryByLabelText(`${entityType}-color-picker-menu`)).toBeVisible();
    //Select a color
    userEvent.click(getByTitle(entityTypeColor));
    //click outside color picker and check color picker popover it's closed
    fireEvent.click(getByLabelText(`${entityType}-entityType`));
    expect(queryByLabelText(`${entityType}-color-picker-menu`)).toBeNull();
    //check the color it's selected in the component
    expect(document.querySelector(`[data-color="${entityTypeColor}"]`)).toBeInTheDocument();

    //check the icon list it's hiden before click
    expect(document.querySelector(`[aria-label=${entityType}-icon-picker] > div`)?.childElementCount).toBe(1);
    //click icon picker and check that the picker show up
    fireEvent.click(document.querySelector(`[aria-label=${entityType}-icon-picker] > div`));
    expect(document.querySelector(`[aria-label=${entityType}-icon-picker] > div`)?.childElementCount).toBe(2);
    //filter the icons typing android on search text
    fireEvent.input(document.querySelector(`[aria-label=${entityType}-icon-picker] input`), {target: {value: "android"}});
    //the options are svg elements and the click event don't work on it

    fireEvent.keyDown(getByLabelText(`${entityType}-label-select-dropdown`), {key: "ArrowDown"});
    act(() => {
      userEvent.click(getByLabelText(`${entityType}-labelOption-${entityTypeProperty}`));
    });
    expect(document.querySelector(`#${entityType}-entityProperties-select-MenuList`)).not.toBeInTheDocument();
    expect(getByLabelText(`${entityType}-labelOption-${entityTypeProperty}`)).toBeInTheDocument();

    userEvent.click(getByText("Save"));
    expect(defaultContextOptions.updateHubCentralConfigOnServer).toHaveBeenCalledTimes(1);
  });

});