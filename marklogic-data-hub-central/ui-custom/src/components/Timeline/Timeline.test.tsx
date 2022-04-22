import {render} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import Timeline from "./Timeline";

const configMultiple = {
    component: "Timeline",
    config: {
        title: "Activities",
        arrayPath: "person.activities.activity",
        marker: {
            path: "place"
        },
        popover: {
            placement: "right",
            items: [
                {
                    label: "Source",
                    path: "source.name"
                },
                {
                    component: "DateTime",
                    label: "Created on",
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

const detailContextValue = {
  detail: detail,
  handleDetail: jest.fn()
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