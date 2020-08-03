import React from 'react';
import Flows from './flows';
import data from '../../assets/mock-data/flows.data';
import { render } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {BrowserRouter as Router} from "react-router-dom";

describe('Flows component', () => {

    it('Verifies input format names and type circles', () => {
        const allKindsOfIngestInAFlow = [{ name: 'allInputFormats', steps: [{
                "stepDefinitionType": "ingestion",
                "sourceFormat": "csv"
                }, {
                "stepDefinitionType": "ingestion",
                "sourceFormat": "binary"
                }, {
                "stepDefinitionType": "ingestion",
                "sourceFormat": "text"
                }, {
                "stepDefinitionType": "ingestion",
                "sourceFormat": "json"
                }, {
                "stepDefinitionType": "ingestion",
                "sourceFormat": "xml"}
                ]
        }];
        const { getByText, getByLabelText } = render(<Router><Flows {...data.flowProps} flows={allKindsOfIngestInAFlow} /></Router>);
        userEvent.click(getByLabelText('icon: right'));
        ["CSV", "BIN", "TXT", "JSON", "XML"].forEach(format => {
            expect(getByText(format)).toBeInTheDocument();
            expect(getByText(format)).toHaveStyle("height: 35px; width: 35px; line-height: 35px; text-align: center;");
        });
    })
});
