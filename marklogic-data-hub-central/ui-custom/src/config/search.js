export const configSearch = { 
    meter: {
        colors: {
            all: "#cccccc",
            filters: "#1ACCA8"
        }
    },
    facets: {
        selected: "#1acca8",
        unselected: "#dfdfdf",
        displayThreshold: 3,
        displayShort: 3,
        displayLong: 5,
        items: [
            {
                type: "category",
                name: "Collection",
                tooltip: "Filter by entity.",
                disabled: true
            },
            {
                type: "category",
                name: "sources",
                tooltip: "Filter by source."
            },
            {
                type: "category",
                name: "status",
                tooltip: "Filter by status."
            },
            {
                type: "category",
                name: "email",
                tooltip: "Filter by email."
            },
            {
                type: "category",
                name: "name",
                tooltip: "Filter by name."
            },
            {
                type: "category",
                name: "personId",
                tooltip: "Filter by ID."
            }
        ]
    },
    results: {
        thumbnail: {
            src: "extracted.person.image",
            width: "70px",
            height: "70px",
            alt: "result thumbnail"
        },
        title: { 
            id: "extracted.person.personId",
            path: "extracted.person.name"
        },
        items: [
            { 
                component: "Address", 
                config: {
                    addressPath: "extracted.person.address",
                    street1: "street",
                    city: "city",
                    state: "state",
                    postal1: "zip.fiveDigit",
                    postal2: "zip.plusFour"
                },
                style: {
                    width: "350px",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }
            },
            { path: "extracted.person.phone", className: "phone" },
            { path: "extracted.person.email", className: "email" },
            { path: "extracted.person.ssn" }
        ],
        categories: {
            path: "extracted.person.sources",
            colors: "sourcesColors"
        },
        timestamp: {
            path: "extracted.person.createdOn",
            type: "datetime",
            format: "yyyy-MM-dd",
            label: "Created on",
            style: {
                fontStyle: "normal"
            }
        },
        status: { path: "extracted.person.status" }
    }
};