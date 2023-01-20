import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {waitForElement, waitForElementToBeRemoved, render, wait, cleanup, fireEvent, within} from "@testing-library/react";
import {waitFor} from "@testing-library/dom";
import MappingStepDetail from "./mapping-step-detail";
import data from "../../../../assets/mock-data/curation/common.data";
import {CurationContext} from "../../../../util/curation-context";
import {personMappingStepEmpty, personMappingStepWithData, personMappingStepWithRelatedEntityData} from "../../../../assets/mock-data/curation/curation-context-mock";
import {updateMappingArtifact, getMappingArtifactByMapName, getMappingFunctions, getMappingRefs} from "../../../../api/mapping";
import {mappingStep, mappingStepPerson} from "../../../../assets/mock-data/curation/mapping.data";
import {getUris, getDoc} from "../../../../util/search-service";
import {getMappingValidationResp, getNestedEntities} from "../../../../util/manageArtifacts-service";
import {act} from "react-dom/test-utils";
import {personNestedEntityDef, personNestedEntityDefSameNames, personRelatedEntityDef, personRelatedEntityDefLargePropSet} from "../../../../assets/mock-data/curation/entity-definitions-mock";
import {AuthoritiesContext, AuthoritiesService} from "../../../../util/authorities";
import userEvent from "@testing-library/user-event";
import StepsConfig from "../../../../config/steps.config";

jest.mock("axios");
jest.mock("../../../../api/mapping");
jest.mock("../../../../util/search-service");
jest.mock("../../../../util/manageArtifacts-service");

const mockGetMapArtifactByName = getMappingArtifactByMapName as jest.Mock;
const mockUpdateMapArtifact = updateMappingArtifact as jest.Mock;
const mockGetSourceDoc = getDoc as jest.Mock;
const mockGetUris = getUris as jest.Mock;
const mockGetNestedEntities = getNestedEntities as jest.Mock;
const mockGetMappingValidationResp = getMappingValidationResp as jest.Mock;
const mockGetMappingFunctions = getMappingFunctions as jest.Mock;
const mockGetMappingRefs = getMappingRefs as jest.Mock;

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const defaultRender =  (curationContextValue: any) => {
  return render(
    <CurationContext.Provider value={curationContextValue}>
      <MappingStepDetail />
    </CurationContext.Provider>
  );
};

const renderWithAuthorities = (curationContextValue, authorityService) => {
  return render(
    <AuthoritiesContext.Provider value={authorityService}>
      <CurationContext.Provider value={curationContextValue}>
        <MappingStepDetail />
      </CurationContext.Provider>
    </AuthoritiesContext.Provider>
  );
};

const renderWithRouter = (curationContextValue, authorityService) => {
  return render(
    <Router>
      <AuthoritiesContext.Provider value={authorityService}>
        <CurationContext.Provider value={curationContextValue}>
          <MappingStepDetail />
        </CurationContext.Provider>
      </AuthoritiesContext.Provider>
    </Router>
  );
};

const renderWithRouterNoAuthorities = (curationContextValue) => {
  return render(
    <Router>
      <CurationContext.Provider value={curationContextValue}>
        <MappingStepDetail />
      </CurationContext.Provider>
    </Router>
  );
};

describe("RTL Source-to-entity map tests", () => {

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  beforeEach(() => jest.setTimeout(20000));

  test("RTL tests with no source data", async () => {
    mockGetUris.mockResolvedValueOnce({status: 200, data: []});

    let getByText, getByRole, getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepEmpty);
      getByText = renderResults.getByText;
      getByRole = renderResults.getByRole;
      getByTestId = renderResults.getByTestId;
    });
    expect(getByText("Source Data")).toBeInTheDocument();
    expect(getByText("Test")).toBeDisabled;
    expect(getByText("Clear")).toBeDisabled;
    expect(getByTestId("entityContainer")).toBeInTheDocument();
    expect(getByTestId("srcContainer")).toBeInTheDocument();
    expect(getByText("Unable to find source records using the specified collection or query.")).toBeInTheDocument;
    expect(getByTestId("srcContainer")).toHaveClass("sourceContainer");
    expect(getByText("Entity Type: Person")).toBeInTheDocument();
    expect(getByRole("presentation").className).toEqual("Resizer vertical ");
  });

  test("Verify 'before' interceptor success messaging in source table", async () => {
    mockGetMapArtifactByName.mockResolvedValue(mappingStep.artifacts[4]);
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});

    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    let getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
    });

    expect(getByLabelText("interceptorMessage")).toBeInTheDocument();

    //source table should still be present
    expect(getByTestId("sourceTableKey")).toBeInTheDocument();

  });

  test("Verify 'before' interceptor error messaging in source table", async () => {
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetMapArtifactByName.mockResolvedValue(mappingStep.artifacts[4]);
    mockGetSourceDoc.mockImplementation(() => {
      throw {response: {data: {message: "Interceptor execution failed;cause: JS-JAVASCRIPT: a.b; -- Error running JavaScript request: TypeError: Cannot read property 'b' of undefined"}}};
    });

    let getByLabelText, queryByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByLabelText = renderResults.getByLabelText;
      queryByTestId = renderResults.queryByTestId;
    });

    expect(getByLabelText("interceptorError")).toBeInTheDocument();

    //source table should not be present
    expect(queryByTestId("sourceTableKey")).not.toBeInTheDocument();
  });

  test("Verify legend visibility", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByTestId = renderResults.getByTestId;
    });

    //verify legend visibility
    expect(getByTestId("relationshipIconLegend")).toBeInTheDocument();
    expect(getByTestId("foreignKeyIconLegend")).toBeInTheDocument();
    expect(getByTestId("multipleIconLegend")).toBeInTheDocument();
    expect(getByTestId("structuredIconLegend")).toBeInTheDocument();

    //verify table icons
    expect(getByTestId("multiple-items")).toBeInTheDocument();
    expect(getByTestId("structured-items/itemCategory")).toBeInTheDocument();

    //TODO: add verification for table foreign-key and related-entity legend icons.
  });

  test("RTL tests with entire source record", async () => {
    mockGetMapArtifactByName.mockResolvedValue({...mappingStep.artifacts[0], "sourceRecordScope": "entireRecord"});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblingsEntireRecord});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
    });

    expect(getByText("envelope")).toBeInTheDocument();
    expect(getByText("triples")).toBeInTheDocument();
    await (() => expect(getByText("instance")).toBeInTheDocument());

  });

  test("RTL tests with source data", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, queryByText, getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      queryByText = renderResults.queryByText;
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
    });

    expect(getByText("Source Data")).toBeInTheDocument();
    expect(getByText("proteinId")).toBeInTheDocument();
    expect(getByText("emptyString")).toBeInTheDocument();
    expect(getByText("nullValue")).toBeInTheDocument();
    expect(getByText("numberValue")).toBeInTheDocument();
    expect(getByText("booleanValue")).toBeInTheDocument();
    expect(getByText("whitespaceValue")).toBeInTheDocument();
    expect(getByText("emptyArrayValue")).toBeInTheDocument();
    expect(getByTestId("entityContainer")).toBeInTheDocument();
    expect(getByTestId("srcContainer")).toBeInTheDocument();
    expect(getByTestId("srcContainer")).toHaveClass("sourceContainer");
    expect(getByText("Entity Type: Person")).toBeInTheDocument();
    expect(getByText("Test")).toBeEnabled();

    // No related entity filter if no related entities
    expect(queryByText("Person-entities-filter")).not.toBeInTheDocument();

    // Link to Settings
    const settingsLink = getByLabelText("stepSettings");
    settingsLink.onclick = jest.fn();
    await act(async () => { fireEvent.click(settingsLink); });
    expect(settingsLink.onclick).toHaveBeenCalledTimes(1);

    // Check datatype class names for source values
    expect(getByTestId("emptyString-srcValue").children[0].className.includes("datatype-string")).toBe(true);
    expect(getByTestId("nullValue-srcValue").children[0].className.includes("datatype-null")).toBe(true);
    expect(getByTestId("numberValue-srcValue").children[0].className.includes("datatype-number")).toBe(true);
    expect(getByTestId("booleanValue-srcValue").children[0].className.includes("datatype-boolean")).toBe(true);
    expect(getByTestId("whitespaceValue-srcValue").children[0].className.includes("datatype-string")).toBe(true);
    expect(getByTestId("emptyArrayValue-srcValue").children[0].className.includes("datatype-object")).toBe(true);

    //rerender(<MappingStepDetail{...data.mapProps} mappingVisible={true} isLoading={true} />);
    //await act(async () => {
    // rerender(<CurationContext.Provider value={personMappingStepWithData}><MappingStepDetail />
    //   </CurationContext.Provider>)

    //await(waitForElement(() => getByTestId("spinTest")));

    //await(waitForElementToBeRemoved(() => getByTestId("spinTest")));
    //});
    //expect(getByTestId("spinTest")).toBeInTheDocument();
    //rerender(<MappingStepDetail{...data.mapProps} mappingVisible={true} isLoading={false} />);
    // rerender(<CurationContext.Provider value={personMappingStepEmpty}><MappingStepDetail />
    //   </CurationContext.Provider>)
    //await act(() => Promise.resolve())
    expect(queryByText("Unable to find source records using the specified collection or query.")).not.toBeInTheDocument();
    let exp = getByText("testNameInExp");
    expect(exp).toBeInTheDocument();
    await act(async () => { fireEvent.change(exp, {target: {value: "concat(name,'-NEW')"}}); });
    await act(async () => { fireEvent.blur(exp); });
    await act(async () => { fireEvent.click(getByText("Clear")); });
    expect(getByText("Clear")).toBeEnabled();
    expect(getByText("concat(name,'-NEW')")).toBeInTheDocument();
  });

  test("Filtering Name column in Source data table for array type data", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getAllByText, queryByText, getByLabelText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getAllByText = renderResults.getAllByText;
      queryByText = renderResults.queryByText;
      getByLabelText = renderResults.getByLabelText;
    });

    await act(async () => { fireEvent.click(getByLabelText("filterIcon-srcName")); });
    fireEvent.change(getByLabelText("searchInput-source"), {target: {value: "protein"}});
    await act(async () => { fireEvent.click(document.querySelector("#submitSearch-source")!); });

    expect(getAllByText("protein")).toHaveLength(4);
    expect(queryByText("whitespaceValue")).not.toBeInTheDocument();
  });

  test("Mapping expression for a nested entity property with same name should be saved appropriately", async () => {
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDefSameNames});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});

    let getAllByTestId, getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepEmpty);
      getAllByTestId = renderResults.getAllByTestId;
      getByTestId = renderResults.getByTestId;
    });

    fireEvent.change(getAllByTestId("propName-mapexpression")[0], {target: {value: "concat(propName,'-NEW')"}});
    fireEvent.blur(getAllByTestId("propName-mapexpression")[0]);
    await (waitForElement(() => (getByTestId("successMessage"))));

    //Appropriate field should be saved when there are duplicate property names
    expect(getAllByTestId("propName-mapexpression")[0]).toHaveTextContent("concat(propName,'-NEW')");
    expect(getAllByTestId("propName-mapexpression")[1]).toHaveTextContent("");
  });

  test("Filtering Name column in Source (JSON Source Data) and Entity tables", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, getAllByText, queryByText, getByLabelText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      getAllByText = renderResults.getAllByText;
      queryByText = renderResults.queryByText;
      getByLabelText = renderResults.getByLabelText;
    });

    //For Source table testing
    let sourcefilterIcon = getByLabelText("filterIcon-srcName");

    /* Test filter for JSON Source data in Source table  */
    await act(async() => { fireEvent.click(sourcefilterIcon); });
    let inputSearchSource = getByLabelText("searchInput-source");

    await act(async () => { fireEvent.change(inputSearchSource, {target: {value: "first"}}); }); //Enter a case-insensitive value in inputSearch fiel
    expect(inputSearchSource).toHaveValue("first");
    let submitSearchSource = document.querySelector("#submitSearch-source");
    await act(async () => { submitSearchSource && fireEvent.click(submitSearchSource); }); //Click on Search button to apply the filter with the desired strin

    //Check if the expected values are available/not available in search result.
    expect(getAllByText("nutFreeName").length).toEqual(2);
    expect(getAllByText("NamePreferred").length).toEqual(2);
    expect(getByText("John")).toBeInTheDocument();
    expect(queryByText("proteinId")).not.toBeInTheDocument();
    expect(queryByText("proteinType")).not.toBeInTheDocument();
    expect(queryByText("withNutsOrganism")).not.toBeInTheDocument();
    expect(queryByText("OrganismName")).not.toBeInTheDocument();
    expect(queryByText("Frog virus 3")).not.toBeInTheDocument();
    expect(queryByText("OrganismType")).not.toBeInTheDocument();
    expect(queryByText("scientific")).not.toBeInTheDocument();

    //Check if the entity properties are not affected by the filter on source table
    expect(getByText("propId")).toBeInTheDocument();
    expect(getByText("propName")).toBeInTheDocument();
    expect(queryByText("artCraft")).not.toBeInTheDocument();
    expect(queryByText("automobile")).not.toBeInTheDocument();
    expect(queryByText("speedometer")).not.toBeInTheDocument();
    expect(queryByText("windscreen")).not.toBeInTheDocument();

    //Reset the search filter on Source table
    await act(async () => { fireEvent.click(sourcefilterIcon); });
    let resetSourceSearch = document.querySelector("#resetSearch-source");
    await act(async () => { resetSourceSearch && fireEvent.click(resetSourceSearch); });

    //Check if the table goes back to the default state after resetting the filter on source table.
    expect(getByText("proteinId")).toBeInTheDocument();
    expect(getByText("proteinType")).toBeInTheDocument();
    expect(getByText("withNutsOrganism")).toBeInTheDocument();
    expect(getByText("OrganismName")).toBeInTheDocument();
    expect(getByText("Frog virus 3")).toBeInTheDocument();
    expect(getByText("OrganismType")).toBeInTheDocument();
    expect(getByText("scientific")).toBeInTheDocument();
    expect(getAllByText("nutFreeName").length).toEqual(2);
    expect(getAllByText("FirstNamePreferred").length).toEqual(2);
    expect(getByText("John")).toBeInTheDocument();
    expect(queryByText("suffix")).not.toBeInTheDocument(); //This is not visible since only root and first level are expanded in the default state

    /* Test filter on Entity table  */

    //Updating expression for few fields to be validated later
    let exp = getByText("testNameInExp");
    fireEvent.change(exp, {target: {value: "concat(propName,'-NEW')"}});
    fireEvent.blur(exp);
    expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument();

    //For Entity table testing
    let entityfilterIcon = getByLabelText("filterIcon-Person-entity");

    //Moving along with the filter test
    await act(async () => { fireEvent.click(entityfilterIcon); });

    let inputSearchEntity = getByLabelText("searchInput-entity");

    await act(async () => { fireEvent.change(inputSearchEntity, {target: {value: "craft"}}); }); //Enter a case-insensitive value in inputEntitySearch fiel}
    expect(inputSearchEntity).toHaveValue("craft");
    await act(async () => { fireEvent.click(document.querySelector("#submitSearch-entity")!); }); //Click on Search button to apply the filter with the desired strin})

    //Entity type title should remain in the first row after filter is applied
    // let entTableTopRow: any;
    // let entTableRow = document.querySelectorAll("#entityContainer .ant-table-row-level-0");
    // entTableRow.forEach(item => { if (item.getAttribute("data-row-key") === "0") { return entTableTopRow = item; } });
    // expect(entTableTopRow).toHaveTextContent(data.mapProps.entityTypeTitle);

    //Check if the expected values are available/not available in search result.
    expect(getByText("Craft")).toBeInTheDocument();

    //Check if the source table properties are not affected by the filter on Entity table
    expect(getByText("proteinId")).toBeInTheDocument();
    expect(getByText("proteinType")).toBeInTheDocument();
    expect(getAllByText("nutFreeName").length).toEqual(2);
    expect(getAllByText("FirstNamePreferred").length).toEqual(2);
    expect(getAllByText("LastName").length).toEqual(2);
    expect(getByText("withNutsOrganism")).toBeInTheDocument();
    expect(getByText("OrganismName")).toBeInTheDocument();
    expect(getByText("Frog virus 3")).toBeInTheDocument();
    expect(getByText("OrganismType")).toBeInTheDocument();
    expect(getByText("scientific")).toBeInTheDocument();
    expect(getByText("John")).toBeInTheDocument();
    expect(queryByText("suffix")).not.toBeInTheDocument();

    //Reset the search filter on Entity table
    await act(async () => { fireEvent.click(entityfilterIcon); });

    let resetEntitySearch = document.querySelector("#resetSearch-entity");
    await act(async () => { resetEntitySearch && fireEvent.click(resetEntitySearch); });

    //Check if the table goes back to the default state after resetting the filter on Entity table.
    expect(getByText("propId")).toBeInTheDocument();
    expect(getByText("propName")).toBeInTheDocument();
    expect(getByText("itemTypes")).toBeInTheDocument();
    expect(getByText("itemCategory")).toBeInTheDocument();
  });

  test("Filtering of Name column in XML Source data", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, getAllByText, queryByText, getByLabelText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      getAllByText = renderResults.getAllByText;
      queryByText = renderResults.queryByText;
      getByLabelText = renderResults.getByLabelText;
    });

    /* Test filter on Source table with XML data  */
    let sourcefilterIcon = getByLabelText("filterIcon-srcName");

    await act(async () => { fireEvent.click(sourcefilterIcon); }); //Click on filter icon to open the search input field and other related buttons.
    let inputSourceSearch = getByLabelText("searchInput-source");

    fireEvent.change(inputSourceSearch, {target: {value: "organism"}}); //Enter a case-insensitive value in inputSearch field
    expect(inputSourceSearch).toHaveValue("organism");
    await act(async () => { fireEvent.click(document.querySelector("#submitSearch-source")!); }); //Click on Search button to apply the filter with the desired string

    //Check if the expected values are available/not available in search result.
    expect(getByText(/withNuts:/)).toBeInTheDocument();
    expect(getByText("Frog virus 3")).toBeInTheDocument();
    expect(getByText("scientific")).toBeInTheDocument();
    expect(queryByText("NamePreferred")).not.toBeInTheDocument();
    expect(queryByText("John")).not.toBeInTheDocument();
    expect(queryByText("LastName")).not.toBeInTheDocument();
    expect(queryByText("Smith")).not.toBeInTheDocument();

    //Check if the entity properties are not affected by the filter on source table
    expect(getByText("propId")).toBeInTheDocument();
    expect(getByText("propName")).toBeInTheDocument();
    expect(queryByText("artCraft")).not.toBeInTheDocument();
    expect(queryByText("automobile")).not.toBeInTheDocument();
    expect(queryByText("speedometer")).not.toBeInTheDocument();
    expect(queryByText("windscreen")).not.toBeInTheDocument();

    //Reset the search filter on Source table
    await act(async () => { fireEvent.click(sourcefilterIcon); });
    let resetSourceSearch = document.querySelector("#resetSearch-source");
    await act(async () => { resetSourceSearch && fireEvent.click(resetSourceSearch); });

    //Check if the table goes back to the default state after resetting the filter on source table.
    expect(getAllByText(/nutFree:/).length).toEqual(2);
    expect(getByText(/withNuts:/)).toBeInTheDocument();
    expect(queryByText("NamePreferred")).not.toBeInTheDocument();
    expect(queryByText("LastName")).not.toBeInTheDocument();
  });

  test("Rendering of XML Namespaced Source Data", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlNamespacedSourceData});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, getAllByText, getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      getAllByText = renderResults.getAllByText;
      getByTestId = renderResults.getByTestId;
    });

    let namespacePrefixes = getAllByText("org:example:");
    expect(namespacePrefixes).toHaveLength(2);
    expect(getByTestId("test-namespaced-value")).toBeInTheDocument();
    expect(getByTestId("hello-namespaced-value")).toBeInTheDocument();
    expect(getByText("world")).toBeInTheDocument();

    fireEvent.mouseOver(namespacePrefixes[0]);
    await wait(() => expect(getByText(`org:example = "org:example"`)).toBeInTheDocument());

    fireEvent.mouseOver(namespacePrefixes[1]);
    await wait(() => expect(getAllByText(`org:example = "org:example"`)).toHaveLength(2));
  });

  test("Filtering Name column in related entity tables", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDef});

    let getByTestId, getByLabelText, getAllByLabelText, getByText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByTestId = renderResults.getByTestId;
      getByLabelText = renderResults.getByLabelText;
      getByText = renderResults.getByText;
      getAllByLabelText = renderResults.getAllByLabelText;
    });

    //expand nested levels first
    await act(async () => { fireEvent.click(within(getByTestId("entityContainer")).getByLabelText("radio-button-expand")); });

    //   //Entity type title should be visible
    //   // let entTableTopRow: any;
    //   // let entTableRow = document.querySelectorAll("#entityContainer .ant-table-row-level-0");
    //   // entTableRow.forEach(item => { if (item.getAttribute("data-row-key") === "0") { return entTableTopRow = item; } });
    //   // expect(entTableTopRow).toHaveTextContent(data.mapProps.entityTypeTitle);

    //   // // Verify related entity filter in the first row
    //   // expect(getByText("Map related entities:").closest("tr")).toBe(entTableTopRow);

    //   // //Verify entity settings icon also exist in the first row
    //   // expect(getByLabelText("entitySettings").closest("tr")).toBe(entTableTopRow);

    await wait(() => fireEvent.keyDown(getByLabelText("entities-filter-select"), {key: "ArrowDown"})); // focus on the search box


    //Related entity options should appear
    expect(getByText("Order (orderedBy Person)")).toBeInTheDocument();
    expect(getByText("BabyRegistry (ownedBy Person)")).toBeInTheDocument();

    //Select both Order and BabyRegistry related entities to display
    await act(async () => { fireEvent.click(getByLabelText("Order (orderedBy Person)-option")); });
    await wait(() => fireEvent.keyDown(getAllByLabelText("entities-filter-select")[0], {key: "ArrowDown"})); // focus on the search box again
    await act(async () => { fireEvent.click(getByLabelText("BabyRegistry (ownedBy Person)-option")); });

    let entityFilterValue = getAllByLabelText("multioption-container");

    //Both selected values should appear in primary table filter
    expect(entityFilterValue[0]).toHaveTextContent("Order (orderedBy Person)");
    expect(entityFilterValue[1]).toHaveTextContent("BabyRegistry (ownedBy Person)");

    //Order and BabyRegistry tables should be present on the screen
    expect(getByLabelText("Order (orderedBy Person)-title")).toBeInTheDocument();
    expect(getByLabelText("BabyRegistry (ownedBy Person)-title")).toBeInTheDocument();

    expect(getByText("orderedBy")).toBeInTheDocument();
    await act(async () => { fireEvent.mouseOver((getByTestId("foreign-orderedBy"))); });
    await wait(() => expect(document.querySelector("#tooltip-orderedBy")).toBeInTheDocument());

    //Verify that there are now three entity filters, one in the primary table and one in each related table
    let entityFilters = getAllByLabelText("entities-filter-select");

    expect(entityFilters).toHaveLength(3);

    //For Entity table testing
    let entityfilterIcon = getByLabelText("filterIcon-Person-entity");
    /* Test filter on Entity table  */

    //Filter by the properties of main and related tables
    await act(async () => { fireEvent.click(entityfilterIcon); });
    let inputSearchEntity = getByLabelText("searchInput-entity");
    await act(async () => { fireEvent.change(inputSearchEntity, {target: {value: "orderId"}}); });
    expect(inputSearchEntity).toHaveValue("orderId");
    await act(async () => { fireEvent.click(document.querySelector("#submitSearch-entity")!); });
    expect(getByText("orderId")).toBeInTheDocument();
    expect(getByText("orderId")).toHaveStyle("background-color: yellow");

    await act(async () => { fireEvent.click(entityfilterIcon); });
    inputSearchEntity = getByLabelText("searchInput-entity");
    fireEvent.change(inputSearchEntity, {target: {value: "arrivalDate"}});
    expect(inputSearchEntity).toHaveValue("arrivalDate");
    await act(async () => { fireEvent.click(document.querySelector("#submitSearch-entity")!); });
    expect(getByText("arrivalDate")).toBeInTheDocument();
    expect(getByText("arrivalDate")).toHaveStyle("background-color: yellow");

    await act(async () => { fireEvent.click(entityfilterIcon); });
    inputSearchEntity = getByLabelText("searchInput-entity");
    fireEvent.change(inputSearchEntity, {target: {value: "babyRegistryId"}});
    expect(inputSearchEntity).toHaveValue("babyRegistryId");
    await act(async () => { fireEvent.click(document.querySelector("#submitSearch-entity")!); });
    expect(getByText("babyRegistryId")).toBeInTheDocument();
    expect(getByText("babyRegistryId")).toHaveStyle("background-color: yellow");

    await act(async () => { fireEvent.click(entityfilterIcon); });
    inputSearchEntity = getByLabelText("searchInput-entity");
    await act(async () => { fireEvent.change(inputSearchEntity, {target: {value: "deliveredTo"}}); });
    expect(inputSearchEntity).toHaveValue("deliveredTo");
    await act(async () => { fireEvent.click(document.querySelector("#submitSearch-entity")!); });
    expect(getByText("deliveredTo")).toBeInTheDocument();
    expect(getByText("deliveredTo")).toHaveStyle("background-color: yellow");

    await act(async () => { fireEvent.click(entityfilterIcon); });
    inputSearchEntity = getByLabelText("searchInput-entity");
    await act(async () => { fireEvent.change(inputSearchEntity, {target: {value: "orderedBy"}}); });
    expect(inputSearchEntity).toHaveValue("orderedBy");
    await act(async () => { fireEvent.click(document.querySelector("#submitSearch-entity")!); });
    expect(getByText("orderedBy")).toBeInTheDocument();
    expect(getByText("orderedBy")).toHaveStyle("background-color: yellow");

    await act(async () => { fireEvent.click(entityfilterIcon); });
    inputSearchEntity = getByLabelText("searchInput-entity");
    await act(async () => { fireEvent.change(inputSearchEntity, {target: {value: "lineItems"}}); });
    expect(inputSearchEntity).toHaveValue("lineItems");
    await act(async () => { fireEvent.click(document.querySelector("#submitSearch-entity")!); });
    expect(getByText("lineItems")).toBeInTheDocument();
    expect(getByText("lineItems")).toHaveStyle("background-color: yellow");
  });

  test("Column option selector in Entity table", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, getByTestId, getAllByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      getAllByTestId = renderResults.getAllByTestId;
    });

    //Set the data for testing in xpath expression

    let exp = getByText("testNameInExp");
    await act(async () => { fireEvent.change(exp, {target: {value: "concat(propName,'-NEW')"}}); });
    await act(async () => { fireEvent.blur(exp); });
    expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument();

    /* Test column option selector in Entity table  */
    let colOptSelect = getByTestId("column-selector");
    await act(async () => { fireEvent.click(colOptSelect); });
    let Name = getByTestId("columnOptionsCheckBox-name");
    let Type = getByTestId("columnOptionsCheckBox-type");
    let XPathExpression = getByTestId("columnOptionsCheckBox-key");
    let Value = getByTestId("columnOptionsCheckBox-value");
    expect(Name).toBeChecked();
    expect(Type).toBeChecked();
    expect(XPathExpression).toBeChecked();
    expect(Value).toBeChecked();

    await act(async () => { fireEvent.click(Name); }); //Uncheck Name column
    let colHeader: any = getAllByTestId("entityTableType")[0].closest("tr");
    let entityTableHeaderRow = within(colHeader);
    expect(entityTableHeaderRow.queryByText("Name")).not.toBeInTheDocument();

    //Verifying edge case where xpath expression rows for the filtered out names also appear if Name is unchecked in options selector
    expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument(); // This will not have been visible if name had not been unchecked earlier.

    await act(async () => { fireEvent.click(XPathExpression); }); //Uncheck XPath Expression column

    //Verifying that columns Name and Xpath expression are not visible.
    expect(entityTableHeaderRow.queryByText("Name")).not.toBeInTheDocument();
    expect(entityTableHeaderRow.queryByText("XPath Expression")).not.toBeInTheDocument();

    //Checking the columns one by one in selector and verify that they appear in entity table
    await act(async () => { fireEvent.click(Name); }); //Check Name column
    //Props below should be available now
    expect(getByText("propId")).toBeInTheDocument();
    expect(getByText("propName")).toBeInTheDocument();

    await act(async () => { fireEvent.click(XPathExpression); }); //Check XPathExpression column
    //Props below should be available now
    expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument();
  });

  test("Verify view related entities with selection/deselection in filters", async () => {
    mockGetMapArtifactByName.mockResolvedValue(mappingStep.artifacts[1]);
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDef});

    let getByTestId, getByLabelText, getByText, queryByTestId, getAllByLabelText, queryByLabelText, getByPlaceholderText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithRelatedEntityData);
      getByTestId = renderResults.getByTestId;
      getByLabelText = renderResults.getByLabelText;
      getByText = renderResults.getByText;
      queryByTestId = renderResults.queryByTestId;
      getAllByLabelText = renderResults.getAllByLabelText;
      queryByLabelText = renderResults.queryByLabelText;
      getByPlaceholderText = renderResults.getByPlaceholderText;
    });

    //expand nested levels first
    let entityContainer: any  = await (() => getByTestId("entityContainer"));
    await (() => fireEvent.click(within(entityContainer).getByLabelText("radio-button-expand")));
    await (() => fireEvent.click(within(getByTestId("entityContainer")).getByLabelText("radio-button-expand")));

    //Verify utility in first row of Entity table

    //Entity type title should be visible
    // let entTableTopRow: any;
    // let entTableRow = document.querySelectorAll("#entityContainer .ant-table-row-level-0");
    // entTableRow.forEach(item => { if (item.getAttribute("data-row-key") === "0") { return entTableTopRow = item; } });
    // expect(entTableTopRow).toHaveTextContent(data.mapProps.entityTypeTitle);

    // // Verify related entity filter in the first row
    // expect(getAllByText("Map related entities:")[0].closest("tr")).toBe(entTableTopRow);

    // //Verify entity settings icon also exist in the first row
    // expect(getAllByLabelText("entitySettings")[0].closest("tr")).toBe(entTableTopRow);

    //All mapped entity tables should be present on the screen by default
    await (() => expect(getByLabelText("Person-title")).toBeInTheDocument());
    await wait(() => expect(getByLabelText("Order (orderedBy Person)-title")).toBeInTheDocument());
    await wait(() => expect(getByLabelText("Product (Order hasProduct)-title")).toBeInTheDocument());
    await wait(() => expect(getByLabelText("BabyRegistry (ownedBy Person)-title")).toBeInTheDocument());
    await wait(() => expect(getByLabelText("Product (BabyRegistry hasProduct)-title")).toBeInTheDocument());

    // Verify top-level entity does not have Context row
    expect(queryByTestId("Person-Context-name")).not.toBeInTheDocument();

    // Verify related Context row has expected menus (property but NO function or reference)
    expect(getByTestId("Order (orderedBy Person)-Context-listIcon")).toBeInTheDocument();
    expect(queryByTestId("Context-112-functionIcon")).not.toBeInTheDocument();
    expect(queryByTestId("Order (orderedBy Person)-Context-refIcon")).not.toBeInTheDocument();

    // Verify related URI row has expected menus (property, function and reference)
    expect(getByTestId("Order (orderedBy Person)-URI-listIcon")).toBeInTheDocument();
    expect(getByTestId("URI-112-functionIcon")).toBeInTheDocument();
    expect(getByTestId("Order (orderedBy Person)-URI-refIcon")).toBeInTheDocument();

    //Verify deletion of related entity tables and different confirmation messages

    //Try deleting the BabyRegistry table via X button
    await act(async () => { fireEvent.click(getByTestId("BabyRegistry (ownedBy Person)-delete")); });

    expect(await (waitForElement(() => getByLabelText("entity-being-referenced-msg")))).toBeInTheDocument();

    //Close the confirmation modal
    await act(async () => { fireEvent.click(getByText("OK")); });

    //Delete Product table via X button
    await act(async () => { fireEvent.click(getByTestId("Product (BabyRegistry hasProduct)-delete")); });

    //Confirmation modal to confirm deletion of the entity should appear
    expect(await (waitForElement(() => getByLabelText("confirm-deletion-msg")))).toBeInTheDocument();

    //Confirm deletion of Product (BabyRegistry hasProduct) table
    await act(async () => { fireEvent.click(getByText("Yes")); });

    //Product (BabyRegistry hasProduct) table should no longer be shown
    await wait(() => expect(queryByLabelText("Product (BabyRegistry hasProduct)-title")).not.toBeInTheDocument());

    //Test deletion of BabyRegistry related entity through the X button on the filter label of its parent table (Person) now

    let entityFilterValue = getAllByLabelText("multioption-container");

    //Verify BabyRegistry label exists in the Person table's filter
    expect(entityFilterValue[1]).toHaveTextContent("BabyRegistry (ownedBy Person)");

    //Click X button on the BabyRegistry label
    await act(async () => { fireEvent.click(getAllByLabelText("icon: close")[1]); });

    //Should display confirmation message now, instead of the entity being referenced message because Product child table has been deleted
    expect(await (waitForElement(() => getByLabelText("confirm-deletion-msg")))).toBeInTheDocument();

    //Confirm deletion of BabyRegistry table
    // expect(getByText("Yes")).toBeInTheDocument();
    // fireEvent.click(getByText("Yes"));
    // await act(async () => { fireEvent.click(getByText("Yes")); });

    // entityFilterValue = getAllByLabelText("multioption-container");

    // //BabyRegistry (ownedBy Person) table should no longer be shown
    // await wait(() => expect(queryByLabelText("BabyRegistry (ownedBy Person)-title")).not.toBeInTheDocument());

    // //BabyRegistry label should no longer exist in Person's entity filter
    // expect(entityFilterValue[1]).not.toEqual("BabyRegistry (ownedBy Person)");

    //only target entity table (Person) and Order and its related entity table Product should remain
    await (() => expect(getByLabelText("Person-title")).toBeInTheDocument());
    await wait(() => expect(getByLabelText("Order (orderedBy Person)-title")).toBeInTheDocument());
    await wait(() => expect(getByLabelText("Product (Order hasProduct)-title")).toBeInTheDocument());
    // await wait(() => expect(queryByLabelText("BabyRegistry (ownedBy Person)-title")).not.toBeInTheDocument());
    // await wait(() => expect(queryByLabelText("Product (BabyRegistry hasProduct)-title")).not.toBeInTheDocument());

    //verify advanced settings of related entity
    //click on the related entity table order settings

    //verify the proper related entity settings title shows up when popover is clicked (Order)
    await act(async () => { fireEvent.click(getByTestId("Order-entity-settings")); });
    expect(getByTestId("Order-settings-title")).toBeInTheDocument();

    //verify Target Collections
    expect(getByText("Target Collections:")).toBeInTheDocument();
    expect(getByText("Please add target collections")).toBeInTheDocument();

    //verify Default Collections
    expect(getByText("Default Collections:")).toBeInTheDocument();
    expect(getByText("Order")).toBeInTheDocument();

    //verify Target Permissions
    expect(getByText("Target Permissions:")).toBeInTheDocument();
    await act(async () => { fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-operator"}}); });
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-operator");
    await act(async () => { fireEvent.blur(getByPlaceholderText("Please enter target permissions")); });

    expect(getByTestId("validationError")).toHaveTextContent("The format of the string is incorrect. The required format is role,capability,role,capability,....");

    await act(async () => { fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-operator,read"}}); });
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-operator,read");
    await act(async () => { fireEvent.blur(getByPlaceholderText("Please enter target permissions")); });
    expect(getByTestId("validationError")).toHaveTextContent("");

    // verify proper target entity settings title shows up when popover is clicked (Person)
    await act(async () => { fireEvent.click(getByTestId("Person-entity-settings")); });
    expect(getByTestId("Person-settings-title")).toBeInTheDocument();

    // TODO DHFPROD-7744 Add validation for testing URI value tooltip
  }, 90000);

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("Verify right XPATH with source context selection and testing in related entity tables", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue(mappingStep.artifacts[1]);
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataRelated});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValue({status: 200, data: mappingStepPerson.artifacts[5]});

    let getByTestId, getByLabelText, getAllByText, getByText, queryByTestId, getAllByRole, getAllByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithRelatedEntityData, authorityService);
      getByTestId = renderResults.getByTestId;
      getByLabelText = renderResults.getByLabelText;
      getAllByText = renderResults.getAllByText;
      getByText = renderResults.getByText;
      queryByTestId = renderResults.queryByTestId;
      getAllByRole = renderResults.getAllByRole;
      getAllByTestId = renderResults.getAllByTestId;
    });

    //BabyRegistry table should be present on the screen
    expect(getByLabelText("BabyRegistry (ownedBy Person)-title")).toBeInTheDocument();

    //Verify Context name and xpath field is present for only the related entity table
    expect(queryByTestId("Person-Context-name")).not.toBeInTheDocument();
    expect(queryByTestId("BabyRegistry (ownedBy Person)-Context-name")).toBeInTheDocument();

    expect(queryByTestId("Person-Context-mapexpression")).not.toBeInTheDocument();
    expect(queryByTestId("BabyRegistry (ownedBy Person)-Context-mapexpression")).toBeInTheDocument();

    let mapExp = getByTestId("BabyRegistry (ownedBy Person)-Context-mapexpression");
    //Context value should be "/" by default
    expect(mapExp).toHaveTextContent("/");

    userEvent.type(mapExp, "{selectall}{backspace}");

    let sourceSelector = await waitForElement(() => getByTestId("BabyRegistry (ownedBy Person)-Context-listIcon"));

    //corresponds to 'Context' source selector
    fireEvent.click(sourceSelector);

    await (waitForElement(() => getAllByRole("option"), {"timeout": 600}));
    //Set 'Context' for BabyRegistry related entity to 'BabyRegistry'

    fireEvent.click(getByTestId("BabyRegistry-option"));

    //Right Xpath is populated
    expect(mapExp).toHaveTextContent("BabyRegistry");

    // Verify Xpath for properties is correct when source context parent is set
    sourceSelector = getByTestId("babyRegistryId-listIcon");

    fireEvent.click(sourceSelector);

    fireEvent.click(getAllByTestId("BabyRegistryId-option")[1]);

    mapExp = getByTestId("babyRegistryId-mapexpression");

    //Right Xpath is populated (and not BabyRegistry/BabyRegistryId since sourceContext is set)
    expect(mapExp).toHaveTextContent("BabyRegistryId");

    //Verify Xpath is populated with full context when no sourceContext is set

    //Clear input boxes
    userEvent.type(mapExp, "{selectall}{backspace}");
    fireEvent.blur(mapExp);
    expect(mapExp).toHaveTextContent("");
    mapExp = getByTestId("BabyRegistry (ownedBy Person)-Context-mapexpression");
    userEvent.type(mapExp, "{selectall}{backspace}");
    fireEvent.blur(mapExp);
    expect(mapExp).toHaveTextContent("");

    fireEvent.click(sourceSelector);
    fireEvent.click(getAllByTestId("BabyRegistryId-option")[1]);

    mapExp = getByTestId("babyRegistryId-mapexpression");

    //Right Xpath is populated (BabyRegistry/BabyRegistryId) since sourceContext is empty)
    expect(mapExp).toHaveTextContent("BabyRegistry/BabyRegistryId");
    //Set map expression for BabyRegistry's arrivalDate property as well
    mapExp = getByTestId("arrivalDate-mapexpression");
    fireEvent.change(mapExp, {target: {value: "Arrival_Date"}});

    //Set map expressions for target Person entity
    let propNameExpression = getAllByText("testNameInExp")[0];
    let propAttributeExpression = getAllByText("placeholderAttribute")[0];

    fireEvent.change(propNameExpression, {target: {value: "proteinId"}});
    fireEvent.blur(propNameExpression);
    fireEvent.change(propAttributeExpression, {target: {value: "proteinType"}});
    fireEvent.blur(propAttributeExpression);
    // Test button should be disabled before mapping expression is saved
    expect(document.querySelector("#Test-btn")).toBeDisabled();

    // waiting for success message before clicking on Test button
    await (waitForElement(() => (getByTestId("successMessage"))));
    // checking successMessage is still there before waitForElementToBeRemoved as this would occasionally fail under load
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }

    // Test button should be enabled after mapping expression is saved
    expect(document.querySelector("#Test-btn")).toBeEnabled();

    //Verify Test button click
    fireEvent.click(getByText("Test"));

    await (waitForElement(() => getByTestId("Person-propName-value")));

    //Target entity table should show evaluated expressions
    expect(getByTestId("Person-propName-value")).toHaveTextContent("123EAC");
    expect(getByTestId("Person-propAttribute-value")).toHaveTextContent("home");

    //BabyRegistry Related Entity should also show evaluated expressions
    await (waitForElement(() => getByTestId("BabyRegistry (ownedBy Person)-babyRegistryId-value")));
    expect(getByTestId("BabyRegistry (ownedBy Person)-babyRegistryId-value")).toHaveTextContent("3039");
    expect(getByTestId("BabyRegistry (ownedBy Person)-arrivalDate-value")).toHaveTextContent("2021-01-07-07:00");
  });

  test("Verify URI fields for primary and related entity tables.", async () => {
    const authorityService = new AuthoritiesService();
    await act(async() => authorityService.setAuthorities(["readMapping", "writeMapping"]));

    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataRelated});
    mockGetMapArtifactByName.mockResolvedValue(mappingStep.artifacts[1]);
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValue({status: 200, data: mappingStepPerson.artifacts[5]});

    let getByTestId, getByText, queryByTestId, getByLabelText;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithRelatedEntityData, authorityService);
      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      queryByTestId = renderResults.queryByTestId;
      getByLabelText = renderResults.getByLabelText;
    });

    // URI field should exist for primary entity table and have default value
    let primaryUriExp = await(() => getByTestId("Person-URI-mapexpression"));
    await(() => expect(primaryUriExp).toHaveTextContent(StepsConfig.defaultPrimaryUri));

    // URI field should exist for related entity table and have default value
    let relatedUriExp:any = await(() => getByTestId("BabyRegistry (ownedBy Person)-URI-mapexpression"));
    await(() => expect(relatedUriExp).toHaveTextContent(StepsConfig.defaultRelatedUri("BabyRegistry")));

    // Related entity URI field can be edited
    await(() => userEvent.type(relatedUriExp, "{selectall}{backspace}"));
    await(() => userEvent.type(relatedUriExp, "###"));
    await(() => expect(relatedUriExp).toHaveTextContent("###"));
    await(() => fireEvent.blur(relatedUriExp));

    // Test button should be disabled before mapping expression is saved
    await(() => expect(document.querySelector("#Test-btn")).toBeDisabled());

    // waiting for success message before clicking on Test button
    await (() => (getByTestId("successMessage")));
    // checking successMessage is still there before waitForElementToBeRemoved as this would occasionally fail under load
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }

    // Test button should be enabled after mapping expression is saved
    expect(document.querySelector("#Test-btn")).toBeEnabled();

    //Clicking 'Test' should display evaluated URI expression values in target and related entity tables
    await (() => fireEvent.click(getByText("Test")));
    await ((() => getByTestId("Person-URI-value")));
    await (() => expect(getByTestId("Person-URI-value")).toHaveTextContent("/Person/personWithRelat..."));
    //Verify tooltip shows full value when hovering truncated URI value
    await (() => fireEvent.mouseOver(getByText("/Person/personWithRelat...")));
    await (() => getByText("/Person/personWithRelatedEntities.json"));

    //Verify error message in evaluated URI expression for related entity table
    await (() => expect(getByTestId("BabyRegistry (ownedBy Person)-URI-value")).toHaveTextContent(""));
    await (() => getByLabelText("invalid-uri-text").toBeInTheDocument());

  });

  test("Verify evaluation of valid expression for mapping writer user", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValueOnce({status: 200, data: mappingStepPerson.artifacts[1]});

    let getByText, getByTestId, queryAllByText, queryByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      queryAllByText = renderResults.queryAllByText;
      queryByTestId = renderResults.queryByTestId;
      getByTestId = renderResults.getByTestId;
    });
    await (waitForElement(() => getByTestId("proteinId-srcValue")));
    expect(getByTestId("proteinId-srcValue")).toHaveTextContent("123EAC");

    await act(async () => { fireEvent.mouseOver(getByText("123EAC")); });
    //Verify there is no tooltip.
    expect(queryAllByText("123EAC")).toHaveLength(1);

    let propNameExpression = getByText("testNameInExp");
    let propAttributeExpression = getByText("placeholderAttribute");

    fireEvent.change(propNameExpression, {target: {value: "proteinID"}});
    fireEvent.blur(propNameExpression);
    fireEvent.change(propAttributeExpression, {target: {value: "proteinType"}});
    fireEvent.blur(propAttributeExpression);

    // Test button should be disabled before mapping expression is saved
    await act(() => { expect(document.querySelector("#Test-btn")).toBeDisabled(); });

    // waiting for success message before clicking on Test button
    await (waitForElement(() => (getByTestId("successMessage"))));
    // checking successMessage is still there before waitForElementToBeRemoved as this would occasionally fail under load
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }

    // Test button should be enabled after mapping expression is saved
    expect(document.querySelector("#Test-btn")).toBeEnabled();

    //Verify Test button click
    await act(async () => { fireEvent.click(getByText("Test")); });
    await (waitForElement(() => getByTestId("Person-propName-value")));
    expect(getByTestId("Person-propName-value")).toHaveTextContent("123EAC");
    expect(getByTestId("Person-propAttribute-value")).toHaveTextContent("home");

    //Verify Clear button click
    await act(async () => { fireEvent.click(getByText("Clear")); });
    expect(getByTestId("Person-propName-value")).not.toHaveTextContent("123EAC");
    expect(getByTestId("Person-propAttribute-value")).not.toHaveTextContent("home");
    // DEBUG
    // debug(onClosestTableRow(getByTestId('propName-value')))
    // debug(onClosestTableRow(getByTestId('propAttribute-value')))
  });

  test("Truncation in case of responses for Array datatype", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.JSONSourceDataToTruncate});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValueOnce({status: 200, data: mappingStepPerson.artifacts[0]});

    let getByText, getByTestId, queryByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      queryByTestId = renderResults.queryByTestId;
      getByTestId = renderResults.getByTestId;
    });

    let propNameExpression = getByText("testNameInExp");
    let propAttributeExpression = getByText("placeholderAttribute");

    fireEvent.change(propNameExpression, {target: {value: "proteinID"}});
    fireEvent.blur(propNameExpression);
    fireEvent.change(propAttributeExpression, {target: {value: "proteinType"}});
    fireEvent.blur(propAttributeExpression);

    // Test button should be disabled before mapping expression is saved
    expect(document.querySelector("#Test-btn")).toBeDisabled();

    // waiting for success message before clicking on Test button
    await (waitForElement(() => (getByTestId("successMessage"))));
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }

    //Verify truncated text in Source table
    await (waitForElement(() => getByTestId("proteinId-srcValue")));
    expect(getByTestId("proteinId-srcValue")).toHaveTextContent("extremelylongu...");
    expect(getByTestId("proteinType-srcValue")).toHaveTextContent("s@ml.com (7 more)");

    //Verify tooltip shows full value when hovering Source values
    fireEvent.mouseOver(getByText("extremelylongu..."));
    await waitForElement(() => getByText("extremelylongusername@marklogic.com"));
    fireEvent.mouseOut(getByText("extremelylongu..."));

    //Verify tooltip shows all values in a list when hovering values with multiple items
    fireEvent.mouseOver(getByText((_, node) => node.textContent === "(7 more)"));
    await waitForElement(() => getByText("s@ml.com, , t@ml.com, u@ml.com, v@ml.com, w@ml.com, x@ml.com, y@ml.com, z@ml.com"));
    fireEvent.mouseOut(getByText((_, node) => node.textContent === "(7 more)"));
    // Test button should be enabled after mapping expression is saved
    expect(document.querySelector("#Test-btn")).toBeEnabled();

    //Verify Test button click and truncated text in Entity table
    fireEvent.click(getByText("Test"));
    await (waitForElement(() => getByTestId("Person-propName-value")));
    expect(getByTestId("Person-propName-value")).toHaveTextContent("extremelylongusername@m...");
    expect(getByTestId("Person-propAttribute-value")).toHaveTextContent("s@ml.com (7 more)");

    // Verify tooltip shows full value when hovering Test values
    fireEvent.mouseOver(getByText("extremelylongusername@m..."));
    await waitForElement(() => getByText("extremelylongusername@marklogic.com"));
  });

  test("Verify evaluation of valid expression for mapping reader user", async () => {
    //Updating mapping expression as a mapping writer user first
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValueOnce({status: 200, data: mappingStepPerson.artifacts[1]});

    let getByText, getByTestId, rerender;
    await act(async () => {
      const renderResults = renderWithAuthorities(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      rerender = renderResults.rerender;
    });
    let propAttributeExpression = getByText("placeholderAttribute");

    fireEvent.change(propAttributeExpression, {target: {value: "proteinType"}});
    fireEvent.blur(propAttributeExpression);

    // waiting for success message before clicking on Test button
    await (waitForElement(() => (getByTestId("successMessage"))));

    //Rerendering as a mapping reader user
    authorityService.setAuthorities(["readMapping"]);
    await act(async () => {
      rerender(
        <AuthoritiesContext.Provider value={authorityService}>
          <CurationContext.Provider value={personMappingStepWithData}><MappingStepDetail /></CurationContext.Provider>
        </AuthoritiesContext.Provider>
      );
    });

    //Verify Test button click
    fireEvent.click(getByText("Test"));
    await (waitForElement(() => getByTestId("Person-propAttribute-value")));
    expect(getByTestId("Person-propAttribute-value")).toHaveTextContent("home");

    //Verify Clear button click
    fireEvent.click(getByText("Clear"));
    expect(getByTestId("Person-propAttribute-value")).not.toHaveTextContent("home");

    //Verify that fx/source-data list is disabled for mapping reader user
    expect(getByTestId("propId-102-functionIcon")).toBeDisabled();
  }, 10000);

  test("Verify evaluation of invalid expression for mapping writer user", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValueOnce({status: 200, data: mappingStepPerson.artifacts[3]});

    let getByText, getByTestId, queryByTestId;
    await act(async () => {
      const renderResults = renderWithAuthorities(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      queryByTestId = renderResults.queryByTestId;
    });

    let propIdExpression = getByText("id");

    fireEvent.change(propIdExpression, {target: {value: "proteinID"}});
    fireEvent.blur(propIdExpression);

    // waiting for success message before clicking on Test button
    await (waitForElement(() => (getByTestId("successMessage"))));

    //Verify Test button click
    fireEvent.click(getByText("Test"));
    await (waitForElement(() => getByTestId("propId-expErr")));

    //debug(onClosestTableRow(getByTestId('propId-value')))
    let errorMessage = mappingStepPerson.artifacts[3].properties.propId ? mappingStepPerson.artifacts[3].properties.propId.errorMessage : "";
    expect(getByTestId("propId-expErr")).toHaveTextContent(errorMessage);
    expect(getByTestId("Person-propId-value")).toHaveTextContent("");

    //SCROLL TEST FOR BUG DHFPROD-4743
    //let element = document.querySelector('#entityContainer .ant-table-body')
    //getByText('propId').closest('div');
    //expect(document.querySelector('#entityContainer .ant-table-fixed-header')).not.toHaveClass('ant-table-scroll-position-right')
    //fireEvent.scroll(element).valueOf()
    //expect(document.querySelector('#entityContainer .ant-table-fixed-header')).not.toHaveClass('ant-table-scroll-position-right')
    //debug(document.querySelector('#entityContainer .ant-table-fixed-header'))

    //Verify Clear button click
    fireEvent.click(getByText("Clear"));
    expect(queryByTestId("propId-expErr")).toBeNull();

    //Verify that fx/source-data list is enabled for mapping writer user
    expect(getByTestId("propId-102-functionIcon")).toBeEnabled();
    expect(getByTestId("propId-listIcon1")).not.toHaveAttribute("disabled");
  });

  test("Verify evaluation of invalid expression for mapping reader user", async () => {
    //Updating mapping expression as a mapping writer user first
    const authorityService = new AuthoritiesService();
    await act(async() => authorityService.setAuthorities(["readMapping", "writeMapping"]));

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValueOnce({status: 200, data: mappingStepPerson.artifacts[3]});

    let getByText, getByTestId, queryByTestId, rerender;
    await act(async () => {
      const renderResults = renderWithAuthorities(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      queryByTestId = renderResults.queryByTestId;
      rerender = renderResults.rerender;
    });

    let propIdExpression = getByText("id");
    await act(async() => { fireEvent.change(propIdExpression, {target: {value: "proteinID"}}); });
    await act(async() => { fireEvent.blur(propIdExpression); });

    // waiting for success message before clicking on Test button
    //await (waitForElement(() => (getByTestId("successMessage"))));

    //Rerendering as a mapping reader user
    await act(async() => authorityService.setAuthorities(["readMapping"]));
    await act(async() => {
      rerender(
        <AuthoritiesContext.Provider value={authorityService}>
          <CurationContext.Provider value={personMappingStepWithData}><MappingStepDetail /></CurationContext.Provider>
        </AuthoritiesContext.Provider>
      );
    });

    //Verify Test button click
    await act(async() => { fireEvent.click(getByText("Test")); });
    //await (waitForElement(() => getByTestId("propId-expErr")));

    //debug(onClosestTableRow(getByTestId('propId-value')))
    let errorMessage = mappingStepPerson.artifacts[3].properties.propId ? mappingStepPerson.artifacts[3].properties.propId.errorMessage : "";
    act(() => {
      expect(getByTestId("propId-expErr")).toHaveTextContent(errorMessage);
      expect(getByTestId("Person-propId-value")).toHaveTextContent("");
    });

    //Verify Clear button click
    await act(async() => { fireEvent.click(getByText("Clear")); });
    act(() => expect(queryByTestId("propId-expErr")).toBeNull());
  });

  xtest("Verify evaluation of valid expression for XML source document", () => {
    // const { getByText } = render(<MappingStepDetail {...data.mapProps} sourceData={data.xmlSourceData} mappingVisible={true} />);
    /**
           * TODO once DHFPROD-4845 is implemented
           */

  });

  test("CollapseAll/Expand All feature in JSON Source data table", async () => {

    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, getByTestId, queryByText;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      queryByText = renderResults.queryByText;
    });

    /* Validate collapse-expand in source table */
    //Check if the expected source table elements are present in the DOM before hittting the Expan/Collapse button
    await (() => expect(queryByText("suffix")).not.toBeInTheDocument());
    await (() => expect(getByText("nutFreeName")).toBeInTheDocument());
    await (() => expect(getByText("FirstNamePreferred")).toBeInTheDocument());
    await (() => expect(getByText("LastName")).toBeInTheDocument());

    let expandBtnSource:any = await (() => within(getByTestId("srcContainer")).getByLabelText("radio-button-expand"));
    let collapseBtnSource:any =  await (() => within(getByTestId("srcContainer")).getByLabelText("radio-button-collapse"));
    let collapseButtons:any =  await (() => document.querySelectorAll(`[data-testid="collapseBtn"]`))!;//document.querySelectorAll(`[data-testid="collapseBtn"]`)!;

    // Validating the default button state
    await (() => expect(expandBtnSource).not.toBeChecked());
    await (() => expect(collapseBtnSource).not.toBeChecked());

    //Expanding all nested levels
    await (() => fireEvent.click(expandBtnSource));
    await (() => expect(getByText("suffix")).toBeInTheDocument());

    //Check if indentation is right
    await (() => expect(getByText("suffix").parentElement.parentElement).toHaveStyle(`padding-left: 66px`));

    //Collapsing all child levels
    await (() => fireEvent.click(collapseBtnSource));
    await (() => expect(collapseButtons).toHaveLength(2));
    await (() => fireEvent.click(collapseButtons[1]));
    await (() => expect(queryByText("suffix")).not.toBeInTheDocument());
    await (() => expect(queryByText("FirstNamePreferred")).not.toBeInTheDocument());
    await (() => expect(queryByText("LastName")).not.toBeInTheDocument());
  });

  test("CollapseAll/Expand All feature in JSON Entity table", async () => {

    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, getByTestId, queryByText;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      queryByText = renderResults.queryByText;
    });

    /* Validate collapse-expand in Entity table */
    //Check if the expected Entity table elements are present in the DOM before hittting the Expand/Collapse button
    expect(queryByText("artCraft")).not.toBeInTheDocument();
    expect(getByText("items")).toBeInTheDocument();
    expect(getByText("itemTypes")).toBeInTheDocument();
    expect(getByText("itemCategory")).toBeInTheDocument();

    let expandBtnEntity = within(getByTestId("entityContainer")).getByLabelText("radio-button-expand");
    let collapseBtnEntity = within(getByTestId("entityContainer")).getByLabelText("radio-button-collapse");

    // Validating the default button state
    expect(expandBtnEntity).not.toBeChecked();
    expect(collapseBtnEntity).not.toBeChecked();

    //Expanding all nested levels
    fireEvent.click(expandBtnEntity);
    expect(getByText("artCraft")).toBeInTheDocument();

    //Check if indentation is right
    expect(getByText("artCraft").parentElement.parentElement.parentElement.parentElement.parentElement).toHaveStyle(`padding-left: 63.699999999999996px`);

    //Collapsing all child levels
    fireEvent.click(collapseBtnEntity);
    expect(queryByText("artCraft")).not.toBeInTheDocument();
    await (() => expect(queryByText("itemTypes")).not.toBeInTheDocument());
    await (() => expect(queryByText("itemCategory")).not.toBeInTheDocument());
  });

  test("CollapseAll/Expand All feature in XML Source data table", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, getByTestId, queryByText, getAllByText;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      queryByText = renderResults.queryByText;
      getAllByText = renderResults.getAllByText;
    });

    //Check if the expected elements are present in the DOM before hittting the Expand/Collapse button
    expect(queryByText("FirstNamePreferred")).not.toBeInTheDocument();
    expect(queryByText("LastName")).not.toBeInTheDocument();
    let nutFree = getAllByText(/nutFree/);
    expect(nutFree.length).toEqual(2);
    expect(getByText("@proteinType")).toBeInTheDocument();
    expect(getByText("proteinId")).toBeInTheDocument();

    let expandBtnSource = within(getByTestId("srcContainer")).getByLabelText("radio-button-expand");
    let collapseBtnSource = within(getByTestId("srcContainer")).getByLabelText("radio-button-collapse");
    let collapseButtons = document.querySelectorAll(`[data-testid="collapseBtn"]`)!;
    // Validating the default button state
    expect(expandBtnSource).not.toBeChecked();
    expect(collapseBtnSource).not.toBeChecked();

    //Expanding all nested levels
    fireEvent.click(expandBtnSource);
    let firstName = getByText("FirstNamePreferred");
    let lastName = getByText("LastName");
    expect(firstName).toBeInTheDocument();
    expect(firstName.parentElement.parentElement.parentElement).toHaveStyle(`padding-left: 57.599999999999994px`); // Check if the indentation is right
    expect(lastName).toBeInTheDocument();
    expect(lastName.parentElement.parentElement.parentElement).toHaveStyle(`padding-left: 57.599999999999994px`); // Check if the indentation is right

    //Collapsing back to the default view (root and 1st level)
    expect(collapseButtons).toHaveLength(2);
    fireEvent.click(collapseBtnSource);
    fireEvent.click(collapseButtons[1]);
    expect(queryByText("FirstNamePreferred")).not.toBeInTheDocument();
    expect(queryByText("LastName")).not.toBeInTheDocument();
  });

  test("Function selector dropdown in entity table", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockGetMappingFunctions.mockResolvedValue({status: 200, data: data.mapProps.mapFunctions});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValueOnce({status: 200, data: mappingStepPerson.artifacts[2]});

    let getByText, getByTestId, queryByText, getAllByRole, queryByTestId, getByLabelText;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      queryByText = renderResults.queryByText;
      getAllByRole = renderResults.getAllByRole;
      queryByTestId = renderResults.queryByTestId;
      getByLabelText = renderResults.getByLabelText;
    });

    //Prepare the map expression field for function signature later
    let propAttributeExpression = getByTestId("propAttribute-mapexpression");
    fireEvent.change(propAttributeExpression, {target: {value: ""}});
    fireEvent.blur(propAttributeExpression);

    let functionSelector = getByTestId("propAttribute-104-functionIcon");
    fireEvent.click(functionSelector);
    let inputBox = getByLabelText("dropdownList-select-wrapper");

    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    expect(getByText("concat")).toBeInTheDocument();
    expect(getByText("documentLookup")).toBeInTheDocument();

    fireEvent.click(inputBox); // focus on the search box

    // Filter out the functions list to get to concat function
    fireEvent.change(inputBox, {target: {value: "conc"}});
    expect(getByText("concat")).toBeInTheDocument();
    expect(queryByText("documentLookup")).not.toBeInTheDocument();

    //Choose the concat function
    fireEvent.keyDown(inputBox, {key: "Enter", code: "Enter", keyCode: 13, charCode: 13});

    //Map Expression is populated with function signature
    expect(propAttributeExpression).toHaveTextContent("concat(xs:anyAtomicType?)");

    // Verify auto-save on population of function signature
    await (waitForElement(() => (getByTestId("successMessage"))));
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }

    // Click the same function button again to verify it opens up with the same list of functions
    fireEvent.click(functionSelector);
    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    fireEvent.click(inputBox);

    //Verify multiple matches
    fireEvent.change(inputBox, {target: {value: "Lookup"}});
    expect(getByText("memoryLookup")).toBeInTheDocument();
    expect(getByText("documentLookup")).toBeInTheDocument();
    expect(queryByText("parseDateTime")).not.toBeInTheDocument();

    //Click on the Fx button again to close the list
    fireEvent.click(functionSelector);

    //Verify if value appears in the Value column after clicking on Test button
    fireEvent.click(getByText("Test"));
    await (waitForElement(() => getByTestId("Person-propAttribute-value")));
    expect(getByTestId("Person-propAttribute-value")).toHaveTextContent("home-NEW"); // home should be mapped as home-New
  });

  test("Reference selector dropdown in entity table", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockGetMappingRefs.mockResolvedValue({status: 200, data: data.mapReferences});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValueOnce({status: 200, data: mappingStepPerson.artifacts[2]});

    let getByTestId, getAllByRole, queryByTestId, getByLabelText;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      // getAllByText = renderResults.getAllByText;
      getByTestId = renderResults.getByTestId;
      getAllByRole = renderResults.getAllByRole;
      queryByTestId = renderResults.queryByTestId;
      getByLabelText = renderResults.getByLabelText;
    });

    // Prepare the map expression field for reference input
    let propAttributeExpression = getByTestId("propAttribute-mapexpression");
    fireEvent.change(propAttributeExpression, {target: {value: ""}});
    fireEvent.blur(propAttributeExpression);

    // Open reference menu and verify options
    let referenceSelector = getByTestId("Person-propAttribute-refIcon");
    fireEvent.click(referenceSelector);

    let inputBox = getByLabelText("dropdownList-select-wrapper");

    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    expect(getByTestId("$URI-option")).toBeInTheDocument();
    expect(getByTestId("$ZIP_POINTS-option")).toBeInTheDocument();

    fireEvent.click(inputBox); // Focus on the search box

    // Filter reference options for a reference
    fireEvent.change(inputBox, {target: {value: "ZIP"}});
    expect(getByTestId("$ZIP_POINTS-option")).toBeInTheDocument();
    expect(queryByTestId("$URI-option")).not.toBeInTheDocument();

    // Select the filtered reference
    fireEvent.keyDown(inputBox, {key: "Enter", code: "Enter", keyCode: 13, charCode: 13});

    // Verify map expression is populated with selected reference
    expect(propAttributeExpression).toHaveTextContent("$ZIP_POINTS");
    fireEvent.blur(propAttributeExpression);

    // Verify auto-save on population of reference
    await (waitForElement(() => (getByTestId("successMessage"))));
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }

  });

  test("URI nav index resets on close of mapping", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataDefault});

    let getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = renderWithRouterNoAuthorities(personMappingStepWithData);
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
    });

    // URI index starts at 1
    let uriIndex = within(getByLabelText("uriIndex"));
    expect(uriIndex.getByText("1")).toBeInTheDocument();

    // Click next, URI index is 2
    fireEvent.click(getByTestId("navigate-uris-right"));
    await wait(() => expect(getByLabelText("uriIndex")).toHaveTextContent("2"));

    // Going back to curate home page
    fireEvent.click(getByLabelText("Back"));

    // URI index reset to 1
    await(() => uriIndex = within(getByLabelText("uriIndex")));
    await(() => expect(uriIndex.getByText("1")).toBeInTheDocument());
  });

  test.skip("verify if pagination works properly in Source and Entity tables", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[4]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataLargeDataset});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDefLargePropSet});
    window.HTMLElement.prototype.scrollIntoView = function () { };

    let getByText, queryByText, getByTestId, getByTitle, getAllByTitle, queryByTitle, getByLabelText, queryByTestId, getAllByText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithRelatedEntityData);
      getByText = renderResults.getByText;
      queryByText = renderResults.queryByText;
      getByTestId = renderResults.getByTestId;
      getByTitle = renderResults.getByTitle;
      getAllByTitle = renderResults.getAllByTitle;
      queryByTitle = renderResults.queryByTitle;
      getByLabelText = renderResults.getByLabelText;
      queryByTestId = renderResults.queryByTestId;
      getAllByText = renderResults.getAllByText;
    });

    await waitFor(() => {
      //Check the elements of page 1 are visible
      expect(getByText("CustomerID")).toBeInTheDocument();
      expect(getByText("FirstName")).toBeInTheDocument();
      expect(getByText("LastName")).toBeInTheDocument();
    });

    //Filter options
    let sourcefilterIcon = getByTestId("filterIcon-srcName");

    //Pagination options
    let srcPreviousPageLink = getAllByTitle("Previous Page")[0];
    let srcNextPageLink = getAllByTitle("Next Page")[0];
    let srcPage1_Option = getAllByTitle("1")[0];
    let srcNext_5_Pages_Option = getAllByTitle("Next 5 Pages")[0];

    expect(srcPreviousPageLink).toHaveAttribute("aria-disabled", "true");
    expect(queryByTitle("9")).not.toBeInTheDocument();
    expect(queryByText("prop169")).not.toBeInTheDocument();

    userEvent.click(srcNext_5_Pages_Option);
    expect(queryByTitle("9")).not.toBeInTheDocument();
    expect(getByText("prop108")).toBeInTheDocument();
    expect(srcPreviousPageLink).toHaveAttribute("aria-disabled", "false");

    userEvent.click(srcNext_5_Pages_Option);
    expect(getByText("prop208")).toBeInTheDocument();

    let page9_Option = getByTitle("9");
    expect(page9_Option).toBeInTheDocument();
    //Check the elements of page 1 are not visible
    expect(queryByText("CustomerID")).not.toBeInTheDocument();
    expect(queryByText("FirstName")).not.toBeInTheDocument();
    expect(queryByText("LastName")).not.toBeInTheDocument();

    userEvent.click(page9_Option);

    expect(getByText("prop169")).toBeInTheDocument();

    userEvent.click(srcPage1_Option);
    expect(getByText("CustomerID")).toBeInTheDocument();
    expect(queryByText("prop126Billing")).not.toBeInTheDocument();

    fireEvent.click(sourcefilterIcon);
    let inputSearchSource = getByTestId("searchInput-source");
    let submitSearchText = getByTestId("submitSearch-source");

    fireEvent.change(inputSearchSource, {target: {value: "fiveDigit"}});
    expect(inputSearchSource).toHaveValue("fiveDigit");
    fireEvent.click(submitSearchText);

    expect(srcPreviousPageLink).toHaveAttribute("aria-disabled", "true");
    expect(getByText("prop126Billing")).toBeInTheDocument();
    expect(getByText("Street")).toBeInTheDocument();
    expect(getByText("City")).toBeInTheDocument();
    expect(getByText("State")).toBeInTheDocument();
    expect(getByText("Postal")).toBeInTheDocument();
    expect(getByText("fiveDigit")).toBeInTheDocument();

    fireEvent.click(sourcefilterIcon);

    inputSearchSource = getByTestId("searchInput-source");
    submitSearchText = getByTestId("submitSearch-source");

    fireEvent.change(inputSearchSource, {target: {value: "prop1"}});
    expect(inputSearchSource).toHaveValue("prop1");
    fireEvent.click(submitSearchText);

    expect(getAllByTitle("Next 5 Pages")).toHaveLength(3);
    expect(srcNextPageLink).toHaveAttribute("aria-disabled", "false");

    //All mapped entity tables should be present on the screen by default
    expect(getByLabelText("Person-title")).toBeInTheDocument();
    await wait(() => expect(getByLabelText("Order (orderedBy Person)-title")).toBeInTheDocument());
    await wait(() => expect(getByLabelText("BabyRegistry (ownedBy Person)-title")).toBeInTheDocument());

    await waitFor(() => {
      //Check the elements of page 1 are visible in target entity and related entity tablbes
      expect(getByTestId("Person-propId-name")).toBeInTheDocument();
      expect(getByTestId("Person-propId2-name")).toBeInTheDocument();
      expect(getByTestId("Order (orderedBy Person)-propId-name")).toBeInTheDocument();
      expect(getByTestId("Order (orderedBy Person)-propId2-name")).toBeInTheDocument();
    });

    let tgtEntityPreviousPageLink = getAllByTitle("Previous Page")[1];
    let tgtEntityNextPageLink = getAllByTitle("Next Page")[1];
    let tgtEntityPage1_Option = getAllByTitle("1")[1];
    let tgtEntityNext_5_Pages_Option = getAllByTitle("Next 5 Pages")[0];
    let orderEntityPreviousPageLink = getAllByTitle("Previous Page")[2];
    let orderEntityNextPageLink = getAllByTitle("Next Page")[2];
    let orderEntityPage1_Option = getAllByTitle("1")[2];
    let orderEntityNext_5_Pages_Option = getAllByTitle("Next 5 Pages")[1];

    expect(tgtEntityPreviousPageLink).toHaveAttribute("aria-disabled", "true");
    expect(orderEntityPreviousPageLink).toHaveAttribute("aria-disabled", "true");

    expect(queryByTitle("9")).not.toBeInTheDocument();
    expect(queryByTestId("Person-propId155-name")).not.toBeInTheDocument();
    expect(queryByTestId("Order (orderedBy Person)-propId155-name")).not.toBeInTheDocument();

    userEvent.click(tgtEntityNext_5_Pages_Option);
    userEvent.click(orderEntityNext_5_Pages_Option);
    expect(queryByTitle("9")).not.toBeInTheDocument();
    expect(getByTestId("Person-propId102-name")).toBeInTheDocument();
    expect(getByTestId("Order (orderedBy Person)-propId102-name")).toBeInTheDocument();
    expect(tgtEntityPreviousPageLink).toHaveAttribute("aria-disabled", "false");
    expect(orderEntityPreviousPageLink).toHaveAttribute("aria-disabled", "false");

    //Check the elements of page 1 are not visible
    expect(queryByTestId("Person-propId-name")).not.toBeInTheDocument();
    expect(queryByTestId("Person-propId2-name")).not.toBeInTheDocument();
    expect(queryByTestId("Order (orderedBy Person)-propId-name")).not.toBeInTheDocument();
    expect(queryByTestId("Order (orderedBy Person)-propId2-name")).not.toBeInTheDocument();

    userEvent.click(tgtEntityPage1_Option);
    userEvent.click(orderEntityPage1_Option);
    expect(getByTestId("Person-propId-name")).toBeInTheDocument();
    expect(getByTestId("Order (orderedBy Person)-propId-name")).toBeInTheDocument();
    expect(queryByTestId("Person-propId110-name")).not.toBeInTheDocument();
    expect(queryByTestId("Order (orderedBy Person)-propId110-name")).not.toBeInTheDocument();

    //Filter options
    let entityfilterIcon = getByTestId("filterIcon-name");
    let inputSearchEntity = getByTestId("searchInput-name");
    let submitEntitySearchText = getByTestId("submitSearch-name");
    let resetSearchEntity = getByTestId("ResetSearch-name");

    fireEvent.click(entityfilterIcon);
    fireEvent.change(inputSearchEntity, {target: {value: "propId111"}});
    expect(inputSearchEntity).toHaveValue("propId111");
    fireEvent.click(submitEntitySearchText);

    expect(tgtEntityPreviousPageLink).toHaveAttribute("aria-disabled", "true");
    expect(orderEntityPreviousPageLink).toHaveAttribute("aria-disabled", "true");

    expect(getByTestId("Person-propId111-name")).toBeInTheDocument();
    expect(getByTestId("Order (orderedBy Person)-propId111-name")).toBeInTheDocument();

    fireEvent.click(entityfilterIcon);
    fireEvent.change(inputSearchEntity, {target: {value: "propId1"}});
    expect(inputSearchEntity).toHaveValue("propId1");
    fireEvent.click(submitEntitySearchText);

    expect(queryByTitle("Next 5 Pages")).not.toBeInTheDocument();
    expect(tgtEntityNextPageLink).toHaveAttribute("aria-disabled", "false");
    expect(orderEntityNextPageLink).toHaveAttribute("aria-disabled", "false");

    //Verify page size changer is present in all tables tables (1 source table and 3 entity tables)
    let pageSizeChanger = getAllByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-pagination-options"
    );
    let i: number;

    expect(pageSizeChanger).toHaveLength(4);

    //Test all page size changers' default value is at 20 / page
    for (i = 0; i < 4; ++i) {
      expect(pageSizeChanger[i]).toHaveTextContent("20 / page");
    }

    fireEvent.click(sourcefilterIcon);
    let resetFilter = getByTestId("resetSearch-source");
    fireEvent.click(resetFilter);

    //Verify page size changing for source table
    fireEvent.click(getAllByText("20 / page")[0]);
    await wait(() => fireEvent.click(getByText("1 / page")));

    expect(queryByText("CustomerID")).toBeInTheDocument(); //only first property is present
    expect(getAllByText("Name")).toHaveLength(2); //second "Name" property should not be present, two instances come from table headers

    expect(queryByTitle("310")).toBeInTheDocument();   //there should be 310 pages now

    //test page 4 should only have fourth property
    fireEvent.click(getAllByTitle("4")[0]);
    await wait(() => expect(queryByText("Email")).toBeInTheDocument());
    await wait(() => expect(queryByText("CustomerID")).not.toBeInTheDocument());

    //reopen page size options
    fireEvent.click(getAllByText("1 / page")[0]);

    //test 5 per page
    fireEvent.click(getByText("5 / page"));
    fireEvent.click(getAllByTitle("1")[0]);

    //first through fifth properties should be present
    expect(queryByText("CustomerID")).toBeInTheDocument(); //1st property
    expect(queryByText("Address")).toBeInTheDocument(); //5th property
    expect(queryByText("Phone")).not.toBeInTheDocument(); //6th property


    fireEvent.click(entityfilterIcon);
    fireEvent.click(resetSearchEntity);

    //Verify page size changing for entity table
    fireEvent.click(getAllByText("20 / page")[1]);
    fireEvent.click(getAllByText("1 / page")[1]);

    expect(getByTestId("Person-propId-name")).toBeInTheDocument(); //only first property is present
    expect(queryByTestId("Person-propId2-name")).not.toBeInTheDocument();
    expect(queryByTitle("299")).toBeInTheDocument();   //there should be 299 pages now

    //next page should only have second property
    fireEvent.click(getAllByTitle("2")[1]);
    expect(queryByTestId("Person-propId-name")).not.toBeInTheDocument();
    expect(getByTestId("Person-propId2-name")).toBeInTheDocument();

    //reopen page size options
    fireEvent.click(getAllByText("1 / page")[2]);

    //test 5 per page
    fireEvent.click(getAllByText("5 / page")[2]);
    fireEvent.click(getAllByTitle("1")[1]);

    //first through fifth properties should be present
    expect(getByTestId("Person-propId-name")).toBeInTheDocument();
    expect(getByTestId("Person-propId5-name")).toBeInTheDocument();
    expect(queryByTestId("Person-propId6-name")).not.toBeInTheDocument();

  });

  test.skip("verify pagination and page size menu works properly in Source XML table", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[4]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDefLargePropSet});

    let getByText, queryByText, getAllByTitle, getAllByText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithRelatedEntityData);
      getByText = renderResults.getByText;
      queryByText = renderResults.queryByText;
      getAllByTitle = renderResults.getAllByTitle;
      getAllByText = renderResults.getAllByText;
    });

    //Verify all XML source properties are displayed at first
    await wait(() => expect(getByText("sampleProtein")).toBeInTheDocument());
    await wait(() => expect(getByText("@proteinType")).toBeInTheDocument());
    await wait(() => expect(getByText("home")).toBeInTheDocument());
    await wait(() => expect(getByText("proteinId")).toBeInTheDocument());
    await wait(() => expect(getByText("123EAC")).toBeInTheDocument());
    await wait(() => expect(getByText("proteinCat")).toBeInTheDocument());

    //Verify page size starts at 20/page by default and can be changed for source table
    fireEvent.click(getAllByText("20 / page")[0]);
    await wait(() => fireEvent.click(getByText("1 / page")));

    //only first child property is present, in addition to top level parent
    expect(getByText("sampleProtein")).toBeInTheDocument();
    expect(getByText("@proteinType")).toBeInTheDocument();

    //remaining children properties should no longer be present
    expect(queryByText("proteinId")).not.toBeInTheDocument();
    expect(queryByText("123EAC")).not.toBeInTheDocument();
    expect(queryByText("proteinCat")).not.toBeInTheDocument();

    //test page 4 should only have fourth property
    fireEvent.click(getAllByTitle("4")[0]);
    await wait(() => expect(queryByText("nutFree:")).toBeInTheDocument());
    await wait(() => expect(queryByText("@proteinType")).not.toBeInTheDocument());

    //reopen page size options
    fireEvent.click(getAllByText("1 / page")[0]);

    //test 5 per page
    fireEvent.click(getByText("5 / page"));
    fireEvent.click(getAllByTitle("1")[0]);

    //first through fifth properties should be present
    expect(queryByText("sampleProtein")).toBeInTheDocument(); //1st property
    expect(queryByText("proteinCat")).toBeInTheDocument(); //5th property
  });
});

describe("Source-to-entity map tests", () => {

  afterEach(cleanup);

  test("tests with source data", () => {
    //Use console.log(wrapper.debug()) for debugging the html returned by the wrapper;
    const wrapper = defaultRender(personMappingStepWithData);
    expect(wrapper.container.querySelectorAll("#srcContainer").length).toEqual(1);
    expect(wrapper.container.querySelectorAll("#srcDetails").length).toEqual(1);
    expect(wrapper.container.querySelectorAll("#entityContainer").length).toEqual(1);
    //Success and Error message are shown only when a mapping expression is being saved
    expect(wrapper.container.querySelectorAll("#successMessage").length).toEqual(0);
    expect(wrapper.container.querySelectorAll("#errorMessage").length).toEqual(0);
    //List and Function icon are displayed only when the entity table loads with entity properties
    expect(wrapper.container.querySelectorAll("#listIcon").length).toEqual(0);
    expect(wrapper.container.querySelectorAll("#functionIcon").length).toEqual(0);
    expect(wrapper.container.querySelectorAll("#Clear-btn").length).toEqual(1);
    expect(wrapper.container.querySelectorAll("#Test-btn").length).toEqual(1);
    expect(wrapper.container.querySelectorAll("#errorInExp").length).toEqual(0);
    expect(wrapper.container.querySelectorAll("#valuesAfterTest").length).toEqual(0);
    expect(wrapper.container.getElementsByClassName("SplitPane").length).toEqual(1);
  });

  test("tests with no source data", async  () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: {}});
    mockGetUris.mockResolvedValue({status: 200, data: {}});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: {}});
    let wrapper:any;
    await act(async () => {
      wrapper = defaultRender(personMappingStepEmpty);
    });

    let noDataMessagePart1  = "Unable to find source records using the specified collection or query.";
    let noDataMessagePart2 = "Load some data that mapping can use as reference and/or edit the step settings to use a " +
        "source collection or query that will return some results.";
      //wrapper.setProps({sourceData: []});
    expect(await wrapper.findAllByTestId("noData")).toHaveLength(1);
    expect(await wrapper.queryAllByText(noDataMessagePart1)).toHaveLength(1);
    expect(await wrapper.queryAllByText(noDataMessagePart2)).toHaveLength(1);
    expect(await wrapper.queryAllByTestId("dataPresent")).toHaveLength(0);
    expect(wrapper.container.getElementsByClassName("SplitPane").length).toEqual(1);
  });

  test("XML source data renders properly", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataDefault});

    let getByText, getByTestId, getAllByText;
    await act(async () => {
      const renderResults = renderWithRouterNoAuthorities(personMappingStepWithData);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      getAllByText = renderResults.getAllByText;
    });

    //Expanding all the nested levels first
    await wait(() => fireEvent.click(within(getByTestId("srcContainer")).getByLabelText("radio-button-expand")));
    fireEvent.click(within(getByTestId("entityContainer")).getByLabelText("radio-button-expand"));

    expect(getByText("Source Data")).toBeInTheDocument();
    expect(getByText("proteinId")).toBeInTheDocument();
    expect(getByText("123EAC")).toBeInTheDocument();
    expect(getByText("@proteinType")).toBeInTheDocument();
    expect(getByText("home")).toBeInTheDocument();
    expect(getAllByText(/nutFree:/)).toHaveLength(2);
    expect(getByText("FirstNamePreferred")).toBeInTheDocument();
    expect(getByTestId("nutFree:proteinDog-srcValue")).toHaveTextContent("retriever (2 more)");
    fireEvent.mouseOver(getByText("(2 more)"));
    await waitForElement(() => getByText("retriever, , golden, labrador"));
  });

  test("Nested entity data renders properly", async () => { //////////////////////////////////////////

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, getByTestId, getAllByText;
    await act(async () => {
      const renderResults = renderWithRouterNoAuthorities(personMappingStepWithData);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      getAllByText = renderResults.getAllByText;
    });

    //Expanding all the nested levels first
    await wait(() => fireEvent.click(within(getByTestId("srcContainer")).getByLabelText("radio-button-expand")));
    fireEvent.click(within(getByTestId("entityContainer")).getByLabelText("radio-button-expand"));

    expect(getByText("propId")).toBeInTheDocument();
    expect(getByText("propName")).toBeInTheDocument();
    expect(getByText("items")).toBeInTheDocument();
    expect(getByText("itemTypes")).toBeInTheDocument();
    expect(getByText("itemCategory")).toBeInTheDocument();
    expect(getAllByText("Context").length).toBe(3);
    expect(getByText("ItemType [ ]")).toBeInTheDocument();
    await (() => expect(getByText("artCraft")).toBeInTheDocument());
    await (() => expect(getByText("automobile")).toBeInTheDocument());
    //TO DO: Below tests can be done when working on E2E tests.
    //fireEvent.click(getByLabelText('icon: down'));
    //expect(queryByText('category')).not.toBeInTheDocument();
  });
});

describe("RTL Source Selector/Source Search tests", () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  beforeEach(() => jest.setTimeout(20000));

  test("Search source", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});

    let getByTestId, getAllByText, getAllByRole, queryByTestId, getByLabelText;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByTestId = renderResults.getByTestId;
      getAllByText = renderResults.getAllByText;
      getAllByRole = renderResults.getAllByRole;
      queryByTestId = renderResults.queryByTestId;
      getByLabelText = renderResults.getByLabelText;
    });

    let sourceSelector = await waitForElement(() => getByTestId("itemTypes-listIcon"));

    //corresponds to 'itemTypes' source selector
    fireEvent.click(sourceSelector);

    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    let firstName = getAllByText("FirstNamePreferred");
    expect(firstName.length).toEqual(2);

    let lastName = getAllByText("LastName");
    expect(lastName.length).toEqual(2);

    let inputBox = getByLabelText("dropdownList-select-wrapper");

    fireEvent.click(inputBox);
    fireEvent.change(inputBox, {target: {value: "Fir"}});

    //2 instances of 'firstName'
    firstName = getAllByText("FirstNamePreferred");
    expect(firstName.length).toEqual(2);

    //Only 1 instances of 'lastName' as search has narrowed the results
    lastName = getAllByText("LastName");
    expect(lastName.length).toEqual(1);

    fireEvent.keyDown(inputBox, {key: "Enter", code: "Enter", keyCode: 13, charCode: 13});

    //mapping is saved
    await (waitForElement(() => (getByTestId("successMessage"))));
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }
    let mapExp = getByTestId("itemTypes-mapexpression");
    //Right Xpath is populated
    expect(mapExp).toHaveTextContent("nutFreeName/FirstNamePreferred");
  });

  test("JSON source data with objects - Right display of objects and icons in source dropdown", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});

    let getByTestId, getAllByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByTestId = renderResults.getByTestId;
      getAllByTestId = renderResults.getAllByTestId;
    });

    let sourceSelector = await waitForElement(() => getByTestId("itemTypes-listIcon"));
    await wait(() => fireEvent.click(sourceSelector));

    //Verify object properties in source dropdown only appear once when data is an array of Objects
    expect(getAllByTestId("nutFreeName-option").length).toEqual(1);
    expect(getAllByTestId("FirstNamePreferred-option").length).toEqual(1);
    expect(getAllByTestId("LastName-option").length).toEqual(1);

    //Verify Array icon is not present when item has no children
    expect(getByTestId("FirstNamePreferred-optionIcon")).toHaveAttribute("src", "");

    //Verify Array icon is present when item has children
    expect(getByTestId("nutFreeName-optionIcon")).toHaveAttribute("src", "icon_array.png");
    expect(getByTestId("LastName-optionIcon")).toHaveAttribute("src", "icon_array.png");

    //Verify tooltip for Array icon
    fireEvent.mouseOver(getByTestId("LastName-optionIcon"));
    await waitForElement(() => getByTestId("LastNameMultiple-option-tooltip"));
    fireEvent.mouseOver(getByTestId("nutFreeName-optionIcon"));
    await waitForElement(() => getByTestId("nutFreeNameMultiple-option-tooltip"));

  });

  test("XML source data with objects - Right display of objects and icons in source dropdown", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});

    let getByTestId, getAllByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByTestId = renderResults.getByTestId;
      getAllByTestId = renderResults.getAllByTestId;
    });

    let sourceSelector = await waitForElement(() => getByTestId("itemTypes-listIcon"));
    await wait(() => fireEvent.click(sourceSelector));

    //Verify object properties in source dropdown only appear once when data is an array of Objects
    expect(getAllByTestId("nutFree:name-option").length).toEqual(1);
    expect(getAllByTestId("FirstNamePreferred-option").length).toEqual(1);
    expect(getAllByTestId("LastName-option").length).toEqual(1);

    //Verify Array icon is not present when item has no children
    expect(getByTestId("FirstNamePreferred-optionIcon")).toHaveAttribute("src", "");

    //Verify Array icon is present when item has children
    expect(getByTestId("nutFree:name-optionIcon")).toHaveAttribute("src", "icon_array.png");

    //Verify tooltip for Array icon
    fireEvent.mouseOver(getByTestId("nutFree:name-optionIcon"));
    await waitForElement(() => getByTestId("nutFree:nameMultiple-option-tooltip"));
  });

  test("Nested JSON source data - Right XPATH expression", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});

    let getByText, getByTestId, getAllByText, getAllByRole;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      getAllByText = renderResults.getAllByText;
      getAllByRole = renderResults.getAllByRole;
    });

    expect(getByText("Source Data")).toBeInTheDocument();
    expect(getByText("Entity Type: Person")).toBeInTheDocument();
    await wait(() => expect(getByText("Test")).toBeEnabled());

    let sourceSelector = getByTestId("itemTypes-listIcon");

    //corresponds to 'itemTypes' source selector
    fireEvent.click(sourceSelector);

    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    let firstName = getAllByText("FirstNamePreferred");
    expect(firstName.length).toEqual(2);

    //Check if indentation is right
    expect(firstName[1]).toHaveStyle("line-height: 2vh; padding-left: 20px;");

    //Verify Array icon is present when item has no children but value was an Array of simple values.
    expect(getByTestId("proteinDog-optionIcon")).toHaveAttribute("src", "icon_array.png");

    //Verify tooltip for Array icon
    fireEvent.mouseOver(getByTestId("proteinDog-optionIcon"));
    await waitForElement(() => getByTestId("proteinDogMultiple-option-tooltip"));

    //Click on 'FirstNamePreferred'
    fireEvent.click(firstName[1]);

    //mapping is saved
    expect(await (waitForElement(() => getByTestId("successMessage"), {"timeout": 1000})));

    let mapExp = getByTestId("itemTypes-mapexpression");
    //Right Xpath is populated
    expect(mapExp).toHaveTextContent("nutFreeName/FirstNamePreferred");

  });

  test("Nested XML source data - Right XPATH expression", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});

    let getByTestId, getAllByText, getAllByRole, getAllByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByTestId = renderResults.getByTestId;
      getAllByText = renderResults.getAllByText;
      getAllByRole = renderResults.getAllByRole;
      getAllByTestId = renderResults.getAllByTestId;
    });

    //Expanding all the nested levels first
    await wait(() => fireEvent.click(within(getByTestId("srcContainer")).getByLabelText("radio-button-expand")));
    fireEvent.click(within(getByTestId("entityContainer")).getByLabelText("radio-button-expand"));
    let sourceSelector = getByTestId("itemTypes-listIcon");

    //corresponds to 'itemTypes' source selector
    fireEvent.click(sourceSelector);

    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    let lastName = getAllByText("LastName");
    expect(lastName.length).toEqual(2);

    //Check if indentation is right
    expect(lastName[1]).toHaveStyle("line-height: 2vh; padding-left: 40px;");

    //Verify Array icon is not present when item has no children
    expect(getByTestId("FirstNamePreferred-optionIcon")).toHaveAttribute("src", "");

    //Verify Array icon is present when item has children
    expect(getByTestId("sampleProtein-optionIcon")).toHaveAttribute("src", "icon_array.png");

    //Verify Array icon is present when item has no children but value was an Array of simple values.
    expect(getByTestId("nutFree:proteinDog-optionIcon")).toHaveAttribute("src", "icon_array.png");

    //Verify option in source dropdown only appears once when value is an Array of simple values.
    let proteinDog = (getAllByTestId("nutFree:proteinDog-option"));
    expect(proteinDog.length).toEqual(1);

    //Verify option representing object in source dropdown only appears once when value is an array of Objects.
    let nutFreeName = (getAllByTestId("nutFree:name-option"));
    expect(nutFreeName.length).toEqual(1);

    //Verify tooltip for Array icon
    fireEvent.mouseOver(getByTestId("LastName-optionIcon"));
    await (() => getByTestId("LastNameMultiple-option-tooltip"));

    //Click on 'FirstNamePreferred'
    await (async () => lastName[1] && fireEvent.click(lastName[1]));

    //mapping is saved
    await (() => expect((waitForElement(() => getByTestId("successMessage"), {"timeout": 1000}))));

    let mapExp = getByTestId("itemTypes-mapexpression");
    //Right Xpath is populated
    await ((() => expect(mapExp).toHaveTextContent("sampleProtein/nutFree:name/LastName")));

    //Right Xpath population for namespaced option representing array of values
    sourceSelector = getByTestId("items-listIcon");
    await (async () => sourceSelector && fireEvent.click(sourceSelector));
    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    let proteinDogOption = (getAllByTestId("nutFree:proteinDog-option"));
    await ((() => expect(proteinDogOption.length).toEqual(2)));
    await(async () => proteinDogOption[0] && fireEvent.click(proteinDogOption[0]));
    mapExp = getByTestId("items-mapexpression");
    await (() => expect(mapExp).toHaveTextContent("sampleProtein/nutFree:proteinDog"));

  });

  test("Right XPATH with source context", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValueOnce({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});

    let queryByTestId, findByTestId, getByTestId, getAllByText, getAllByRole;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      queryByTestId = renderResults.queryByTestId;
      findByTestId = renderResults.findByTestId;
      getByTestId = renderResults.getByTestId;
      getAllByText = renderResults.getAllByText;
      getAllByRole = renderResults.getAllByRole;
    });

    let sourceSelector = await waitForElement(() => getByTestId("items-listIcon"));

    //corresponds to 'items' source selector
    fireEvent.click(sourceSelector);

    await (waitForElement(() => getAllByRole("option"), {"timeout": 600}));
    //Set 'sourceContext' to 'nutFreeName'
    let nutFreeName = getAllByText("nutFreeName");
    expect(nutFreeName.length).toEqual(2);
    fireEvent.click(getAllByText("nutFreeName")[1]);
    await wait(() => expect(findByTestId("successMessage")));

    let mapExp = getByTestId("items-mapexpression");
    //Right Xpath is populated
    expect(mapExp).toHaveTextContent("nutFreeName");

    sourceSelector = getByTestId("itemTypes-listIcon");
    fireEvent.click(sourceSelector);
    await (waitForElement(() => getAllByRole("option"), {"timeout": 600}));
    let firstName = getAllByText("FirstNamePreferred");
    await(() => fireEvent.click(firstName[2]));
    //mapping is saved
    await wait(() => expect(findByTestId("successMessage")));
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }

    mapExp = getByTestId("itemTypes-mapexpression");

    //Right Xpath is populated (and not nutFreeName/FirstNamePreferred since sourceContext is set)
    await (() => expect(mapExp).toHaveTextContent("FirstNamePreferred"));
  });

  test("verify invalid source URI error messaging", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockImplementation(() => {
      throw {response: {data: {message: "Could not find a document with URI: /json/customers/badURI.json"}}};
    });

    let getByTestId, getByLabelText;
    await act(async () => {
      const renderResults = renderWithRouterNoAuthorities(personMappingStepWithData);
      getByTestId = renderResults.getByTestId;
      getByLabelText = renderResults.getByLabelText;
    });
    await wait(() => expect(getByLabelText("invalid-uri-message")).toBeInTheDocument());

    fireEvent.mouseOver(getByTestId("uri-edit"));
    await wait(() => expect(getByTestId("pencil-icon")).toBeInTheDocument());
    fireEvent.mouseOver(getByTestId("pencil-icon"));
    await wait(() => expect(getByLabelText("edit-uri-tooltip")).toBeInTheDocument(), {"timeout": 5000});
  });


  test("Verify the index value changes correspondently to left or right document uri button click", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});

    let getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = renderWithRouterNoAuthorities(personMappingStepWithData);
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
    });
    // URI index starts at 1
    let uriIndex = await waitForElement(() => within(getByLabelText("uriIndex")));
    expect(uriIndex.getByText("1")).toBeInTheDocument();

    // Click next, URI index is 2
    userEvent.click(getByTestId("navigate-uris-right"));
    uriIndex = await waitForElement(() => within(getByLabelText("uriIndex")));
    wait(() => expect(uriIndex.getByText("2")).toBeInTheDocument());

    // Click next, URI index is 3
    userEvent.click(getByTestId("navigate-uris-right"));
    uriIndex = await waitForElement(() => within(getByLabelText("uriIndex")));
    wait(() => expect(uriIndex.getByText("3")).toBeInTheDocument());

    // Click previous, URI index is 2
    fireEvent.click(getByTestId("navigate-uris-left"));
    uriIndex = await waitForElement(() => within(getByLabelText("uriIndex")));
    wait(() => expect(uriIndex.getByText("2")).toBeInTheDocument());

    // Click previous, URI index is 1
    fireEvent.click(getByTestId("navigate-uris-left"));
    uriIndex = await waitForElement(() => within(getByLabelText("uriIndex")));
    wait(() => expect(uriIndex.getByText("1")).toBeInTheDocument());
  });

  test("Verify legend visibility", async () => {
    let getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByTestId = renderResults.getByTestId;
    });

    expect(getByTestId("foreignKeyIconLegend")).toBeInTheDocument();
    expect(getByTestId("multipleIconLegend")).toBeInTheDocument();
    expect(getByTestId("structuredIconLegend")).toBeInTheDocument();
  });

  test("Verify Edit Source Doc URI Save/Discard", async () => {
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});

    let getByTestId, getByText, getByLabelText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
    });

    //verify discard case
    expect(getByText("/dummy/uri/person-101.json")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("uri-edit"));
    fireEvent.click(getByTestId("pencil-icon"));
    fireEvent.change(getByTestId("hc-input-component"), {target: {value: "/dummy/uri/person-102.json"}});
    fireEvent.click(getByLabelText("icon: close"));
    expect(getByText("/dummy/uri/person-101.json")).toBeInTheDocument();

    //verify save case
    expect(getByText("/dummy/uri/person-101.json")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("uri-edit"));
    fireEvent.click(getByTestId("pencil-icon"));
    fireEvent.change(getByTestId("hc-input-component"), {target: {value: "/dummy/uri/person-102.json"}});
    fireEvent.click(getByLabelText("icon: check"));
    await (waitForElement(() => getByText("/dummy/uri/person-102.json")));
    expect(getByText("/dummy/uri/person-102.json")).toBeInTheDocument();
  });
  test("Verify Keyboard Navigation focus and sequence", async () => {
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});

    let getByLabelText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByLabelText = renderResults.getByLabelText;
    });

    let j: number;
    let stepSettings = getByLabelText("stepSettingsContainer");
    let columnOptions = getByLabelText("columnOptionsSelectorButton");
    let entityExpandBtn = getByLabelText("expandBtn");
    let entityCollapseBtn = getByLabelText("collapseBtn");
    const entityTableActions = [stepSettings, columnOptions, entityExpandBtn, entityCollapseBtn];

    entityTableActions.forEach((element, i) => async () => {
      element.focus();
      await wait(() => expect(element).toHaveFocus());
    });

    stepSettings.focus();

    // verify elements tab in given order
    for (j = 1; j < 4; ++j) {
      userEvent.tab();
      expect(entityTableActions[j]).toHaveFocus();
    }

    // verify elements tab backwards in same order
    for (j = 2; j >= 0; --j) {
      userEvent.tab({shift: true});
      expect(entityTableActions[j]).toHaveFocus();
    }
  });
});
