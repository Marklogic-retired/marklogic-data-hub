import React from "react";
import {
  cleanup,
  fireEvent,
  render, screen, wait,
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

    const {getByText, getAllByText, getByLabelText, getByTestId, queryByTestId, queryByLabelText} = render(
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
    userEvent.click(getByTestId("customMergeStrategy-expand-icon"));

    //Verify priority option slider tooltip
    userEvent.hover(getByLabelText("icon: question-circle"));
    expect((await(waitForElement(() => getByLabelText("priorityOrderTooltip"))))).toBeInTheDocument();

    //Verify default timeline is visible and no edit strategy button is present
    expect(queryByTestId("default-priorityOrder-timeline")).toBeInTheDocument();
    expect(queryByLabelText("mergeStrategy-scale-switch")).not.toBeInTheDocument();

    //Verify merge rules table is rendered with data
    //Check table column headers are rendered
    expect(getByText("Property")).toBeInTheDocument();
    expect(getByText("Merge Type")).toBeInTheDocument();
    expect(getByText("Strategy")).toBeInTheDocument();
    expect(getByText("Default")).toBeInTheDocument();

    //Verify default icon is rendered for only default strategy
    expect(getByTestId("default-testMerge-icon")).toBeInTheDocument();
    expect(queryByTestId("default-customMergeStrategy-icon")).not.toBeInTheDocument();

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
    expect(getByTestId("mergestrategyIcon-customMergeStrategy")).toBeInTheDocument();
    userEvent.click(getByTestId("mergestrategyIcon-customMergeStrategy"));
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
    expect(getByTestId("mergestrategyIcon-testMerge")).toBeInTheDocument();
    userEvent.click(getByTestId("mergestrategyIcon-testMerge"));
    expect(await (waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "Are you sure you want to delete testMerge merge strategy ?");
    })))).toBeInTheDocument();
    userEvent.click(getByText("No"));
    expect(mockMergingUpdate).toHaveBeenCalledTimes(0);
  });

  it("Accessibility", () => {
    const {getAllByLabelText, getAllByText, getByLabelText, getByTestId, container} = render(
      <CurationContext.Provider value={customerMergingStep}>
        <MergingStepDetail />
      </CurationContext.Provider>
    );


    userEvent.tab();
    expect(getByLabelText("Back")).toHaveFocus();
    userEvent.tab();
    expect(getByLabelText("add-merge-strategy")).toHaveFocus();
    userEvent.tab();
    expect(getByLabelText("Strategy Name sortable")).toHaveFocus();
    userEvent.tab();
    expect(getByLabelText("Max Values sortable")).toHaveFocus();
    userEvent.tab();
    expect(getByLabelText("Max Sources sortable")).toHaveFocus();
    userEvent.tab();
    expect(getByLabelText("Default sortable")).toHaveFocus();
    userEvent.tab();
    screen.debug(undefined, 90000000);
    expect(getAllByText("Delete")[0]).toHaveFocus();
    userEvent.tab();
    expect(getAllByLabelText("Expand row")[0]).toHaveFocus();
    userEvent.tab();
    expect(container.querySelector("#strategy-name-link")).toHaveFocus();
    userEvent.tab();
    expect(getByTestId("mergestrategy-myFavoriteSource")).toHaveFocus();
    for (let i=0;i<=3;i++) { // jump over the  remaining rows
      userEvent.tab();
    }
    expect(getByTestId("page-<")).toHaveFocus();
    userEvent.tab();
    expect(getByTestId("page-1")).toHaveFocus();
    userEvent.tab();
    expect(getByTestId("page->")).toHaveFocus();
    userEvent.tab();
    expect(getByLabelText("add-merge-rule")).toHaveFocus();
    userEvent.tab();
    expect(getByLabelText("Property sortable")).toHaveFocus();
    userEvent.tab();
    expect(getByLabelText("Merge Type sortable")).toHaveFocus();
    userEvent.tab();
    expect(getByLabelText("Strategy sortable")).toHaveFocus();
    userEvent.tab();
    expect(getAllByText("Delete")[1]).toHaveFocus();
  });
});