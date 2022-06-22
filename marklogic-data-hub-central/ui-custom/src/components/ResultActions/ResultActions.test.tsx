import {render} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import ResultActions from "./ResultActions";

const configuration = {
  resultActions: {
    component: "ResultActions",
    config: {
      id: "resultActions",
      arrayPath: "person.actions.action",
      action: {
        icon: "icon",
        color: "color",
        url: "url"
      }
    }
  }
}
const detail = {
  person: {
    actions: {
      action: [
        {
          url: "http://oaic.gov.au",
          icon: "faCog"
        },
        {
          url: "https://multiply.com",
          icon: "faCode"
        },
        {
          url: "http://addthis.com",
          icon: "faSync"
        }
      ]
    }
  }
}

const EXPANDIDS = {
    membership: true,
    info: true,
    relationships: true,
    imageGallery: true,
    timeline: true
}

const detailContextValue = {
    detail: detail,
    recentRecords: [],
    loading: false,
    expandIds: EXPANDIDS,
    handleGetDetail: jest.fn(),
    handleGetRecent: jest.fn(),
    handleGetRecentLocal: jest.fn(),
    handleSaveRecent: jest.fn(),
    handleSaveRecentLocal: jest.fn(),
    handleExpandIds: jest.fn(),
    handleDeleteAllRecent: jest.fn(), 
    hasSavedRecords: jest.fn()
};

describe("LinkList component", () => {
  test("Verify LinkList widget renders correctly", () => {
    const {getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <ResultActions config={configuration.resultActions.config} data={detail} />
      </DetailContext.Provider>
    );
    expect(getByTestId("action-item-0")).toBeInTheDocument();
    expect(getByTestId("action-item-1")).toBeInTheDocument();
    expect(getByTestId("action-item-2")).toBeInTheDocument();
  });
});