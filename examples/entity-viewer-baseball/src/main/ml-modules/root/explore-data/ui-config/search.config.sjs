const searchConfig  = {  

    // Search view
    search: {
        "defaultEntity": "team",

        "meter": {
        "component": "SummaryMeter",
        "config": {
            "colors": {
            "all": "#cccccc",
            "filters": "#1ACCA8"
            },
            "totalPath": "searchResults.recordCount.total"
        }
        },

        "facets": {
            "component": "Facets",
            "config": {
                "selected": "#1acca8",
                "unselected": "#dfdfdf",
                "displayThreshold": 3,
                "displayShort": 3,
                "displayLong": 5,
                "items": []
            }
        },

        "selectedFacets": {
            "component": "SelectedFacets",
            "config": {}
        },

        "results": {
            "component": "ResultsList",
            "config": {
                "pageLengths": [10, 20, 40, 80],
                "defaultIcon" : {
                "type": "faCircle",
                "color": "lightgrey"
                },
                "entities": {
                    "team": {
                        "icon": {
                        "type": "faUsers",
                        "color": "#fdbcc6"
                        },
                        "title": {
                        "id": "uri",
                        "path": "uri"
                        },
                        "items": []
                    },
                    "player": {
                        "icon": {
                            "type": "faUser",
                            "color": "#8C85DE"
                        },
                        "title": {
                            "id": "uri",
                            "path": "uri"
                        },
                        "items": []
                    }
                }
            }
        }
    }
  
}
  
module.exports = searchConfig;
