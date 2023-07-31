import React from "react";
import {render, screen, fireEvent, cleanup, wait} from "@testing-library/react";
import {waitFor} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import PropertyTable from "./property-table";
import {entityReferences, primaryEntityTypes, updateEntityModels} from "../../../api/modeling";
import curateData from "../../../assets/mock-data/curation/flows.data";
import {ConfirmationType} from "../../../types/common-types";
import {getSystemInfo} from "../../../api/environment";
import {ModelingContext} from "../../../util/modeling-context";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {
  propertyTableEntities,
  referencePayloadEmpty,
  referencePayloadSteps,
  referencePayloadForeignKey,
} from "../../../assets/mock-data/modeling/modeling";
import {entityNamesArray} from "../../../assets/mock-data/modeling/modeling-context-mock";
import axiosInstance from "@config/axios";

jest.mock("../../../api/modeling");
jest.mock("../../../api/environment");

const mockEntityReferences = entityReferences as jest.Mock;
const mockPrimaryEntityTypes = primaryEntityTypes as jest.Mock;
const mockGetSystemInfo = getSystemInfo as jest.Mock;
const mockUpdateEntityModels = updateEntityModels as jest.Mock;

jest.mock("@config/axios");

beforeEach(() => {
  axiosInstance.get["mockImplementationOnce"](jest.fn(() => Promise.resolve({})));
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe("Entity Modeling Property Table Component", () => {
  window.scrollTo = jest.fn();
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Property Table renders an Entity with no properties, no writer role", () => {
    let entityName = "NewEntity";
    let definitions = {NewEntity: {properties: {}}};
    const {getByText, getByLabelText} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={false}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    expect(getByText("Add Entity Property")).toBeInTheDocument();
    expect(getByText("Entity Property Name")).toBeInTheDocument();
    expect(getByText("Multiple")).toBeInTheDocument();
    expect(getByText("Sort")).toBeInTheDocument();
    //expect(getByText('Wildcard Search')).toBeInTheDocument();
    expect(getByLabelText("NewEntity-add-property")).toBeDisabled();
  });

  test("Add Property button disabled if user has model reader role", () => {
    let entityName = "NewEntity";
    let definitions = {NewEntity: {properties: {}}};
    const {getByText, getByLabelText} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={false}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    expect(getByText("Add Entity Property")).toBeInTheDocument();
    expect(getByLabelText("NewEntity-add-property")).toBeDisabled();
  });

  test("Add Property button enabled if user has model writer role", () => {
    let entityName = "NewEntity";
    let definitions = {NewEntity: {properties: {}}};
    const {getByText, getByLabelText} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    expect(getByText("Add Entity Property")).toBeInTheDocument();
    expect(getByLabelText("NewEntity-add-property")).toBeEnabled();
  });

  test("Property Table renders in side panel view with less columns as designed", async () => {
    let entityName = propertyTableEntities[0].entityName;
    let definitions = propertyTableEntities[0].model.definitions;

    const {queryByLabelText, getByText, rerender, getByTestId} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={true}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    expect(getByText("Add Entity Property")).toBeInTheDocument();
    expect(queryByLabelText("propertyName-header")).toBeInTheDocument();
    expect(queryByLabelText("type-header")).toBeInTheDocument();
    expect(queryByLabelText("delete-header")).toBeInTheDocument();

    expect(queryByLabelText("add-header")).not.toBeInTheDocument();
    expect(queryByLabelText("multiple-header")).not.toBeInTheDocument();
    expect(queryByLabelText("sort-header")).not.toBeInTheDocument();
    expect(queryByLabelText("identifier-header")).not.toBeInTheDocument();
    expect(queryByLabelText("pii-header")).not.toBeInTheDocument();
    expect(queryByLabelText("facet-header")).not.toBeInTheDocument();

    //Rerender with structured model to verify that "Add" column appears only when there are structured types
    let entityNameStruct = propertyTableEntities[2].entityName;
    let definitionsStruct = propertyTableEntities[2].model.definitions;
    rerender(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityNameStruct}
        definitions={definitionsStruct}
        sidePanelView={true}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    expect(getByText("Add Entity Property")).toBeInTheDocument();
    expect(queryByLabelText("propertyName-header")).toBeInTheDocument();
    expect(queryByLabelText("type-header")).toBeInTheDocument();
    expect(queryByLabelText("delete-header")).toBeInTheDocument();
    expect(queryByLabelText("add-header")).toBeInTheDocument();

    expect(queryByLabelText("multiple-header")).not.toBeInTheDocument();
    expect(queryByLabelText("sort-header")).not.toBeInTheDocument();
    expect(queryByLabelText("identifier-header")).not.toBeInTheDocument();
    expect(queryByLabelText("pii-header")).not.toBeInTheDocument();
    expect(queryByLabelText("facet-header")).not.toBeInTheDocument();

    fireEvent.mouseOver(getByTestId("structured-shipping"));
    await wait(() => expect(screen.getByText(ModelingTooltips.structuredType)).toBeInTheDocument());

    fireEvent.mouseOver(getByTestId("multiple-icon-nicknames"));
    await wait(() => expect(screen.getByText(ModelingTooltips.multipleIconTooltip)).toBeInTheDocument());
  });

  test("Property Table renders with basic datatypes, with writer role & hover text shows", async () => {
    let entityName = propertyTableEntities[0].entityName;
    let definitions = propertyTableEntities[0].model.definitions;
    const {getByText, getByTestId, getByLabelText} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    fireEvent.mouseOver(getByLabelText("identifier-header"));
    await wait(() => expect(screen.getByText(ModelingTooltips.identifier)).toBeInTheDocument());

    fireEvent.mouseOver(getByLabelText("multiple-header"));
    await wait(() => expect(screen.getByText(ModelingTooltips.multiple)).toBeInTheDocument());

    fireEvent.mouseOver(getByLabelText("sort-header"));
    await wait(() => expect(screen.getByText(ModelingTooltips.sort)).toBeInTheDocument());

    fireEvent.mouseOver(getByLabelText("facet-header"));
    await wait(() => expect(screen.getByText(ModelingTooltips.facet)).toBeInTheDocument());

    // fireEvent.mouseOver(getByLabelText('wildcard-header'));
    // await wait (() => expect(screen.getByText(ModelingTooltips.wildcard)).toBeInTheDocument());

    fireEvent.mouseOver(getByLabelText("pii-header"));
    await wait(() => expect(screen.getByText(ModelingTooltips.pii)).toBeInTheDocument());

    expect(getByTestId("identifier-concept_name")).toBeInTheDocument();
    expect(getByTestId("multiple-synonyms")).toBeInTheDocument();
    expect(getByTestId("pii-source_concept_code")).toBeInTheDocument();
    // expect(getByTestId('wildcard-vocabulary')).toBeInTheDocument();

    expect(getByText("invalid_reason")).toBeInTheDocument();
    expect(getByText("vocabulary")).toBeInTheDocument();
    expect(getByText("synonyms")).toBeInTheDocument();
    expect(getByText("unsignedLong")).toBeInTheDocument();

    userEvent.click(getByLabelText("Concept-add-property"));
    expect(getByText("Entity Type:")).toBeInTheDocument();
    expect(getByLabelText("property-modal-submit")).toBeInTheDocument();
    expect(getByLabelText("property-modal-cancel")).toBeInTheDocument();
  });

  test("Property Table renders with structured and external datatypes to verify that the tooltips show up", async () => {
    let entityName = propertyTableEntities[2].entityName;
    let definitions = propertyTableEntities[2].model.definitions;
    const {getByText, getByTestId} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    fireEvent.mouseOver(getByTestId("shipping-shipping-tooltip-trigger"));
    await wait(() => expect(getByText(ModelingTooltips.entityPropertyName)).toBeInTheDocument());

    fireEvent.mouseOver(getByTestId("add-struct-shipping"));
    await wait(() => expect(getByText(ModelingTooltips.addStructuredProperty)).toBeInTheDocument());

    fireEvent.mouseOver(getByTestId("delete-Customer-shipping"));
    await wait(() => expect(getByText(ModelingTooltips.deleteProperty)).toBeInTheDocument());
  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test("Property Table renders with structured and external datatypes, no writer role", async () => {
    let entityName = propertyTableEntities[2].entityName;
    let definitions = propertyTableEntities[2].model.definitions;
    const {getByText, getByTestId, getAllByText, getAllByTestId, getByLabelText, queryByTestId, getAllByLabelText} =
      render(
        <PropertyTable
          canReadEntityModel={true}
          canWriteEntityModel={false}
          entityName={entityName}
          definitions={definitions}
          sidePanelView={false}
          updateSavedEntity={jest.fn()}
          dataModel={[]}
        />,
      );

    expect(getByLabelText("Customer-add-property")).toBeDisabled();
    expect(getByTestId("identifier-customerId")).toBeInTheDocument();
    expect(getAllByTestId("multiple-icon-orders")[0]).toBeInTheDocument();
    expect(getByTestId("add-struct-shipping")).toBeInTheDocument();
    expect(getByTestId("add-struct-billing")).toBeInTheDocument();
    expect(queryByTestId("customerId-customerId-span")).toBeNull();

    expect(getAllByLabelText("Property-name")[0]).toBeInTheDocument();
    expect(getByText("integer")).toBeInTheDocument();
    expect(getByText("birthDate")).toBeInTheDocument();
    expect(getByText("billing")).toBeInTheDocument();
    expect(getByText("shipping")).toBeInTheDocument();

    expect(getAllByText("string")).toHaveLength(3);
    expect(getAllByText("Address")).toHaveLength(2);

    // Table expansion shipping property -> Address Structure type
    const shippingExpandIcon = getByTestId("shipping-expand-icon");
    userEvent.click(shippingExpandIcon);

    expect(getByTestId("add-struct-zip")).toBeInTheDocument();
    expect(getAllByText(/zip/i)).toHaveLength(2);
    expect(getAllByText("street")).toHaveLength(1);
    expect(getAllByText("state")).toHaveLength(1);

    // add property and add struct property display correct tooltip when disabled
    fireEvent.mouseOver(getByText("Add Entity Property"));
    await (() =>
      expect(
        screen.getByText(ModelingTooltips.addProperty + " " + ModelingTooltips.noWriteAccess),
      ).toBeInTheDocument());
    fireEvent.mouseOver(getByTestId("add-struct-zip"));
    await (() =>
      expect(
        screen.getByText(ModelingTooltips.addStructuredProperty + " " + ModelingTooltips.noWriteAccess),
      ).toBeInTheDocument());

    // Table expansion for zip property -> Zip structure type
    const zipExpandIcon = getByTestId("zip-expand-icon");
    userEvent.click(zipExpandIcon);

    expect(getByText("fiveDigit")).toBeInTheDocument();
    expect(getByText("plusFour")).toBeInTheDocument();

    // Table expansion for billing property, Address structure type
    const billingExpandIcon = getByTestId("billing-expand-icon");
    userEvent.click(billingExpandIcon);

    expect(getAllByTestId("add-struct-zip")).toHaveLength(2);
    expect(getAllByText(/zip/i)).toHaveLength(4);
    expect(getAllByText("street")).toHaveLength(2);
    expect(getAllByText("state")).toHaveLength(2);

    // Table expansion for billing property -> Zip structure type
    const zipBillingExpandIcon = getAllByTestId("zip-expand-icon")[1];
    userEvent.click(zipBillingExpandIcon);

    await (() => expect(getAllByText("fiveDigit")).toHaveLength(2));
    await (() => expect(getAllByText("plusFour")).toHaveLength(2));
    await (() => expect(getAllByText("string")).toHaveLength(10));
  });

  test("Expand/Collapse all works in Property table side panel view", async () => {
    let entityName = propertyTableEntities[2].entityName;
    let definitions = propertyTableEntities[2].model.definitions;
    const {queryByText, getByTestId, getAllByText} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={false}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={true}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    //verify expand all
    fireEvent.click(getByTestId("expandBtn"));

    //all nested properties should be present
    expect(getAllByText("street")).toHaveLength(2);
    expect(getAllByText("state")).toHaveLength(2);
    expect(getAllByText("fiveDigit")).toHaveLength(2);
    expect(getAllByText("plusFour")).toHaveLength(2);

    //verify collapse all
    fireEvent.click(getByTestId("collapseBtn"));

    //all nested properties should not be present
    await wait(() => expect(queryByText("street")).not.toBeInTheDocument());
    await wait(() => expect(queryByText("state")).not.toBeInTheDocument());
    await wait(() => expect(queryByText("fiveDigit")).not.toBeInTheDocument());
    await wait(() => expect(queryByText("plusFour")).not.toBeInTheDocument());
  });

  test("Property Table renders and shows messaging when entity name does not match a definition", async () => {
    let entityName = propertyTableEntities[2].entityName + "-different";
    let definitions = propertyTableEntities[2].model.definitions;
    const {getByLabelText, queryByTestId} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={false}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    expect(getByLabelText(entityName + "-add-property")).toBeDisabled();
    expect(queryByTestId("customerId-span")).not.toBeInTheDocument();
    expect(getByLabelText("titleNoDefinition")).toBeInTheDocument();
  });

  test("can add sortable and facetable Property to the table", async () => {
    mockUpdateEntityModels.mockResolvedValue({status: 200, data: curateData.primaryEntityTypes.data});

    let entityName = propertyTableEntities[2].entityName;
    let definitions = propertyTableEntities[2].model.definitions;
    const {getByTestId, getByLabelText} = render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyTable
          canReadEntityModel={true}
          canWriteEntityModel={true}
          entityName={entityName}
          definitions={definitions}
          sidePanelView={false}
          updateSavedEntity={mockUpdateEntityModels}
          dataModel={[]}
        />
      </ModelingContext.Provider>,
    );

    // Verify facet & sort checkmarks render in the table
    expect(getByTestId("sort-customerId")).toBeInTheDocument();
    expect(getByTestId("facet-birthDate")).toBeInTheDocument();
    expect(getByTestId("sort-birthDate")).toBeInTheDocument();
    expect(getByTestId("facet-status")).toBeInTheDocument();

    userEvent.click(getByLabelText("Customer-add-property"));
    userEvent.clear(screen.getByLabelText("input-name"));
    userEvent.type(screen.getByLabelText("input-name"), "altName");

    await (() => userEvent.click(screen.getByPlaceholderText("Select the property type")));
    await (() => userEvent.click(screen.getByText("dateTime")));

    const facetableCheckbox: any = await (() => screen.getByLabelText("Facet"));
    await (() => fireEvent.change(facetableCheckbox, {target: {checked: true}}));
    await (() => expect(facetableCheckbox).toBeChecked());

    const sortableCheckbox: any = await (() => screen.getByLabelText("Sort"));
    await (() => fireEvent.change(sortableCheckbox, {target: {checked: true}}));
    await (() => expect(sortableCheckbox).toBeChecked());

    fireEvent.submit(screen.getByLabelText("input-name"));
    await (() => expect(getByTestId("altName-span")).toBeInTheDocument());
  });

  test("can add a Property to the table and then edit it", async () => {
    let entityName = propertyTableEntities[0].entityName;
    let definitions = propertyTableEntities[0].model.definitions;
    mockUpdateEntityModels.mockResolvedValue({status: 200, data: curateData.primaryEntityTypes.data});
    const {getByTestId} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={mockUpdateEntityModels}
        dataModel={[]}
      />,
    );

    userEvent.click(screen.getByLabelText("Concept-add-property"));
    userEvent.type(screen.getByLabelText("input-name"), "conceptDate");
    await (() => userEvent.click(screen.getByPlaceholderText("Select the property type")));
    await (() => userEvent.click(screen.getByText("dateTime")));

    fireEvent.submit(screen.getByLabelText("input-name"));

    await (() => expect(getByTestId("conceptDate-span")).toBeInTheDocument());
    await (() => userEvent.click(screen.getByTestId("conceptDate-span")));
    await (() => userEvent.clear(screen.getByLabelText("input-name")));
    await (() => userEvent.type(screen.getByLabelText("input-name"), "conception"));

    fireEvent.submit(screen.getByLabelText("input-name"));
    await (() => expect(getByTestId("conception-span")).toBeInTheDocument());
  });

  test("can add a new structured type property to the table and then edit it", async () => {
    mockUpdateEntityModels.mockResolvedValue({status: 200, data: curateData.primaryEntityTypes.data});
    let entityName = propertyTableEntities[0].entityName;
    let definitions = propertyTableEntities[0].model.definitions;
    const {getByTestId} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={mockUpdateEntityModels}
        dataModel={[]}
      />,
    );

    userEvent.click(screen.getByLabelText("Concept-add-property"));
    userEvent.type(screen.getByLabelText("input-name"), "newStructure");
    await (() => userEvent.click(screen.getByPlaceholderText("Select the property type")));
    await (() => userEvent.click(screen.getByText("Structured")));
    await (() => userEvent.click(screen.getByText("New Property Type")));
    await (() => expect(screen.getByText("Add New Structured Property Type")).toBeInTheDocument());
    await (() => userEvent.type(screen.getByLabelText("structured-input-name"), "Product"));
    await (() => fireEvent.submit(screen.getByLabelText("structured-input-name")));

    fireEvent.submit(screen.getByLabelText("input-name"));

    await (() => expect(getByTestId("newStructure-newStructure-span")).toBeInTheDocument());
    await (() => userEvent.click(screen.getByTestId("newStructure-newStructure-span")));
    await (() => userEvent.clear(screen.getByLabelText("input-name")));
    await (() => userEvent.type(screen.getByLabelText("input-name"), "basicName"));
    await (() => userEvent.click(screen.getByLabelText("type-dropdown")));
    await (() => userEvent.click(screen.getByText("More date types")));
    await (() => userEvent.click(screen.getByText("dayTimeDuration")));

    fireEvent.submit(screen.getByLabelText("input-name"));
    await (() => expect(getByTestId("conception-span")).toBeInTheDocument());
  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("can edit a property and change the type from basic to relationship", async () => {
    // Mock population of Join Property menu
    mockPrimaryEntityTypes.mockResolvedValue({status: 200, data: curateData.primaryEntityTypes.data});
    mockUpdateEntityModels.mockResolvedValue({status: 200, data: curateData.primaryEntityTypes.data});

    let entityName = propertyTableEntities[2].entityName;
    let definitions = propertyTableEntities[2].model.definitions;
    const {getByTestId, getByText, getAllByText, getByLabelText} = render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyTable
          canReadEntityModel={true}
          canWriteEntityModel={true}
          entityName={entityName}
          definitions={definitions}
          sidePanelView={false}
          updateSavedEntity={mockUpdateEntityModels}
          dataModel={[]}
        />
      </ModelingContext.Provider>,
    );

    expect(getByTestId("identifier-customerId")).toBeInTheDocument();
    expect(getByTestId("multiple-orders")).toBeInTheDocument();
    expect(getByTestId("add-struct-shipping")).toBeInTheDocument();
    expect(getByTestId("add-struct-billing")).toBeInTheDocument();

    // add property and add struct property display correct tooltip when enabled
    fireEvent.mouseOver(getByText("Add Property"));
    await waitFor(() => expect(screen.getByText(ModelingTooltips.addProperty)).toBeInTheDocument());
    fireEvent.mouseOver(getByTestId("add-struct-shipping"));
    await waitFor(() => expect(screen.getByText(ModelingTooltips.addStructuredProperty)).toBeInTheDocument());

    userEvent.click(getByTestId("nicknames-span"));
    userEvent.clear(screen.getByLabelText("input-name"));

    userEvent.type(screen.getByLabelText("input-name"), "altName");

    const multipleRadio = screen.getByLabelText("multiple-yes");
    fireEvent.change(multipleRadio, {target: {value: "yes"}});
    expect(multipleRadio["value"]).toBe("yes");

    const piiRadio = screen.getByLabelText("pii-yes");
    fireEvent.change(piiRadio, {target: {value: "yes"}});
    expect(piiRadio["value"]).toBe("yes");

    // const wildcardCheckbox = screen.getByLabelText('Wildcard Search')
    // fireEvent.change(wildcardCheckbox, { target: { checked: true } });
    // expect(wildcardCheckbox).toBeChecked();

    const facetableCheckbox = screen.getByLabelText("Facet");
    fireEvent.change(facetableCheckbox, {target: {checked: true}});
    expect(facetableCheckbox).toBeChecked();

    fireEvent.submit(screen.getByLabelText("input-name"));
    expect(getByTestId("altName-span")).toBeInTheDocument();
    userEvent.click(screen.getByTestId("altName-span"));

    userEvent.clear(screen.getByLabelText("input-name"));
    userEvent.type(screen.getByLabelText("input-name"), "customerRelationship");
    userEvent.click(screen.getByLabelText("type-dropdown"));
    userEvent.click(screen.getByText("Related Entity"));
    userEvent.click(screen.getAllByText("Customer")[1]);

    // Choose join property after menu is populated
    userEvent.click(getByLabelText("foreignKey-select"));
    expect(mockPrimaryEntityTypes).toBeCalledTimes(1);
    await waitFor(() => userEvent.click(getAllByText("customerId")[1]));

    userEvent.click(getByLabelText("property-modal-submit"));
    await waitFor(() => expect(getByTestId("customerRelationship-span")).toBeInTheDocument());
    userEvent.click(screen.getByTestId("customerRelationship-span"));

    expect(getByText("customerRelationship")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("foreign-customerRelationship"));
    await waitFor(() => expect(document.querySelector("#foreignKeyTooltip-customerRelationship")).toBeInTheDocument());

    fireEvent.mouseOver(getByTestId("relationship-customerRelationship"));
    await waitFor(() =>
      expect(document.querySelector("#relationshipTooltip-customerRelationship")).toBeInTheDocument(),
    );
    expect(screen.getByText("integer (Customer) [ ]")).toBeInTheDocument();

    userEvent.clear(screen.getByLabelText("input-name"));
    userEvent.type(screen.getByLabelText("input-name"), "basicID");
    userEvent.click(screen.getByLabelText("type-dropdown"));
    userEvent.click(screen.getAllByText("integer")[0]);
    fireEvent.submit(screen.getByLabelText("input-name"));
    await waitFor(() => expect(getByTestId("basicID-span")).toBeInTheDocument());
  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("can delete a basic property from the table", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadEmpty});
    mockUpdateEntityModels.mockResolvedValue({status: 200, data: curateData.primaryEntityTypes.data});

    let entityName = propertyTableEntities[0].entityName;
    let definitions = propertyTableEntities[0].model.definitions;
    const {getByTestId} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={mockUpdateEntityModels}
        dataModel={[]}
      />,
    );
    userEvent.click(getByTestId("delete-Concept-domain"));
    await waitFor(() => expect(screen.getByLabelText("delete-property-text")).toBeInTheDocument());
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeletePropertyWarn}-yes`));
    expect(mockEntityReferences).toBeCalledTimes(1);
    await waitFor(() => expect(screen.queryByTestId("domain-span")).toBeNull());
    expect(mockGetSystemInfo).toBeCalledTimes(1);
    await waitFor(() => expect(screen.queryByTestId("domain-span")).toBeNull());
  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("can delete a property that is type structured from the table", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadEmpty});
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});

    let entityName = propertyTableEntities[1].entityName;
    let definitions = propertyTableEntities[1].model.definitions;
    const {getByTestId} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    userEvent.click(getByTestId("delete-Order-address"));

    await waitFor(() => expect(screen.getByLabelText("delete-property-text")).toBeInTheDocument());
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeletePropertyWarn}-yes`));
    expect(mockEntityReferences).toBeCalledTimes(1);
    expect(screen.queryByTestId("address-span")).toBeNull();
    expect(mockGetSystemInfo).toBeCalledTimes(1);
    expect(screen.queryByTestId("address-span")).toBeNull();
  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("can delete a property from a structured type from the table", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadSteps});
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});

    let entityName = propertyTableEntities[2].entityName;
    let definitions = propertyTableEntities[2].model.definitions;
    const {getByTestId} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );
    userEvent.click(getByTestId("delete-Customer-Address-shipping-city"));

    await waitFor(() => expect(screen.getByLabelText("delete-property-step-text")).toBeInTheDocument());
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeletePropertyStepWarn}-yes`));
    expect(mockEntityReferences).toBeCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
    await waitFor(() => expect(screen.queryByTestId("shipping-city-span")).toBeNull());
  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("cannot delete a property that's a foreign key", async () => {
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadForeignKey});

    let entityName = propertyTableEntities[0].entityName;
    let definitions = propertyTableEntities[0].model.definitions;
    const {getByTestId} = render(
      <PropertyTable
        canReadEntityModel={true}
        canWriteEntityModel={true}
        entityName={entityName}
        definitions={definitions}
        sidePanelView={false}
        updateSavedEntity={jest.fn()}
        dataModel={[]}
      />,
    );

    userEvent.click(getByTestId("delete-Concept-synonyms"));

    await waitFor(() => expect(screen.getByLabelText("delete-property-foreign-key-text")).toBeInTheDocument());

    expect(mockEntityReferences).toBeCalledTimes(1);
    expect(
      screen.getByText("Edit the foreign key relationships of these entity types before deleting this property."),
    ).toBeInTheDocument();
    expect(screen.getByText("Show Entities...")).toBeInTheDocument();
    expect(screen.queryByText("Hide Entities...")).toBeNull();
    userEvent.click(screen.getByLabelText("toggle-entities"));

    expect(screen.getByText("Hide Entities...")).toBeInTheDocument();
    expect(screen.queryByText("Show Entities...")).toBeNull();
    expect(screen.getByTestId("entityPropertyWithForeignKeyReferences")).toHaveTextContent(
      referencePayloadForeignKey.entityNamesWithForeignKeyReferences[0],
    );
    expect(screen.getByTestId("entityPropertyWithForeignKeyReferences")).toHaveTextContent(
      referencePayloadForeignKey.entityNamesWithForeignKeyReferences[1],
    );

    userEvent.click(screen.getByLabelText("toggle-entities"));
    expect(screen.getByText("Show Entities...")).toBeInTheDocument();
    expect(screen.queryByText("Hide Entities...")).toBeNull();

    userEvent.click(
      screen.getByLabelText(`confirm-${ConfirmationType.DeleteEntityPropertyWithForeignKeyReferences}-close`),
    );
  });
});
