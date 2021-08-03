import React from "react";
import axios from "axios";
import {render, wait} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EntityTypeModal from "./entity-type-modal";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {
  createModelErrorResponse,
  createModelErrorResponseNamespace,
  createModelErrorResponsePrefix,
  createModelResponse
} from "../../../assets/mock-data/modeling/modeling";

jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

const placeholders = {
  name: "Enter name",
  description: "Enter description",
  namespace: "Example: http://example.org/es/gs",
  namespacePrefix: "Example: esgs"
};

const defaultModalOptions = {
  isVisible: true,
  toggleModal: jest.fn(),
  updateEntityTypesAndHideModal: jest.fn(),
  isEditModal: false,
  name: "",
  description: "",
  namespace: "",
  prefix: ""
};

describe("EntityTypeModal Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Modal is not visible", () => {
    const {queryByText} = render(
      <EntityTypeModal {...defaultModalOptions} isVisible={false} />
    );
    expect(queryByText("Add Entity Type")).toBeNull();
  });

  test("Valid Entity name is used", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 201, data: createModelResponse})));

    const {getByText, getByPlaceholderText} = render(
      <EntityTypeModal {...defaultModalOptions} />
    );

    let url = "/api/models";
    let payload = {"name": "AnotherModel", "description": "Testing", "namespace": "", "namespacePrefix": ""};

    expect(getByText("Add Entity Type")).toBeInTheDocument();
    userEvent.type(getByPlaceholderText(placeholders.name), payload.name);
    userEvent.type(getByPlaceholderText(placeholders.description), payload.description);

    await wait(() => {
      userEvent.click(getByText("Add"));
    });
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
  });

  test("Adding an invalid Entity name shows error message", async () => {
    const {getByText, getByPlaceholderText} = render(
      <EntityTypeModal {...defaultModalOptions} />
    );
    expect(getByText(/Add Entity Type/i)).toBeInTheDocument();

    userEvent.type(getByPlaceholderText(placeholders.name), "123-Box");
    userEvent.type(getByPlaceholderText(placeholders.description), "Product entity description");

    await wait(() => {
      userEvent.click(getByText("Add"));
    });

    expect(getByText(ModelingTooltips.nameRegex)).toBeInTheDocument();
  });

  test("Creating duplicate entity shows error message", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() =>
      Promise.reject({response: {status: 400, data: createModelErrorResponse}})));

    const {getByText, getByPlaceholderText} = render(
      <EntityTypeModal {...defaultModalOptions} />
    );
    expect(getByText("Add Entity Type")).toBeInTheDocument();

    let url = "/api/models";
    let payload = {"name": "Testing", "description": "", "namespace": "", "namespacePrefix": ""};

    userEvent.type(getByPlaceholderText(placeholders.name), payload.name);
    userEvent.type(getByPlaceholderText(placeholders.description), payload.description);

    await wait(() => {
      userEvent.click(getByText("Add"));
    });
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);

    expect(getByText("An entity type already exists with a name of Testing")).toBeInTheDocument();
  });

  test("Edit modal is not visible", () => {
    const {queryByText} = render(
      <EntityTypeModal {...defaultModalOptions} isVisible={false} isEditModal={true} />
    );
    expect(queryByText("Edit Entity Type")).toBeNull();
  });

  test("Edit modal is visible", () => {
    const {getByText, getByDisplayValue, queryByText} = render(
      <EntityTypeModal {...defaultModalOptions} isEditModal={true}
        name={"ModelName"} description={"Model description"} />
    );

    expect(getByText("Edit Entity Type")).toBeInTheDocument();
    expect(queryByText("*")).toBeNull();
    expect(getByText("ModelName")).toBeInTheDocument();
    expect(getByDisplayValue("Model description")).toBeInTheDocument();
  });

  test("Entity description, namespace, and prefix are updated", async () => {
    axiosMock.put["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200})));

    const {getByText, getByPlaceholderText} = render(
      <EntityTypeModal {...defaultModalOptions} isEditModal={true}
        name={"ModelName"} description={"Model description"} />
    );

    let url = "/api/models/ModelName/info";
    let payload = {"description": "Updated Description", "hubCentral": {"modeling": {}}, "namespace": "http://example.org/updated", "namespacePrefix": "updated"};

    userEvent.clear(getByPlaceholderText(placeholders.description));
    userEvent.type(getByPlaceholderText(placeholders.description), payload.description);
    userEvent.type(getByPlaceholderText(placeholders.namespace), payload.namespace);
    userEvent.type(getByPlaceholderText(placeholders.namespacePrefix), payload.namespacePrefix);

    await wait(() => {
      userEvent.click(getByText("OK"));
    });
    expect(axiosMock.put).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.put).toHaveBeenCalledTimes(1);
  });

  test("Submitting invalid namespace shows error message", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() =>
      Promise.reject({response: {status: 400, data: createModelErrorResponseNamespace}})));

    const {getByText, getByPlaceholderText} = render(
      <EntityTypeModal {...defaultModalOptions} />
    );
    expect(getByText("Add Entity Type")).toBeInTheDocument();

    let url = "/api/models";
    let payload = {"name": "Testing", "description": "", "namespace": "badURI", "namespacePrefix": "test"};

    userEvent.type(getByPlaceholderText(placeholders.name), payload.name);
    userEvent.type(getByPlaceholderText(placeholders.description), payload.description);
    userEvent.type(getByPlaceholderText(placeholders.namespace), payload.namespace);
    userEvent.type(getByPlaceholderText(placeholders.namespacePrefix), payload.namespacePrefix);

    await wait(() => {
      userEvent.click(getByText("Add"));
    });
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);

    expect(getByText(createModelErrorResponseNamespace.message)).toBeInTheDocument();
  });

  test("Submitting invalid namespace prefix shows error message", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() =>
      Promise.reject({response: {status: 400, data: createModelErrorResponsePrefix}})));

    const {getByText, getByPlaceholderText} = render(
      <EntityTypeModal {...defaultModalOptions} />
    );
    expect(getByText("Add Entity Type")).toBeInTheDocument();

    let url = "/api/models";
    let payload = {"name": "Testing", "description": "", "namespace": "http://example.org/test", "namespacePrefix": "xml"};

    userEvent.type(getByPlaceholderText(placeholders.name), payload.name);
    userEvent.type(getByPlaceholderText(placeholders.description), payload.description);
    userEvent.type(getByPlaceholderText(placeholders.namespace), payload.namespace);
    userEvent.type(getByPlaceholderText(placeholders.namespacePrefix), payload.namespacePrefix);

    await wait(() => {
      userEvent.click(getByText("Add"));
    });
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);

    expect(getByText(createModelErrorResponsePrefix.message)).toBeInTheDocument();
  });

});

