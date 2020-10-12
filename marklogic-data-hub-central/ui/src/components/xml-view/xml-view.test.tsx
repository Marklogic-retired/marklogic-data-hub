import { render} from "@testing-library/react";
import XmlView from "../xml-view/xml-view";
import React from "react";
import data from "../../assets/mock-data/curation/common.data";

describe("XML view detail component - RTL", () => {
    test('Rendering xml document with es namespace in instance document', () => {
        const {  getByTestId, getByText } = render(<XmlView document={data.namespacedXmlInstance}/>);
        expect(getByTestId("xml-document")).toBeInTheDocument();
        expect(getByText("Alexandra")).toBeInTheDocument();
    });

    test('Rendering xml document with no namespace in instance document', () => {
        const {  getByTestId, getByText, queryByText } = render(<XmlView document={data.noNamespaceXmlInstance}/>);
        expect(getByTestId("xml-document")).toBeInTheDocument();
        expect(queryByText("es:envelope")).not.toBeInTheDocument();
        expect(getByText("Alexandra")).toBeInTheDocument();
    });
});
