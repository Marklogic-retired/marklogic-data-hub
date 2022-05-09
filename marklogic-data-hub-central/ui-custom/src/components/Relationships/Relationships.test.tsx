import Relationships from "./Relationships";
import { DetailContext } from "../../store/DetailContext";
import {render} from "@testing-library/react";
import userEvent from '@testing-library/user-event'

const relationshipsConfig = {
    component: "Relationships",
    config: {
        type: "text",
        size: 30,
        root: {
            id: {
                path: "result[0].extracted.person.id"
            },
            label: {
                path: "result[0].extracted.person.fullname"
            },
            imgSrc: {
                path: "result[0].extracted.person.image.url"
            },
            title: {
                path: "result[0].extracted.person.fullname"
            },
            city: {
                path: "result[0].extracted.person.address.city"
            },
            state: {
                path: "result[0].extracted.person.address.state"
            }
        },
        relations: {
            arrayPath: "result[0].extracted.person.relations.relation",
            id: "id",
            predicate: "predicate",
            label: "fullname",
            imgSrc: "imageSrc",
            title: "fullname",
            city: "city",
            state: "state"
        },
        options: {
            edges: {
                color: "red"
            }
        }
    }
};

const detail = {
	result: [
		{
		    extracted: {
		        person: {
		            id: "10001",
		            fullname: "John Doe",
                    image: {
                        url: "https://example.org/image0.jpg"
                    },
		            address: {
                        street1: "123 Main St.",
                        street2: "Apt. 456",
                        city: "Anytown",
                        state: "CA",
                        postal1: "12345",
                        postal2: "6789"
                    },
                    relations: {
                        relation: [
                          {
                            id: "101",
                            imageSrc: "https://example.org/image1.jpg",
                            predicate: "worksWith",
                            fullname: "John Smith",
                            city: "New Haven",
                            state: "CT"
                          },
                          {
                            id: "102",
                            imageSrc: "https://example.org/image1.jpg",
                            predicate: "livesWith",
                            fullname: "Jane Doe",
                            city: "Charleston",
                            state: "SC"
                          }
                        ]
                    }
		        }
		    }
		}
	]
};

const detailContextValue = {
    detail: detail,
    handleDetail: jest.fn()
};

describe("Relationships component", () => {

    test.skip("Verify list items appear and titles are clickable when results returned", () => {
        const {getByText, debug} = render(
            <DetailContext.Provider value={detailContextValue}>
                <Relationships config={relationshipsConfig} />
            </DetailContext.Provider>
        );
        debug();
        // expect(getByText("John Doe")).toBeInTheDocument();
    });

});
