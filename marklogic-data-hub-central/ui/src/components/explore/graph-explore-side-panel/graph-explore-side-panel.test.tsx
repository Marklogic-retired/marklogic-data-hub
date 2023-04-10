import React from "react";
import {render, cleanup, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import GraphExploreSidePanel from "./graph-explore-side-panel";
import {SearchContext} from "../../../util/search-context";
import {BrowserRouter as Router} from "react-router-dom";
import {
  searchContextInterfaceByDefault,
  defaultSearchOptions as defaultSearchOptions,
} from "@util/uiTestCommonInterface";
import axios from "axios";

jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

describe("Graph view side panel", () => {
  afterEach(cleanup);

  const defaultSavedNode = {
    entityName: "Order",
    primaryKey: {propertyValue: "1234"},
    docUri: "10260.json",
    sources: "",
    entityInstance: {},
    label: "1234",
  };
  test("Render graph side bar", () => {
    const {getByTestId} = render(
      <SearchContext.Provider
        value={{...searchContextInterfaceByDefault, searchOptions: defaultSearchOptions, savedNode: defaultSavedNode}}
      >
        <Router>
          <GraphExploreSidePanel
            onCloseSidePanel={() => {}}
            graphView={true}
            openUnmergeCompare={false}
            loadingCompare={""}
            data={[]}
            isUnmergeAvailable={jest.fn()}
          />
        </Router>
      </SearchContext.Provider>,
    );
    const dropdown = getByTestId("graphSidePanel");
    expect(dropdown).toBeInTheDocument();
    const heading = getByTestId("entityHeading");
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("Order1234");
    const uri = getByTestId("uriLabel");
    expect(uri).toBeInTheDocument();
    expect(uri.textContent).toBe("URI: 10260.json");
  });

  test("Render instance tab", () => {
    const {getByLabelText, getByText} = render(
      <SearchContext.Provider
        value={{...searchContextInterfaceByDefault, searchOptions: defaultSearchOptions, savedNode: defaultSavedNode}}
      >
        <Router>
          <GraphExploreSidePanel
            onCloseSidePanel={() => {}}
            graphView={true}
            openUnmergeCompare={false}
            loadingCompare={""}
            data={[]}
            isUnmergeAvailable={jest.fn()}
          />
        </Router>
      </SearchContext.Provider>,
    );
    const instanceTab = getByLabelText("instanceTabInSidePanel");
    fireEvent.click(instanceTab);
    expect(getByText("Property")).toBeInTheDocument();
    expect(getByText("Value")).toBeInTheDocument();
    expect(getByLabelText("radio-button-expand")).toBeInTheDocument();
    expect(getByLabelText("radio-button-collapse")).toBeInTheDocument();
  });

  test("Display message when the node has no data", () => {
    const {getByLabelText} = render(
      <SearchContext.Provider
        value={{...searchContextInterfaceByDefault, savedNode:
          {isConcept: false, docUri: null, docURI: null, uri: null}}}
      >
        <Router>
          <GraphExploreSidePanel
            onCloseSidePanel={() => {}}
            graphView={true}
            openUnmergeCompare={false}
            loadingCompare={""}
            data={[]}
            isUnmergeAvailable={jest.fn()}
          />
        </Router>
      </SearchContext.Provider>,
    );
    expect(getByLabelText("noMappedDoc-Alert")).toBeInTheDocument();
  });

  test("Render semantic concept information in the side panel", async () => {
    let semanticConceptIRI = "http://www.example.com/Category/Sneakers";
    let semanticConceptInfo = {
      semanticConceptIRI: semanticConceptIRI,
      data: [
        {
          entityTypeIRI: "http://example.org/Product-1.0.0/Product",
          total: 1,
        },
      ],
    };
    const savedNodeConcept = {
      docUri: "testURI",
      label: "Sneakers",
      isConcept: true,
      id: "http://www.example.com/Category/Sneakers",
    };
    axiosMock.get["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: semanticConceptInfo})));
    let url = `/api/entitySearch/graph/semanticConceptInfo?semanticConceptIRI=${semanticConceptIRI}&database=final`;
    const {getByTestId, findByLabelText, queryByLabelText} = render(
      <SearchContext.Provider
        value={{...searchContextInterfaceByDefault, searchOptions: defaultSearchOptions, savedNode: savedNodeConcept}}
      >
        <Router>
          <GraphExploreSidePanel
            onCloseSidePanel={() => {}}
            graphView={true}
            openUnmergeCompare={false}
            loadingCompare={""}
            data={[]}
            isUnmergeAvailable={jest.fn()}
          />
        </Router>
      </SearchContext.Provider>,
    );
    expect(getByTestId("graphSidePanel")).toBeInTheDocument();
    const heading = await findByLabelText("Sneakers-conceptHeading");
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("Sneakers");
    expect(queryByLabelText("graphViewRightArrow")).not.toBeInTheDocument();
    expect((await findByLabelText("Product-entityType")).textContent).toBe("Product");
    expect((await findByLabelText("Product-relatedInstances")).textContent).toBe("1");
    expect(axiosMock.get).toHaveBeenCalledWith(url);
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
  });
});
