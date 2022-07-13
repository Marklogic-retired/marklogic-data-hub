const searchConfig  = {  

    // Search view
    search: {
        "defaultEntity": "person",
    
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
                "items": [
                {
                    "type": "dateRange",
                    "name": "created",
                    "tooltip": "Filter by date created."
                },
                {
                    "type": "dateRange",
                    "name": "updated",
                    "tooltip": "Filter by date updated."
                },
                {
                    "type": "string",
                    "name": "sources",
                    "tooltip": "Filter by source."
                },
                {
                    "type": "string",
                    "name": "status",
                    "tooltip": "Filter by status."
                },
                {
                    "type": "string",
                    "name": "country",
                    "tooltip": "Filter by country."
                },
                {
                    "type": "string",
                    "name": "area",
                    "tooltip": "Filter by area."
                }
                ]
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
                "sort":{
                    "entities": ["person", "organization"],
                    "label": "Created On",
                    "sortBy": "createdOn",
                    "order": "descending"
                },
                "entities": {
                    "person": {
                        "icon": {
                        "type": "faUser",
                        "color": "#8C85DE"
                        },
                        "thumbnail": {
                            "component": "Image",
                            "config": {
                                "arrayPath": "extracted.person.images.image",
                                "path": "url",
                                "alt": "result thumbnail",
                                "style": {
                                    "width": "48px",
                                    "height": "48px"
                                }
                            }
                        },
                        "title": {
                            "id": "uri",
                            "arrayPath": "extracted.person.nameGroup",
                            "path": "fullname.value"
                        },
                        "items": [
                        {
                            "component": "Address",
                            "config": {
                                "arrayPath": "extracted.person.addresses.address",
                                "street1": "street",
                                "city": "city",
                                "state": "state",
                                "postal1": "postal",
                                "country": "country",
                                "style": {
                                    "width": "350px",
                                    "overflow": "hidden",
                                    "textOverflow": "ellipsis"
                                }
                            }
                        },
                        {
                            "component": "Value",
                            "config": {
                                "path": "extracted.person.phone",
                                "className": "phone"
                            }
                        },
                        {
                            "arrayPath": "extracted.person.emails.email",
                            "path": "value",
                            "className": "email"
                        },
                        {
                            "path": "extracted.person.ssn.value"
                        }
                        ],
                        "categories": {
                            "arrayPath": "extracted.person.sources",
                            "path": "source.name",
                            "colors": {
                                "New York Times": "#d5e1de",
                                "USA Today": "#ebe1fa",
                                "Los Angeles Times": "#cae4ea",
                                "Wall Street Journal": "#fae9d3",
                                "Washington Post": "#fae3df",
                                "Chicago Tribune": "#f0f6d9"
                            }
                        },
                        "timestamp": {
                            "arrayPath": "extracted.person.createdOn",
                            "path": "ts",
                            "type": "datetime",
                            "format": "yyyy-MM-dd",
                            "prefix": "Created on ",
                            "style": {
                                "fontStyle": "normal"
                            }
                        },
                        "status": { "path": "extracted.person.status" },
                        "resultActions": {
                            "component": "ResultActions",
                            "config": {
                                "id": "resultActions",
                                "arrayPath": "person.actions.action",
                                "action": {
                                "icon": "icon",
                                "color": "color",
                                "url": "url"
                                }
                            }
                        }
                    },
                    "organization": {
                        "icon": {
                            "type": "faIndustry",
                            "color": "#fdbcc6"
                        },
                        "thumbnail": {
                            "component": "Image",
                            "config": {
                                "arrayPath": "extracted.organization.images.image",
                                "path": "url",
                                "alt": "result thumbnail",
                                "style": {
                                    "width": "48px",
                                    "height": "48px"
                                }
                            }
                        },
                        "title": {
                            "id": "uri",
                            "arrayPath": "extracted.organization.names",
                            "path": "name.value"
                        },
                        "items": [
                        {
                            "component": "Value",
                            "config": {
                            "path": "extracted.organization.types.type"
                            }
                        },
                        {
                            "component": "Value",
                            "config": {
                            "path": "extracted.organization.country"
                            }
                        },
                        {
                            "component": "Value",
                            "config": {
                            "path": "extracted.organization.areas.area"
                            }
                        }
                        ],
                        "categories": {
                            "arrayPath": "extracted.organization.sources",
                            "path": "source.name",
                            "colors": {
                                "New York Times": "#d5e1de",
                                "USA Today": "#ebe1fa",
                                "Los Angeles Times": "#cae4ea",
                                "Wall Street Journal": "#fae9d3",
                                "Washington Post": "#fae3df",
                                "Chicago Tribune": "#f0f6d9"
                            }
                        },
                        "timestamp": {
                            "arrayPath": "extracted.organization.createdOn",
                            "path": "ts",
                            "type": "datetime",
                            "format": "yyyy-MM-dd",
                            "prefix": "Created on ",
                            "style": {
                                "fontStyle": "normal"
                            }
                        }
                    }
                }
            }
        }
    }
  
}
  
module.exports = searchConfig;
