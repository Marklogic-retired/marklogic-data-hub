import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {waitForElement, waitForElementToBeRemoved, render, wait, cleanup, fireEvent, within} from "@testing-library/react";
import {waitFor} from "@testing-library/dom";
import MappingStepDetail from "./mapping-step-detail";
import data from "../../../../assets/mock-data/curation/common.data";
import {shallow} from "enzyme";
import {validateMappingTableRow, onClosestTableRow} from "../../../../util/test-utils";
import {CurationContext} from "../../../../util/curation-context";
import {personMappingStepEmpty, personMappingStepWithData, personMappingStepWithRelatedEntityData} from "../../../../assets/mock-data/curation/curation-context-mock";
import {updateMappingArtifact, getMappingArtifactByMapName, getMappingFunctions, getMappingRefs} from "../../../../api/mapping";
import {mappingStep, mappingStepPerson} from "../../../../assets/mock-data/curation/mapping.data";
import {getUris, getDoc} from "../../../../util/search-service";
import {getMappingValidationResp, getNestedEntities} from "../../../../util/manageArtifacts-service";
import {act} from "react-dom/test-utils";
import {personEntityDef, personNestedEntityDef, personNestedEntityDefSameNames, personRelatedEntityDef, personRelatedEntityDefLargePropSet} from "../../../../assets/mock-data/curation/entity-definitions-mock";
import {AuthoritiesContext, AuthoritiesService} from "../../../../util/authorities";
import SplitPane from "react-split-pane";
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

const defaultRender = (curationContextValue: any) => {
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

  test("Verify legend visibility",  async() => {
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
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
    });

    expect(getByText("envelope")).toBeInTheDocument();
    expect(getByText("triples")).toBeInTheDocument();
    expect(getByText("instance")).toBeInTheDocument();

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
    fireEvent.click(settingsLink);
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
    fireEvent.change(exp, {target: {value: "concat(name,'-NEW')"}});
    fireEvent.blur(exp);
    fireEvent.click(getByText("Clear"));
    expect(getByText("Clear")).toBeEnabled();
    expect(getByText("concat(name,'-NEW')")).toBeInTheDocument();
  });

  test("Filtering Name column in Source data table for array type data", async () => {
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});

    let getAllByText, queryByText, getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getAllByText = renderResults.getAllByText;
      queryByText = renderResults.queryByText;
      getByTestId = renderResults.getByTestId;
    });

    fireEvent.click(getByTestId("filterIcon-key"));
    fireEvent.change(getByTestId("searchInput-key"), {target: {value: "protein"}});
    fireEvent.click(getByTestId("submitSearch-key"));
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

    let getByText, getAllByText, queryByText, getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      getAllByText = renderResults.getAllByText;
      queryByText = renderResults.queryByText;
      getByTestId = renderResults.getByTestId;
    });

    //For Source table testing
    let sourcefilterIcon = getByTestId("filterIcon-key");
    let inputSearchSource = getByTestId("searchInput-key");
    let resetSourceSearch = getByTestId("ResetSearch-key");

    //For Entity table testing
    let entityfilterIcon = getByTestId("filterIcon-name");
    let inputSearchEntity = getByTestId("searchInput-name");
    let resetEntitySearch = getByTestId("ResetSearch-name");

    /* Test filter for JSON Source data in Source table  */
    fireEvent.click(sourcefilterIcon);

    fireEvent.change(inputSearchSource, {target: {value: "first"}}); //Enter a case-insensitive value in inputSearch field
    expect(inputSearchSource).toHaveValue("first");
    fireEvent.click(getByTestId("submitSearch-key")); //Click on Search button to apply the filter with the desired string

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
    fireEvent.click(sourcefilterIcon);
    fireEvent.click(resetSourceSearch);

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

    //Moving along with the filter test
    fireEvent.click(entityfilterIcon);

    fireEvent.change(inputSearchEntity, {target: {value: "craft"}}); //Enter a case-insensitive value in inputEntitySearch field
    expect(inputSearchEntity).toHaveValue("craft");
    fireEvent.click(getByTestId("submitSearch-name")); //Click on Search button to apply the filter with the desired string

    //Entity type title should remain in the first row after filter is applied
    let entTableTopRow: any;
    let entTableRow = document.querySelectorAll("#entityContainer .ant-table-row-level-0");
    entTableRow.forEach(item => { if (item.getAttribute("data-row-key") === "0") { return entTableTopRow = item; } });
    expect(entTableTopRow).toHaveTextContent(data.mapProps.entityTypeTitle);

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
    fireEvent.click(entityfilterIcon);
    fireEvent.click(resetEntitySearch);

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

    let getByText, getByTestId, getAllByText, queryByText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      getAllByText = renderResults.getAllByText;
      queryByText = renderResults.queryByText;
      getByTestId = renderResults.getByTestId;
    });

    /* Test filter on Source table with XML data  */
    let sourcefilterIcon = getByTestId("filterIcon-key");
    let inputSourceSearch = getByTestId("searchInput-key");
    let resetSourceSearch = getByTestId("ResetSearch-key");

    fireEvent.click(sourcefilterIcon); //Click on filter icon to open the search input field and other related buttons.

    fireEvent.change(inputSourceSearch, {target: {value: "organism"}}); //Enter a case-insensitive value in inputSearch field
    expect(inputSourceSearch).toHaveValue("organism");
    fireEvent.click(getByTestId("submitSearch-key")); //Click on Search button to apply the filter with the desired string

    //Check if the expected values are available/not available in search result.
    expect(getByText(/withNuts:/)).toBeInTheDocument();
    expect(getByText("Frog virus 3")).toBeInTheDocument();
    expect(getByText("scientific")).toBeInTheDocument();
    expect(getAllByText(/nutFree:/).length).toEqual(2);
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
    fireEvent.click(sourcefilterIcon);
    fireEvent.click(resetSourceSearch);

    //Check if the table goes back to the default state after resetting the filter on source table.
    expect(getAllByText(/nutFree:/).length).toEqual(2);
    expect(getByText(/withNuts:/)).toBeInTheDocument();
    expect(onClosestTableRow(getByText("Frog virus 3"))?.style.display).toBe("none");
    expect(onClosestTableRow(getByText("scientific"))?.style.display).toBe("none");
    expect(queryByText("NamePreferred")).not.toBeInTheDocument();
    expect(queryByText("LastName")).not.toBeInTheDocument();
  });

  test("Filtering Name column in related entity tables", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDef});

    let getByTestId, getByLabelText, getByText, getAllByText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByTestId = renderResults.getByTestId;
      getByLabelText = renderResults.getByLabelText;
      getByText = renderResults.getByText;
      getAllByText = renderResults.getAllByText;
    });

    //expand nested levels first
    fireEvent.click(within(getByTestId("entityContainer")).getByLabelText("radio-button-expand"));

    //Entity type title should be visible
    let entTableTopRow: any;
    let entTableRow = document.querySelectorAll("#entityContainer .ant-table-row-level-0");
    entTableRow.forEach(item => { if (item.getAttribute("data-row-key") === "0") { return entTableTopRow = item; } });
    expect(entTableTopRow).toHaveTextContent(data.mapProps.entityTypeTitle);

    // Verify related entity filter in the first row
    expect(getByText("Map related entities:").closest("tr")).toBe(entTableTopRow);

    //Verify entity settings icon also exist in the first row
    expect(getByLabelText("entitySettings").closest("tr")).toBe(entTableTopRow);

    let entitiesFilter = getByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-select-search__field"
    );

    fireEvent.click(entitiesFilter); // focus on the search box

    //Related entity options should appear
    expect(getByText("Order (orderedBy Person)")).toBeInTheDocument();
    expect(getByText("BabyRegistry (ownedBy Person)")).toBeInTheDocument();

    //Select both Order and BabyRegistry related entities to display
    fireEvent.click(getByText("Order (orderedBy Person)"));
    fireEvent.click(getByText("BabyRegistry (ownedBy Person)"));

    let entityFilterValue = getAllByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-select-selection__choice__content"
    );

    //Both selected values should appear in primary table filter
    expect(entityFilterValue[0]).toHaveTextContent("Order (orderedBy Person)");
    expect(entityFilterValue[1]).toHaveTextContent("BabyRegistry (ownedBy Person)");

    //Order and BabyRegistry tables should be present on the screen
    expect(getByLabelText("Order (orderedBy Person)-title")).toBeInTheDocument();
    expect(getByLabelText("BabyRegistry (ownedBy Person)-title")).toBeInTheDocument();

    expect(getByText("orderedBy")).toBeInTheDocument();
    // TODO skipping, DHFPROD-7711 MLTooltip -> Tooltip
    // fireEvent.mouseOver((getByTestId("foreign-orderedBy")));
    // await wait(() => expect(document.querySelector("#tooltip-orderedBy")).toBeInTheDocument());
    expect(getByText("integer (Person)")).toBeInTheDocument();

    //Verify that there are now three entity filters, one in the primary table and one in each related table
    let entityFilters = getAllByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-select-search__field"
    );

    expect(entityFilters).toHaveLength(3);

    //For Entity table testing
    let entityfilterIcon = getByTestId("filterIcon-name");
    let inputSearchEntity = getByTestId("searchInput-name");
    /* Test filter on Entity table  */

    //Filter by the properties of main and related tables
    fireEvent.click(entityfilterIcon);
    fireEvent.change(inputSearchEntity, {target: {value: "orderId"}});
    expect(inputSearchEntity).toHaveValue("orderId");
    fireEvent.click(getByTestId("submitSearch-name"));
    expect(getByText("orderId")).toBeInTheDocument();
    expect(getByText("orderId")).toHaveStyle("background-color: yellow");

    fireEvent.click(entityfilterIcon);
    fireEvent.change(inputSearchEntity, {target: {value: "arrivalDate"}});
    expect(inputSearchEntity).toHaveValue("arrivalDate");
    fireEvent.click(getByTestId("submitSearch-name"));
    expect(getByText("arrivalDate")).toBeInTheDocument();
    expect(getByText("arrivalDate")).toHaveStyle("background-color: yellow");

    fireEvent.click(entityfilterIcon);
    fireEvent.change(inputSearchEntity, {target: {value: "babyRegistryId"}});
    expect(inputSearchEntity).toHaveValue("babyRegistryId");
    fireEvent.click(getByTestId("submitSearch-name"));
    expect(getByText("babyRegistryId")).toBeInTheDocument();
    expect(getByText("babyRegistryId")).toHaveStyle("background-color: yellow");

    fireEvent.click(entityfilterIcon);
    fireEvent.change(inputSearchEntity, {target: {value: "deliveredTo"}});
    expect(inputSearchEntity).toHaveValue("deliveredTo");
    fireEvent.click(getByTestId("submitSearch-name"));
    expect(getByText("deliveredTo")).toBeInTheDocument();
    expect(getByText("deliveredTo")).toHaveStyle("background-color: yellow");

    fireEvent.click(entityfilterIcon);
    fireEvent.change(inputSearchEntity, {target: {value: "orderedBy"}});
    expect(inputSearchEntity).toHaveValue("orderedBy");
    fireEvent.click(getByTestId("submitSearch-name"));
    expect(getByText("orderedBy")).toBeInTheDocument();
    expect(getByText("orderedBy")).toHaveStyle("background-color: yellow");

    fireEvent.click(entityfilterIcon);
    fireEvent.change(inputSearchEntity, {target: {value: "lineItems"}});
    expect(inputSearchEntity).toHaveValue("lineItems");
    fireEvent.click(getByTestId("submitSearch-name"));
    expect(getByText("lineItems")).toBeInTheDocument();
    expect(getByText("lineItems")).toHaveStyle("background-color: yellow");
  });

  test("Column option selector in Entity table", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});

    let getByText, getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
    });

    //Set the data for testing in xpath expression

    let exp = getByText("testNameInExp");
    fireEvent.change(exp, {target: {value: "concat(propName,'-NEW')"}});
    fireEvent.blur(exp);
    expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument();

    /* Test column option selector in Entity table  */
    let colOptSelect = getByText("Column Options");
    fireEvent.click(colOptSelect);
    let Name = getByTestId("columnOptionsCheckBox-name");
    let Type = getByTestId("columnOptionsCheckBox-type");
    let XPathExpression = getByTestId("columnOptionsCheckBox-key");
    let Value = getByTestId("columnOptionsCheckBox-value");
    expect(Name).toBeChecked();
    expect(Type).toBeChecked();
    expect(XPathExpression).toBeChecked();
    expect(Value).toBeChecked();

    fireEvent.click(Name); //Uncheck Name column
    let colHeader: any = getByTestId("entityTableType").closest("tr");
    let entityTableHeaderRow = within(colHeader);
    expect(entityTableHeaderRow.queryByText("Name")).not.toBeInTheDocument();

    //Verifying edge case where xpath expression rows for the filtered out names also appear if Name is unchecked in options selector
    expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument(); // This will not have been visible if name had not been unchecked earlier.

    fireEvent.click(XPathExpression); //Uncheck XPath Expression column

    //Verifying that columns Name and Xpath expression are not visible.
    expect(entityTableHeaderRow.queryByText("Name")).not.toBeInTheDocument();
    expect(entityTableHeaderRow.queryByText("XPath Expression")).not.toBeInTheDocument();

    //Checking the columns one by one in selector and verify that they appear in entity table
    fireEvent.click(Name); //Check Name column
    //Props below should be available now
    expect(getByText("propId")).toBeInTheDocument();
    expect(getByText("propName")).toBeInTheDocument();

    fireEvent.click(XPathExpression); //Check XPathExpression column
    //Props below should be available now
    expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument();
  });

  test("Sorting in Source table", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personEntityDef});

    let getByTestId;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithData);
      getByTestId = renderResults.getByTestId;
    });

    //Expanding the nested levels first
    fireEvent.click(within(getByTestId("srcContainer")).getByLabelText("radio-button-expand"));

    const sourceTableNameSort = getByTestId("sourceTableKey"); // For name column sorting
    const sourceTableValueSort = getByTestId("sourceTableValue"); // For value column sorting

    /* Validate sorting on Name column in source table */

    //Check the sort order of Name column rows before enforcing sort order
    let srcTable = document.querySelectorAll("#srcContainer .ant-table-row-level-0");
    validateMappingTableRow(srcTable, ["proteinId", "proteinType", "nutFreeName", "proteinCat", "proteinDog", "emptyString", "nullValue", "numberValue", "booleanValue", "whitespaceValue", "emptyArrayValue", "numberArray", "booleanArray"], "key", data.mapProps.sourceData, "source");

    //Click on the Name column to sort the rows by Ascending order
    fireEvent.click(sourceTableNameSort);
    srcTable = document.querySelectorAll("#srcContainer .ant-table-row-level-0");
    validateMappingTableRow(srcTable, ["booleanArray", "booleanValue", "emptyArrayValue", "emptyString", "nullValue", "numberArray", "numberValue", "nutFreeName", "proteinCat", "proteinDog", "proteinId", "proteinType", "whitespaceValue"], "key", data.mapProps.sourceData, "source");

    //Click on the Name column to sort the rows by Descending order
    fireEvent.click(sourceTableNameSort);
    srcTable = document.querySelectorAll("#srcContainer .ant-table-row-level-0");
    validateMappingTableRow(srcTable, ["whitespaceValue", "proteinType", "proteinId", "proteinDog", "proteinCat", "nutFreeName", "numberValue", "numberArray", "nullValue", "emptyString", "emptyArrayValue", "booleanValue", "booleanArray"], "key", data.mapProps.sourceData, "source");

    //Click on the Name column again to remove the applied sort order and check if its removed
    fireEvent.click(sourceTableNameSort);
    srcTable = document.querySelectorAll("#srcContainer .ant-table-row-level-0");
    validateMappingTableRow(srcTable, ["proteinId", "proteinType", "nutFreeName", "proteinCat", "proteinDog", "emptyString", "nullValue", "numberValue", "booleanValue", "whitespaceValue", "emptyArrayValue", "numberArray", "booleanArray"], "key", data.mapProps.sourceData, "source");

    /* Validate sorting on Values column in source table */

    //Check the sort order of Values column rows before enforcing sort order
    srcTable = document.querySelectorAll("#srcContainer .ant-table-row-level-0");
    validateMappingTableRow(srcTable, ["123EAC", "home", undefined, "commercial", "retriever, golden, labrador", "", "null", "321", "true", " ", "[ ]", "1, 2, 3", "true, false, true"], "val", data.mapProps.sourceData, "source");

    //Click on the Values column to sort the rows by Ascending order
    fireEvent.click(sourceTableValueSort);
    srcTable = document.querySelectorAll("#srcContainer .ant-table-row-level-0");
    validateMappingTableRow(srcTable, ["", " ", "[ ]", "1, 2, 3", "123EAC", "321", "commercial", "home", "null", "retriever, golden, labrador", "true", "true, false, true", undefined], "val", data.mapProps.sourceData, "source");

    //Click on the Values column to sort the rows by Descending order
    fireEvent.click(sourceTableValueSort);
    srcTable = document.querySelectorAll("#srcContainer .ant-table-row-level-0");
    validateMappingTableRow(srcTable, ["true", "retriever, golden, labrador", "null", "home", "commercial", "123EAC", undefined, "true, false, true", "321", "1, 2, 3", "[ ]", " ", ""], "val", data.mapProps.sourceData, "source");

    //Click on the Value column again to remove the applied sort order and check if its removed
    fireEvent.click(sourceTableValueSort);
    srcTable = document.querySelectorAll("#srcContainer .ant-table-row-level-0");
    validateMappingTableRow(srcTable, ["123EAC", "home", undefined, "commercial", "retriever, golden, labrador", "", "null", "321", "true", " ", "[ ]", "1, 2, 3", "true, false, true"], "val", data.mapProps.sourceData, "source");
  });

  test("Verify view related entities with selection/deselection in filters", async () => {
    mockGetMapArtifactByName.mockResolvedValue(mappingStep.artifacts[1]);
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataDefault});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDef});

    let getByTestId, getByLabelText, getByText, getAllByText, queryByTestId, getAllByLabelText, queryByLabelText, getByPlaceholderText;
    await act(async () => {
      const renderResults = defaultRender(personMappingStepWithRelatedEntityData);
      getByTestId = renderResults.getByTestId;
      getByLabelText = renderResults.getByLabelText;
      getByText = renderResults.getByText;
      getAllByText = renderResults.getAllByText;
      queryByTestId = renderResults.queryByTestId;
      getAllByLabelText = renderResults.getAllByLabelText;
      queryByLabelText = renderResults.queryByLabelText;
      getByPlaceholderText = renderResults.getByPlaceholderText;
    });

    //expand nested levels first
    fireEvent.click(within(getByTestId("entityContainer")).getByLabelText("radio-button-expand"));

    //Verify utility in first row of Entity table

    //Entity type title should be visible
    let entTableTopRow: any;
    let entTableRow = document.querySelectorAll("#entityContainer .ant-table-row-level-0");
    entTableRow.forEach(item => { if (item.getAttribute("data-row-key") === "0") { return entTableTopRow = item; } });
    expect(entTableTopRow).toHaveTextContent(data.mapProps.entityTypeTitle);

    // Verify related entity filter in the first row
    expect(getAllByText("Map related entities:")[0].closest("tr")).toBe(entTableTopRow);

    //Verify entity settings icon also exist in the first row
    expect(getAllByLabelText("entitySettings")[0].closest("tr")).toBe(entTableTopRow);

    //All mapped entity tables should be present on the screen by default
    expect(getByLabelText("Person-title")).toBeInTheDocument();
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
    fireEvent.click(getByTestId("BabyRegistry (ownedBy Person)-delete"));

    expect(await(waitForElement(() => getByLabelText("entity-being-referenced-msg")))).toBeInTheDocument();

    //Close the confirmation modal
    fireEvent.click(getByText("OK"));

    //Delete Product table via X button
    fireEvent.click(getByTestId("Product (BabyRegistry hasProduct)-delete"));

    //Confirmation modal to confirm deletion of the entity should appear
    expect(await(waitForElement(() => getByLabelText("confirm-deletion-msg")))).toBeInTheDocument();

    //Confirm deletion of Product (BabyRegistry hasProduct) table
    fireEvent.click(getByText("Yes"));

    //Product (BabyRegistry hasProduct) table should no longer be shown
    await wait(() => expect(queryByLabelText("Product (BabyRegistry hasProduct)-title")).not.toBeInTheDocument());

    //Test deletion of BabyRegistry related entity through the X button on the filter label of its parent table (Person) now

    let entityFilterValue = getAllByText(
      (_content, element) =>
        element.className !== null &&
                element.className === "ant-select-selection__choice"
    );

    //Verify BabyRegistry label exists in the Person table's filter
    expect(entityFilterValue[1]).toHaveTextContent("BabyRegistry (ownedBy Person)");

    //Click X button on the BabyRegistry label
    fireEvent.click(getAllByLabelText("icon: close")[1]);

    //Should display confirmation message now, instead of the entity being referenced message because Product child table has been deleted
    expect(await(waitForElement(() => getByLabelText("confirm-deletion-msg")))).toBeInTheDocument();

    //Confirm deletion of BabyRegistry table
    fireEvent.click(getByText("Yes"));

    entityFilterValue = getAllByText(
      (_content, element) =>
        element.className !== null &&
                element.className === "ant-select-selection__choice"
    );

    //BabyRegistry (ownedBy Person) table should no longer be shown
    await wait(() => expect(queryByLabelText("BabyRegistry (ownedBy Person)-title")).not.toBeInTheDocument());

    //BabyRegistry label should no longer exist in Person's entity filter
    expect(entityFilterValue[1]).not.toEqual("BabyRegistry (ownedBy Person)");

    //only target entity table (Person) and Order and its related entity table Product should remain
    expect(getByLabelText("Person-title")).toBeInTheDocument();
    await wait(() => expect(getByLabelText("Order (orderedBy Person)-title")).toBeInTheDocument());
    await wait(() => expect(getByLabelText("Product (Order hasProduct)-title")).toBeInTheDocument());
    await wait(() => expect(queryByLabelText("BabyRegistry (ownedBy Person)-title")).not.toBeInTheDocument());
    await wait(() => expect(queryByLabelText("Product (BabyRegistry hasProduct)-title")).not.toBeInTheDocument());

    let targetEntityFilter = getAllByText(
      (_content, element) =>
        element.className !== null &&
                element.className === "ant-select-search__field"
    )[0];

    fireEvent.click(targetEntityFilter); // focus on the search box

    //Related entity options should appear
    expect(getByLabelText("Order (orderedBy Person)-option")).toBeInTheDocument();
    expect(getByLabelText("BabyRegistry (ownedBy Person)-option")).toBeInTheDocument();

    //Select BabyRegistry related entity to display
    fireEvent.click(getByLabelText("BabyRegistry (ownedBy Person)-option"));

    entityFilterValue = getAllByText(
      (_content, element) =>
        element.className !== null &&
                element.className === "ant-select-selection__choice"
    );

    //Order and BabyRegistry tables should be present on the screen
    expect(getByLabelText("Order (orderedBy Person)-title")).toBeInTheDocument();
    expect(getByLabelText("BabyRegistry (ownedBy Person)-title")).toBeInTheDocument();

    //Verify that there are now three entity filters, one in the primary table and one in each related table
    let entityFilters = getAllByText(
      (_content, element) =>
        element.className !== null &&
                element.className === "ant-select-search__field"
    );

    expect(entityFilters).toHaveLength(3);

    //Verify related entities can be opened from a related entity table

    fireEvent.click(getByTestId("BabyRegistry (ownedBy Person)-entities-filter"));
    fireEvent.click(getByText("Product (BabyRegistry hasProduct)"));

    let relatedEntityFilterValue = getAllByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-select-selection__choice__content"
    );

    //Selected value should appear in BabyRegistry table filter
    expect(relatedEntityFilterValue[3]).toHaveTextContent("Product (BabyRegistry hasProduct)");

    //BabyRegistry's Product and Order's Product tables should be present on the screen
    expect(getByLabelText("Product (Order hasProduct)-title")).toBeInTheDocument();
    expect(getByLabelText("Product (BabyRegistry hasProduct)-title")).toBeInTheDocument();

    //Both Products have no related entities so no filter should be available
    expect(queryByTestId("Product (Order hasProduct)-entities-filter")).not.toBeInTheDocument();
    expect(queryByTestId("Product (BabyRegistry hasProduct)-entities-filter")).not.toBeInTheDocument();

    //verify advanced settings of related entity
    //click on the related entity table order settings

    //verify the proper related entity settings title shows up when popover is clicked (Order)
    fireEvent.click(getByTestId("Order-entity-settings"));
    expect(getByTestId("Order-settings-title")).toBeInTheDocument();

    //verify Target Collections
    expect(getByText("Target Collections")).toBeInTheDocument();
    expect(getByText("Please add target collections")).toBeInTheDocument();

    //verify Default Collections
    expect(getByText("Default Collections")).toBeInTheDocument();
    expect(getByText("Order")).toBeInTheDocument();

    //verify Target Permissions
    expect(getByText("Target Permissions")).toBeInTheDocument();
    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-operator"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-operator");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));

    expect(getByTestId("validationError")).toHaveTextContent("The format of the string is incorrect. The required format is role,capability,role,capability,....");

    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-operator,read"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-operator,read");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));
    expect(getByTestId("validationError")).toHaveTextContent("");

    //verify proper target entity settings title shows up when popover is clicked (Person)
    fireEvent.click(getByTestId("Person-entity-settings"));
    expect(getByTestId("Person-settings-title")).toBeInTheDocument();

    // TODO DHFPROD-7744 Add validation for testing URI value tooltip
  });

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
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataRelated});
    mockGetMapArtifactByName.mockResolvedValue(mappingStep.artifacts[1]);
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});
    mockGetMappingValidationResp.mockResolvedValue({status: 200, data: mappingStepPerson.artifacts[5]});

    let getByTestId, getByText, queryByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithRelatedEntityData, authorityService);
      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      queryByTestId = renderResults.queryByTestId;
    });

    // URI field should exist for primary entity table and have default value
    let primaryUriExp = getByTestId("Person-URI-mapexpression");
    expect(primaryUriExp).toHaveTextContent(StepsConfig.defaultPrimaryUri);

    // URI field should exist for related entity table and have default value
    let relatedUriExp = getByTestId("BabyRegistry (ownedBy Person)-URI-mapexpression");
    expect(relatedUriExp).toHaveTextContent(StepsConfig.defaultRelatedUri("BabyRegistry"));

    // Related entity URI field can be edited
    userEvent.type(relatedUriExp, "{selectall}{backspace}");
    userEvent.type(relatedUriExp, "###");
    expect(relatedUriExp).toHaveTextContent("###");
    fireEvent.blur(relatedUriExp);

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

    //Clicking 'Test' should display evaluated URI expression values in target and related entity tables
    fireEvent.click(getByText("Test"));
    await (waitForElement(() => getByTestId("Person-URI-value")));
    expect(getByTestId("Person-URI-value")).toHaveTextContent("/Person/personWithRelat...");
    //Verify tooltip shows full value when hovering truncated URI value
    fireEvent.mouseOver(getByText("/Person/personWithRelat..."));
    await waitForElement(() => getByText("/Person/personWithRelatedEntities.json"));

    //Verify error message in evaluated URI expression for related entity table
    expect(getByTestId("BabyRegistry (ownedBy Person)-URI-value")).toHaveTextContent("");
    await waitForElement(() => getByText("Invalid XPath expression: ###"));

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

    fireEvent.mouseOver(getByText("123EAC"));
    //Verify there is no tooltip.
    expect(queryAllByText("123EAC")).toHaveLength(1);

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
    // checking successMessage is still there before waitForElementToBeRemoved as this would occasionally fail under load
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }

    // Test button should be enabled after mapping expression is saved
    expect(document.querySelector("#Test-btn")).toBeEnabled();

    //Verify Test button click
    fireEvent.click(getByText("Test"));
    await (waitForElement(() => getByTestId("Person-propName-value")));
    expect(getByTestId("Person-propName-value")).toHaveTextContent("123EAC");
    expect(getByTestId("Person-propAttribute-value")).toHaveTextContent("home");

    //Verify Clear button click
    fireEvent.click(getByText("Clear"));
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

    //Verify tooltip shows all values in a list when hovering values with multiple items
    fireEvent.mouseOver(getByText((_, node) => node.textContent === "(7 more)"));
    await waitForElement(() => getByText("s@ml.com, , t@ml.com, u@ml.com, v@ml.com, w@ml.com, x@ml.com, y@ml.com, z@ml.com"));

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
    rerender(
      <AuthoritiesContext.Provider value={authorityService}>
        <CurationContext.Provider value={personMappingStepWithData}><MappingStepDetail /></CurationContext.Provider>
      </AuthoritiesContext.Provider>
    );

    //Verify Test button click
    fireEvent.click(getByText("Test"));
    await (waitForElement(() => getByTestId("Person-propAttribute-value")));
    expect(getByTestId("Person-propAttribute-value")).toHaveTextContent("home");

    //Verify Clear button click
    fireEvent.click(getByText("Clear"));
    expect(getByTestId("Person-propAttribute-value")).not.toHaveTextContent("home");

    //Verify that fx/source-data list is disabled for mapping reader user
    expect(getByTestId("propId-102-functionIcon")).toBeDisabled();
  });

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
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

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

    fireEvent.change(propIdExpression, {target: {value: "proteinID"}});
    fireEvent.blur(propIdExpression);

    // waiting for success message before clicking on Test button
    await (waitForElement(() => (getByTestId("successMessage"))));

    //Rerendering as a mapping reader user
    authorityService.setAuthorities(["readMapping"]);
    rerender(
      <AuthoritiesContext.Provider value={authorityService}>
        <CurationContext.Provider value={personMappingStepWithData}><MappingStepDetail /></CurationContext.Provider>
      </AuthoritiesContext.Provider>
    );

    //Verify Test button click
    fireEvent.click(getByText("Test"));
    await (waitForElement(() => getByTestId("propId-expErr")));

    //debug(onClosestTableRow(getByTestId('propId-value')))
    let errorMessage = mappingStepPerson.artifacts[3].properties.propId ? mappingStepPerson.artifacts[3].properties.propId.errorMessage : "";
    expect(getByTestId("propId-expErr")).toHaveTextContent(errorMessage);
    expect(getByTestId("Person-propId-value")).toHaveTextContent("");

    //Verify Clear button click
    fireEvent.click(getByText("Clear"));
    expect(queryByTestId("propId-expErr")).toBeNull();
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
    expect(queryByText("suffix")).not.toBeInTheDocument();
    expect(getByText("nutFreeName")).toBeInTheDocument();
    expect(getByText("FirstNamePreferred")).toBeInTheDocument();
    expect(getByText("LastName")).toBeInTheDocument();

    let expandBtnSource = within(getByTestId("srcContainer")).getByLabelText("radio-button-expand");
    let collapseBtnSource = within(getByTestId("srcContainer")).getByLabelText("radio-button-collapse");

    // Validating the default button state
    expect(expandBtnSource).not.toBeChecked();
    expect(collapseBtnSource).not.toBeChecked();

    //Expanding all nested levels
    fireEvent.click(expandBtnSource);
    expect(getByText("suffix")).toBeInTheDocument();

    //Check if indentation is right
    expect(getByText("suffix").closest("td")?.firstElementChild).toHaveStyle("padding-left: 40px;");

    //Collapsing all child levels
    fireEvent.click(collapseBtnSource);
    expect(onClosestTableRow(getByText("suffix"))?.style.display).toBe("none"); // Checking if the row is marked hidden in DOM. All collapsed rows are marked hidden(display: none) once you click on Collapse All button.
    expect(onClosestTableRow(getByText("FirstNamePreferred"))?.style.display).toBe("none");
    expect(onClosestTableRow(getByText("LastName"))?.style.display).toBe("none");
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
    expect(getByText("artCraft").closest("td")?.firstElementChild).toHaveStyle("padding-left: 56px;");

    //Collapsing all child levels
    fireEvent.click(collapseBtnEntity);
    expect(onClosestTableRow(getByText("artCraft"))?.style.display).toBe("none"); // Checking if the row is marked hidden(collapsed) in DOM. All collapsed rows are marked hidden(display: none) once you click on Collapse All button.
    expect(onClosestTableRow(getByText("itemTypes"))?.style.display).toBe("none");
    expect(onClosestTableRow(getByText("itemCategory"))?.style.display).toBe("none");
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

    // Validating the default button state
    expect(expandBtnSource).not.toBeChecked();
    expect(collapseBtnSource).not.toBeChecked();

    //Expanding all nested levels
    fireEvent.click(expandBtnSource);
    let firstName = getByText("FirstNamePreferred");
    let lastName = getByText("LastName");
    let proteinId = getByText("proteinId");
    expect(firstName).toBeInTheDocument();
    expect(firstName.closest("td")?.firstElementChild).toHaveStyle("padding-left: 20px;"); // Check if the indentation is right
    expect(lastName).toBeInTheDocument();
    expect(lastName.closest("td")?.firstElementChild).toHaveStyle("padding-left: 20px;"); // Check if the indentation is right

    //Collapsing back to the default view (root and 1st level)
    fireEvent.click(collapseBtnSource);
    expect(onClosestTableRow(proteinId)?.style.display).toBe("");
    expect(onClosestTableRow(firstName)?.style.display).toBe("none");
    expect(onClosestTableRow(lastName)?.style.display).toBe("none");
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

    let getByText, getAllByText, getByTestId, queryByText, getAllByRole, queryByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getAllByText = renderResults.getAllByText;
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      queryByText = renderResults.queryByText;
      getAllByRole = renderResults.getAllByRole;
      queryByTestId = renderResults.queryByTestId;
    });

    //Prepare the map expression field for function signature later
    let propAttributeExpression = getByTestId("propAttribute-mapexpression");
    fireEvent.change(propAttributeExpression, {target: {value: ""}});
    fireEvent.blur(propAttributeExpression);

    let functionSelector = getByTestId("propAttribute-104-functionIcon");
    fireEvent.click(functionSelector);
    let inputBox = getAllByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-select-search__field"
    )[0];

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

    let getAllByText, getByTestId, getAllByRole, queryByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getAllByText = renderResults.getAllByText;
      getByTestId = renderResults.getByTestId;
      getAllByRole = renderResults.getAllByRole;
      queryByTestId = renderResults.queryByTestId;
    });

    // Prepare the map expression field for reference input
    let propAttributeExpression = getByTestId("propAttribute-mapexpression");
    fireEvent.change(propAttributeExpression, {target: {value: ""}});
    fireEvent.blur(propAttributeExpression);

    // Open reference menu and verify options
    let referenceSelector = getByTestId("Person-propAttribute-refIcon");
    fireEvent.click(referenceSelector);
    let inputBox = getAllByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-select-search__field"
    )[0];
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
    uriIndex = await waitForElement(() => within(getByLabelText("uriIndex")));
    wait(() => expect(uriIndex.getByText("2")).toBeInTheDocument());

    // Going back to curate home page
    fireEvent.click(getByLabelText("Back"));

    // URI index reset to 1
    uriIndex = within(getByLabelText("uriIndex"));
    expect(uriIndex.getByText("1")).toBeInTheDocument();
  });

  test("verify if pagination works properly in Source and Entity tables", async () => {
    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[4]});
    mockGetUris.mockResolvedValue({status: 200, data: ["/dummy/uri/person-101.json"]});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.jsonSourceDataLargeDataset});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personRelatedEntityDefLargePropSet});
    window.HTMLElement.prototype.scrollIntoView = function() {};

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
    let sourcefilterIcon = getByTestId("filterIcon-key");
    let inputSearchSource = getByTestId("searchInput-key");
    let submitSearchText = getByTestId("submitSearch-key");
    let resetFilter = getByTestId("ResetSearch-key");

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

  test("verify pagination and page size menu works properly in Source XML table", async () => {
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

describe("Enzyme Source-to-entity map tests", () => {
  let wrapper: any;
  beforeEach(() => {
    wrapper = shallow(
      <MappingStepDetail />, {
        context: {CurationContext}
      }
    );
  });
  afterEach(cleanup);

  test("Enzyme tests with source data", () => {
    //Use console.log(wrapper.debug()) for debugging the html returned by the wrapper;
    expect(wrapper.find("#srcContainer").length).toEqual(1);
    expect(wrapper.find("#srcDetails").length).toEqual(1);
    expect(wrapper.find("#entityContainer").length).toEqual(1);
    //Success and Error message are shown only when a mapping expression is being saved
    expect(wrapper.find("#successMessage").length).toEqual(0);
    expect(wrapper.find("#errorMessage").length).toEqual(0);
    //List and Function icon are displayed only when the entity table loads with entity properties
    expect(wrapper.find("#listIcon").length).toEqual(0);
    expect(wrapper.find("#functionIcon").length).toEqual(0);
    expect(wrapper.find("#Clear-btn").length).toEqual(1);
    expect(wrapper.find("#Test-btn").length).toEqual(1);
    expect(wrapper.find("#errorInExp").length).toEqual(0);
    expect(wrapper.find("#valuesAfterTest").length).toEqual(0);
    const splitPane = wrapper.find(SplitPane);
    expect(splitPane).toHaveLength(1);
    expect(splitPane.prop("split")).toEqual("vertical");
    expect(splitPane.prop("primary")).toEqual("second");
    expect(splitPane.prop("allowResize")).toEqual(true);
    expect(wrapper.find(SplitPane).at(0).find("#srcContainer").length).toEqual(1);
    expect(wrapper.find(SplitPane).at(0).find("#entityContainer").length).toEqual(1);
  });

  test("Enzyme tests with no source data", () => {
    let noDataMessage = "Unable to find source records using the specified collection or query." +
      "Load some data that mapping can use as reference and/or edit the step settings to use a " +
      "source collection or query that will return some results.";
    //wrapper.setProps({sourceData: []});
    expect(wrapper.find("#noData").length).toEqual(1);
    expect(wrapper.find(".emptyText").text().includes(noDataMessage)).toBeTruthy();
    expect(wrapper.find("#dataPresent").length).toEqual(0);
    const splitPane = wrapper.find(SplitPane);
    expect(splitPane).toHaveLength(1);
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

  test("Nested entity data renders properly", async () => {

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
    expect(getByText("artCraft")).toBeInTheDocument();
    expect(getByText("automobile")).toBeInTheDocument();
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

    let getByTestId, getAllByText, getAllByRole, queryByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByTestId = renderResults.getByTestId;
      getAllByText = renderResults.getAllByText;
      getAllByRole = renderResults.getAllByRole;
      queryByTestId = renderResults.queryByTestId;
    });

    let sourceSelector = await waitForElement(() => getByTestId("itemTypes-listIcon"));

    //corresponds to 'itemTypes' source selector
    fireEvent.click(sourceSelector);

    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    let firstName = getAllByText("FirstNamePreferred");
    expect(firstName.length).toEqual(2);

    let lastName = getAllByText("LastName");
    expect(lastName.length).toEqual(2);

    let inputBox = getAllByText(
      (_content, element) =>
        element.className !== null &&
        element.className === "ant-select-search__field"
    )[0];

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

    let getByText, getByTestId, getAllByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
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
    await waitForElement(() => getByText("Multiple"));
    fireEvent.mouseOver(getByTestId("nutFreeName-optionIcon"));
    await waitForElement(() => getByText("Multiple"));

  });

  test("XML source data with objects - Right display of objects and icons in source dropdown", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    mockGetMapArtifactByName.mockResolvedValue({status: 200, data: mappingStep.artifacts[0]});
    mockGetUris.mockResolvedValue({status: 200, data: data.mapProps.docUris});
    mockGetSourceDoc.mockResolvedValue({status: 200, data: data.xmlSourceDataMultipleSiblings});
    mockGetNestedEntities.mockResolvedValue({status: 200, data: personNestedEntityDef});
    mockUpdateMapArtifact.mockResolvedValueOnce({status: 200, data: true});

    let getByText, getByTestId, getAllByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
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
    await waitForElement(() => getByText("Multiple"));
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
    expect(firstName[1]).toHaveStyle("line-height: 2vh; text-indent: 20px;");

    //Verify Array icon is present when item has no children but value was an Array of simple values.
    expect(getByTestId("proteinDog-optionIcon")).toHaveAttribute("src", "icon_array.png");

    //Verify tooltip for Array icon
    fireEvent.mouseOver(getByTestId("proteinDog-optionIcon"));
    await waitForElement(() => getByText("Multiple"));

    //Click on 'FirstNamePreferred'
    fireEvent.click(firstName[1]);

    //mapping is saved
    expect(await (waitForElement(() => getByTestId("successMessage"), {"timeout": 200})));

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

    let getByText, getByTestId, getAllByText, getAllByRole, getAllByTestId;
    await act(async () => {
      const renderResults = renderWithRouter(personMappingStepWithData, authorityService);
      getByText = renderResults.getByText;
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
    expect(lastName[1]).toHaveStyle("line-height: 2vh; text-indent: 40px;");

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
    await waitForElement(() => getByText("Multiple"));

    //Click on 'FirstNamePreferred'
    fireEvent.click(lastName[1]);

    //mapping is saved
    expect(await (waitForElement(() => getByTestId("successMessage"), {"timeout": 200})));

    let mapExp = getByTestId("itemTypes-mapexpression");
    //Right Xpath is populated
    expect(mapExp).toHaveTextContent("sampleProtein/nutFree:name/LastName");

    //Right Xpath population for namespaced option representing array of values
    sourceSelector = getByTestId("items-listIcon");
    fireEvent.click(sourceSelector);
    await (waitForElement(() => getAllByRole("option"), {"timeout": 200}));
    let proteinDogOption = (getAllByTestId("nutFree:proteinDog-option"));
    expect(proteinDogOption.length).toEqual(2);
    fireEvent.click(proteinDogOption[1]);
    mapExp = getByTestId("items-mapexpression");
    expect(mapExp).toHaveTextContent("sampleProtein/nutFree:proteinDog");

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
    fireEvent.click(firstName[2]);
    //mapping is saved
    await wait(() => expect(findByTestId("successMessage")));
    if (queryByTestId("successMessage")) {
      await (waitForElementToBeRemoved(() => (queryByTestId("successMessage"))));
    }

    mapExp = getByTestId("itemTypes-mapexpression");

    //Right Xpath is populated (and not nutFreeName/FirstNamePreferred since sourceContext is set)
    expect(mapExp).toHaveTextContent("FirstNamePreferred");
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
    fireEvent.change(getByTestId("uri-input"), {target: {value: "/dummy/uri/person-102.json"}});
    fireEvent.click(getByLabelText("icon: close"));
    expect(getByText("/dummy/uri/person-101.json")).toBeInTheDocument();

    //verify save case
    expect(getByText("/dummy/uri/person-101.json")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("uri-edit"));
    fireEvent.click(getByTestId("pencil-icon"));
    fireEvent.change(getByTestId("uri-input"), {target: {value: "/dummy/uri/person-102.json"}});
    fireEvent.click(getByLabelText("icon: check"));
    await (waitForElement(() => getByText("/dummy/uri/person-102.json")));
    expect(getByText("/dummy/uri/person-102.json")).toBeInTheDocument();
  });
});
