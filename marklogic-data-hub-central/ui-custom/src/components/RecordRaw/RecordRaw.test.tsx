
import {render} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import RecordRaw from "./RecordRaw";

const recordRawConfig = {
  "config": {
    "name": "person",
    "title": "Record raw label",
    "path": "person",
    "maxHeight": "400px",
    "enableClipboard": false,
    "displayDataTypes": false,
    "quotesOnKeys": false,
    "displayObjectSize": false,
    "collapsedLevel": 2,
    "indentWidth": 10,
    "groupArraysAfterLength": 3
  }
}

const detail = {
  person: {
    "personId": 10054,
    "nameGroup": {
      "givenname": {
        "value": "Uri"
      },
      "surname": {
        "value": "Capponeer"
      },
      "fullname": {
        "classification": "S",
        "restricted": false,
        "value": "Capponeer Uri",
        "source": [
          {
            "name": "New York Times",
            "ts": "2015-03-27T00:37:03Z"
          },
          {
            "name": "New York Times",
            "ts": "2016-05-26T23:37:35Z"
          },
          {
            "name": "USA Today",
            "ts": "2018-05-30T02:12:02Z"
          }
        ]
      }
    },
    "emails": {
      "email": {
        "value": "twhannel0@toplist.cz",
        "classification": "C",
        "restricted": false
      }
    },
    "phone": "803-271-2715",
    "ssn": {
      "value": "172-35-0546",
      "classification": "(S)"
    },
    "images": {
      "image": {
        "url": "https://cdn1.marklogic.com/wp-content/uploads/2021/02/1612313387205.jpeg",
        "source": {
          "name": "New York Times",
          "ts": "2020-01-19T19:18:19Z",
          "uploadedBy": "fshine0"
        }
      }
    },
    "addresses": {
      "address": [
        {
          "street": "09537 Becker Junction",
          "city": "Evanston",
          "state": "IL",
          "postal": 60208,
          "country": "United States",
          "latitude": 42.0586,
          "longitude": -87.6845
        },
        {
          "street": "58467 Farwell Park",
          "city": "Kalamazoo",
          "state": "MI",
          "postal": 49006,
          "country": "United States",
          "latitude": 42.2922,
          "longitude": -85.633
        },
        {
          "street": "4034 Norway Maple Parkway",
          "city": "Odessa",
          "state": "TX",
          "postal": 79769,
          "country": "United States",
          "latitude": 31.7466,
          "longitude": -102.567
        }
      ]
    },
    "schools": {
      "school": {
        "country": "Canada",
        "name": "North Island College",
        "city": "Olds",
        "state": "AB",
        "postal": "T4H",
        "latitude": 51.7920135,
        "longitude": -114.105279,
        "source": {
          "name": "USA Today",
          "ts": "2014-06-05T12:14:40Z"
        }
      }
    },
    "status": "Active",
    "sources": [
      {
        "source": {
          "name": "Los Angeles Times",
          "ts": "2015-11-03T19:11:51Z"
        }
      },
      {
        "source": {
          "name": "New York Times",
          "ts": "2019-10-01T16:13:29Z"
        }
      },
      {
        "source": {
          "name": "Wall Street Journal",
          "ts": "2012-12-11T03:55:25Z"
        }
      }
    ],
    "relations": {
      "relation": [
        {
          "id": "/person/10027.xml",
          "predicate": "relatedTo",
          "imageSrc": "https://cdn1.marklogic.com/wp-content/uploads/2018/02/trinh-lieu-profile.jpg",
          "fullname": "Hembrow Yehudi",
          "city": "Toledo",
          "state": "OH"
        },
        {
          "id": "/person/10013.xml",
          "predicate": "worksWith",
          "imageSrc": "https://cdn1.marklogic.com/wp-content/uploads/2020/11/george-bloom-headshot-300x300-1.jpg",
          "fullname": "Goulding Gerry",
          "city": "West Palm Beach",
          "state": "FL"
        }
      ]
    },
    "createdOn": {
      "ts": "2022-02-18T05:23:11Z",
      "user": "ucapponeer1h"
    },
    "lastUpdated": {
      "ts": "2022-02-05T02:06:22Z",
      "user": "ucapponeer1h"
    },
    "socials": {
      "social": [
        {
          "site": "facebook",
          "handle": "bbusek0",
          "address": "https://dion.ne.jp/sit/amet/turpis/elementum/ligula/vehicula.html"
        },
        {
          "site": "facebook",
          "handle": "cgiovannazzi1",
          "address": "https://huffingtonpost.com/dui/vel/sem/sed.xml"
        },
        {
          "site": "facebook",
          "handle": "aprisley2",
          "address": "http://liveinternet.ru/est/quam.html"
        }
      ]
    },
    "memberships": {
      "membership": [
        {
          "list": "list3",
          "important": true,
          "ts": "2022-01-08"
        },
        {
          "list": "list12",
          "important": true,
          "ts": "2022-02-13"
        }
      ]
    },
    "links": {
      "link": [
        {
          "label": "Quick View",
          "url": "http://rakuten.co.jp",
          "icon": "faEye"
        },
        {
          "label": "Nomination History",
          "url": "https://state.tx.us",
          "icon": "faMedal"
        },
        {
          "label": "Comments",
          "url": "http://blogtalkradio.com",
          "icon": "faComments"
        }
      ]
    },
    "activities": {
      "activity": [
        {
          "predicate": "endedAt",
          "place": "Demivee",
          "predplace": "endedAt Demivee",
          "ts": "2011-02-01T05:55:45Z",
          "source": {
            "name": "USA Today",
            "ts": "2018-01-19T23:03:13Z",
            "createdBy": "Farrel Marien",
            "approvedBy": "Aundrea Braidman"
          }
        },
        {
          "predicate": "startedAt",
          "place": "Shufflebeat",
          "predplace": "startedAt Shufflebeat",
          "ts": "2013-03-13T02:28:48Z",
          "source": {
            "name": "New York Times",
            "ts": "2020-12-09T18:09:33Z",
            "createdBy": "Kele Eyes",
            "approvedBy": "Clare Tink"
          }
        },
        {
          "predicate": "endedAt",
          "place": "Jaxspan",
          "predplace": "endedAt Jaxspan",
          "ts": "2010-11-22T04:18:47Z",
          "source": {
            "name": "Chicago Tribune",
            "ts": "2020-03-02T16:08:00Z",
            "createdBy": "Hermann Vosse",
            "approvedBy": "Shell Oguz"
          }
        },
        {
          "predicate": "transferredTo",
          "place": "Realpoint",
          "predplace": "transferredTo Realpoint",
          "ts": "2014-12-26T15:45:14Z",
          "source": {
            "name": "Los Angeles Times",
            "ts": "2017-04-15T21:36:40Z",
            "createdBy": "Viv Bottell",
            "approvedBy": "Claudetta Syson"
          }
        }
      ]
    },
    "actions": {
      "action": [
        {
          "url": "https://pbs.org",
          "icon": "faCog"
        },
        {
          "url": "http://geocities.jp",
          "icon": "faCode"
        },
        {
          "url": "http://deliciousdays.com",
          "icon": "faSync"
        }
      ]
    }
  }
}

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

describe("RecordRaw component", () => {
  test("Verify RecordRaw widget renders correctly", () => {
    const {getByTestId, getByText} = render(
      <DetailContext.Provider value={detailContextValue}>
        <RecordRaw config={recordRawConfig.config} data={detail} />
      </DetailContext.Provider>
    );
    expect(getByTestId("record-raw-component")).toBeInTheDocument();
    expect(getByText("Record raw label")).toBeInTheDocument();
    expect(getByText("person")).toBeInTheDocument();
  });
});