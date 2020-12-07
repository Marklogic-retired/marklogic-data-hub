import React from "react";
import {
  cleanup,
  fireEvent,
  render, wait,
  waitForElement
} from "@testing-library/react";
import {CurationContext} from "../../../../util/curation-context";
import {customerMergingStep, customerMergingStepEmpty} from "../../../../assets/mock-data/curation/curation-context-mock";
import MergingStepDetail from "./merging-step-detail";
import userEvent from "@testing-library/user-event";
import {updateMergingArtifact} from "../../../../api/merging";
import {MergeStrategyTooltips} from "../../../../config/tooltips.config";

jest.mock("../../../../api/merging");
const mockMergingUpdate = updateMergingArtifact as jest.Mock;

const getSubElements = (content, node, title) => {
  const hasText = node => node.textContent === title;
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node.children).every(
    child => !hasText(child)
  );
  return nodeHasText && childrenDontHaveText;
};

describe("Merging Step Detail view component", () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("can render merging step with no strategies or merge rules", () => {

    const {getByText, getAllByText, container} = render(
      <CurationContext.Provider value={customerMergingStepEmpty}>
        <MergingStepDetail />
      </CurationContext.Provider>

    );
    expect(getByText("mergeCustomersEmpty")).toBeInTheDocument();
    expect(getByText("Define merge strategies")).toBeInTheDocument();
    expect(getByText("Add merge rules")).toBeInTheDocument();
    expect(getAllByText(/No Data/i)).toHaveLength(2);
    expect(container.querySelector(".ant-pagination")).toBeNull();
  });

  it("can render merging step with merge strategies and rulesets", async () => {

    const {getByText, getAllByText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergingStepDetail />
      </CurationContext.Provider>
    );
    expect(getByText("mergeCustomers")).toBeInTheDocument();
    //Verify Merge Strategies table is rendered with data
    // Check table column headers are rendered
    expect(getByText("Strategy Name")).toBeInTheDocument();
    expect(getByText("Max Values")).toBeInTheDocument();
    expect(getByText("Max Sources")).toBeInTheDocument();
    expect(getAllByText("Delete")).toHaveLength(2);

    //check table data is rendered correctly
    expect(getByText("customMergeStrategy")).toBeInTheDocument();

    //Verify merge rules table is rendered with data
    // Check table column headers are rendered
    expect(getByText("Property")).toBeInTheDocument();
    expect(getByText("Merge Type")).toBeInTheDocument();
    expect(getByText("Strategy")).toBeInTheDocument();

    //check table data is rendered correctly
    expect(getByText("name")).toBeInTheDocument();
    expect(getByText("address")).toBeInTheDocument();
    expect(getByText("phone")).toBeInTheDocument();
    expect(getByText("strategy")).toBeInTheDocument();
    expect(getByText("custom")).toBeInTheDocument();
    expect(getByText("property-specific")).toBeInTheDocument();
  });

  it("Verify common merge strategy names are greyed out", async () => {
    const {getByTestId, getByText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergingStepDetail />
      </CurationContext.Provider>
    );
    expect(getByTestId("mergestrategy-myFavoriteSource")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("mergestrategy-myFavoriteSource"));
    await wait(() => expect(getByText(MergeStrategyTooltips.delete)).toBeInTheDocument());
  });

  it("Verify clicking yes deletes the merge rule ", async () => {
    mockMergingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const {getByTestId, getByText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergingStepDetail />
      </CurationContext.Provider>
    );
    expect(getByTestId("mergerule-address")).toBeInTheDocument();
    userEvent.click(getByTestId("mergerule-address"));
    expect(await (waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "Are you sure you want to delete address - custom merge rule ?");
    })))).toBeInTheDocument();
    expect(getByText("Yes")).toBeInTheDocument();
    //Clicking on yes will delete the merge rule
    userEvent.click(getByText("Yes"));
    expect(mockMergingUpdate).toHaveBeenCalledTimes(1);
  });

  it("Verify clicking no doesnot delete the merge rule", async () => {
    mockMergingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const {getByTestId, getByText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergingStepDetail />
      </CurationContext.Provider>
    );
    expect(getByTestId("mergerule-phone")).toBeInTheDocument();
    userEvent.click(getByTestId("mergerule-phone"));
    expect(await (waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "Are you sure you want to delete phone - property-specific merge rule ?");
    })))).toBeInTheDocument();
    userEvent.click(getByText("No"));
    expect(mockMergingUpdate).toHaveBeenCalledTimes(0);
    expect(getByText("phone")).toBeInTheDocument();
  });

  it("Verify clicking yes deletes the merge strategy ", async () => {
    mockMergingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const {getByTestId, getByText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergingStepDetail />
      </CurationContext.Provider>
    );
    expect(getByTestId("mergestrategy-customMergeStrategy")).toBeInTheDocument();
    userEvent.click(getByTestId("mergestrategy-customMergeStrategy"));
    expect(await (waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "Are you sure you want to delete customMergeStrategy merge strategy ?");
    })))).toBeInTheDocument();
    expect(getByText("Yes")).toBeInTheDocument();
    //Clicking on yes will delete the merge rule
    userEvent.click(getByText("Yes"));
    expect(mockMergingUpdate).toHaveBeenCalledTimes(1);
  });

  it("Verify clicking no doesnot delete the merge strategy", async () => {
    mockMergingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const {getByTestId, getByText} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergingStepDetail />
      </CurationContext.Provider>
    );
    expect(getByTestId("mergestrategy-testMerge")).toBeInTheDocument();
    userEvent.click(getByTestId("mergestrategy-testMerge"));
    expect(await (waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "Are you sure you want to delete testMerge merge strategy ?");
    })))).toBeInTheDocument();
    userEvent.click(getByText("No"));
    expect(mockMergingUpdate).toHaveBeenCalledTimes(0);
  });

});
