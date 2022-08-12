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
                "entityType": {
                    "path": "entityType",
                    "rootRelative": false
                },
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
                                //"arrayPath": "extracted.person.images.image",
                                //"path": "url",
                                "path": "extracted.person.images..*[?(@property === 'url')]",
                                "alt": "result thumbnail",
                                "style": {
                                    "width": "70px",
                                    "height": "70px"
                                }
                            }
                        },
                        "title": {
                            "id": {
                                "path": "uri"
                            },
                            "component": "Concat",
                            "config": {
                                "items": [
                                    {
                                        "arrayPath": "extracted.person.nameGroup",
                                        "path": "givenname.value",
                                        "suffix": " "
                                    },
                                    {
                                        "arrayPath": "extracted.person.nameGroup",
                                        "path": "surname.value"
                                    } 
                                ]
                            }
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
                                //"path": "extracted.person.phone",
                                "path": "extracted.person.contacts..[?(@[`type`] === 'phone')].value",
                                //"path": "extracted.person.contacts..value",
                                "className": "phone"
                            }
                        },
                        { 
                            //"arrayPath": "extracted.person.emails.email",
                            //"path": "value",
                            "path": "extracted.person.emails..*[?(@property === 'value')]",
                            "className": "email"
                        },
                        {
                            "path": "extracted.person.ssn.value"
                        }
                        ],
                        "categories": {
                            //"arrayPath": "extracted.person.sources",
                            //"path": "source.name",
                            "path": "$.extracted.person.sources..*[?(@property === 'name')]",
                            // Filter out all categories NOT ("New York Times" OR "Wall Street Journal")
                            //"path": "extracted.person.sources..*[?(@property === 'name' && (@ === 'New York Times' || @ === 'Wall Street Journal'))]",
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
                            //"arrayPath": "extracted.person.createdOn",
                            //"path": "ts",
                            "path": "extracted.person.createdOn..ts",
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
                                    "width": "70px",
                                    "height": "70px"
                                }
                            }
                        },
                        "title": {
                            "id": {
                                "path": "uri"
                            },
                            "component": "Value",
                            "config": {
                                "arrayPath": "extracted.organization.names",
                                "path": "name.value"
                            }
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
                        },
                        {
                            "component": "Concat",
                            "config": {
                                "items": [
                                    "Created by: ",
                                    {
                                        "path": "extracted.organization.createdOn.user"
                                    },
                                    {
                                        "path": "extracted.organization.createdOn.ts",
                                        "type": "DateTime",
                                        "prefix": " (",
                                        "suffix": ")",
                                    }
                                ]
                            }
                        }
                        ],
                        "categories": {
                            //"arrayPath": "extracted.organization.sources",
                            //"path": "source.name",
                            "path": "$.extracted.organization.sources..*[?(@property === 'name')]",
                            // Filter out all categories NOT ("New York Times" OR "Wall Street Journal")
                            // "path": "$.extracted.organization.sources..*[?(@property === 'name' && (@ === 'New York Times' || @ === 'Wall Street Journal'))]",
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
