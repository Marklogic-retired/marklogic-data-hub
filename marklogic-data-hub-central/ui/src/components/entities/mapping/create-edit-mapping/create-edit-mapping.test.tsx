import React from "react";
import {render, fireEvent, cleanup, wait} from "@testing-library/react";
import CreateEditMapping from "./create-edit-mapping";
import data from "../../../../assets/mock-data/curation/common.data";
import axiosMock from "axios";
import {stringSearchResponse} from "../../../../assets/mock-data/explore/facet-props";
import {NewMapTooltips, CommonStepTooltips} from "../../../../config/tooltips.config";

jest.mock("axios");
describe("Create/Edit Mapping Step artifact component", () => {

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test("Verify New Mapping Step dialog renders ", () => {
    const {getByText, getByLabelText, getByPlaceholderText} = render(
      <CreateEditMapping {...data.newMap} />
    );

    expect(getByPlaceholderText("Enter name")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter description")).toBeInTheDocument();
    expect(getByLabelText("Collection")).toBeInTheDocument();
    expect(getByLabelText("Query")).toBeInTheDocument();
    expect(getByLabelText("collection-input")).toBeInTheDocument();
    expect(getByText("Save")).toBeEnabled();
    expect(getByText("Cancel")).toBeEnabled();
    //Collection radio button should be selected by default
    expect(getByLabelText("Collection")).toBeChecked();
  });

  test("Verify mapping name, source query is mandatory and Save button is always enabled", async () => {
    const {getByText, getByPlaceholderText, getByLabelText} = render(<CreateEditMapping {...data.newMap} />);
    const nameInput = getByPlaceholderText("Enter name");
    const saveButton = getByText("Save");

    // Enter the value for name input.
    fireEvent.change(nameInput, {target: {value: "testCreateMap"}});
    expect(nameInput).toHaveValue("testCreateMap");
    expect(saveButton).toBeEnabled();

    //Providing the value for Collection field now so that Save button can be enabled.
    const collInput = document.querySelector(("#collList .ant-input"));
    await wait(() => {
      if (collInput) {
        fireEvent.change(collInput, {target: {value: "testCollection"}});
      }
    });
    expect(collInput).toHaveValue("testCollection");
    expect(saveButton).toBeEnabled();

    //Removing the value of Name field to check if getting the error what name field is required.
    fireEvent.change(nameInput, {target: {value: ""}});
    expect(getByText("Name is required")).toBeInTheDocument();
    expect(saveButton).toBeEnabled();

    //Adding the value for name field to test if Source Query /Collections fields are 'Required', in the next test case.
    fireEvent.change(nameInput, {target: {value: "testCreateMap"}});
    expect(nameInput).toHaveValue("testCreateMap");
    expect(saveButton).toBeEnabled();

    //Removing collection field value to check if we get the validation error as 'Collection or Query is required'.
    await wait(() => {
      if (collInput) {
        fireEvent.change(collInput, {target: {value: ""}});
      }
    });
    expect(getByText("Collection or Query is required")).toBeInTheDocument();
    expect(saveButton).toBeEnabled();

    await wait(() => {
      if (collInput) {
        fireEvent.change(collInput, {target: {value: "testCollection"}});
      }
    });
    expect(collInput).toHaveValue("testCollection");
    expect(saveButton).toBeEnabled();

    // Remove collection value first and provide a value for Query field later.
    await wait(() => {
      if (collInput) {
        fireEvent.change(collInput, {target: {value: ""}});
      }
    });
    expect(saveButton).toBeEnabled();
    fireEvent.click(getByLabelText("Query"));  //updating the value of Query field now.
    const queryInput = getByPlaceholderText("Enter source query");
    fireEvent.change(queryInput, {target: {value: "cts.collectionQuery([\"testCollection\"])"}});
    expect(saveButton).toBeEnabled();

    //Removing source field value now to check if we get the validation error as 'Collection or Query is required'.
    fireEvent.change(queryInput, {target: {value: ""}});
    expect(getByText("Collection or Query is required")).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });

  test("Verify able to type in input fields and typeahead search in collections field", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: stringSearchResponse})));
    const {getByText, getByLabelText, getByPlaceholderText} = render(
      <CreateEditMapping {...data.newMap} />
    );

    const descInput = getByPlaceholderText("Enter description");
    const saveButton = getByText("Save");
    saveButton.onclick = jest.fn();

    fireEvent.change(descInput, {target: {value: "test description"}});
    expect(descInput).toHaveValue("test description");

    const collInput = document.querySelector(("#collList .ant-input"));
    //verify typeahead search in collections field
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
    fireEvent.change(queryInput, {target: {value: "cts.collectionQuery(\"testCollection\")"}});
    expect(queryInput).toHaveTextContent("cts.collectionQuery(\"testCollection\")");
    expect(collInput).toHaveValue("testCollection");
    fireEvent.change(queryInput, {target: {value: "cts.collectionQuery(['testCollection'])"}});
    expect(queryInput).toHaveTextContent("cts.collectionQuery(['testCollection'])");
    expect(collInput).toHaveValue("testCollection");
    fireEvent.change(queryInput, {target: {value: "cts.collectionQuery('testCollection')"}});
    expect(queryInput).toHaveTextContent("cts.collectionQuery('testCollection')");
    expect(collInput).toHaveValue("testCollection");
    fireEvent.click(saveButton);
    expect(saveButton.onclick).toHaveBeenCalled();

  });

  test("Verify Save button requires all mandatory fields and error messaging appears as needed", async () => {
    const {getByText, queryByText, getByPlaceholderText} = render(<CreateEditMapping {...data.newMap} />);
    const nameInput = getByPlaceholderText("Enter name");
    const collInput = document.querySelector(("#collList .ant-input"));

    // click save without any input
    fireEvent.click(getByText("Save"));

    // both messages should show when both boxes are empty
    expect(getByText("Name is required")).toBeInTheDocument();
    expect(getByText("Collection or Query is required")).toBeInTheDocument();

    //verify validation on name field

    //proper error message shows when field does not lead with a letter
    fireEvent.change(nameInput, {target: {value: "123testCreateMap"}});
    expect(getByText("Names must start with a letter and can contain letters, numbers, hyphens, and underscores only.")).toBeInTheDocument();

    //reset name field
    fireEvent.change(nameInput, {target: {value: ""}});
    expect(getByText("Name is required")).toBeInTheDocument();

    //proper error message shows when field contains special characters
    fireEvent.change(nameInput, {target: {value: "testCreateStep^()+="}});
    expect(getByText("Names must start with a letter and can contain letters, numbers, hyphens, and underscores only.")).toBeInTheDocument();

    //reset name field
    fireEvent.change(nameInput, {target: {value: ""}});
    expect(getByText("Name is required")).toBeInTheDocument();

    //enter in a valid name and verify error message disappears (test hyphen and underscores are allowed)
    fireEvent.change(nameInput, {target: {value: "test_Create-Step-"}});

    await wait(() => {
      expect(queryByText("Name is required")).toBeNull();
      expect(queryByText("Names must start with a letter and can contain letters, numbers, hyphens, and underscores only.")).toBeNull();
    });

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

  test("Verify Edit Mapping Step dialog renders correctly", () => {
    const {getByText, getByPlaceholderText, getByLabelText} = render(
      <CreateEditMapping {...data.editMap} />
    );
    expect(getByPlaceholderText("Enter name")).toHaveValue("testMap");
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    expect(getByPlaceholderText("Enter description")).toHaveValue("Description of testMap");

    expect(getByLabelText("Collection")).toBeChecked();
    const collInput = document.querySelector(("#collList .ant-input"));
    expect(collInput).toHaveValue("map-collection");

    fireEvent.click(getByLabelText("Query"));
    expect(getByPlaceholderText("Enter source query")).toHaveTextContent("cts.collectionQuery(['map-collection'])");

    expect(getByText("Save")).toBeEnabled();
    expect(getByText("Cancel")).toBeEnabled();
  });

  test("Verify Edit Mapping Step dialog renders correctly for a read only user", async () => {
    const {getByText, getByPlaceholderText, getByLabelText} = render(
      <CreateEditMapping {...data.editMap} canReadOnly={true} canReadWrite={false}/>
    );

    expect(getByPlaceholderText("Enter name")).toHaveValue("testMap");
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    expect(getByPlaceholderText("Enter description")).toHaveValue("Description of testMap");
    expect(getByPlaceholderText("Enter description")).toBeDisabled();
    expect(getByLabelText("Collection")).toBeChecked();
    expect(getByLabelText("Collection")).toBeDisabled();
    expect(getByLabelText("Query")).toBeDisabled();
    const collInput = document.querySelector(("#collList .ant-input"));
    expect(collInput).toBeDisabled();
    expect(getByText("Save")).toBeDisabled();
    fireEvent.mouseOver(getByText("Save"));
    await wait(() => {
      fireEvent.click(getByText(NewMapTooltips.missingPermission));
    });
    expect(getByText("Cancel")).toBeEnabled();
  });

  test("Verify collection and query tooltips appear when hovered", () => {
    const {getByText, getByTestId} = render(<CreateEditMapping {...data.editMap} />);

    fireEvent.mouseOver(getByTestId("collectionTooltip"));
    wait(() => expect(getByText(CommonStepTooltips.radioCollection)).toBeInTheDocument());

    fireEvent.mouseOver(getByTestId("queryTooltip"));
    wait(() => expect(getByText(CommonStepTooltips.radioQuery)).toBeInTheDocument());
  });

});
