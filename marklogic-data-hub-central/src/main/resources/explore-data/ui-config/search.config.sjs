const searchConfig  = {  

    // Search view
    search: {
        defaultEntity: "ENTITY1",

        meter: {
            component: "SummaryMeter",
            config: {
                colors: {
                    all: "#cccccc",
                    filters: "#1ACCA8"
                },
                totalPath: "searchResults.recordCount.total"
            }
        },

        facets: {
            component: "Facets",
            config: {
                selected: "#1acca8",
                unselected: "#dfdfdf",
                displayThreshold: 3,
                displayShort: 3,
                displayLong: 5,
                items: [
                    {
                        type: "category",
                        name: "Collection",
                        tooltip: "Filter by collection."
                    },
                    {
                        type: "category",
                        name: "CONSTRAINT1",
                        tooltip: "Filter by CONSTRAINT1."
                    }
                ]
            }
        },

        selectedFacets: {
            component: "SelectedFacets",
            config: {}
        },

        results: {
            component: "ResultsList",
            config: {
                pageLengths: [10, 20, 40, 80],
                "defaultIcon" : {
                    type: "faCircle",
                    color: "lightgrey"
                },
                entities: {
                    ENTITY1: {
                        icon: {
                            type: "faUser",
                            color: "#8C85DE"
                        },
                        title: {
                            id: "uri",
                            path: "uri"
                        },
                        items: [
                            {
                                component: "Value",
                                config: {
                                    path: "snippet.match.#text"
                                }
                            }
                        ]
                    },
                    ENTITY2: {
                        icon: {
                            type: "faIndustry",
                            color: "#fdbcc6"
                        },
                        title: {
                            id: "uri",
                            path: "uri"
                        },
                        items: [
                            {
                                component: "Value",
                                config: {
                                    path: "snippet.match.#text"
                                }
                            }
                        ]
                    }
                }
            }
        }
    }
  
}
  
module.exports = searchConfig;
