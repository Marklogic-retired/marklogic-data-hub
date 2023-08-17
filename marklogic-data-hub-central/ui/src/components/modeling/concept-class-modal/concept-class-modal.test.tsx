import React from "react";
import axiosInstance from "@config/axios";
import {render, wait} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConceptClassModal from "./concept-class-modal";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {createConceptsResponse} from "../../../assets/mock-data/modeling/modeling";
import {defaultHubCentralConfig} from "../../../config/modeling.config";

jest.mock("@config/axios");

const placeholders = {
  name: "Enter name",
  description: "Enter description",
};

const defaultModalOptions = {
  isVisible: true,
  toggleModal: jest.fn(),
  updateConceptClassAndHideModal: jest.fn(),
  isEditModal: false,
  name: "",
  description: "",
  updateHubCentralConfig: jest.fn(),
  hubCentralConfig: defaultHubCentralConfig,
  dataModel: [{entityName: "Client"}, {conceptName: "ClothStyle"}],
};

let hubCentralConfig = defaultHubCentralConfig;

describe("ConceptClassModal Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Modal is not visible", () => {
    const {queryByText} = render(<ConceptClassModal {...defaultModalOptions} isVisible={false} color="" icon="" />);
    expect(queryByText("Add Concept Class")).toBeNull();
  });

  test("Valid Concept Class name is used", async () => {
    axiosInstance.post["mockImplementationOnce"](
      jest.fn(() => Promise.resolve({status: 201, data: createConceptsResponse})),
    );

    const {getByText, getByPlaceholderText, getByTestId, getByTitle} = render(
      <ConceptClassModal {...defaultModalOptions} color="" icon="" />,
    );

    let url = "/api/concepts";
    let payload = {"name": "ShoeTypes", "description": "Testing"};

    expect(getByText("Add Concept Class")).toBeInTheDocument();
    userEvent.type(getByPlaceholderText(placeholders.name), payload.name);
    userEvent.type(getByPlaceholderText(placeholders.description), payload.description);

    //modify the entity color via color picker and verify it is sent in hub central config payload
    userEvent.click(getByTestId(`${payload.name}-color-button`));
    userEvent.click(getByTitle("#CEE0ED"));

    await wait(() => {
      expect(getByTestId("ShoeTypes-color")).toHaveStyle("background: #CEE0ED");
    });

    await wait(() => {
      userEvent.click(getByText("Add"));
    });
    expect(axiosInstance.post).toHaveBeenCalledWith(url, payload);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);

    //Verify the hubCentral payload
    hubCentralConfig.modeling.concepts["ShoeTypes"] = {color: "#cee0ed", icon: "FaLightbulb"};

    expect(defaultModalOptions.updateHubCentralConfig).toHaveBeenCalledWith(hubCentralConfig);
    expect(defaultModalOptions.updateHubCentralConfig).toHaveBeenCalledTimes(1);
  });

  test("Adding a new ConceptClass with an existing name should show an error message", async () => {
    const {getByText, getByPlaceholderText, getByLabelText} = render(
      <ConceptClassModal {...defaultModalOptions} color="" icon="" />,
    );
    expect(getByText(/Add Concept Class/i)).toBeInTheDocument();

    userEvent.type(getByPlaceholderText(placeholders.name), "ClothStyle");
    userEvent.type(getByPlaceholderText(placeholders.description), "Test concept description");

    await wait(() => {
      userEvent.click(getByText("Add"));
    });

    await wait(() => {
      expect(getByLabelText("concept-class-name-error")).toBeInTheDocument();
    });
  });

  test("Adding an invalid concept class name shows error message", async () => {
    const {getByText, getByPlaceholderText} = render(<ConceptClassModal {...defaultModalOptions} color="" icon="" />);
    expect(getByText(/Add Concept Class/i)).toBeInTheDocument();

    userEvent.type(getByPlaceholderText(placeholders.name), "123-Box");
    userEvent.type(getByPlaceholderText(placeholders.description), "Test concept description");

    await wait(() => {
      userEvent.click(getByText("Add"));
    });

    expect(getByText(ModelingTooltips.nameConceptClass)).toBeInTheDocument();
  });

  test("Edit modal is not visible", () => {
    const {queryByText} = render(
      <ConceptClassModal {...defaultModalOptions} isVisible={false} isEditModal={true} color="" icon="" />,
    );
    expect(queryByText("Edit Concept Class")).toBeNull();
  });

  test("Edit modal is visible", async () => {
    const {getByText, getByDisplayValue, queryByText, getByTestId, getByLabelText} = render(
      <ConceptClassModal
        {...defaultModalOptions}
        isEditModal={true}
        name={"ModelName"}
        description={"Model description"}
        color="#CEE0ED"
        icon="FaUserAlt"
      />,
    );

    expect(getByText("Edit Concept Class")).toBeInTheDocument();
    expect(queryByText("*")).toBeNull();
    expect(getByText("ModelName")).toBeInTheDocument();
    expect(getByDisplayValue("Model description")).toBeInTheDocument();

    //proper color and icon is displayed
    expect(getByTestId("ModelName-color")).toHaveStyle("background: #CEE0ED");

    expect(getByLabelText("ModelName-FaUserAlt-icon")).toBeInTheDocument();
  });
});
