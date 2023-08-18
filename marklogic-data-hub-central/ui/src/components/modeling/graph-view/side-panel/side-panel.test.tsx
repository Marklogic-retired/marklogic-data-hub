import React from "react";
import {render, cleanup, act, wait} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GraphViewSidePanel from "./side-panel";
import {isModified} from "../../../../assets/mock-data/modeling/modeling-context-mock";
import {ModelingContext} from "@util/modeling-context";
import {getEntityTypes, hubCentralConfig} from "../../../../assets/mock-data/modeling/modeling";
import {primaryEntityTypes} from "../../../../api/modeling";

jest.mock("../../../../api/modeling");
jest.mock("../../../../api/environment");

const mockPrimaryEntityTypes = primaryEntityTypes as jest.Mock;

describe("Graph View sidepanel", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  const withEntityAs = (entityName: string, canReadEntityModel: boolean, canWriteEntityModel: boolean) => {
    let entityTypeNamesArrayUpdated = [
      ...isModified.modelingOptions.entityTypeNamesArray,
      {
        name: entityName,
        entityTypeId: `http://marklogic.com/example/${entityName}-0.0.1/${entityName}`,
      },
    ];
    let isModifiedUpdated = {
      ...isModified,
      modelingOptions: {
        ...isModified.modelingOptions,
        selectedEntity: entityName,
        entityTypeNamesArray: entityTypeNamesArrayUpdated,
      },
    };
    return (
      <ModelingContext.Provider value={isModifiedUpdated}>
        <GraphViewSidePanel
          dataModel={getEntityTypes}
          canReadEntityModel={canReadEntityModel}
          canWriteEntityModel={canWriteEntityModel}
          onCloseSidePanel={jest.fn()}
          deleteEntityClicked={jest.fn()}
          updateEntities={jest.fn()}
          updateSavedEntity={jest.fn()}
          hubCentralConfig={hubCentralConfig}
          updateHubCentralConfig={jest.fn()}
          relationshipModalVisible={jest.fn()}
          toggleRelationshipModal={jest.fn()}
          getColor={jest.fn()}
          getIcon={jest.fn()}
          setNodeNeedRedraw={jest.fn()}
          deleteConceptClass={jest.fn()}
        />
      </ModelingContext.Provider>
    );
  };

  test("Ready-only user should not be able to edit/delete related concepts", async () => {
    mockPrimaryEntityTypes.mockReturnValueOnce({data: getEntityTypes});
    const {getByText, getByLabelText, getByTestId} = render(withEntityAs("Product", true, false));

    // Opens side panel
    await wait(() => expect(getByLabelText("Product-selectedEntity")).toBeInTheDocument());

    // Verifies side panel content
    const relatedConceptsTab = getByText("Related Concept Classes");
    expect(relatedConceptsTab).toBeInTheDocument();
    act(() => {
      userEvent.click(relatedConceptsTab);
    });

    // Verifies concept class name field is with disabled style
    const relationshipNameField = getByTestId("isCategory-disabled");
    expect(relationshipNameField).toBeInTheDocument();

    // Verifies namespace field is is with disabled style
    const deleteConceptField = getByTestId("isCategory-delete-disabled");
    expect(deleteConceptField).toBeInTheDocument();
  });
});
