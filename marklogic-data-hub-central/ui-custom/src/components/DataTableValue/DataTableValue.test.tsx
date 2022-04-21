import DataTableValue from "./DataTableValue";
import {DetailContext} from "../../store/DetailContext";
import {render} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const configMultiple = {
    component: "DataTableValue",
    config: {
        id: "email",
        title: "Email",
        arrayPath: "person.emails.email",
        value: "value",
        icon: "email",
        width: "400px",
        metadata: [
            {
                type: "block",
                color: "#96bde4",
                path: "classification",
                placement: "after"
            }
        ]
    }
};

const configSingular = {
    component: "DataTableValue",
    config: {
        id: "ssn",
        title: "SSN",
        path: "person.ssn",
        value: "value",
        width: "400px",
        metadata: [
            {
                type: "block",
                color: "#f4364c",
                path: "classification",
                placement: "before",
                style: {
                    width: "20px"
                }
            }
        ]
    }
};

const configArrayPathMultiple = {
    "component": "DataTableValue",
    "config": {
        "id": "phone",
        "title": "Phone Number",
        "arrayPath": "person.phone",
        "icon": "phone",
        "width": "400px",
        "metadata": [
            {
                "type": "block",
                "color": "#96bde4"
            },
            {
                "type": "block",
                "color": "#5d6aaa"
            }
        ]
    }
};

const configArrayPathSingular = {
    component: "DataTableValue",
    config: {
        id: "name",
        title: "Name",
        arrayPath: "person.nameGroup.fullname",
        path: "value",
        metadata: [
            {
                type: "block",
                color: "#96bde4",
                value: "B"
            },
            {
                type: "block",
                color: "#5d6aaa",
                value: "4"
            }
        ]
    }
};

const configNoExist = {
    component: "DataTableValue",
    config: {
        id: "noexist",
        title: "No Exist",
        path: "result[0].extracted.person.noexist"
    }
};

const detail = {
    "person": {
        "personId": "10021",
        "nameGroup": {
            "givenname": {
                "value": "Shanna"
            },
            "surname": {
                "value": "Heineke"
            },
            "fullname": {
                "classification": "C",
                "restricted": "true",
                "value": "Heineke Shanna",
                "source": [
                    {
                        "name": "Chicago Tribune",
                        "ts": "2021-10-01T05:59:18Z"
                    },
                    {
                        "name": "New York Times",
                        "ts": "2016-10-08T16:02:28Z"
                    },
                    {
                        "name": "USA Today",
                        "ts": "2019-03-24T22:00:21Z"
                    }
                ]
            }
        },
        "emails": {
            "email": [
                {
                    "value": "rbjorkan0@e-recht24.de",
                    "classification": "S",
                    "restricted": "false"
                },
                {
                    "value": "lpods1@printfriendly.com",
                    "classification": "U",
                    "restricted": "false"
                }
            ]
        },
        "phone": ["843-489-8237","843-489-354"],
        "ssn": {
            "value": "501-76-6957",
            "restricted": "true"
        },
        "images": {
            "image": [
                {
                    "url": "https://cdn1.marklogic.com/wp-content/uploads/2020/04/JamesKenwood-headshot-600x600-1.jpg",
                    "source": {
                        "name": "Chicago Tribune",
                        "ts": "2017-07-16T02:04:44Z",
                        "uploadedBy": "lhann0"
                    }
                },
                {
                    "url": "https://cdn1.marklogic.com/wp-content/uploads/2018/01/Alicia-Saia-MarkLogic1.jpg",
                    "source": {
                        "name": "Chicago Tribune",
                        "ts": "2015-03-25T23:54:09Z",
                        "uploadedBy": "awittman0"
                    }
                },
                {
                    "url": "https://cdn1.marklogic.com/wp-content/uploads/2020/11/george-bloom-headshot-300x300-1.jpg",
                    "source": {
                        "name": "New York Times",
                        "ts": "2015-11-15T06:07:06Z",
                        "uploadedBy": "aberling0"
                    }
                },
                {
                    "url": "https://cdn1.marklogic.com/wp-content/uploads/2018/01/Diane-Burley-MarkLogic-2015.jpg",
                    "source": {
                        "name": "USA Today",
                        "ts": "2011-04-19T17:17:10Z",
                        "uploadedBy": "vcamolli0"
                    }
                }
            ]
        },
        "addresses": {
            "address": [
                {
                    "street": "8005 Becker Hill",
                    "city": "Shreveport",
                    "state": "LA",
                    "postal": "71130",
                    "country": "United States",
                    "latitude": "32.6076",
                    "longitude": "-93.7526"
                },
                {
                    "street": "1 Nobel Alley",
                    "city": "Montgomery",
                    "state": "AL",
                    "postal": "36134",
                    "country": "United States",
                    "latitude": "32.2334",
                    "longitude": "-86.2085"
                },
                {
                    "street": "10 Goodland Crossing",
                    "city": "Virginia Beach",
                    "state": "VA",
                    "postal": "23464",
                    "country": "United States",
                    "latitude": "36.7978",
                    "longitude": "-76.1759"
                }
            ]
        },
        "schools": {
            "school": [
                {
                    "country": "United States",
                    "name": "Hillsdale College",
                    "city": "Waco",
                    "state": "TX",
                    "postal": "76711",
                    "latitude": "31.5140575",
                    "longitude": "-97.1520926"
                },
                {
                    "country": "Mexico",
                    "name": "Instituto Tecnologico de Durango",
                    "city": "La Palma",
                    "state": "MIC",
                    "postal": "60433",
                    "latitude": "24.8197427",
                    "longitude": "-107.655919"
                }
            ]
        },
        "status": "Active",
        "sources": [
            {
                "source": {
                    "name": "Los Angeles Times",
                    "ts": "2021-01-10T08:07:27Z"
                }
            },
            {
                "source": {
                    "name": "Chicago Tribune",
                    "ts": "2017-05-22T20:17:11Z"
                }
            },
            {
                "source": {
                    "name": "USA Today",
                    "ts": "2018-12-28T16:03:00Z"
                }
            }
        ],
        "relations": {
            "relation": [
                {
                    "id": "/person/10085.xml",
                    "predicate": "worksWith",
                    "imageSrc": "https://cdn1.marklogic.com/wp-content/uploads/2018/02/trinh-lieu-profile.jpg",
                    "fullname": "Rabbage Urbanus",
                    "city": "Olympia",
                    "state": "WA"
                },
                {
                    "id": "/person/10019.xml",
                    "predicate": "worksWith",
                    "imageSrc": "https://cdn1.marklogic.com/wp-content/uploads/2021/02/1612313387205.jpeg",
                    "fullname": "Kenworth Walden",
                    "city": "Kalamazoo",
                    "state": "MI"
                },
                {
                    "id": "/person/10028.xml",
                    "predicate": "relatedTo",
                    "imageSrc": "https://cdn1.marklogic.com/wp-content/uploads/2021/02/1612313387205.jpeg",
                    "fullname": "Shoulder Lambert",
                    "city": "Lincoln",
                    "state": "NE"
                }
            ]
        },
        "createdOn": {
            "ts": "2022-02-03T11:34:08Z",
            "user": "sheinekek"
        },
        "lastUpdated": {
            "ts": "2022-02-19T01:46:07Z",
            "user": "sheinekek"
        },
        "socials": {
            "social": {
                "site": "linkedin",
                "handle": "cludlamme0",
                "address": "https://mysql.com/ut.png"
            }
        },
        "memberships": {
            "membership": {
                "list": "list3",
                "important": "true",
                "ts": "2021-03-16"
            }
        },
        "links": {
            "link": [
                {
                    "label": "Quick View",
                    "url": "http://prweb.com",
                    "icon": "faEye"
                },
                {
                    "label": "Nomination History",
                    "url": "http://salon.com",
                    "icon": "faMedal"
                },
                {
                    "label": "Comments",
                    "url": "https://newyorker.com",
                    "icon": "faComments"
                }
            ]
        },
        "actions": {
            "action": [
                {
                    "url": "http://oaic.gov.au",
                    "icon": "faCog"
                },
                {
                    "url": "https://multiply.com",
                    "icon": "faCode"
                },
                {
                    "url": "http://addthis.com",
                    "icon": "faSync"
                }
            ]
        }
    },
    "entityType": "person",
    "uri": "/person/10021.xml"
};

const detailContextValue = {
    detail: detail,
    handleDetail: jest.fn()
};

describe("DataTableValue component", () => {

    test("Verify data table renders with a property with multiple values and an icon", () => {
        const {getByText, queryAllByText, getByTestId} = render(
            <DataTableValue config={configMultiple.config} data={detail} />
        );
        expect(getByText(configMultiple.config.title)).toBeInTheDocument();
        expect(getByTestId("hideUp")).toBeInTheDocument();
        expect(getByTestId("icon-" + configMultiple.config.icon)).toBeInTheDocument();
        expect(getByText("rbjorkan0@e-recht24.de")).toBeInTheDocument();
        expect(getByText("lpods1@printfriendly.com")).toBeInTheDocument();
        expect(getByText("S"));
        expect(getByText("U"));
        userEvent.click(getByTestId("hideUp"));
        expect(getByTestId("hideDown")).toBeInTheDocument();
        userEvent.click(getByTestId("hideDown"));
        expect(getByTestId("hideUp")).toBeInTheDocument();
    });

    test("Verify data table renders with a property with a single value", () => {
        const {getByText, queryAllByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configSingular.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(getByText(configSingular.config.title)).toBeInTheDocument();
        expect(queryByTestId("hideUp")).not.toBeInTheDocument();
        expect(getByText("501-76-6957")).toBeInTheDocument();
    });

    test("Verify data table renders with a property in an array of objects using arrayPath", () => {
        const {getByText, getByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configArrayPathMultiple.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(getByText(configArrayPathMultiple.config.title)).toBeInTheDocument();
        expect(getByTestId("hideUp")).toBeInTheDocument();
        expect(getByText("843-489-8237")).toBeInTheDocument();
        expect(getByText("843-489-354")).toBeInTheDocument();
    });

    test("Verify data table renders with a property in a single object using arrayPath", () => {
        const {getByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configArrayPathSingular.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(getByText(configArrayPathSingular.config.title)).toBeInTheDocument();
        expect(queryByTestId("hideUp")).not.toBeInTheDocument();
        expect(getByText("Heineke Shanna")).toBeInTheDocument();
    });

    test("Verify data table does not render with a property that does not exist in the results", () => {
        const {queryByText, queryByTestId} = render(
            <DetailContext.Provider value={detailContextValue}>
                <DataTableValue config={configNoExist.config} data={detail} />
            </DetailContext.Provider>
        );
        expect(queryByText(configNoExist.config.title)).not.toBeInTheDocument();
        expect(queryByTestId(configNoExist.config.id)).not.toBeInTheDocument();
    });

});
