const dashboardConfig  = {  

    // Dashboard view
    dashboard: {
        "metrics": {
            "component": "Metrics",
            "config": {
                "items": [
                {
                    "title": "New entities this week",
                    "type": "entities",
                    "path": "entities",
                    "period": 10080,
                    "color": "#70d8c1"
                },
                {
                    "title": "Sources added this week",
                    "type": "sources",
                    "path": "sources",
                    "period": 10080,
                    "color": "#f5d881"
                },
                {
                    "title": "Tasks created today",
                    "type": "tasks",
                    "path": "tasks",
                    "period": 1440,
                    "color": "#ffbd8e"
                },
                {
                    "title": "Activities unassigned",
                    "type": "activities",
                    "path": "activities",
                    "period": 0,
                    "color": "#ff984e"
                }
                ]
            }
        },
    
        "recentSearches": {
            "component": "RecentSearches",
            "maxEntries": 100,
            "maxTime": 1440,
            "config": {
                "cols": [
                {
                    "title": "Search Criteria",
                    "type": "query"
                },
                {
                    "title": "Copy & Share",
                    "type": "icon"
                }
                ]
            }
        },
    
        "whatsNew": {
            "component": "WhatsNew",
            "config": {
                "items": [
                {
                    "label": "New",
                    "type": "new",
                    "path": "new",
                    "color": "#3CDBC0"
                },
                {
                    "label": "Changed",
                    "type": "changed",
                    "path": "changed",
                    "color": "#09ABDE"
                },
                {
                    "label": "Submitted",
                    "type": "submitted",
                    "path": "submitted",
                    "color": "#09EFEF"
                }
                ],
                "menu": [
                {
                    "label": "Today",
                    "period": 1440
                },
                {
                    "label": "This Week",
                    "period": 10080,
                    "default": true
                },
                {
                    "label": "This Month",
                    "period": 43200
                }
                ]
            }
        },
    
        "recentRecords": {
            "component": "RecentRecords",
            "maxEntries": 100,
            "maxTime": 1440,
            "config": {
                "entities": {
                    "person": {
                        "thumbnail": {
                        "component": "Image",
                        "config": {
                            //"arrayPath": "person.images.image",
                            //"path": "url",
                            "path": "person.images..*[?(@property === 'url')]",
                            "alt": "recent thumbnail",
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
                                        "arrayPath": "person.nameGroup",
                                        "path": "givenname.value",
                                        "suffix": " "
                                    },
                                    {
                                        "arrayPath": "person.nameGroup",
                                        "path": "surname.value"
                                    }
                                ]
                            }
                        },
                        "items": [
                        {
                            "component": "Address",
                            "config": {
                            "arrayPath": "person.addresses.address",
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
                            "path": "person.phone",
                            "className": "phone"
                            }
                        },
                        {
                            //"arrayPath": "person.emails.email",
                            //"path": "value",
                            "path": "person.emails..*[?(@property === 'value')]",
                            "className": "email"
                        },
                        {
                            "path": "person.ssn.value"
                        }
                        ],
                        "categories": {
                        //"arrayPath": "person.sources",
                        //"path": "source.name",
                        "path": "person.sources..*[?(@property === 'name')]",
                        // Filter out all categories NOT ("New York Times" OR "Wall Street Journal")
                        //"path": "person.sources..*[?(@property === 'name' && (@ === 'New York Times' || @ === 'Wall Street Journal'))]",
                        "colors": {
                            "New York Times": "#d5e1de",
                            "USA Today": "#ebe1fa",
                            "Los Angeles Times": "#cae4ea",
                            "Wall Street Journal": "#fae9d3",
                            "Washington Post": "#fae3df",
                            "Chicago Tribune": "#f0f6d9"
                        }
                        }
                    },
                    "organization": {
                        "thumbnail": {
                            "component": "Image",
                            "config": {
                                "arrayPath": "organization.images.image",
                                "path": "url",
                                "alt": "recent thumbnail",
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
                                "arrayPath": "organization.names",
                                "path": "name.value"
                            }
                        },
                        "items": [
                        {
                            "component": "Value",
                            "config": {
                                "path": "organization.types.type"
                            }
                        },
                        {
                            "component": "Value",
                            "config": {
                                "path": "organization.country"
                            }
                        },
                        {
                            "component": "Value",
                            "config": {
                                "path": "organization.areas.area"
                            }
                        }
                        ],
                        "categories": {
                            "arrayPath": "organization.sources",
                            "path": "source.name",
                            "colors": {
                                "New York Times": "#d5e1de",
                                "USA Today": "#ebe1fa",
                                "Los Angeles Times": "#cae4ea",
                                "Wall Street Journal": "#fae9d3",
                                "Washington Post": "#fae3df",
                                "Chicago Tribune": "#f0f6d9"
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = dashboardConfig;
