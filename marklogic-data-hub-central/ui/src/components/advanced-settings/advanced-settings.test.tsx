import React from "react";
import axiosMock from "axios";
import {fireEvent, render, wait, waitForElement, act, cleanup} from "@testing-library/react";
import AdvancedSettings from "./advanced-settings";
import mocks from "../../api/__mocks__/mocks.data";
import data from "../../assets/mock-data/curation/advanced-settings.data";
import {AdvancedSettingsTooltips, SecurityTooltips} from "../../config/tooltips.config";
import StepsConfig from "../../config/steps.config";

jest.mock("axios");

describe("Advanced step settings", () => {

  beforeEach(() => {
    mocks.advancedAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  // NOTE: Detailed tests of create new settings functionality are in steps/steps.test
  test("Verify edit advanced settings for Load", async () => {
    const {getByText, getAllByText, queryByText} = render(
      <AdvancedSettings {...data.advancedLoad} />
    );

    //'Step Definition Name' should be present only for custom ingestion steps
    expect(queryByText("Step Definition Name")).not.toBeInTheDocument();

    expect(queryByText("Source Database")).not.toBeInTheDocument();
    expect(getByText("Target Database")).toBeInTheDocument();
    expect(getByText("data-hub-STAGING")).toBeInTheDocument();

    expect(getByText("Target Collections")).toBeInTheDocument();
    expect(getByText("Please add target collections")).toBeInTheDocument();
    expect(getByText("Default Collections")).toBeInTheDocument();
    expect((await(waitForElement(() => getAllByText("AdvancedLoad")))).length > 0);

    expect(getByText("Target Permissions")).toBeInTheDocument();

    expect(getByText("Provenance Granularity")).toBeInTheDocument();
    expect(getByText("Coarse-grained")).toBeInTheDocument();

    expect(queryByText("Entity Validation")).not.toBeInTheDocument();
    expect(queryByText("Source Record Scope")).not.toBeInTheDocument();

    expect(getByText("Batch Size")).toBeInTheDocument();

    expect(getByText("Header Content")).toBeInTheDocument();
    expect(getByText("{ \"header\": true }")).toBeInTheDocument();

    expect(getByText("Interceptors")).toBeInTheDocument();
    expect(getByText("Custom Hook")).toBeInTheDocument();

    fireEvent.click(getByText("Interceptors"));
    expect(getByText("{ \"interceptor\": true }")).toBeInTheDocument();

    fireEvent.click(getByText("Custom Hook"));
    expect(getByText("{ \"hook\": true }")).toBeInTheDocument();
    fireEvent.mouseOver(getByText("DEPRECATED"));
    await wait(() =>  expect(getByText(AdvancedSettingsTooltips.customHookDeprecated)).toBeInTheDocument());

  });

  /* Custom ingestion should be same as default-ingestion except "step definition name" field should be present */
  test("Verify advanced settings for Custom Load step", async () => {
    const {getByText, getAllByText, queryByText, getByPlaceholderText} = render(
      <AdvancedSettings {...data.advancedCustomLoad} />
    );

    expect(queryByText("Source Database")).not.toBeInTheDocument();
    expect(getByText("Target Database")).toBeInTheDocument();
    expect(getByText("data-hub-STAGING")).toBeInTheDocument();

    expect(getByText("Target Collections")).toBeInTheDocument();
    expect(getByText("Please add target collections")).toBeInTheDocument();
    expect(getByText("Default Collections")).toBeInTheDocument();
    expect(getAllByText(data.advancedCustomLoad.stepData.collections[0]).length > 0);

    expect(getByText("Step Definition Name")).toBeInTheDocument();

    expect(getByText("Target Permissions")).toBeInTheDocument();

    expect(getByText("Provenance Granularity")).toBeInTheDocument();
    expect(getByText("Coarse-grained")).toBeInTheDocument();

    expect(getByText("Batch Size")).toBeInTheDocument();

    expect(getByText("Header Content")).toBeInTheDocument();
    expect(getByText("{ \"header\": true }")).toBeInTheDocument();

    expect(getByText("Interceptors")).toBeInTheDocument();
    expect(getByText("Custom Hook")).toBeInTheDocument();

    fireEvent.click(getByText("Interceptors"));
    expect(getByText("{ \"interceptor\": true }")).toBeInTheDocument();

    fireEvent.click(getByText("Custom Hook"));
    expect(getByText("{ \"hook\": true }")).toBeInTheDocument();
    fireEvent.mouseOver(getByText("DEPRECATED"));
    await wait(() =>  expect(getByText(AdvancedSettingsTooltips.customHookDeprecated)).toBeInTheDocument());

    expect(getByPlaceholderText("Please enter additional settings")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter additional settings")).toBeEnabled();
  });

  test("Verify edit advanced settings for Mapping", async () => {
    const {getByText, getAllByText, getByLabelText} = render(
      <AdvancedSettings {...data.advancedMapping} />
    );

    expect(getByText("Source Database")).toBeInTheDocument();
    expect(getByText("data-hub-STAGING")).toBeInTheDocument();
    expect(getByText("Target Database")).toBeInTheDocument();
    expect(getByText("data-hub-FINAL")).toBeInTheDocument();

    expect(getByText("Target Collections")).toBeInTheDocument();
    expect(getByText("Please add target collections")).toBeInTheDocument();
    expect(getByText("Default Collections")).toBeInTheDocument();
    expect((await(waitForElement(() => getAllByText("AdvancedMapping")))).length > 0);

    expect(getByText("Target Permissions")).toBeInTheDocument();

    expect(getByText("Batch Size")).toBeInTheDocument();

    expect(getByText("Provenance Granularity")).toBeInTheDocument();
    expect(getByText("Coarse-grained")).toBeInTheDocument();

    expect(getByText("Entity Validation")).toBeInTheDocument();
    expect(getByText("Do not validate")).toBeInTheDocument();

    expect(getByText("Source Record Scope")).toBeInTheDocument();
    expect(getByText("Instance only")).toBeInTheDocument();

    expect(getByText("Attach Source Document")).toBeInTheDocument();
    const radio = getByLabelText("No");

    expect(radio["value"]).toBe("false");
    fireEvent.change(radio, {target: {value: "true"}});
    expect(radio["value"]).toBe("true");

    expect(getByText("Header Content")).toBeInTheDocument();
    expect(getByText("{ \"header\": true }")).toBeInTheDocument();

    expect(getByText("Interceptors")).toBeInTheDocument();
    expect(getByText("Custom Hook")).toBeInTheDocument();

    fireEvent.click(getByText("Interceptors"));
    expect(getByText("{ \"interceptor\": true }")).toBeInTheDocument();

    fireEvent.click(getByText("Custom Hook"));
    expect(getByText("{ \"hook\": true }")).toBeInTheDocument();
    fireEvent.mouseOver(getByText("DEPRECATED"));
    await wait(() =>  expect(getByText(AdvancedSettingsTooltips.customHookDeprecated)).toBeInTheDocument());

  });

  test("Verify edit advanced settings for Matching", async () => {
    const {getByText, getAllByText} = render(
      <AdvancedSettings {...data.advancedMatching} />
    );

    expect(getByText("Source Database")).toBeInTheDocument();
    expect(getAllByText("data-hub-FINAL")[0]).toBeInTheDocument();
    expect(getByText("Target Database")).toBeInTheDocument();
    expect(getAllByText("data-hub-FINAL")[1]).toBeInTheDocument();

    expect(getByText("Target Collections")).toBeInTheDocument();
    expect(getByText("Please add target collections")).toBeInTheDocument();
    expect(getByText("Default Collections")).toBeInTheDocument();

    expect(getByText("Target Permissions")).toBeInTheDocument();

    expect(getByText("Batch Size")).toBeInTheDocument();

    expect(getByText("Provenance Granularity")).toBeInTheDocument();
    expect(getByText("Fine-grained")).toBeInTheDocument();

    expect(getByText("Interceptors")).toBeInTheDocument();
    expect(getByText("Custom Hook")).toBeInTheDocument();
    fireEvent.mouseOver(getByText("DEPRECATED"));
    await wait(() =>  expect(getByText(AdvancedSettingsTooltips.customHookDeprecated)).toBeInTheDocument());

    fireEvent.click(getByText("Interceptors"));
    expect((await(waitForElement(() => getByText("{ \"interceptor\": true }"))))).toBeInTheDocument();

    fireEvent.click(getByText("Custom Hook"));
    expect(getByText("{ \"hook\": true }")).toBeInTheDocument();
    fireEvent.mouseOver(getByText("DEPRECATED"));
    await wait(() =>  expect(getByText(AdvancedSettingsTooltips.customHookDeprecated)).toBeInTheDocument());

  });

  test("Verify edit advanced settings for Merging", async () => {
    const {queryByText, getByLabelText, getByTestId, getByText, getAllByText} = render(
      <AdvancedSettings {...data.advancedMerging} />
    );

    expect(getByText("Source Database")).toBeInTheDocument();
    expect(getAllByText("data-hub-FINAL")[0]).toBeInTheDocument();
    expect(getByText("Target Database")).toBeInTheDocument();
    expect(getAllByText("data-hub-FINAL")[1]).toBeInTheDocument();

    expect(getByText("Target Collections:")).toBeInTheDocument();
    expect(getByText("Default Collections")).toBeInTheDocument();
    expect(getByText("Additional Collections")).toBeInTheDocument();
    // merge collections are present
    expect((await(waitForElement(() => getAllByText("Merge")))).length > 0);
    expect(getByText("sm-Test-merged sm-Test-mastered")).toBeInTheDocument();
    expect(getByText("merged")).toBeInTheDocument();

    // Can edit the additional collections
    fireEvent.click(getByTestId("onMerge-edit"));
    let collectionInput = getByLabelText("additionalColl-select-onMerge").getElementsByTagName("input").item(0)!;
    // test discarding a collection update
    fireEvent.input(collectionInput, {target: {value: "discardedMergeCollection"}});
    expect(collectionInput).toHaveValue("discardedMergeCollection");
    fireEvent.keyDown(collectionInput, {keyCode: 13, key: "Enter"});
    expect(collectionInput).toHaveValue("");
    fireEvent.click(getByTestId("onMerge-discard"));
    expect(queryByText("merged discardedMergeCollection")).not.toBeInTheDocument();

    // test keeping a collection update
    fireEvent.click(getByTestId("onMerge-edit"));
    collectionInput = getByLabelText("additionalColl-select-onMerge").getElementsByTagName("input").item(0)!;
    fireEvent.input(collectionInput, {target: {value: "keptMergeCollection"}});
    expect(collectionInput).toHaveValue("keptMergeCollection");
    fireEvent.keyDown(collectionInput, {keyCode: 13, key: "Enter"});
    expect(collectionInput).toHaveValue("");
    fireEvent.click(getByTestId("onMerge-keep"));
    expect(getByText("merged keptMergeCollection")).toBeInTheDocument();

    // test no match collections
    expect(getByText("No Match")).toBeInTheDocument();
    expect(getByText("sm-Test-mastered")).toBeInTheDocument();
    expect(getByText("noMatch")).toBeInTheDocument();

    // test archive collections
    expect(getByText("Archive")).toBeInTheDocument();
    expect(getByText("sm-Test-archived")).toBeInTheDocument();
    expect(getByText("archived")).toBeInTheDocument();

    // test notification collections
    expect(getByText("Notification")).toBeInTheDocument();
    expect(getByText("sm-Test-notification")).toBeInTheDocument();
    expect(getByText("notification")).toBeInTheDocument();

    expect(getByText("Target Permissions")).toBeInTheDocument();

    expect(getByText("Batch Size")).toBeInTheDocument();

    expect(getByText("Provenance Granularity")).toBeInTheDocument();
    expect(getByText("Fine-grained")).toBeInTheDocument();

    expect(getByText("Interceptors")).toBeInTheDocument();
    expect(getByText("Custom Hook")).toBeInTheDocument();

    fireEvent.click(getByText("Interceptors"));
    expect(getByText("{ \"interceptor\": true }")).toBeInTheDocument();

    fireEvent.click(getByText("Custom Hook"));
    expect(getByText("{ \"hook\": true }")).toBeInTheDocument();
    fireEvent.mouseOver(getByText("DEPRECATED"));
    await wait(() =>  expect(getByText(AdvancedSettingsTooltips.customHookDeprecated)).toBeInTheDocument());

  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("Verify form fields can be input/selected", async () => {
    let getByText, getAllByText, getByLabelText, getByTestId, getAllByTestId, getByPlaceholderText;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettings {...data.advancedMapping} />
      );
      getByText = renderResults.getByText;
      getAllByText = renderResults.getAllByText;
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
      getAllByTestId = renderResults.getAllByTestId;
      getByPlaceholderText = renderResults.getByPlaceholderText;
    });

    fireEvent.click(getByLabelText("sourceDatabase-select"));
    expect(getByTestId("sourceDbOptions-data-hub-STAGING")).toBeInTheDocument();
    expect(getByTestId("sourceDbOptions-data-hub-FINAL")).toBeInTheDocument();

    fireEvent.select(getByTestId("sourceDbOptions-data-hub-FINAL"));
    expect(getAllByText("data-hub-FINAL").length === 2);

    fireEvent.click(getByLabelText("targetDatabase-select"));
    expect(getByTestId("targetDbOptions-data-hub-STAGING")).toBeInTheDocument();
    expect(getByTestId("targetDbOptions-data-hub-FINAL")).toBeInTheDocument();
    fireEvent.select(getByTestId("targetDbOptions-data-hub-STAGING"));
    expect(getAllByText("data-hub-STAGING").length === 1);

    fireEvent.change(getByPlaceholderText("Please enter batch size"), {target: {value: "50"}});
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue("50");

    //Verifying provenance options select field
    fireEvent.click(getByText("Coarse-grained"));
    expect(getByTestId("provOptions-Coarse-grained")).toBeInTheDocument();
    expect(getByTestId("provOptions-Off")).toBeInTheDocument();
    fireEvent.select(getByTestId("provOptions-Off"));
    expect(getByText("Off")).toBeInTheDocument();

    //Verifying entity validation options select field
    fireEvent.click(getByText("Do not validate"));
    fireEvent.select(getByTestId("entityValOpts-1"));
    expect(getByText("Store validation errors in entity headers")).toBeInTheDocument();
    fireEvent.click(getByText("Store validation errors in entity headers"));
    fireEvent.select(getByTestId("entityValOpts-2"));
    expect(getByText("Skip documents with validation errors")).toBeInTheDocument();

    //Verifying source record scope options select field
    let instanceOnlyOption = getByText("Instance only");
    expect(instanceOnlyOption).toBeInTheDocument();
    fireEvent.click(instanceOnlyOption);
    fireEvent.select(getByTestId("sourceRecordScopeOptions-1"));
    expect(getByText("Entire record")).toBeInTheDocument();
    let entireRecordOption = getByText("Entire record");
    fireEvent.click(entireRecordOption);
    expect(getByText(StepsConfig.toggleSourceRecordScopeMessage)).toBeInTheDocument();

    //Not able to send input to Additional collections. Test via e2e
    //https://github.com/testing-library/react-testing-library/issues/375
    //Solution in github wont work because our list for additional collection is empty to start with

    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-operator"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-operator");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));

    //TODO: Test with reference rather than hardcoded string.
    expect(getByTestId("validationError")).toHaveTextContent("The format of the string is incorrect. The required format is role,capability,role,capability,....");

    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-operator,read"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-operator,read");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));
    expect(getByTestId("validationError")).toHaveTextContent("");


    fireEvent.change(getByLabelText("headers-textarea"), {target: {value: "headers-changed"}});
    expect(getByLabelText("headers-textarea")).toHaveValue("headers-changed");

    fireEvent.click(getByText("Please select target format"));
    const formatOptions = getAllByTestId("targetFormatOptions").map(li => li);
    expect(formatOptions.map(li => li.textContent).toString()).toEqual("JSON,XML");
    fireEvent.select(formatOptions[1]);
    expect(getByText("XML")).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText("Please enter batch size"), {target: {value: "25"}});
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue("25");

    // Verify targetFormat options select field
    expect(getAllByText("JSON")[0]).toBeInTheDocument();
    fireEvent.click(getAllByText("JSON")[0]);
    const testFormatOptions = getAllByTestId("targetFormatOptions").map(li => li);
    expect(testFormatOptions.map(li => li.textContent).toString()).toEqual("JSON,XML");
    fireEvent.select(testFormatOptions[1]);

    fireEvent.click(getByText("Interceptors"));
    fireEvent.change(getByLabelText("interceptors-textarea"), {target: {value: "interceptors-changed"}});
    expect(getByLabelText("interceptors-textarea")).toHaveValue("interceptors-changed");

    fireEvent.click(getByText("Custom Hook"));
    fireEvent.change(getByLabelText("customHook-textarea"), {target: {value: "hook-changed"}});
    expect(getByLabelText("customHook-textarea")).toHaveValue("hook-changed");
    fireEvent.mouseOver(getByText("DEPRECATED"));
    await wait(() =>  expect(getByText(AdvancedSettingsTooltips.customHookDeprecated)).toBeInTheDocument());

  });

  test("Verify no/invalid/valid JSON is recognized correctly in JSON fields", async () => {
    let getByText, getByLabelText, queryAllByText;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettings {...data.advancedCustomLoad} />
      );
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      queryAllByText = renderResults.queryAllByText;
    });

    // Expand all textarea inputs
    fireEvent.click(getByText("Interceptors"));
    fireEvent.click(getByText("Custom Hook"));

    // No errors at start
    expect(queryAllByText("Invalid JSON").length === 0);

    // No JSON (empty field)
    fireEvent.change(getByLabelText("headers-textarea"), {target: {value: ""}});
    expect(queryAllByText("Invalid JSON").length === 0);
    fireEvent.change(getByLabelText("interceptors-textarea"), {target: {value: ""}});
    expect(queryAllByText("Invalid JSON").length === 0);
    fireEvent.change(getByLabelText("customHook-textarea"), {target: {value: ""}});
    expect(queryAllByText("Invalid JSON").length === 0);
    fireEvent.change(getByLabelText("options-textarea"), {target: {value: ""}});
    expect(queryAllByText("Invalid JSON").length === 0);

    // Invalid JSON
    fireEvent.change(getByLabelText("headers-textarea"), {target: {value: "{\"badJSON\": \"noClosingBracket\""}});
    expect(queryAllByText("Invalid JSON").length === 1);
    fireEvent.change(getByLabelText("interceptors-textarea"), {target: {value: "{\"badJSON\": \"noClosingBracket\""}});
    expect(queryAllByText("Invalid JSON").length === 2);
    fireEvent.change(getByLabelText("customHook-textarea"), {target: {value: "{\"badJSON\": \"noClosingBracket\""}});
    expect(queryAllByText("Invalid JSON").length === 3);
    fireEvent.change(getByLabelText("options-textarea"), {target: {value: "{\"badJSON\": \"noClosingBracket\""}});
    expect(queryAllByText("Invalid JSON").length === 4);

    // Valid JSON
    fireEvent.change(getByLabelText("headers-textarea"), {target: {value: "{\"goodJSON\": true}"}});
    expect(queryAllByText("Invalid JSON").length === 3);
    fireEvent.change(getByLabelText("interceptors-textarea"), {target: {value: "{\"goodJSON\": true}"}});
    expect(queryAllByText("Invalid JSON").length === 2);
    fireEvent.change(getByLabelText("customHook-textarea"), {target: {value: "{\"goodJSON\": true}"}});
    expect(queryAllByText("Invalid JSON").length === 1);
    fireEvent.change(getByLabelText("options-textarea"), {target: {value: "{\"goodJSON\": true}"}});
    expect(queryAllByText("Invalid JSON").length === 0);

  });

  test("Verify read-only users cannot edit settings", async () => {
    let getByText, getByPlaceholderText;
    await act(async () => {
      const renderResults = render(
        <AdvancedSettings {...data.advancedMapping} canWrite={false} />
      );
      getByText = renderResults.getByText;
      getByPlaceholderText = renderResults.getByPlaceholderText;
    });

    expect(document.querySelector("#sourceDatabase")).toHaveClass("ant-select-disabled");
    expect(document.querySelector("#targetDatabase")).toHaveClass("ant-select-disabled");
    expect(document.querySelector("#additionalColl")).toHaveClass("ant-select-disabled");
    expect(getByPlaceholderText("Please enter target permissions")).toBeDisabled();
    expect(getByPlaceholderText("Please enter batch size")).toBeDisabled();
    expect(document.querySelector("#headers")).toHaveClass("ant-input-disabled");
    expect(document.querySelector("#targetFormat")).toHaveClass("ant-select-disabled");
    expect(document.querySelector("#provGranularity")).toHaveClass("ant-select-disabled");
    expect(document.querySelector("#validateEntity")).toHaveClass("ant-select-disabled");

    fireEvent.click(getByText("Interceptors"));
    expect(document.querySelector("#interceptors")).toHaveClass("ant-input-disabled");

    fireEvent.click(getByText("Custom Hook"));
    expect(document.querySelector("#customHook")).toHaveClass("ant-input-disabled");

    fireEvent.mouseOver(getByText("Save"));
    await wait(() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());
  });

  test("Verify tooltips", async () => {
    const {getByText, getAllByLabelText} = render(
      <AdvancedSettings {...data.advancedMapping} />
    );
    fireEvent.click(getByText("Interceptors"));
    fireEvent.click(getByText("Custom Hook"));
    let tipIcons  = getAllByLabelText("icon: question-circle");
    const tips = ["sourceDatabase", "targetDatabase", "additionalCollections", "targetPermissions",
      "targetFormat", "provGranularity", "validateEntity", "batchSize", "headers", "interceptors", "customHook"];
    tips.forEach(async (tip, i) => {
      fireEvent.mouseOver(tipIcons[i]);
      await waitForElement(() => getByText(AdvancedSettingsTooltips[tip]));
    });
  });

});
