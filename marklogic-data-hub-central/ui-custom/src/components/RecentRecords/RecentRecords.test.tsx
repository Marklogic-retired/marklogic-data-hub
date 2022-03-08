import RecentRecords from "./RecentRecords";
import { DetailContext } from "../../store/DetailContext";
import { render } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

const recentConfig = {
    "thumbnail": {
        "component": "Image",
        "config": {
            "path": "person.image",
            "alt": "recent thumbnail",
            "style": {
                "width": "70px",
                "height": "70px"
            }
        }
    },
    "title": { 
        "id": "uri",
        "path": "person.id"
    },
    "items": [
        { 
            "component": "Value",
            "config": {
                "arrayPath": "person.email",
                "path": "value"
            }
        }
    ],
    "categories": {
        "arrayPath": "person.sources",
        "path": "source",
        "colors": {
            "source1": "#d5e1de",
            "source2": "#ebe1fa"
        }
    }
};

const recent = [{
    "uri": "doc1.xml",
    "person": {
        "id": "10001",
        "email": [
            { "value": "jdoe1@example.org" },
            { "value": "jdoe2@example.org" }
        ],
        "image": "http://example.org/img.jpg",
        "sources": [
            { "source": "source1" },
            { "source": "source2" }
        ],
    }
}];

const recentEmpty = [];

const detailContextValue = {
    detail: {},
    recentRecords: recent,
    loading: false,
    handleGetDetail: jest.fn(),
    handleGetRecent: jest.fn(),
    handleGetRecentLocal: jest.fn(),
    handleSaveRecent: jest.fn(),
    handleSaveRecentLocal: jest.fn()
};

describe("RecentRecords component", () => {

    test("Verify list items appear and title is clickable when recently visited records returned", () => {
        const {getByText, getAllByAltText} = render(
            <DetailContext.Provider value={detailContextValue}>
                <RecentRecords data={recent} config={recentConfig} />
            </DetailContext.Provider>
        );
        let title = getByText(recent[0].person.id);
        expect(getAllByAltText(recentConfig.thumbnail.config.alt)[0]).toBeInTheDocument(); // Image
        expect(title).toBeInTheDocument(); // Title
        expect(getByText(recent[0].person.email[0].value)).toBeInTheDocument(); // Email
        expect(getByText(recent[0].person.sources[0].source)).toBeInTheDocument(); // Source
        userEvent.click(title);
        expect(detailContextValue.handleGetDetail).toHaveBeenCalledWith(recent[0].uri);
    });

    test("Verify messaging appears when no recently visited records returned", () => {
        const {getByText} = render(
            <DetailContext.Provider value={detailContextValue}>
                <RecentRecords data={recentEmpty} config={recentConfig} />
            </DetailContext.Provider>
        );
        expect(getByText("No recently visited records found.")).toBeInTheDocument();
    });

});
