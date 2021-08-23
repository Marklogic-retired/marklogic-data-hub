import React from "react";
import {fireEvent, render} from "@testing-library/react";
import Sidebar from "./sidebar";
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

  test("Verify createdOn dropdown is rendered", () => {
    const {getByText} = render(<Sidebar
      entityDefArray={entityDefArray}
      facets={searchPayloadFacets}
      selectedEntities={[]}
      facetRender = {jest.fn()}
      checkFacetRender = {jest.fn()}
    />);
    expect(getByText("Select time")).toBeInTheDocument();
  });

  test("Verify createdOn dropdown is selected", () => {
    const {getByText, getByPlaceholderText} = render(<Sidebar
      entityDefArray={entityDefArray}
      facets={searchPayloadFacets}
      selectedEntities={[]}
      facetRender = {jest.fn()}
      checkFacetRender = {jest.fn()}
    />);
    expect(getByText("Select time")).toBeInTheDocument();
    userEvent.click(getByText("select time"));
    expect(getByText("Custom")).toBeInTheDocument();
    fireEvent.click(getByText("Custom"));
    expect(getByPlaceholderText("Start date ~ End date")).toBeInTheDocument();
  });

  test("Verify that hub properties is expanded by default", () => {
    const {getByText} = render(<Sidebar
      entityDefArray={entityDefArray}
      facets={searchPayloadFacets}
      selectedEntities={[]}
      facetRender = {jest.fn()}
      checkFacetRender = {jest.fn()}
    />);
    expect(document.querySelector("#hub-properties .accordion-button")).toHaveAttribute("aria-expanded", "true");
    userEvent.click(getByText("Hub Properties"));
    expect(document.querySelector("#hub-properties .accordion-button")).toHaveAttribute("aria-expanded", "false");
  });

  test("Verify that entity properties is expanded when entity is selected", () => {
    const {getByText} = render(<Sidebar
      entityDefArray={entityDefArray}
      facets={searchPayloadFacets}
      selectedEntities={["Customer"]}
      facetRender = {jest.fn()}
      checkFacetRender = {jest.fn()}
    />);
    expect(document.querySelector("#entity-properties .accordion-button")).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("#hub-properties .accordion-button")).toHaveAttribute("aria-expanded", "false");
    userEvent.click(getByText("Entity Properties"));
    userEvent.click(getByText("Hub Properties"));
    expect(document.querySelector("#entity-properties .accordion-button")).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("#hub-properties .accordion-button")).toHaveAttribute("aria-expanded", "true");
  });

  test("Verify entity properties, marked as facetable in entityModel, are rendered properly as facets", () => {
    const {getByText, getByTestId} = render(<Sidebar
      entityDefArray={entityDefArray}
      facets={searchPayloadFacets}
      selectedEntities={["Customer"]}
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

  test("Verify onclick is called for final/staging buttons", () => {
    const {getByText} = render(
      <Sidebar
        entityDefArray={entityDefArray}
        facets={searchPayloadFacets}
        selectedEntities={["Customer"]}
        facetRender={jest.fn()}
        checkFacetRender={jest.fn()}
        database="final"
        setDatabasePreferences={jest.fn()}
      />
    );

    const finalDatabaseButton = getByText("Final");
    const stagingDatabaseButton = getByText("Staging");
    finalDatabaseButton.onclick = jest.fn();
    stagingDatabaseButton.onclick = jest.fn();
    fireEvent.click(finalDatabaseButton);
    expect(finalDatabaseButton.onclick).toHaveBeenCalledTimes(1);
    fireEvent.click(stagingDatabaseButton);
    expect(stagingDatabaseButton.onclick).toHaveBeenCalledTimes(1);
  });

  test("Collapse/Expand carets render properly for database and hub properties", () => {
    const {getByText} = render(
      <Sidebar
        entityDefArray={entityDefArray}
        facets={searchPayloadFacets}
        selectedEntities={[]}
        facetRender={jest.fn()}
        checkFacetRender={jest.fn()}
        database="final"
        setDatabasePreferences={jest.fn()}
      />
    );
    expect(document.querySelector("#database .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("#database .accordion-collapse")).not.toHaveClass("collapsed");
    userEvent.click(getByText("Database"));
    expect(document.querySelector("#database .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("#database .accordion-collapse")).not.toHaveClass("collapse");

    expect(document.querySelector("#hub-properties .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("#hub-properties .accordion-collapse")).not.toHaveClass("collapsed");
    userEvent.click(getByText("Hub Properties"));
    expect(document.querySelector("#hub-properties .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("#hub-properties .accordion-collapse")).not.toHaveClass("collapse");
  });

  test("Collapse/Expand carets render properly for database, entity and hub properties", async () => {
    const {getByText} = render(
      <Sidebar
        entityDefArray={entityDefArray}
        facets={searchPayloadFacets}
        selectedEntities={["Customer"]}
        facetRender={jest.fn()}
        checkFacetRender={jest.fn()}
        database="final"
        setDatabasePreferences={jest.fn()}
      />
    );
    expect(document.querySelector("#database .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("#database .accordion-collapse")).not.toHaveClass("collapsed");
    userEvent.click(getByText("Database"));
    expect(document.querySelector("#database .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("#database .accordion-collapse")).not.toHaveClass("collapse");

    expect(document.querySelector("#entity-properties .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("#entity-properties .accordion-collapse")).not.toHaveClass("collapsed");
    userEvent.click(getByText("Entity Properties"));
    expect(document.querySelector("#entity-properties .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("#entity-properties .accordion-collapse")).not.toHaveClass("collapse");

    expect(document.querySelector("#hub-properties .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("#hub-properties .accordion-collapse")).toHaveClass("collapse");
    userEvent.click(getByText("Hub Properties"));
    expect(document.querySelector("#hub-properties .accordion-button.after-indicator")).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("#hub-properties .accordion-collapse")).not.toHaveClass("collapse");
  });

  test("Verify Include Data Hub Artifacts switch is rendered properly and user is able to toggle it", () => {
    const {getByTestId} = render(
      <Sidebar
        entityDefArray={entityDefArray}
        facets={searchPayloadFacets}
        selectedEntities={["Customer"]}
        facetRender={jest.fn()}
        checkFacetRender={jest.fn()}
        database="final"
        setDatabasePreferences={jest.fn()}
        cardView={true}
        hideDataHubArtifacts={true}
        setHubArtifactsVisibilityPreferences={jest.fn()}
      />
    );

    const includeHubArtifactsSwitch = getByTestId("toggleHubArtifacts");
    includeHubArtifactsSwitch.onclick = jest.fn();

    expect(includeHubArtifactsSwitch).not.toBeChecked(); //Siwtch is not checked by default

    userEvent.click(includeHubArtifactsSwitch); //Enabling the switch
    expect(includeHubArtifactsSwitch).toBeChecked();
    expect(includeHubArtifactsSwitch.onclick).toHaveBeenCalledTimes(1);

    userEvent.click(includeHubArtifactsSwitch); //Disabling the switch
    expect(includeHubArtifactsSwitch).not.toBeChecked();
    expect(includeHubArtifactsSwitch.onclick).toHaveBeenCalled();

  });


});
