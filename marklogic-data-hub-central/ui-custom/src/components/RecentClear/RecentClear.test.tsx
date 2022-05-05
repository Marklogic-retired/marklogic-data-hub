import {render, fireEvent} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import RecentClear from "./RecentClear";
const EXPANDIDS = {
  membership: true,
  info: true,
  relationships: true,
  imageGallery: true,
  timeline: true
}
const detailContextValue = {
  detail: {},
  recentRecords: [],
  loading: false,
  expandIds: EXPANDIDS,
  handleGetDetail: jest.fn(),
  handleGetRecent: jest.fn(),
  handleGetRecentLocal: jest.fn(),
  handleSaveRecent: jest.fn(),
  handleSaveRecentLocal: jest.fn(),
  handleExpandIds: (idsObject = EXPANDIDS) => { },
  handleDeleteAllRecent: jest.fn(),
  hasSavedRecords: () => true
};
describe("RecentClear component", () => {
  it("Verify RecentClear is rendered", () => {
    const {getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <RecentClear type="recentRecords" />
      </DetailContext.Provider>
    );
    expect(getByTestId("recentClearContainer")).toBeInTheDocument();
    expect(getByTestId("recentRecords-clearButton")).toBeInTheDocument();
  });
  it("Verify is the modal is opened", () => {
    const {getByTestId, getByText} = render(
      <DetailContext.Provider value={detailContextValue} >
        <RecentClear type="recentRecords" title="Title" />
      </DetailContext.Provider>
    );
    expect(getByTestId("recentClearContainer")).toBeInTheDocument();
    expect(getByTestId("recentRecords-clearButton")).toBeInTheDocument();
    fireEvent.click(getByTestId("recentRecords-clearButton"));
    expect(getByTestId("Title-resetConfirmationModal")).toBeInTheDocument();
    expect(getByText("Clear Title history for the current user?")).toBeInTheDocument();

  });
});