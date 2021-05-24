import React from "react";
import axiosMock from "axios";
import {render, waitForElement, act, cleanup} from "@testing-library/react";
import mocks from "../../api/__mocks__/mocks.data";
import JobResponse from "./job-response";
import {BrowserRouter as Router} from "react-router-dom";
import {CurationContext} from "../../util/curation-context";
import {curationContextMock} from "../../assets/mock-data/curation/curation-context-mock";

jest.mock("axios");

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
    let getByText, queryByText;
    act(() => {
      ({getByText, queryByText} = render(
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

    // check that
    await (waitForElement(() => (getByText("testFlow"))));
    expect(getByText("2020-04-24 14:05")).toBeInTheDocument();
    expect(getByText("0.702s")).toBeInTheDocument();

    // check that expected steps are listed
    expect(getByText("Mapping1")).toBeInTheDocument();
    expect(getByText("match-customer")).toBeInTheDocument();
    expect(getByText("merge-customer")).toBeInTheDocument();
    expect(getByText("master-customer")).toBeInTheDocument();
    expect(getByText("Ingestion1")).toBeInTheDocument();

    expect(getByText("Close")).toBeInTheDocument();

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
    expect(getByText("2020-04-04 01:17")).toBeInTheDocument();
    expect(getByText("0.702s")).toBeInTheDocument();

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
