import React from "react";
import {fireEvent, render, wait, cleanup, screen} from "@testing-library/react";
import Steps from "./steps";
import axiosMock from "axios";
import mocks from "../../api/__mocks__/mocks.data";
import data from "../../assets/mock-data/curation/advanced-settings.data";
import {AdvancedSettingsMessages} from "../../config/messages.config";
import StepsConfig from "../../config/steps.config";
import {ErrorTooltips} from "../../config/tooltips.config";

jest.mock("axios");

describe("Steps settings component", () => {

  beforeEach(() => {
    mocks.advancedAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  const stepLoad = data.stepLoad.data;
  const stepMapping = data.stepMapping.data;
  const stepMatching = data.stepMatching.data;
  const stepMerging = data.stepMerging.data;
  const stepCustom = {...data.stepLoad.data, stepDefinitionName: "custom-ingestion", name: "CustomLoad"};

  const stepsProps = {
    isEditing: true,
    createStep: jest.fn(),
    updateStep: jest.fn(),
    stepData: {},
    sourceDatabase: "",
    canReadWrite: true,
    canReadOnly: true,
    tooltipsData: {},
    openStepSettings: true,
    setOpenStepSettings: jest.fn(),
    activityType: "",
    canWrite: true,
    openStepDetails: jest.fn()
  };

  const stepsPropsNew = {
    ...stepsProps,
    isEditing: false
  };

  test("Verify rendering of Load step, tab switching, discard dialog on cancel, saving", async () => {
    const {baseElement, getByText, getByLabelText, getAllByLabelText, getByPlaceholderText} = render(
      <Steps {...stepsProps} activityType="ingestion" stepData={stepLoad} />
    );

    expect(getByText("Loading Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Default Basic tab
    expect(getByText("Basic").closest("div")).toHaveClass("ant-tabs-tab-active");
    expect(getByText("Advanced").closest("div")).not.toHaveClass("ant-tabs-tab-active");
    expect(baseElement.querySelector("#name")).toHaveValue("AdvancedLoad");
    // Other Basic settings details tested in create-edit-*.test.tsx

    // Switch to Advanced tab
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByText("Basic").closest("div")).not.toHaveClass("ant-tabs-tab-active");
    expect(getByText("Advanced").closest("div")).toHaveClass("ant-tabs-tab-active");
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-common,read,data-hub-common,update");
    // Other Advanced settings details tested in advanced-settings.test.tsx

    // Change form content
    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-common,read"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-common,read");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));

    // Switch to Basic tab and cancel
    await wait(() => {
      fireEvent.click(getByText("Basic"));
    });
    expect(getByText("Basic").closest("div")).toHaveClass("ant-tabs-tab-active");
    expect(getByText("Advanced").closest("div")).not.toHaveClass("ant-tabs-tab-active");

    fireEvent.click(getAllByLabelText("Cancel")[0]);

    // Verify discard dialog
    expect(getByText("Discard changes?")).toBeInTheDocument();
    expect(getByText("Yes")).toBeInTheDocument();
    expect(getByText("No")).toBeInTheDocument();

    const noButton = getByText("No");
    noButton.onclick = jest.fn();
    fireEvent.click(noButton);
    expect(noButton.onclick).toHaveBeenCalledTimes(1);

    const yesButton = getByText("Yes");
    yesButton.onclick = jest.fn();
    fireEvent.click(yesButton);
    expect(yesButton.onclick).toHaveBeenCalledTimes(1);

    // Save
    await wait(() => {
      fireEvent.click(getAllByLabelText("Save")[0]);
    });
    const saveButton = getAllByLabelText("Save")[0];
    saveButton.onclick = jest.fn();
    fireEvent.click(saveButton);
    expect(saveButton.onclick).toHaveBeenCalledTimes(1);

  });

  test("Verify rendering of Mapping step, tab disabling on form error, discard changes dialog on close", async () => {
    const {getByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Steps {...stepsProps} activityType="mapping" targetEntityName="entityName" stepData={stepMapping} />
    );

    expect(getByText("Mapping Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Mapping step has link to Details
    const detailsLink = getByLabelText("stepDetails");
    detailsLink.onclick = jest.fn();
    fireEvent.click(detailsLink);
    expect(detailsLink.onclick).toHaveBeenCalledTimes(1);

    // Default Basic tab
    expect(getByText("Basic").closest("div")).toHaveClass("ant-tabs-tab-active");
    expect(getByText("Advanced").closest("div")).not.toHaveClass("ant-tabs-tab-active");

    // Switch to Advanced tab, create error, verify other tab disabled
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-common,read,data-hub-common,update");
    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "bad-value"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("bad-value");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));
    expect(getByTestId("validationError")).toHaveTextContent(AdvancedSettingsMessages.targetPermissions.incorrectFormat);

    expect(getByText("Basic").closest("div")).toHaveClass("ant-tabs-tab-disabled");
    fireEvent.mouseOver(getByText("Basic"));
    wait(() => expect(screen.getByText(ErrorTooltips.disabledTab)).toBeInTheDocument());

    // Fix error, verify other tab enabled
    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-common,read"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-common,read");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));
    expect(getByTestId("validationError")).toHaveTextContent("");

    expect(getByText("Basic").closest("div")).not.toHaveClass("ant-tabs-tab-disabled");

    // Close dialog, verify discard changes confirm dialog
    await wait(() => {
      fireEvent.click(getByLabelText("Close"));
    });

    expect(getByText("Discard changes?")).toBeInTheDocument();
    expect(getByText("Yes")).toBeInTheDocument();
    expect(getByText("No")).toBeInTheDocument();

    const noButton = getByText("No");
    noButton.onclick = jest.fn();
    fireEvent.click(noButton);
    expect(noButton.onclick).toHaveBeenCalledTimes(1);

    const yesButton = getByText("Yes");
    yesButton.onclick = jest.fn();
    fireEvent.click(yesButton);
    expect(yesButton.onclick).toHaveBeenCalledTimes(1);

  });

  test("Verify rendering of Matching step", async () => {
    const {getByText, getByLabelText} = render(
      <Steps {...stepsProps} activityType="matching" stepData={stepMatching} />
    );

    expect(getByText("Matching Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();
  });

  test("Verify rendering of Merging step", async () => {
    const {getByText, getByLabelText} = render(
      <Steps {...stepsProps} activityType="merging" stepData={stepMerging} />
    );

    expect(getByText("Merging Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();
  });

  test("Verify rendering of Custom step", async () => {
    const {getByText, getByLabelText} = render(
      <Steps {...stepsProps} activityType="custom" stepData={stepCustom} />
    );

    expect(getByText("Custom Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();
  });

  test("Verify rendering of new Mapping step", async () => {
    const testName = "stepName";
    const testColl = "testCollection";
    const testEntity = "entityName";
    const {getByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Steps {...stepsPropsNew} activityType="mapping" targetEntityName={testEntity} />
    );

    expect(getByText("New Mapping Step")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Advanced tab disabled since Basic tab has empty required fields
    expect(getByText("Basic").closest("div")).toHaveClass("ant-tabs-tab-active");
    expect(getByText("Advanced").closest("div")).toHaveClass("ant-tabs-tab-disabled");

    // Enter required name
    const nameField = getByPlaceholderText("Enter name");
    expect(nameField).toBeInTheDocument();
    fireEvent.change(nameField, {target: {value: testName}});
    expect(nameField).toHaveValue(testName);

    // Enter required source collection
    const collInput = document.querySelector(("#collList .ant-input"))!;
    fireEvent.change(collInput, {target: {value: testColl}});
    expect(collInput).toHaveValue(testColl);

    // Switch to enabled Advanced tab, check default collections
    fireEvent.click(getByText("Advanced"));
    expect(getByTestId("defaultCollections-" + testName)).toBeInTheDocument();
    expect(getByTestId("defaultCollections-" + testEntity)).toBeInTheDocument();

    // Check other defaults
    expect(getByText("Source Database")).toBeInTheDocument();
    expect(getByText(StepsConfig.stagingDb)).toBeInTheDocument();
    expect(getByText("Target Database")).toBeInTheDocument();
    expect(getByText(StepsConfig.finalDb)).toBeInTheDocument();
    expect(getByText("Target Permissions")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue(StepsConfig.defaultTargetPerms);
    expect(getByText("Target Format")).toBeInTheDocument();
    expect(getByText(StepsConfig.defaultTargetFormat)).toBeInTheDocument();
    expect(getByText("Provenance Granularity")).toBeInTheDocument();
    expect(getByText("Coarse-grained")).toBeInTheDocument();
    expect(getByText("Entity Validation")).toBeInTheDocument();
    expect(getByText("Do not validate")).toBeInTheDocument();
    expect(getByText("Batch Size")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue(StepsConfig.defaultBatchSize.toString());
    expect(getByLabelText("headers-textarea")).toBeEmpty();
    // Open text areas that are closed by default
    fireEvent.click(getByText("Processors"));
    expect(getByLabelText("processors-textarea")).toBeEmpty();
    fireEvent.click(getByText("Custom Hook"));
    expect(getByLabelText("customHook-textarea")).toBeEmpty();
  });

  test("Verify rendering of new non-Mapping step", async () => {
    const testName = "stepName";
    // New non-mapping steps have the following default collections: Step Name
    const {getByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Steps {...stepsPropsNew} activityType="ingestion" />
    );

    expect(getByText("New Loading Step")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Advanced tab disabled since Basic tab has empty required fields
    expect(getByText("Basic").closest("div")).toHaveClass("ant-tabs-tab-active");
    expect(getByText("Advanced").closest("div")).toHaveClass("ant-tabs-tab-disabled");

    // Enter required name
    const nameField = getByPlaceholderText("Enter name");
    expect(nameField).toBeInTheDocument();
    fireEvent.change(nameField, {target: {value: testName}});
    expect(nameField).toHaveValue(testName);

    // Switch to enabled Advanced tab, check default collections
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByTestId("defaultCollections-" + testName)).toBeInTheDocument();

    // Check other defaults
    expect(getByText("Target Database")).toBeInTheDocument();
    expect(getByText(StepsConfig.stagingDb)).toBeInTheDocument();
    expect(getByText("Target Collections")).toBeInTheDocument();
    const targetColl = document.querySelector((".formItemTargetCollections .ant-select-search__field"))!;
    expect(targetColl).toBeEmpty();
    expect(getByText("Target Permissions")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue(StepsConfig.defaultTargetPerms);
    expect(getByText("Provenance Granularity")).toBeInTheDocument();
    expect(getByText("Coarse-grained")).toBeInTheDocument();
    expect(getByText("Batch Size")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue(StepsConfig.defaultBatchSize.toString());
    expect(getByLabelText("headers-textarea")).toBeEmpty();
    // Open text areas that are closed by default
    fireEvent.click(getByText("Processors"));
    expect(getByLabelText("processors-textarea")).toBeEmpty();
    fireEvent.click(getByText("Custom Hook"));
    expect(getByLabelText("customHook-textarea")).toBeEmpty();
  });

});
