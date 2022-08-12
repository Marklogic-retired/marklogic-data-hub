import RecentRecords from "./RecentRecords";
import { DetailContext } from "../../store/DetailContext";
import { render } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import _ from "lodash";

const recentConfig = {

    "config": {
        "entities": {
            "person": {
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
                    "id": {
                        "path": "uri"
                    },
                    "component": "Value",
                    "config": {
                        "path": "person.id"
                    }
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
            }
        }
    }
};

const recentConfigCustomEntity = _.cloneDeep(recentConfig);
recentConfigCustomEntity.config['entityType'] = {"path": "entityTypeCustom"};

const recent = [{
    "uri": "doc1.xml",
    "entityType": "person",
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

const recentCustomEntity = _.cloneDeep(recent);
delete recentCustomEntity[0]['entityType'];
recentCustomEntity[0]['entityTypeCustom'] = "person"; // For testing custom entity definition (not "entityType")

const EXPANDIDS = {
    membership: true,
    info: true,
    relationships: true,
    imageGallery: true,
    timeline: true
}

const detailContextValue = {
    detail: {
        entityType: "person"
    },
    recentRecords: recent,
    loading: false,
    expandIds: EXPANDIDS,
    handleGetDetail: jest.fn(),
    handleGetRecent: jest.fn(),
    handleGetRecentLocal: jest.fn(),
    handleSaveRecent: jest.fn(),
    handleSaveRecentLocal: jest.fn(),
    handleExpandIds: jest.fn(),
    handleDeleteAllRecent: jest.fn(), 
    hasSavedRecords: jest.fn()
};

describe("RecentRecords component", () => {

    test("Verify list items appear and title is clickable when recently visited records returned", () => {
        const {getByText, getAllByAltText} = render(
            <DetailContext.Provider value={detailContextValue}>
                <RecentRecords data={recent} config={recentConfig.config} />
            </DetailContext.Provider>
        );
        let title = getByText(recent[0].person.id);
        expect(getAllByAltText(recentConfig.config.entities.person.thumbnail.config.alt)[0]).toBeInTheDocument(); // Image
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

    test("Verify list items appear when custom entity path defined", () => {
        const {getByText} = render(
            <DetailContext.Provider value={detailContextValue}>
                <RecentRecords data={recentCustomEntity} config={recentConfigCustomEntity.config} />
            </DetailContext.Provider>
        );
        expect(getByText(recent[0].person.id)).toBeInTheDocument(); // Title
        expect(getByText(recent[0].person.email[0].value)).toBeInTheDocument(); // Email
        expect(getByText(recent[0].person.sources[0].source)).toBeInTheDocument(); // Source
    });

});