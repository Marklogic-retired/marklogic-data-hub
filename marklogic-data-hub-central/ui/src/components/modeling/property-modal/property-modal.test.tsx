import React from "react";
import {render, fireEvent, screen, wait} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PropertyModal from "./property-modal";
import {
  StructuredTypeOptions,
  EditPropertyOptions,
  PropertyType,
  PropertyOptions
} from "../../../types/modeling-types";
import {ConfirmationType} from "../../../types/common-types";

import {entityReferences, primaryEntityTypes} from "../../../api/modeling";
import curateData from "../../../assets/mock-data/curation/flows.data";
import {getSystemInfo} from "../../../api/environment";
import {definitionsParser} from "../../../util/data-conversion";
import {propertyTableEntities, referencePayloadEmpty, referencePayloadSteps, referencePayloadStepRelationships} from "../../../assets/mock-data/modeling/modeling";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {ModelingContext} from "../../../util/modeling-context";
import {entityNamesArray, customerEntityNamesArray} from "../../../assets/mock-data/modeling/modeling-context-mock";

jest.mock("../../../api/modeling");
jest.mock("../../../api/environment");

const mockEntityReferences = entityReferences as jest.Mock;
const mockPrimaryEntityTypes = primaryEntityTypes as jest.Mock;
const mockGetSystemInfo = getSystemInfo as jest.Mock;


const DEFAULT_STRUCTURED_TYPE_OPTIONS: StructuredTypeOptions = {
  isStructured: false,
  name: "",
  propertyName: ""
};

const DEFAULT_SELECTED_PROPERTY_OPTIONS: PropertyOptions = {
  propertyType: PropertyType.Basic,
  type: "",
  identifier: "no",
  multiple: "no",
  pii: "no",
  sortable: false,
  facetable: false,
  wildcard: false
};

const DEFAULT_EDIT_PROPERTY_OPTIONS: EditPropertyOptions = {
  name: "",
  isEdit: false,
  propertyOptions: DEFAULT_SELECTED_PROPERTY_OPTIONS
};

describe("Property Modal Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Modal is not visible", () => {
    const {queryByText} =  render(
      <PropertyModal
        entityName=""
        entityDefinitionsArray={[]}
        isVisible={false}
        editPropertyOptions={DEFAULT_EDIT_PROPERTY_OPTIONS}
        structuredTypeOptions={DEFAULT_STRUCTURED_TYPE_OPTIONS}
        toggleModal={jest.fn()}
        addPropertyToDefinition={jest.fn()}
        addStructuredTypeToDefinition={jest.fn()}
        editPropertyUpdateDefinition={jest.fn()}
        deletePropertyFromDefinition={jest.fn()}
      />);

    expect(queryByText("Add Property")).toBeNull();
  });

  test("Add a basic property type and duplicate name validation", () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let mockAdd = jest.fn();

    const {getByLabelText, getByPlaceholderText, getByText, getByTestId} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          editPropertyOptions={DEFAULT_EDIT_PROPERTY_OPTIONS}
          structuredTypeOptions={DEFAULT_STRUCTURED_TYPE_OPTIONS}
          isVisible={true}
          toggleModal={jest.fn()}
          addPropertyToDefinition={mockAdd}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    userEvent.type(getByLabelText("input-name"), "name");
    userEvent.click(getByText("Add"));
    expect(getByTestId("propery-name-error")).toBeInTheDocument();

    userEvent.clear(getByLabelText("input-name"));
    userEvent.type(getByLabelText("input-name"), "new-property-name");

    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("string"));

    // Verify that the default values for Identifier, Multiple and PII properties is "no".
    expect(screen.getByLabelText("identifier-no")).toBeChecked();
    expect(screen.getByLabelText("multiple-no")).toBeChecked();

    const identifierRadio = screen.getByLabelText("identifier-yes");
    fireEvent.change(identifierRadio, {target: {value: "yes"}});
    expect(identifierRadio["value"]).toBe("yes");

    const multipleRadio = screen.getByLabelText("multiple-yes");
    fireEvent.change(multipleRadio, {target: {value: "yes"}});
    expect(multipleRadio["value"]).toBe("yes");

    const piiRadio = screen.getByLabelText("pii-no");
    expect(piiRadio).toBeChecked();
    fireEvent.change(piiRadio, {target: {value: "no"}});
    expect(piiRadio["value"]).toBe("no");

    // const wildcardCheckbox = screen.getByLabelText('Wildcard Search')
    // fireEvent.change(wildcardCheckbox, { target: { checked: true } });
    // expect(wildcardCheckbox).toBeChecked();

    const facetableCheckbox = screen.getByLabelText("Facet");
    fireEvent.change(facetableCheckbox, {target: {checked: true}});
    expect(facetableCheckbox).toBeChecked();

    const sortableCheckbox = screen.getByLabelText("Sort");
    fireEvent.change(sortableCheckbox, {target: {checked: true}});
    expect(sortableCheckbox).toBeChecked();

    userEvent.click(getByText("Add"));
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("Add a Property with relationship type", async () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});
    // Mock population of Join Property menu
    mockPrimaryEntityTypes.mockResolvedValue({status: 200, data: curateData.primaryEntityTypes.data});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let mockAdd = jest.fn();

    const {getByPlaceholderText, getByText, getAllByText, getByLabelText} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={DEFAULT_EDIT_PROPERTY_OPTIONS}
          structuredTypeOptions={DEFAULT_STRUCTURED_TYPE_OPTIONS}
          toggleModal={jest.fn()}
          addPropertyToDefinition={mockAdd}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    userEvent.type(getByPlaceholderText("Enter the property name"), "Entity-Property");

    // Choose related entity type
    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("Related Entity"));
    userEvent.click(getAllByText("Customer")[1]);
    expect(mockPrimaryEntityTypes).toBeCalledTimes(1);

    expect(screen.queryByLabelText("identifier-yes")).toBeNull();
    expect(screen.queryByLabelText("pii-yes")).toBeNull();
    expect(screen.queryByLabelText("Sort")).toBeNull();
    expect(screen.queryByLabelText("Facet")).toBeNull();
    //expect(screen.queryByLabelText('Wildcard Search')).toBeNull();

    expect(getByLabelText("joinProperty-select")).toBeInTheDocument();
    //Join property select field should disappear after selecting a different property type like string
    userEvent.click(getByLabelText("icon: close-circle")); //clear "Customer" from property field
    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("string"));
    expect(screen.queryByLabelText("joinProperty-select")).toBeNull();

    //Try selection of a structured type after selecting related entity type again, join property select should disappear
    userEvent.click(getByLabelText("icon: close-circle")); //clear "string" from property field
    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("Related Entity"));
    userEvent.click(getAllByText("Customer")[1]);
    expect(getByLabelText("joinProperty-select")).toBeInTheDocument();

    userEvent.click(getByLabelText("icon: close-circle")); //clear "Customer" from property field
    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("Structured"));
    userEvent.click(getByText("Address"));
    expect(screen.queryByLabelText("joinProperty-select")).toBeNull();

    //Now go back to related entity type to populate
    userEvent.click(getByLabelText("icon: close-circle")); //clear "Address" from property field
    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("Related Entity"));
    userEvent.click(getAllByText("Customer")[1]);

    // Choose join property after menu is populated
    userEvent.click(getByLabelText("joinProperty-select"));
    expect(mockPrimaryEntityTypes).toBeCalledTimes(3);
    await wait(() => userEvent.click(getByText("customerId")));

    const multipleRadio = screen.getByLabelText("multiple-no");
    fireEvent.change(multipleRadio, {target: {value: "no"}});
    expect(multipleRadio["value"]).toBe("no");

    userEvent.click(getByLabelText("property-modal-submit"));
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("can display error message for property name and type inputs and press cancel", () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let mockAdd = jest.fn();

    const {getByLabelText, getByText, getByPlaceholderText} =  render(
      <PropertyModal
        entityName={entityType?.entityName}
        entityDefinitionsArray={entityDefninitionsArray}
        editPropertyOptions={DEFAULT_EDIT_PROPERTY_OPTIONS}
        structuredTypeOptions={DEFAULT_STRUCTURED_TYPE_OPTIONS}
        isVisible={true}
        toggleModal={jest.fn()}
        addPropertyToDefinition={mockAdd}
        addStructuredTypeToDefinition={jest.fn()}
        editPropertyUpdateDefinition={jest.fn()}
        deletePropertyFromDefinition={jest.fn()}
      />);

    userEvent.type(getByLabelText("input-name"), "123-name");
    userEvent.click(getByText("Add"));
    expect(getByText(ModelingTooltips.nameRegex)).toBeInTheDocument();
    userEvent.clear(getByLabelText("input-name"));

    userEvent.type(getByLabelText("input-name"), "name2");
    userEvent.click(getByText("Add"));
    expect(getByText("Type is required")).toBeInTheDocument();

    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("More string types"));
    userEvent.click(getByText("anyURI"));

    userEvent.click(getByText("Cancel"));
    expect(mockAdd).toHaveBeenCalledTimes(0);
    expect(mockGetSystemInfo).toBeCalledTimes(0);
  });

  test("Add a Property with a structured type, no relationship type in dropdown", () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let mockAdd = jest.fn();

    const {getByPlaceholderText, getByText, getByLabelText} =  render(
      <ModelingContext.Provider value={customerEntityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={DEFAULT_EDIT_PROPERTY_OPTIONS}
          structuredTypeOptions={DEFAULT_STRUCTURED_TYPE_OPTIONS}
          toggleModal={jest.fn()}
          addPropertyToDefinition={mockAdd}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    userEvent.type(getByPlaceholderText("Enter the property name"), "alternate-address");

    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("Structured"));
    userEvent.click(getByText("Address"));

    expect(screen.queryByText("Related Entity")).toBeNull();
    expect(screen.queryByLabelText("identifier-yes")).toBeNull();

    const multipleRadio = screen.getByLabelText("multiple-no");
    fireEvent.change(multipleRadio, {target: {value: "no"}});
    expect(multipleRadio["value"]).toBe("no");

    userEvent.click(getByLabelText("property-modal-submit"));
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("Add a new property to a structured type definition", () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let addMock = jest.fn();

    const {getByPlaceholderText, getByText, getByLabelText, queryByLabelText} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={DEFAULT_EDIT_PROPERTY_OPTIONS}
          structuredTypeOptions={{isStructured: true, name: "propName,Employee", propertyName: ""}}
          toggleModal={jest.fn()}
          addPropertyToDefinition={addMock}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    expect(getByText("Structured Type:")).toBeInTheDocument();
    expect(getByText("Employee")).toBeInTheDocument();

    userEvent.type(getByPlaceholderText("Enter the property name"), "email");

    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("string"));


    const multipleRadio = screen.getByLabelText("multiple-yes");
    fireEvent.change(multipleRadio, {target: {value: "yes"}});
    expect(multipleRadio["value"]).toBe("yes");

    const piiRadio = screen.getByLabelText("pii-yes");
    fireEvent.change(piiRadio, {target: {value: "yes"}});
    expect(piiRadio["value"]).toBe("yes");
    expect(queryByLabelText("Sort")).toBeInTheDocument();
    expect(queryByLabelText("Facet")).toBeInTheDocument();
    // const wildcardCheckbox = screen.getByLabelText('Wildcard Search')
    // fireEvent.change(wildcardCheckbox, { target: { checked: true } });
    // expect(wildcardCheckbox).toBeChecked();

    userEvent.click(getByLabelText("property-modal-submit"));
    expect(addMock).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("Add a Property with relationship type to a structured type definition", async () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});
    // Mock population of Join Property menu
    mockPrimaryEntityTypes.mockResolvedValue({status: 200, data: curateData.primaryEntityTypes.data});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let addMock = jest.fn();

    const {getByPlaceholderText, getByText, getAllByText, getByLabelText} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={DEFAULT_EDIT_PROPERTY_OPTIONS}
          structuredTypeOptions={{isStructured: true, name: "propName,Employee", propertyName: ""}}
          toggleModal={jest.fn()}
          addPropertyToDefinition={addMock}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    expect(getByText("Structured Type:")).toBeInTheDocument();
    expect(getByText("Employee")).toBeInTheDocument();

    userEvent.type(getByPlaceholderText("Enter the property name"), "email");

    // Choose related entity type
    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("Related Entity"));
    userEvent.click(getAllByText("Customer")[1]);
    expect(mockPrimaryEntityTypes).toBeCalledTimes(1);

    // Choose join property after menu is populated
    userEvent.click(getByLabelText("joinProperty-select"));
    expect(mockPrimaryEntityTypes).toBeCalledTimes(1);
    await wait(() => userEvent.click(getByText("customerId")));

    userEvent.click(getByLabelText("property-modal-submit"));
    expect(addMock).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("Add a Property with a newly created structured type", () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let addMock = jest.fn();

    const {getByPlaceholderText, getByText, getByLabelText, queryByLabelText} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={DEFAULT_EDIT_PROPERTY_OPTIONS}
          structuredTypeOptions={DEFAULT_STRUCTURED_TYPE_OPTIONS}
          toggleModal={jest.fn()}
          addPropertyToDefinition={addMock}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    userEvent.type(getByPlaceholderText("Enter the property name"), "alternate-address");

    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("Structured"));
    userEvent.click(getByText("New Property Type"));

    expect(screen.getByText("Add New Structured Property Type")).toBeInTheDocument();
    userEvent.type(screen.getByLabelText("structured-input-name"), "Product");

    fireEvent.submit(screen.getByLabelText("structured-input-name"));

    expect(getByText("Product")).toBeInTheDocument();

    const multipleRadio = screen.getByLabelText("multiple-yes");
    fireEvent.change(multipleRadio, {target: {value: "yes"}});
    expect(multipleRadio["value"]).toBe("yes");

    const piiRadio = screen.getByLabelText("pii-yes");
    fireEvent.change(piiRadio, {target: {value: "yes"}});
    expect(piiRadio["value"]).toBe("yes");

    expect(queryByLabelText("Sort")).toBeNull();
    expect(queryByLabelText("Facet")).toBeNull();
    userEvent.click(getByLabelText("property-modal-submit"));
    expect(addMock).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("Add an identifier to a new Property", () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Order");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let addMock = jest.fn();

    const {getByPlaceholderText, getByText, getByLabelText} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={DEFAULT_EDIT_PROPERTY_OPTIONS}
          structuredTypeOptions={DEFAULT_STRUCTURED_TYPE_OPTIONS}
          toggleModal={jest.fn()}
          addPropertyToDefinition={addMock}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );
    userEvent.type(getByPlaceholderText("Enter the property name"), "newId");

    userEvent.click(getByPlaceholderText("Select the property type"));
    userEvent.click(getByText("string"));

    const identifierRadio = screen.getByLabelText("identifier-yes");
    fireEvent.change(identifierRadio, {target: {value: "yes"}});
    expect(identifierRadio["value"]).toBe("yes");

    userEvent.click(getByLabelText("property-modal-submit"));
    expect(addMock).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("can edit a basic property with step warning, but cancel changes", async () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadStepRelationships});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let editMock = jest.fn();

    const basicPropertyOptions: PropertyOptions = {
      propertyType: PropertyType.Basic,
      type: "integer",
      identifier: "yes",
      multiple: "no",
      pii: "yes",
      sortable: false,
      facetable: false,
      wildcard: true
    };

    const editPropertyOptions: EditPropertyOptions = {
      name: "customerId",
      isEdit: true,
      propertyOptions: basicPropertyOptions
    };

    const {getByLabelText, getByText, queryByText} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={editPropertyOptions}
          structuredTypeOptions={{isStructured: true, name: "propName,Employee", propertyName: ""}}
          toggleModal={jest.fn()}
          addPropertyToDefinition={jest.fn()}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={editMock}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );


    expect(mockEntityReferences).toBeCalledWith(entityType?.entityName);
    expect(mockEntityReferences).toBeCalledTimes(1);

    await wait(() =>
      expect(getByText("Show Steps...")).toBeInTheDocument()
    );

    expect(queryByText("Hide Steps...")).toBeNull();
    userEvent.click(getByLabelText("toggle-steps"));
    expect(getByText("Hide Steps...")).toBeInTheDocument();
    expect(queryByText("Show Steps...")).toBeNull();
    expect(getByText("Order-Load")).toBeInTheDocument();
    expect(getByText("Order-Map")).toBeInTheDocument();

    expect(getByText("Edit Property")).toBeInTheDocument();

    expect(screen.getByLabelText("multiple-no")).toBeChecked(); //default value

    const multipleRadio = screen.getByLabelText("multiple-yes");
    expect(multipleRadio["value"]).toBe("yes");

    const piiRadio = screen.getByLabelText("pii-yes");
    expect(piiRadio["value"]).toBe("yes");

    // const wildcardCheckbox = screen.getByLabelText('Wildcard Search')
    // expect(wildcardCheckbox).toBeChecked();

    fireEvent.change(multipleRadio, {target: {value: "no"}});
    expect(multipleRadio["value"]).toBe("no");

    // fireEvent.change(wildcardCheckbox, { target: { checked: false } });
    // expect(wildcardCheckbox).toHaveProperty("checked", false);

    userEvent.click(getByLabelText("property-modal-cancel"));
    expect(editMock).toHaveBeenCalledTimes(0);
    expect(mockGetSystemInfo).toBeCalledTimes(0);
  });

  test("can edit a relationship property", async () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadEmpty});
    // Mock population of Join Property menu
    mockPrimaryEntityTypes.mockResolvedValue({status: 200, data: curateData.primaryEntityTypes.data});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let editMock = jest.fn();

    const relationshipPropertyOptions: PropertyOptions = {
      propertyType: PropertyType.RelatedEntity,
      type: "integer",
      joinPropertyName: "customerId",
      joinPropertyType: "Customer",
      identifier: "no",
      multiple: "yes",
      pii: "no",
      sortable: false,
      facetable: false
      //wildcard: false
    };

    const editPropertyOptions: EditPropertyOptions = {
      name: "order",
      isEdit: true,
      propertyOptions: relationshipPropertyOptions
    };

    const {getByLabelText, getByText, queryByText} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={editPropertyOptions}
          structuredTypeOptions={{isStructured: true, name: "propName,Employee", propertyName: ""}}
          toggleModal={jest.fn()}
          addPropertyToDefinition={jest.fn()}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={editMock}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    expect(mockEntityReferences).toBeCalledWith(entityType?.entityName);
    expect(mockEntityReferences).toBeCalledTimes(1);

    // Population of Join Property menu
    expect(mockPrimaryEntityTypes).toBeCalledTimes(1);

    expect(queryByText("Show Steps...")).toBeNull();
    expect(queryByText("Hide Steps...")).toBeNull();

    expect(getByText("Edit Property")).toBeInTheDocument();

    // Change Join Property
    expect(getByText("customerId")).toBeInTheDocument();
    userEvent.click(getByLabelText("joinProperty-select"));
    await wait(() => userEvent.click(getByText("name")));

    const multipleRadio = screen.getByLabelText("multiple-yes");
    expect(multipleRadio["value"]).toBe("yes");

    fireEvent.change(multipleRadio, {target: {value: "no"}});
    expect(multipleRadio["value"]).toBe("no");

    userEvent.click(getByLabelText("property-modal-submit"));
    expect(editMock).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("can edit a structured type property and change property name", async () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadSteps});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let editMock = jest.fn();

    const structuredPropertyOptions: PropertyOptions = {
      propertyType: PropertyType.Structured,
      type: "Address",
      identifier: "no",
      multiple: "yes",
      pii: "no",
      sortable: false,
      facetable: false
      //wildcard: false
    };

    const editPropertyOptions: EditPropertyOptions = {
      name: "shipping",
      isEdit: true,
      propertyOptions: structuredPropertyOptions
    };

    const structuredOptions: StructuredTypeOptions = {
      isStructured: true,
      name: "Address",
      propertyName: "shipping"
    };

    const {getByLabelText, getByText, getByPlaceholderText, queryByText, queryByLabelText} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={editPropertyOptions}
          structuredTypeOptions={structuredOptions}
          toggleModal={jest.fn()}
          addPropertyToDefinition={jest.fn()}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={editMock}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    expect(mockEntityReferences).toBeCalledWith(entityType?.entityName);
    expect(mockEntityReferences).toBeCalledTimes(1);

    await wait(() =>
      expect(getByText("Show Steps...")).toBeInTheDocument()
    );

    expect(queryByText("Hide Steps...")).toBeNull();
    userEvent.click(getByLabelText("toggle-steps"));
    expect(getByText("Hide Steps...")).toBeInTheDocument();
    expect(queryByText("Show Steps...")).toBeNull();
    expect(getByText("Order-Load")).toBeInTheDocument();
    expect(getByText("Order-Map")).toBeInTheDocument();

    expect(getByText("Edit Property")).toBeInTheDocument();

    userEvent.clear(getByPlaceholderText("Enter the property name"));
    userEvent.type(getByPlaceholderText("Enter the property name"), "alt_shipping");

    const multipleRadio = screen.getByLabelText("multiple-yes");
    expect(multipleRadio["value"]).toBe("yes");

    fireEvent.change(multipleRadio, {target: {value: "no"}});
    expect(multipleRadio["value"]).toBe("no");

    const piiRadio = screen.getByLabelText("pii-yes");
    fireEvent.change(piiRadio, {target: {value: "yes"}});
    expect(piiRadio["value"]).toBe("yes");

    expect(queryByLabelText("Sort")).toBeInTheDocument();
    expect(queryByLabelText("Facet")).toBeInTheDocument();

    userEvent.click(getByLabelText("property-modal-submit"));
    expect(editMock).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("can edit a basic property from a structured type", () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadEmpty});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let editMock = jest.fn();

    const structuredPropertyOptions: PropertyOptions = {
      propertyType: PropertyType.Basic,
      type: "gMonth",
      identifier: "no",
      multiple: "no",
      pii: "yes",
      sortable: false,
      facetable: false
      //wildcard: true
    };

    const editPropertyOptions: EditPropertyOptions = {
      name: "state",
      isEdit: true,
      propertyOptions: structuredPropertyOptions
    };

    const structuredOptions: StructuredTypeOptions = {
      isStructured: true,
      name: "Address",
      propertyName: "address"
    };

    const {getByLabelText, getByText, getByPlaceholderText, queryByText} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={editPropertyOptions}
          structuredTypeOptions={structuredOptions}
          toggleModal={jest.fn()}
          addPropertyToDefinition={jest.fn()}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={editMock}
          deletePropertyFromDefinition={jest.fn()}
        />
      </ModelingContext.Provider>
    );

    expect(mockEntityReferences).toBeCalledWith(entityType?.entityName);
    expect(mockEntityReferences).toBeCalledTimes(1);

    expect(queryByText("Show Steps...")).toBeNull();
    expect(queryByText("Hide Steps...")).toBeNull();

    expect(getByText("Edit Property")).toBeInTheDocument();
    expect(getByText("Structured Type:")).toBeInTheDocument();

    userEvent.clear(getByPlaceholderText("Enter the property name"));
    userEvent.type(getByPlaceholderText("Enter the property name"), "county");

    const piiRadio = screen.getByLabelText("pii-yes");
    expect(piiRadio["value"]).toBe("yes");

    // const wildcardCheckbox = screen.getByLabelText('Wildcard Search')
    // expect(wildcardCheckbox).toBeChecked();

    fireEvent.change(piiRadio, {target: {value: "no"}});
    expect(piiRadio["value"]).toBe("no");

    // fireEvent.change(wildcardCheckbox, { target: { checked: false } });
    // expect(wildcardCheckbox).toHaveProperty("checked", false);

    userEvent.click(getByLabelText("property-modal-submit"));
    expect(editMock).toHaveBeenCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("can delete a property", async () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadEmpty});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let deleteMock = jest.fn();

    const basicPropertyOptions: PropertyOptions = {
      propertyType: PropertyType.Basic,
      type: "integer",
      identifier: "yes",
      multiple: "no",
      pii: "yes",
      sortable: false,
      facetable: false
      //wildcard: true
    };

    const editPropertyOptions: EditPropertyOptions = {
      name: "customerId",
      isEdit: true,
      propertyOptions: basicPropertyOptions
    };

    const {getByText, getByTestId} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={editPropertyOptions}
          structuredTypeOptions={DEFAULT_STRUCTURED_TYPE_OPTIONS}
          toggleModal={jest.fn()}
          addPropertyToDefinition={jest.fn()}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={deleteMock}
        />
      </ModelingContext.Provider>
    );

    expect(getByText("Edit Property")).toBeInTheDocument();

    userEvent.click(getByTestId(`delete-${editPropertyOptions.name}`));
    expect(mockEntityReferences).toBeCalledWith(entityType?.entityName);
    expect(mockEntityReferences).toBeCalledTimes(2);

    await wait(() =>
      expect(screen.getByLabelText("delete-property-text")).toBeInTheDocument(),
    );
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeletePropertyWarn}-yes`));
    expect(deleteMock).toBeCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("can delete a structured property with step warning", async () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadSteps});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let deleteMock = jest.fn();

    const basicPropertyOptions: PropertyOptions = {
      propertyType: PropertyType.Basic,
      type: "short",
      identifier: "no",
      multiple: "yes",
      pii: "no",
      sortable: false,
      facetable: false
      //wildcard: false
    };

    const editPropertyOptions: EditPropertyOptions = {
      name: "street",
      isEdit: true,
      propertyOptions: basicPropertyOptions
    };


    const structuredOptions: StructuredTypeOptions = {
      isStructured: true,
      name: "Address",
      propertyName: "address"
    };

    const {getByText, getByTestId} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={editPropertyOptions}
          structuredTypeOptions={structuredOptions}
          toggleModal={jest.fn()}
          addPropertyToDefinition={jest.fn()}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={deleteMock}
        />
      </ModelingContext.Provider>
    );

    expect(getByText("Edit Property")).toBeInTheDocument();

    userEvent.click(getByTestId(`delete-${editPropertyOptions.name}`));
    expect(mockEntityReferences).toBeCalledWith(entityType?.entityName);
    expect(mockEntityReferences).toBeCalledTimes(2);

    await wait(() =>
      expect(screen.getByLabelText("delete-property-step-text")).toBeInTheDocument(),
    );
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeletePropertyStepWarn}-yes`));
    expect(deleteMock).toBeCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });

  test("can delete a relationship type property with step warning", async () => {
    mockGetSystemInfo.mockResolvedValueOnce({status: 200, data: {}});
    mockEntityReferences.mockResolvedValueOnce({status: 200, data: referencePayloadEmpty});

    let entityType = propertyTableEntities.find(entity => entity.entityName === "Customer");
    let entityDefninitionsArray = definitionsParser(entityType?.model.definitions);
    let deleteMock = jest.fn();

    const relationshipPropertyOptions: PropertyOptions = {
      propertyType: PropertyType.RelatedEntity,
      type: "Order",
      identifier: "no",
      multiple: "yes",
      pii: "no",
      sortable: false,
      facetable: false,
      wildcard: false
    };

    const editPropertyOptions: EditPropertyOptions = {
      name: "orders",
      isEdit: true,
      propertyOptions: relationshipPropertyOptions
    };

    const {getByText, getByTestId} =  render(
      <ModelingContext.Provider value={entityNamesArray}>
        <PropertyModal
          entityName={entityType?.entityName}
          entityDefinitionsArray={entityDefninitionsArray}
          isVisible={true}
          editPropertyOptions={editPropertyOptions}
          structuredTypeOptions={DEFAULT_STRUCTURED_TYPE_OPTIONS}
          toggleModal={jest.fn()}
          addPropertyToDefinition={jest.fn()}
          addStructuredTypeToDefinition={jest.fn()}
          editPropertyUpdateDefinition={jest.fn()}
          deletePropertyFromDefinition={deleteMock}
        />
      </ModelingContext.Provider>
    );

    expect(getByText("Edit Property")).toBeInTheDocument();

    userEvent.click(getByTestId(`delete-${editPropertyOptions.name}`));
    expect(mockEntityReferences).toBeCalledWith(entityType?.entityName);
    expect(mockEntityReferences).toBeCalledTimes(2);

    await wait(() =>
      expect(screen.getByLabelText("delete-property-text")).toBeInTheDocument(),
    );
    userEvent.click(screen.getByLabelText(`confirm-${ConfirmationType.DeletePropertyWarn}-yes`));
    expect(deleteMock).toBeCalledTimes(1);
    expect(mockGetSystemInfo).toBeCalledTimes(1);
  });
});

