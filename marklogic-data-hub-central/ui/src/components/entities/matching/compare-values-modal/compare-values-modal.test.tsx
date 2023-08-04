import React from "react";
import {render, fireEvent, waitForElement, wait} from "@testing-library/react";
import CompareValuesModal from "./compare-values-modal";
import data from "../../../../assets/mock-data/curation/merging.data";

describe("Compare Values Modal component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const twoComparedUris = ["/xml/persons/first-name-synonym1.xml", "/xml/persons/first-name-synonym2.xml"];

  const comparedUris = [
    "/com.marklogic.smart-mastering/Cust1.json",
    "/com.marklogic.smart-mastering/Cust2.json",
    "/com.marklogic.smart-mastering/Cust3.json",
    "/com.marklogic.smart-mastering/Cust5.json",
    "/com.marklogic.smart-mastering/Cust6.json",
    "/com.marklogic.smart-mastering/Cust7.json",
    "/com.marklogic.smart-mastering/Cust4.json",
    "/com.marklogic.smart-mastering/Cust8.json",
    "/com.marklogic.smart-mastering/Cust9.json",
    "/com.marklogic.smart-mastering/Cust10.json",
    "/com.marklogic.smart-mastering/Cust11.json",
    "/com.marklogic.smart-mastering/Cust12.json",
  ];

  const overflowedUris = [
    ...comparedUris,
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
  ];

  const uriInfo = [
    {
      "result1Instance": {
        "info": {"title": "Person", "version": "0.0.1", "baseUri": "http://example.org/", "draft": false},
        "Person": {"fname": "Alexandra", "lname": "Wilson", "Address": "123 Wilsons St", "ZipCode": "68150"},
      },
    },
    {
      "result2Instance": {
        "info": {"title": "Person", "version": "0.0.1", "baseUri": "http://example.org/", "draft": false},
        "Person": {"fname": "Alexandria", "lname": "Wilson", "Address": "123 Wilson Rd", "ZipCode": "68150"},
      },
    },
    {
      "previewInstance": {
        "info": {"title": "Person", "version": "0.0.1", "baseUri": "http://example.org/", "draft": false},
        "Person": {
          "ZipCode": "68150",
          "Address": "123 Wilsons St",
          "lname": "Wilson",
          "fname": ["Alexandra", "Alexandria"],
        },
      },
    },
  ];

  const entityDefinitionsArray = [
    {
      "name": "Person",
      "info": {"title": "Person", "version": "0.0.1", "baseUri": "http://example.org/", "draft": false},
      "primaryKey": "id",
      "properties": [
        {
          "name": "id",
          "datatype": "string",
          "ref": "",
          "collation": "http://marklogic.com/collation/codepoint",
          "related": "",
        },
        {
          "name": "fname",
          "datatype": "string",
          "ref": "",
          "collation": "http://marklogic.com/collation//S2",
          "related": "",
          "sortable": true,
          "facetable": true,
        },
        {
          "name": "lname",
          "datatype": "string",
          "ref": "",
          "collation": "http://marklogic.com/collation//S2",
          "related": "",
          "sortable": true,
          "facetable": true,
        },
        {
          "name": "desc",
          "datatype": "string",
          "ref": "",
          "collation": "http://marklogic.com/collation/codepoint",
          "related": "",
        },
        {
          "name": "SSN",
          "datatype": "string",
          "ref": "",
          "collation": "http://marklogic.com/collation/codepoint",
          "related": "",
        },
        {
          "name": "ZipCode",
          "datatype": "string",
          "ref": "",
          "collation": "http://marklogic.com/collation/codepoint",
          "related": "",
        },
        {
          "name": "Address",
          "datatype": "string",
          "ref": "",
          "collation": "http://marklogic.com/collation/codepoint",
          "related": "",
        },
        {"name": "DateOfBirth", "datatype": "date", "ref": "", "related": ""},
      ],
      "relatedEntities": [],
      "relatedConcepts": [],
      "icon": "FaShapes",
      "color": "#eeeff1",
    },
  ];

  const originalUri = "/com.marklogic.smart-mastering/merged/ea11539a17ebe56343556a2f0ea1eb99.xml";

  const mockUnmergeUri = jest.fn();

  const getSubElements = (content, node, title) => {
    const hasText = node => node.textContent === title;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = Array.from(node.children).every(child => !hasText(child));
    return nodeHasText && childrenDontHaveText;
  };

  test("Unmerge Modal renders with popup info for showing all URIs and verify block future merges", async () => {
    const {getByLabelText, getByText, rerender} = render(
      <CompareValuesModal
        {...data.compareModal}
        unmergeUri={mockUnmergeUri}
        uris={comparedUris}
        uriCompared={comparedUris}
        isVisible={true}
        toggleModal={jest.fn()}
        fetchNotifications={jest.fn()}
        previewMatchActivity={{}}
        uriInfo={""}
        activeStepDetails={{}}
        entityProperties={{}}
        entityDefinitionsArray={[]}
        isPreview={false}
        isMerge={false}
        mergeUris={[]}
        originalUri={"/com.marklogic.smart-mastering/merged/8a0b71b0a525ca7449611b2e9786d0cf.json"}
        flowName={""}
      />,
    );

    expect(document.querySelector(".compare-values-model-unmerge")).toBeInTheDocument();
    fireEvent.mouseOver(getByLabelText("icon: info-circle"));

    expect(
      await waitForElement(() =>
        getByText((content, node) => {
          return getSubElements(content, node, "12 total");
        }),
      ),
    ).toBeInTheDocument();
    expect(getByLabelText("more-uri-info")).toBeInTheDocument();
    expect(getByLabelText(`${comparedUris[0]}-uri`)).toBeInTheDocument();
    expect(getByLabelText(`${comparedUris[11]}-uri`)).toBeInTheDocument();

    //verify blockFutureMerges is added when checkbox is not selected

    let payload = {
      "blockFutureMerges": true,
      "mergeDocumentURI": "/com.marklogic.smart-mastering/merged/8a0b71b0a525ca7449611b2e9786d0cf.json",
    };
    fireEvent.click(getByLabelText("confirm-merge-unmerge"));
    await wait(() => {
      fireEvent.click(getByLabelText("Yes"));
    });
    expect(mockUnmergeUri).toHaveBeenCalledWith(payload);
    expect(mockUnmergeUri).toHaveBeenCalledTimes(1);

    //verify blockFutureMerges is false when checkbox is selected
    rerender(
      <CompareValuesModal
        {...data.compareModal}
        unmergeUri={mockUnmergeUri}
        uris={comparedUris}
        uriCompared={comparedUris}
        isVisible={true}
        toggleModal={jest.fn()}
        fetchNotifications={jest.fn()}
        previewMatchActivity={{}}
        uriInfo={""}
        activeStepDetails={{}}
        entityProperties={{}}
        entityDefinitionsArray={[]}
        isPreview={false}
        isMerge={false}
        mergeUris={[]}
        originalUri={"/com.marklogic.smart-mastering/merged/8a0b71b0a525ca7449611b2e9786d0cf.json"}
        flowName={""}
      />,
    );
    fireEvent.click(getByLabelText("unmerge-inclusion-checkbox"));
    fireEvent.click(getByLabelText("confirm-merge-unmerge"));
    await wait(() => {
      fireEvent.click(getByLabelText("Yes"));
    });

    let payload2 = {
      "blockFutureMerges": false,
      "mergeDocumentURI": "/com.marklogic.smart-mastering/merged/8a0b71b0a525ca7449611b2e9786d0cf.json",
    };

    expect(mockUnmergeUri).toHaveBeenLastCalledWith(payload2);
  });

  test("Merge Modal renders with popup info for showing all URIs", async () => {
    const {getByLabelText, getByText} = render(
      <CompareValuesModal
        {...data.compareModal}
        uris={comparedUris}
        uriCompared={comparedUris}
        isMerge={true}
        isVisible={true}
        toggleModal={jest.fn()}
        fetchNotifications={jest.fn()}
        previewMatchActivity={{}}
        uriInfo={""}
        activeStepDetails={{}}
        entityProperties={{}}
        entityDefinitionsArray={[]}
        isPreview={true}
        mergeUris={""}
        originalUri={""}
        flowName={""}
      />,
    );
    expect(document.querySelector(".compare-values-model")).toBeInTheDocument();
    fireEvent.mouseOver(getByLabelText("icon: info-circle"));
    expect(
      await waitForElement(() =>
        getByText((content, node) => {
          return getSubElements(content, node, "12 total");
        }),
      ),
    ).toBeInTheDocument();
    expect(getByLabelText("more-uri-info")).toBeInTheDocument();
    expect(getByLabelText(`${comparedUris[0]}-uri`)).toBeInTheDocument();
    expect(getByLabelText(`${comparedUris[11]}-uri`)).toBeInTheDocument();
  });

  test("Unmerge Modal renders with popup info for showing all URIs (overflow case)", async () => {
    const {getByLabelText, getByText, queryByLabelText} = render(
      <CompareValuesModal
        {...data.compareModal}
        uris={overflowedUris}
        uriCompared={overflowedUris}
        isVisible={true}
        toggleModal={jest.fn()}
        fetchNotifications={jest.fn()}
        previewMatchActivity={{}}
        uriInfo={""}
        activeStepDetails={{}}
        entityProperties={{}}
        entityDefinitionsArray={[]}
        isPreview={true}
        isMerge={true}
        mergeUris={""}
        originalUri={""}
        flowName={""}
      />,
    );

    fireEvent.mouseOver(getByLabelText("icon: info-circle"));
    expect(
      await waitForElement(() =>
        getByText((content, node) => {
          return getSubElements(content, node, "32 total");
        }),
      ),
    ).toBeInTheDocument();
    expect(getByLabelText("more-uri-info-limit")).toBeInTheDocument();
    expect(getByLabelText(`${overflowedUris[0]}-uri`)).toBeInTheDocument();
    expect(getByLabelText(`${overflowedUris[29]}-uri`)).toBeInTheDocument();
    expect(getByText("...")).toBeInTheDocument();
    expect(queryByLabelText(`${overflowedUris[30]}-uri`)).not.toBeInTheDocument();
    expect(queryByLabelText(`${overflowedUris[31]}-uri`)).not.toBeInTheDocument();
  });

  test("Merge Modal renders with popup info for showing all URIs (overflow case)", async () => {
    const {getByLabelText, getByText, queryByLabelText} = render(
      <CompareValuesModal
        {...data.compareModal}
        uris={overflowedUris}
        uriCompared={overflowedUris}
        isMerge={true}
        isVisible={true}
        toggleModal={jest.fn()}
        fetchNotifications={jest.fn()}
        previewMatchActivity={{}}
        uriInfo={""}
        activeStepDetails={{}}
        entityProperties={{}}
        entityDefinitionsArray={[]}
        isPreview={true}
        mergeUris={""}
        originalUri={""}
        flowName={""}
      />,
    );

    fireEvent.mouseOver(getByLabelText("icon: info-circle"));
    expect(
      await waitForElement(() =>
        getByText((content, node) => {
          return getSubElements(content, node, "32 total");
        }),
      ),
    ).toBeInTheDocument();
    expect(getByLabelText("more-uri-info-limit")).toBeInTheDocument();
    expect(getByLabelText(`${overflowedUris[29]}-uri`)).toBeInTheDocument();
    expect(getByText("...")).toBeInTheDocument();
    expect(queryByLabelText(`${overflowedUris[30]}-uri`)).not.toBeInTheDocument();
    expect(queryByLabelText(`${overflowedUris[31]}-uri`)).not.toBeInTheDocument();
  });

  test("Unmerge Modal renders with popup info for showing less than 4 URIs", async () => {
    const {queryAllByText, findByText} = render(
      <CompareValuesModal
        {...data.compareModal}
        uris={twoComparedUris}
        uriCompared={twoComparedUris}
        isVisible={true}
        toggleModal={jest.fn()}
        fetchNotifications={jest.fn()}
        previewMatchActivity={{}}
        uriInfo={uriInfo}
        activeStepDetails={{}}
        entityProperties={{}}
        entityDefinitionsArray={entityDefinitionsArray}
        isPreview={false}
        isMerge={false}
        mergeUris={""}
        originalUri={originalUri}
        flowName={""}
      />,
    );

    const labels = await queryAllByText(`Preview:`);
    expect(labels).toHaveLength(2);
    expect(await findByText(`/xml/persons/first-name-synonym1.xml`)).toBeVisible();
    expect(await findByText(`/xml/persons/first-name-synonym2.xml`)).toBeVisible();
  });
});
