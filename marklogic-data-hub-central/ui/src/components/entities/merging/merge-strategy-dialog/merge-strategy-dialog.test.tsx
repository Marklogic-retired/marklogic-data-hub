import React from "react";
import {render, cleanup, fireEvent, screen, waitForElement} from "@testing-library/react";
import data from "../../../../assets/mock-data/curation/merging.data";
import {CurationContext} from "../../../../util/curation-context";
import {customerMergingStep} from "../../../../assets/mock-data/curation/curation-context-mock";
import MergeStrategyDialog from "./merge-strategy-dialog";
import {updateMergingArtifact} from "../../../../api/merging";
import userEvent from "@testing-library/user-event";
import {multiSliderTooltips} from "../../../../config/tooltips.config";

jest.mock("../../../../api/merging");
const mockMergingUpdate = updateMergingArtifact as jest.Mock;

describe("Merge Strategy Dialog component", () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("Verify Add Merge Strategy dialog renders correctly", async () => {
    mockMergingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const {getByText, getByPlaceholderText, getByTestId, getByLabelText, getAllByLabelText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergeStrategyDialog
          {...data.mergeStrategyDataProps}
          isEditStrategy={false}
        />
      </CurationContext.Provider>
    );

    expect(getByText("Add Strategy")).toBeInTheDocument();
    //verify strategy name, max values, max sources can be changed
    let strategyText = getByPlaceholderText("Enter strategy name");
    expect(strategyText).toHaveAttribute("value", "");
    fireEvent.change(strategyText, {target: {value: "myFavouriteSource"}});
    expect(getByPlaceholderText("Enter max values")).toHaveValue("");
    fireEvent.change(getByPlaceholderText("Enter max values"), {target: {value: 1}});
    expect(getByPlaceholderText("Enter max values")).toHaveAttribute("value", "1");
    expect(getByPlaceholderText("Enter max sources")).toHaveValue("");
    fireEvent.change(getByPlaceholderText("Enter max sources"), {target: {value: 2}});
    expect(getByPlaceholderText("Enter max sources")).toHaveAttribute("value", "2");
    expect(getByTestId("prioritySlider")).toBeInTheDocument();

    //Verify priority option slider tooltip
    userEvent.hover(getAllByLabelText("icon: question-circle")[2]);
    expect((await(waitForElement(() => getByText(multiSliderTooltips.priorityOrder))))).toBeInTheDocument();

    //Timestamp handle is visible by default
    let timestampHandle = getByTestId("Timestamp-active");
    expect(timestampHandle).toHaveClass("handleDisabled");
    expect(getByLabelText("Timestamp")).toBeInTheDocument();
    userEvent.hover(timestampHandle);
    expect((await(waitForElement(() => getByText(multiSliderTooltips.timeStamp))))).toBeInTheDocument();

    fireEvent.click(getByLabelText("add-slider-button"));
    let saveButton = getByText("Save");
    //Modal will close now
    fireEvent.click(saveButton);
    expect(data.mergeStrategyDataProps.setOpenEditMergeStrategyDialog).toHaveBeenCalledTimes(1);
    expect(mockMergingUpdate).toHaveBeenCalledTimes(1);
  });

  it("Verify if add merge strategy dialog can be closed without saving", () => {
    const {getByText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergeStrategyDialog
          {...data.mergeStrategyDataProps}
          isEditStrategy={false}
        />
      </CurationContext.Provider>
    );
    let cancelButton = getByText("Cancel");
    fireEvent.click(cancelButton);
    expect(screen.queryByLabelText("confirm-body")).toBeNull();
    expect(data.mergeStrategyDataProps.setOpenEditMergeStrategyDialog).toHaveBeenCalledTimes(1);
    expect(mockMergingUpdate).toHaveBeenCalledTimes(0);
  });

  it("Verify Add/Edit Merge Strategy dialog shows default strategy and error message ", async () => {
    mockMergingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const {getByText, getByLabelText, queryByLabelText, rerender} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergeStrategyDialog
          {...data.mergeStrategyDataProps}
          isEditStrategy={false}
        />
      </CurationContext.Provider>
    );

    //testing Add strategy scenario
    expect(getByText("Add Strategy")).toBeInTheDocument();

    expect(getByText("Default Strategy?")).toBeInTheDocument();
    //default strategy radio button should be set to "No" by default
    let radio = getByLabelText("No");
    expect(radio["value"]).toBe("2");

    expect(queryByLabelText("default-strategy-error")).not.toBeInTheDocument();
    //selecting "Yes" when there is an existing default strategy should prompt error message
    fireEvent.click(getByLabelText("Yes"));
    expect(getByLabelText("default-strategy-error")).toBeInTheDocument();

    //rerender to test edit scenario
    rerender(<CurationContext.Provider value={customerMergingStep}>
      <MergeStrategyDialog
        {...data.mergeStrategyDataProps}
        strategyName={"myFavouriteSource"}
      />
    </CurationContext.Provider>);

    expect(getByText("Edit Strategy")).toBeInTheDocument();

    expect(getByText("Default Strategy?")).toBeInTheDocument();
    //default strategy radio button should be set to "No" by default
    radio = getByLabelText("No");
    expect(radio["value"]).toBe("2");

    //selecting "Yes" when there is an existing default strategy should prompt error message
    fireEvent.click(getByLabelText("Yes"));
    expect(getByLabelText("default-strategy-error")).toBeInTheDocument();

  });

  it("Verify Edit Merge Strategy dialog renders correctly with priority order options", () => {
    const {getByText, getByPlaceholderText, getByTestId, getByLabelText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergeStrategyDialog
          {...data.mergeStrategyDataProps}
          strategyName={"myFavouriteSource"}
        />
      </CurationContext.Provider>
    );

    expect(getByText("Edit Strategy")).toBeInTheDocument();
    let strategyText = getByPlaceholderText("Enter strategy name");
    expect(strategyText).toHaveAttribute("value", "myFavouriteSource");
    fireEvent.change(strategyText, {target: {value: ""}});
    //verify if the below error message is displayed properly
    expect(getByPlaceholderText("Enter max values")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter max sources")).toBeInTheDocument();
    expect(getByTestId("prioritySlider")).toBeInTheDocument();
    expect(getByLabelText("add-slider-button")).toBeInTheDocument();
    let saveButton = getByText("Save");
    //Modal will close now
    fireEvent.click(saveButton);
    //Verify if error message is displayed correctly
    expect(getByText("Strategy name is required")).toBeInTheDocument();
    expect(data.mergeStrategyDataProps.setOpenEditMergeStrategyDialog).toHaveBeenCalledTimes(0);
  });

  it("Verify Edit Merge Strategy dialog renders correctly for custom step", () => {
    const {getByText, getByPlaceholderText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergeStrategyDialog
          {...data.mergeStrategyDataProps}
          strategyName={"customMergeStrategy"}
        />
      </CurationContext.Provider>
    );
    expect(getByText("Edit Strategy")).toBeInTheDocument();
    let strategyText = getByPlaceholderText("Enter strategy name");
    expect(strategyText).toHaveAttribute("value", "customMergeStrategy");
  });

});
