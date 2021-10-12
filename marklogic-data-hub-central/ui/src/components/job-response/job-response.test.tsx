import React from "react";
import axiosMock from "axios";
import {render, waitForElement, act, cleanup} from "@testing-library/react";
import mocks from "../../api/__mocks__/mocks.data";
import JobResponse from "./job-response";
import {BrowserRouter as Router} from "react-router-dom";
import {CurationContext} from "../../util/curation-context";
import {curationContextMock} from "../../assets/mock-data/curation/curation-context-mock";
import moment from "moment";
import curateData from "../../assets/mock-data/curation/flows.data";

jest.mock("axios");

/* Commenting out for DHFPROD-7820, remove unfinished run flow epic stories from 5.6
// const getSubElements=(content, node, title) => {
//   const hasText = node => node.textContent === title;
//   const nodeHasText = hasText(node);
//   const childrenDontHaveText = Array.from(node.children).every(
//     child => !hasText(child)
//   );
//   return nodeHasText && childrenDontHaveText;
// };
*/

describe("Job response modal", () => {

  beforeEach(() => {
    mocks.advancedAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify successful job response information displays", async () => {
    mocks.runAPI(axiosMock);
    let getByText;
    act(() => {
      ({getByText} = render(
        <Router>
          <CurationContext.Provider value={curationContextMock}>
            <JobResponse
              jobId={"e4590649-8c4b-419c-b6a1-473069186592"}
              openJobResponse={true}
              setOpenJobResponse={() => {}}
            />
          </CurationContext.Provider>
        </Router>
      ));
    });

    /* Commenting out for DHFPROD-7820, remove unfinished run flow epic stories from 5.6
    // verify modal text and headers
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "The flow testFlow completed");
    })))).toBeInTheDocument();

    expect(getByText("Job ID:")).toBeInTheDocument();
    expect(getByText("Start Time:")).toBeInTheDocument();
    expect(getByText("Duration:")).toBeInTheDocument();

    expect(getByText("e4590649-8c4b-419c-b6a1-473069186592")).toBeInTheDocument();
    expect(getByText("2020-04-24 14:05")).toBeInTheDocument();
    expect(getByText("0s 702ms")).toBeInTheDocument();
    */

    // check that
    await (waitForElement(() => (getByText("testFlow"))));
    let ts: string = curateData.jobRespSuccess.data.timeEnded; // "2020-04-24T14:05:01.019819-07:00"
    let tsExpected: string = moment(ts).format("YYYY-MM-DD HH:mm");
    expect(getByText(tsExpected)).toBeInTheDocument(); // "2020-04-24 14:05"
    expect(getByText("0s 702ms")).toBeInTheDocument();

    // check that expected steps are listed
    expect(getByText("Mapping1")).toBeInTheDocument();
    expect(getByText("match-customer")).toBeInTheDocument();
    expect(getByText("merge-customer")).toBeInTheDocument();
    expect(getByText("master-customer")).toBeInTheDocument();
    expect(getByText("Ingestion1")).toBeInTheDocument();
  });

  test("Verify failed job response information displays", async () => {
    mocks.runXMLAPI(axiosMock);
    let getByText, queryByText;
    act(() => {
      ({getByText, queryByText} = render(
        <Router>
          <CurationContext.Provider value={curationContextMock}>
            <JobResponse
              jobId={"350da405-c1e9-4fa7-8269-d9aefe3b4b9a"}
              openJobResponse={true}
              setOpenJobResponse={() => {}}
            />
          </CurationContext.Provider>
        </Router>
      ));
    });

    // check that
    await (waitForElement(() => (getByText("testFlow"))));
    let ts: string = curateData.jobRespFailedWithError.data.stepResponses["1"].stepEndTime; // "2020-04-04T01:17:45.012137-07:00"
    let tsExpected: string = moment(ts).format("YYYY-MM-DD HH:mm");
    expect(getByText(tsExpected)).toBeInTheDocument(); // "2020-04-04 01:17"
    expect(getByText("0s 702ms")).toBeInTheDocument();

    // check that expected steps are listed
    expect(getByText("failedIngest")).toBeInTheDocument();
    expect(getByText("Mapping1")).toBeInTheDocument();
    expect(getByText("match-customer")).toBeInTheDocument();
    expect(getByText("merge-customer")).toBeInTheDocument();
    expect(getByText("master-customer")).toBeInTheDocument();

    expect(queryByText("Explore Loaded Data")).not.toBeInTheDocument();
    expect(queryByText("Explore Curated Data")).not.toBeInTheDocument();

  });
});
