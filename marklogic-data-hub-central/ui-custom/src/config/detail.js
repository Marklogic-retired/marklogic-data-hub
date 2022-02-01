export const configDetail = { 
    heading: {
        id: "result[0].extracted.person.personId",
        thumbnail: {
            src: "result[0].extracted.person.image",
            width: "70px",
            height: "70px"
        },
        title: "result[0].extracted.person.name"
    },
    personal: {
        name: {
            id: "name",
            title: "Name",
            dataPath: "result[0].extracted.person.name",
            width: "400px",
            metadata: [
                {
                    type: "block",
                    color: "#96bde4",
                    value: "B"
                },
                {
                    type: "block",
                    color: "#5d6aaa",
                    value: "3",
                    popover: {
                        title: "Sources",
                        dataPath: "result[0].extracted.person.sources",
                        placement: "right",
                        colors: "sourcesColors",
                        cols: [
                            {
                                path: "name",
                                type: "chiclet",
                                colors: "sourcesColors"
                            },
                            {
                                path: "timestamp",
                                type: "datetime",
                                format: "yyyy-MM-dd",
                            }
                        ],
                    }
                }
            ]
        },
        phone: {
            id: "phone",
            title: "Phone Number",
            dataPath: "result[0].extracted.person.phone",
            icon: "phone",
            width: "400px",
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
        },
        email: {
            id: "email",
            title: "Email",
            dataPath: "result[0].extracted.person.email",
            icon: "email",
            width: "400px",
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
        },
        ssn: {
            id: "ssn",
            title: "SSN",
            dataPath: "result[0].extracted.person.ssn",
            width: "400px",
            metadata: [
                {
                    type: "block",
                    color: "#e67485",
                    value: "R"
                },
                {
                    type: "block",
                    color: "#5d6aaa",
                    value: "4"
                }
            ]
        },
        sources: {
            id: "sources",
            title: "Sources",
            dataPath: "result[0].extracted.person.sources",
            icon: "sources",
            width: "400px",
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
        },
        address: {
            id: "address",
            title: "Address",
            width: "600px",
            dataPath: "result[0].extracted.person.address",
            cols: [
                {
                    title: "Street",
                    value: "street",
                    width: "320px"
                },
                {
                    title: "City",
                    value: "city",
                    width: "140px"
                },
                {
                    title: "State",
                    value: "state",
                    width: "50px"
                },
                {
                    title: "Zip",
                    value: "zip.fiveDigit",
                    width: "65px"
                }
            ],
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
        },
        school: {
            id: "school",
            title: "School",
            width: "600px",
            dataPath: "result[0].extracted.person.school",
            cols: [
                {
                    title: "Name",
                    value: "name",
                    width: "320px"
                },
                {
                    title: "Enrolled",
                    value: "enrolled",
                    width: "294px"
                }
            ],
            metadata: [
                {
                    type: "block",
                    color: "#96bde4",
                    value: "B"
                },
                {
                    type: "block",
                    color: "#5d6aaa",
                    value: "3",
                    popover: {
                        title: "Sources",
                        dataPath: "result[0].extracted.person.sources",
                        placement: "right",
                        colors: "sourcesColors",
                        cols: [
                            {
                                path: "name",
                                type: "chiclet",
                                colors: "sourcesColors"
                            },
                            {
                                path: "timestamp",
                                type: "datetime",
                                format: "yyyy-MM-dd",
                            }
                        ],
                    }
                }
            ]
        }
    }
};