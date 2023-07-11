import React from "react";
import axiosInstance from "@config/axios";
import {render, waitForElement, act, cleanup, wait, fireEvent, screen} from "@testing-library/react";
import mocks from "../../api/__mocks__/mocks.data";
import JobResponse from "./job-response";
import {BrowserRouter as Router} from "react-router-dom";
import {CurationContext} from "../../util/curation-context";
import {customerMatchingStep} from "../../assets/mock-data/curation/curation-context-mock";
import dayjs from "dayjs";
import curateData from "../../assets/mock-data/curation/flows.data";
import userEvent from "@testing-library/user-event";

jest.mock("@config/axios");

const mockHistoryPush = jest.fn();

jest.useRealTimers();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const getSubElements = (content, node, title) => {
  const hasText = node => node.textContent === title;
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node.children).every(child => !hasText(child));
  return nodeHasText && childrenDontHaveText;
};

describe("Job response modal", () => {
  beforeEach(() => {
    mocks.advancedAPI(axiosInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify successful job response information displays", async () => {
    mocks.runAPI(axiosInstance);
    let getByText;
    let getAllByText;
    let getByTestId;
    act(() => {
      ({getByText, getAllByText, getByTestId} = render(
        <Router>
          <CurationContext.Provider value={customerMatchingStep}>
            <JobResponse jobId={"e4590649-8c4b-419c-b6a1-473069186592"} setOpenJobResponse={() => {}} />
          </CurationContext.Provider>
        </Router>,
      ));
    });

    // verify modal text and headers
    expect(
      await waitForElement(() =>
        getByText((content, node) => {
          return getSubElements(content, node, "The flow testFlow completed");
        }),
      ),
    ).toBeInTheDocument();

    expect(getByText("Job ID:")).toBeInTheDocument();
    expect(getByText("Start Time:")).toBeInTheDocument();
    expect(getByText("Duration:")).toBeInTheDocument();

    expect(getByText("e4590649-8c4b-419c-b6a1-473069186592")).toBeInTheDocument();
    // check that
    await waitForElement(() => getByText("testFlow"));
    let ts: string = curateData.jobRespSuccess.data.timeEnded; // "2020-04-24T14:05:01.019819-07:00"
    let tsExpected: string = dayjs(ts).format("YYYY-MM-DD HH:mm");
    expect(getByText(tsExpected)).toBeInTheDocument(); // "2020-04-24 14:05"
    expect(getByText(/[0-9]*s [0-9]*ms/)).toBeInTheDocument();

    // check that expected steps are listed
    expect(getAllByText("match-customer")[0]).toBeInTheDocument();
    expect(getAllByText("Mapping1")[0]).toBeInTheDocument();
    expect(getAllByText("merge-customer")[0]).toBeInTheDocument();
    expect(getAllByText("master-customer")[0]).toBeInTheDocument();
    expect(getAllByText("Ingestion1")[0]).toBeInTheDocument();

    // checks merge-customer explore button
    let exploreButton = await waitForElement(() => getByTestId(`merge-customer-explorer-link`));
    fireEvent.click(exploreButton);
    await wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/explore"});
    });
    // checks Mapping1 explore button
    exploreButton = await waitForElement(() => getByTestId(`Mapping1-explorer-link`));
    fireEvent.click(exploreButton);
    await wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/explore"});
    });
    // checks Ingestion1 explore button
    exploreButton = await waitForElement(() => getByTestId(`Ingestion1-explorer-link`));
    fireEvent.click(exploreButton);
    await wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/explore"});
    });
  });

  test("Verify failed job response information displays", async () => {
    mocks.runXMLAPI(axiosInstance);
    let getByText, queryByText, getByTestId;
    act(() => {
      ({getByText, queryByText, getByTestId} = render(
        <Router>
          <CurationContext.Provider value={customerMatchingStep}>
            <JobResponse jobId={"350da405-c1e9-4fa7-8269-d9aefe3b4b9a"} setOpenJobResponse={() => {}} />
          </CurationContext.Provider>
        </Router>,
      ));
    });

    // check that
    await waitForElement(() => getByText("testFlow"));
    let ts: string = curateData.jobRespFailedWithError.data.stepResponses["1"].stepEndTime; // "2020-04-04T01:17:45.012137-07:00"
    let tsExpected: string = dayjs(ts).format("YYYY-MM-DD HH:mm");
    expect(getByText(tsExpected)).toBeInTheDocument(); // "2020-04-04 01:17"
    expect(getByText(/[0-9]*s [0-9]*ms/)).toBeInTheDocument();

    expect(getByTestId("stepType-header")).toBeInTheDocument();
    // check that expected steps and step types are listed
    await wait(() => {
      expect(getByText("failedIngest")).toBeInTheDocument();
      expect(getByTestId("failedIngest-loading-type")).toBeInTheDocument();
      expect(getByText("Mapping1")).toBeInTheDocument();
      expect(getByTestId("Mapping1-mapping-type")).toBeInTheDocument();
      expect(getByText("match-customer")).toBeInTheDocument();
      expect(getByTestId("match-customer-matching-type")).toBeInTheDocument();
      expect(getByText("merge-customer")).toBeInTheDocument();
      expect(getByTestId("merge-customer-merging-type")).toBeInTheDocument();
      expect(getByText("master-customer")).toBeInTheDocument();
      expect(getByTestId("master-customer-mastering-type")).toBeInTheDocument();

      expect(queryByText("Explore Loaded Data")).not.toBeInTheDocument();
      expect(queryByText("Explore Curated Data")).not.toBeInTheDocument();
    });
  });

  test("Verify stop run button when step is running", async () => {
    mocks.runAPI(axiosInstance);
    let getByText;
    let getByLabelText;
    const stopRun = jest.fn();
    act(() => {
      ({getByText, getByLabelText} = render(
        <Router>
          <CurationContext.Provider value={customerMatchingStep}>
            <JobResponse
              jobId={"8c69c502-e682-46ce-a0f4-6506ab527ab8"}
              setOpenJobResponse={() => {}}
              stopRun={stopRun}
            />
          </CurationContext.Provider>
        </Router>,
      ));
    });

    expect(
      await waitForElement(() =>
        getByText((content, node) => {
          return getSubElements(content, node, "The flow testFlow is running");
        }),
      ),
    ).toBeInTheDocument();

    expect(getByText("Job ID:")).toBeInTheDocument();
    expect(getByText("Start Time:")).toBeInTheDocument();
    expect(getByText("Duration:")).toBeInTheDocument();

    expect(getByText("8c69c502-e682-46ce-a0f4-6506ab527ab8")).toBeInTheDocument();
    // check that
    await waitForElement(() => getByText("testFlow"));
    const stopButton = getByLabelText("icon: stop-circle");
    expect(stopButton).toBeInTheDocument();
    fireEvent.click(stopButton);
    expect(stopRun).toBeCalled();
  });

  test("Verify canceled job response", async () => {
    mocks.runAPI(axiosInstance);
    let getByText;
    const stopRun = jest.fn();
    act(() => {
      ({getByText} = render(
        <Router>
          <CurationContext.Provider value={customerMatchingStep}>
            <JobResponse
              jobId={"666f23f6-7fc7-492e-980f-8b2ba21a4b94"}
              setOpenJobResponse={() => {}}
              stopRun={stopRun}
            />
          </CurationContext.Provider>
        </Router>,
      ));
    });

    expect(
      await waitForElement(() =>
        getByText((content, node) => {
          return getSubElements(content, node, "The flow testFlow was canceled");
        }),
      ),
    ).toBeInTheDocument();

    expect(getByText("Job ID:")).toBeInTheDocument();
    expect(getByText("Start Time:")).toBeInTheDocument();
    expect(getByText("Duration:")).toBeInTheDocument();

    expect(getByText("666f23f6-7fc7-492e-980f-8b2ba21a4b94")).toBeInTheDocument();
    expect(getByText("merge-person")).toBeInTheDocument();
    expect(getByText("generate-dictionary")).toBeInTheDocument();
  });

  test("Verify that action tooltip apears when hover on the info icon", async () => {
    mocks.runAPI(axiosInstance);

    let getByText;
    let getByLabelText;
    const stopRun = jest.fn();
    act(() => {
      ({getByText, getByLabelText} = render(
        <Router>
          <CurationContext.Provider value={customerMatchingStep}>
            <JobResponse
              jobId={"666f23f6-7fc7-492e-980f-8b2ba21a4b94"}
              setOpenJobResponse={() => {}}
              stopRun={stopRun}
            />
          </CurationContext.Provider>
        </Router>,
      ));
    });

    expect(
      await waitForElement(() =>
        getByText((content, node) => {
          return getSubElements(content, node, "The flow testFlow was canceled");
        }),
      ),
    ).toBeInTheDocument();

    const infoIcon = getByLabelText("icon: info-circle");
    expect(infoIcon).toBeInTheDocument();
    userEvent.hover(infoIcon);
    expect(await screen.findAllByRole("tooltip")).toHaveLength(1);
  }, 50000);
});
