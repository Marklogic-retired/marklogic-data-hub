import React from "react";
import {render, fireEvent, cleanup, wait} from "@testing-library/react";
import CreateEditStep from "./create-edit-step";
import data from "../../../assets/mock-data/curation/create-edit-step.data";
import axiosMock from "axios";
import {stringSearchResponse} from "../../../assets/mock-data/explore/facet-props";
import {SecurityTooltips} from "../../../config/tooltips.config";

jest.mock("axios");
describe("Create Edit Step Dialog component", () => {

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test("Verify Edit Merging dialog renders correctly for a read only user", () => {
    const {getByText, getByPlaceholderText, getByLabelText} = render(
      <CreateEditStep {...data.editMerging} canReadWrite={false} />
    );

    const stepName = getByPlaceholderText("Enter name");
    const description = getByPlaceholderText("Enter description");
    const collection = getByLabelText("Collection");
    const timestamp = getByPlaceholderText("Enter path to the timestamp");

    expect(stepName).toHaveValue("mergeCustomers");
    expect(stepName).toBeDisabled();
    expect(description).toHaveValue("merge customer description");
    expect(description).toBeDisabled();
    expect(collection).toBeChecked();
    expect(collection).toBeDisabled();
    expect(getByLabelText("Query")).toBeDisabled();
    const collInput = document.querySelector(("#collList .ant-input"));
    expect(collInput).toBeDisabled();
    expect(timestamp).toHaveValue("/envelope/headers/createdOn");
    expect(timestamp).toBeDisabled();

    fireEvent.mouseOver(getByText("Save"));
    wait(() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());
    expect(getByText("Save")).toBeDisabled();
    expect(getByText("Cancel")).toBeEnabled();
  });

  test("Verify New Merging Dialog renders ", () => {
    const {getByText, getByLabelText, getByPlaceholderText} = render(
      <CreateEditStep {...data.newMerging} />
    );

    expect(getByPlaceholderText("Enter name")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter description")).toBeInTheDocument();
    expect(getByLabelText("Collection")).toBeInTheDocument();
    expect(getByLabelText("Query")).toBeInTheDocument();
    expect(getByLabelText("collection-input")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter path to the timestamp")).toBeInTheDocument();
    expect(getByText("Save")).toBeEnabled();
    expect(getByText("Cancel")).toBeEnabled();
    //Collection radio button should be selected by default
    expect(getByLabelText("Collection")).toBeChecked();
  });

  test("Verify save button is always enabled", () => {
    const {getByText, getByPlaceholderText} = render(<CreateEditStep {...data.newMerging} />);
    const nameInput = getByPlaceholderText("Enter name");
    const saveButton = getByText("Save");

    expect(saveButton).toBeEnabled(); // button should be enabled without any input

    fireEvent.change(nameInput, {target: {value: "testCreateMerging"}});
    expect(nameInput).toHaveValue("testCreateMerging");
    expect(saveButton).toBeEnabled();

    fireEvent.change(nameInput, {target: {value: ""}});
    expect(getByText("Name is required")).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });

  test("Verify Save button requires all mandatory fields", async () => {
    const {getByText, getByPlaceholderText} = render(<CreateEditStep {...data.newMerging} />);
    const nameInput = getByPlaceholderText("Enter name");
    const collInput = document.querySelector(("#collList .ant-input"));

    // click save without any input
    fireEvent.click(getByText("Save"));

    // both messages should show when both boxes are empty
    expect(getByText("Name is required")).toBeInTheDocument();
    expect(getByText("Collection or Query is required")).toBeInTheDocument();

    // enter name only
    fireEvent.change(nameInput, {target: {value: "testCreateMap"}});
    expect(nameInput).toHaveValue("testCreateMap");

    fireEvent.click(getByText("Save"));

    // error message for name should not appear
    expect(getByText("Collection or Query is required")).toBeInTheDocument();

    // clear name and enter collection only
    fireEvent.change(nameInput, {target: {value: ""}});
    await wait(() => {
      if (collInput) {
        fireEvent.change(collInput, {target: {value: "testCollection"}});
      }
    });
    expect(collInput).toHaveValue("testCollection");

    fireEvent.click(getByText("Save"));

    // error message for empty collection should not appear
    expect(getByText("Name is required")).toBeInTheDocument();
  });

  test("Verify able to type in input fields and typeahead search in collections field", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: stringSearchResponse})));
    const {getByText, getByLabelText, getByPlaceholderText} = render(<CreateEditStep {...data.newMerging} />);

    const descInput = getByPlaceholderText("Enter description");
    const collInput = document.querySelector(("#collList .ant-input"));
    const saveButton = getByText("Save");
    saveButton.onclick = jest.fn();

    fireEvent.change(descInput, {target: {value: "test description"}});
    expect(descInput).toHaveValue("test description");
    await wait(() => {
      if (collInput) {
        fireEvent.change(collInput, {target: {value: "ada"}});
      }
    });
    let url = "/api/entitySearch/facet-values?database=staging";
    let payload = {
      "referenceType": "collection",
      "entityTypeId": " ",
      "propertyPath": " ",
      "limit": 10,
      "dataType": "string",
      "pattern": "ada"
    };
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(getByText("Adams Cole")).toBeInTheDocument();

    await wait(() => {
      if (collInput) {
        fireEvent.change(collInput, {target: {value: "testCollection"}});
      }
    });
    expect(collInput).toHaveValue("testCollection");
    fireEvent.click(getByLabelText("Query"));
    const queryInput = getByPlaceholderText("Enter source query");
    fireEvent.change(queryInput, {target: {value: "cts.collectionQuery([\"testCollection\"])"}});
    expect(queryInput).toHaveTextContent("cts.collectionQuery([\"testCollection\"])");
    fireEvent.click(saveButton);
    expect(saveButton.onclick).toHaveBeenCalled();
  });

  test("Verify able to type in input fields and typeahead search in collections field", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: stringSearchResponse})));
    const {getByText, getByLabelText, getByPlaceholderText} = render(<CreateEditStep {...data.newMerging} />);

    const descInput = getByPlaceholderText("Enter description");
    const collInput = document.querySelector(("#collList .ant-input"));
    const timestampInput = getByPlaceholderText("Enter path to the timestamp");
    const saveButton = getByText("Save");
    saveButton.onclick = jest.fn();

    fireEvent.change(descInput, {target: {value: "test description"}});
    expect(descInput).toHaveValue("test description");
    await wait(() => {
      if (collInput) {
        fireEvent.change(collInput, {target: {value: "ada"}});
      }
    });
    let url = "/api/entitySearch/facet-values?database=staging";
    let payload = {
      "referenceType": "collection",
      "entityTypeId": " ",
      "propertyPath": " ",
      "limit": 10,
      "dataType": "string",
      "pattern": "ada"
    };
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(getByText("Adams Cole")).toBeInTheDocument();

    await wait(() => {
      if (collInput) {
        fireEvent.change(collInput, {target: {value: "testCollection"}});
      }
    });
    expect(collInput).toHaveValue("testCollection");
    fireEvent.click(getByLabelText("Query"));
    const queryInput = getByPlaceholderText("Enter source query");
    fireEvent.change(queryInput, {target: {value: "cts.collectionQuery([\"testCollection\"])"}});
    expect(queryInput).toHaveTextContent("cts.collectionQuery([\"testCollection\"])");

    fireEvent.change(timestampInput, {target: {value: "/test/path/to/timestamp"}});
    expect(timestampInput).toHaveValue("/test/path/to/timestamp");

    fireEvent.click(saveButton);
    expect(saveButton.onclick).toHaveBeenCalled();

  });

  test("Verify Edit Merging dialog renders correctly", () => {
    const {getByText, getByPlaceholderText, getByLabelText} = render(<CreateEditStep {...data.editMerging} />);
    expect(getByPlaceholderText("Enter name")).toHaveValue("mergeCustomers");
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    expect(getByPlaceholderText("Enter description")).toHaveValue("merge customer description");

    expect(getByLabelText("Collection")).toBeChecked();
    const collInput = document.querySelector(("#collList .ant-input"));
    expect(collInput).toHaveValue("matchCustomers");

    fireEvent.click(getByLabelText("Query"));
    expect(getByPlaceholderText("Enter source query")).toHaveTextContent("cts.collectionQuery(['matchCustomers'])");

    expect(getByPlaceholderText("Enter path to the timestamp")).toHaveValue("/envelope/headers/createdOn");

    expect(getByText("Save")).toBeEnabled();
    expect(getByText("Cancel")).toBeEnabled();

    fireEvent.click(getByLabelText("Collection"));

    fireEvent.click(getByText("Save"));
    expect(data.editMerging.createStepArtifact).toBeCalledWith({
      name: "mergeCustomers",
      targetEntityType: "Customer",
      description: "merge customer description",
      collection: "matchCustomers",
      selectedSource: "collection",
      sourceQuery: "cts.collectionQuery(['matchCustomers'])",
      timestamp: "/envelope/headers/createdOn"
    });
  });

});
