import {render} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import Timeline from "./Timeline";

const configMultiple = {
    component: "Timeline",
    config: {
        title: "Activities",
        arrayPath: "person.activities.activity",
        marker: {
          label: {
            path: "predplace"
          },
          ts: {
            path: "ts"
          }
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
                },
                {
                    component: "DateTime",
                    label: "Source date",
                    config: {
                        path: "source.ts",
                        format: "MMMM dd, yyyy"
                    }
                },
                {
                    label: "Created by",
                    path: "source.createdBy"
                },
                {
                    label: "Approved by",
                    path: "source.approvedBy"
                }
            ]
        }
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
                approvedBy: "Dian Aslam",
                createdBy: "Hugues Sink",
                name: "USA Today",
                ts: "2018-02-06T09:37:46Z"
            }
        },
        {
            place: "Babblestorm",
            predicate: "startedAt",
            predplace: "startedAt Babblestorm",
            ts: "2018-05-27T22:28:59Z",
              source : {
                 approvedBy: "Benedikt Caudray",
                 createdBy: "Arny Karpol",
                 name: "New York Times",
                 ts: "2018-05-27T22:28:59Z"
            }
        },
        {
            place: "Realblab",
            predicate: "endedAt",
            predplace: "endedAt Realblab",
            ts: "2018-05-27T22:28:59Z",
            source : {
                approvedBy: "Phillie Petrie",
                createdBy: "Harriett Stanislaw",
                name: "Chicago Tribune",
                ts: "2018-05-27T22:28:59Z"
            }
        },
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