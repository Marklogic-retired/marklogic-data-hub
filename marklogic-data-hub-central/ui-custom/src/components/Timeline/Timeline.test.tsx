import {render} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import Timeline from "./Timeline";

const configMultiple = {
    component: "Timeline",
    config: {
        title: "Activities",
        markers: [{
            arrayPath: "person.activities.activity",
            label: {
                path: "predplace"
            },
            start: {
                path: "ts"
            },
            popover: {
                placement: "right",
                items: [
                    {
                        component: "DateTime",
                        label: "Activity date",
                        config: {
                            path: "ts",
                            format: "MMMM dd, yyyy"
                        }
                    },
                    {
                        label: "Source",
                        path: "source.name"
                    }
                ]
            }
        },
        {
            arrayPath: "person.events.event",
            label: {
                path: "predplace"
            },
            start: {
                path: "start"
            },
            end: {
                path: "end"
            },
            popover: {
                placement: "right",
                items: [
                    {
                        component: "DateTime",
                        label: "Event start",
                        config: {
                            path: "start",
                            format: "MMMM dd, yyyy"
                        }
                    },
                    {
                        component: "DateTime",
                        label: "Event end",
                        config: {
                            path: "end",
                            format: "MMMM dd, yyyy"
                        }
                    },
                ]
            }
        }]
    }
};

const detail = {
  person: {
    activities: {
        activity: [
        {
            place: "Tekfly",
            predicate: "endedAt",
            predplace: "endedAt Tekfly",
            ts: "2018-02-06T09:37:46Z",
            source : {
                name: "USA Today",
            }
        },
        {
            place: "Babblestorm",
            predicate: "startedAt",
            predplace: "startedAt Babblestorm",
            ts: "2018-05-27T22:28:59Z",
              source : {
                 name: "New York Times",
            }
        },
      ]
    },
    events: {
        event: [
        {
            place: "Canada",
            predicate: "servedIn",
            predplace: "servedIn Canada",
            start: "2015-02-06T09:37:46Z",
            end: "2019-02-06T09:37:46Z"
        }
      ]
    }
  }
};

const EXPANDIDS = {
    membership: true,
    info: true,
    relationships: true,
    imageGallery: true,
    timeline: true
}

const detailContextValue = {
    detail: detail,
    recentRecords: [],
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

describe("Timeline component", () => {
  test("Verify timeline widget renders", () => {
    const {getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <Timeline config={configMultiple.config} data={detail} />
      </DetailContext.Provider>
    );
    expect(getByTestId("activity-info-timeline")).toBeInTheDocument();
  })
});