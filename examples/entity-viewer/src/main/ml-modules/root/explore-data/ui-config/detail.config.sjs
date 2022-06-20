const detailConfig  = {  

    // Detail view
    detail: {
        "entities": {
          "person": {
            "heading": {
                "id": "uri",
                "thumbnail": {
                        "component": "Image",
                        "config": {
                        "arrayPath": "person.images.image",
                        "path": "url",
                        "alt": "detail thumbnail",
                        "style": {
                            "width": "60px",
                            "height": "60px"
                        }
                        }
                },
                "title": {
                    "path": "person.nameGroup.fullname.value"
                }
            },
            "membership": {
                "component": "Membership",
                "config": {
                    "arrayPath": "person.memberships.membership",
                    "dateFormat": "yyyy-MM-dd",
                    "iconSize": 30,
                    "status": {
                       "path": "important"
                    },
                    "ts": {
                       "path": "ts"
                    },
                    "lists": [
                        "list1",
                        "list2",
                        "list3",
                        "list4",
                        "list5",
                        "list6",
                        "list7",
                        "list8",
                        "list9",
                        "list10",
                        "list11",
                        "list12"
                    ]
                }
            },
            "info": {
                "title":"Personal Info",
                "items": [
                {
                  "component": "DataTableValue",
                  "config": {
                    "id": "name",
                    "title": "Name",
                    "path": "person.nameGroup.fullname",
                    "value": "value",
                    "width": "400px",
                    "metadata": [
                      {
                        "type": "block",
                        "color": "#96bde4",
                        "path": "classification",
                        "placement": "after"
                      },
                      {
                        "type": "block",
                        "color": "#5d6aaa",
                        "popover": {
                          "title": "Sources",
                          "dataPath": "source",
                          "placement": "right",
                          "cols": [
                            {
                              "path": "name",
                              "type": "chiclet",
                              "colors": {
                                "New York Times": "#d5e1de",
                                "USA Today": "#ebe1fa",
                                "Los Angeles Times": "#cae4ea",
                                "Wall Street Journal": "#fae9d3",
                                "Washington Post": "#fae3df",
                                "Chicago Tribune": "#f0f6d9"
                              }
                            },
                            {
                              "path": "ts",
                              "type": "datetime",
                              "format": "yyyy-MM-dd"
                            }
                          ]
                        }
                      }
                    ]
                  }
                },
                {
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
                },
                {
                  "component": "DataTableValue",
                  "config": {
                    "id": "email",
                    "title": "Email",
                    "arrayPath": "person.emails.email",
                    "value": "value",
                    "icon": "email",
                    "width": "400px",
                    "metadata": [
                      {
                        "type": "block",
                        "color": "#96bde4",
                        "path": "classification",
                        "placement": "after"
                      }
                    ]
                  }
                },
                {
                  "component": "DataTableValue",
                  "config": {
                    "id": "ssn",
                    "title": "SSN",
                    "path": "person.ssn",
                    "value": "value",
                    "width": "400px",
                    "metadata": [
                      {
                        "type": "block",
                        "color": "#f4364c",
                        "path": "classification",
                        "placement": "before",
                        "style": {
                          "width": "20px"
                        }
                      }
                    ]
                  }
                },
                {
                  "component": "DataTableMultiValue",
                  "config": {
                    "id": "address",
                    "title": "Address",
                    "width": "680px",
                    "arrayPath": "person.addresses.address",
                    "cols": [
                      {
                        "title": "Street",
                        "value": "street",
                        "width": "220px"
                      },
                      {
                        "title": "City",
                        "value": "city",
                        "width": "130px"
                      },
                      {
                        "title": "State",
                        "value": "state",
                        "width": "60px"
                      },
                      {
                        "title": "Postal Code",
                        "value": "postal",
                        "width": "85px"
                      },
                      {
                        "title": "Country",
                        "value": "country",
                        "width": "100px"
                      }
                    ],
                    "metadata": [
                      {
                        "type": "block",
                        "color": "#96bde4",
                        "path": "classification",
                        "placement": "after"
                      }
                    ]
                  }
                },
                {
                  "component": "DataTableMultiValue",
                  "config": {
                    "id": "school",
                    "title": "School",
                    "width": "680px",
                    "arrayPath": "person.schools.school",
                    "cols": [
                      {
                        "title": "Name",
                        "value": "name",
                        "width": "240px"
                      },
                      {
                        "title": "City",
                        "value": "city",
                        "width": "130px"
                      },
                      {
                        "title": "Country",
                        "value": "country",
                        "width": "100px"
                      }
                    ],
                    "metadata": [
                      {
                        "type": "block",
                        "color": "#5d6aaa",
                        "placement": "after",
                        "popover": {
                          "title": "Sources",
                          "dataPath": "source",
                          "placement": "right",
                          "cols": [
                            {
                              "path": "name",
                              "type": "chiclet",
                              "colors": {
                                "New York Times": "#d5e1de",
                                "USA Today": "#ebe1fa",
                                "Los Angeles Times": "#cae4ea",
                                "Wall Street Journal": "#fae9d3",
                                "Washington Post": "#fae3df",
                                "Chicago Tribune": "#f0f6d9"
                              }
                            },
                            {
                              "path": "ts",
                              "type": "datetime",
                              "format": "yyyy-MM-dd"
                            }
                          ]
                        }
                      }
                    ]
                  }
                },
                {
                  "component": "SocialMedia",
                  "config": {
                    "title": "Social Media",
                    "social": {
                      "arrayPath": "person.socials.social",
                      "site": "site",
                      "handle": "handle",
                      "url": "address"
                    },
                    "sites": {
                      "facebook": {
                        "title": "facebook",
                        "icon": "Facebook",
                        "color": "#3B5998",
                        "size": 18
                      },
                      "twitter": {
                        "title": "twitter",
                        "icon": "Twitter",
                        "color": "#00ACEE",
                        "size": 18
                      },
                      "linkedin": {
                        "title": "linkedin",
                        "icon": "Linkedin",
                        "color": "#0E76A8",
                        "size": 18
                      },
                      "instagram": {
                        "title": "instagram",
                        "icon": "Instagram",
                        "color": "#8134AF",
                        "size": 18
                      },
                      "youtube": {
                        "title": "youtube",
                        "icon": "Youtube",
                        "color": "#c4302b",
                        "size": 18
                      }
                    }
                  }
                },
                {
                  "component": "RecordRaw",
                  "config": {
                    "id": "raw", 
                    "name": "person",
                    "title": "Record Raw",
                    "path": "person",
                    "maxHeight": "400px",
                    "enableClipboard": false,
                    "displayDataTypes": false,
                    "quotesOnKeys": false,
                    "displayObjectSize": false,
                    "collapsedLevel": 2,
                    "indentWidth": 10,
                    "groupArraysAfterLength": 3,
                  }
                },
              ]
            },
            "relationships": {
              "component": "Relationships",
              "config": {
                "type": "text",
                "size": 30,
                "root": {
                  "id": {
                    "path": "uri"
                  },
                  "label": {
                    "path": "person.nameGroup.fullname.value"
                  },
                  "imgSrc": {
                    "arrayPath": "person.images.image",
                    "path": "url"
                  },
                  "popover": {
                    "items": [
                      {
                        "label": "Name",
                        "path": "person.nameGroup.fullname.value"
                      },
                      {
                        "label": "City",
                        "arrayPath": "person.addresses.address",
                        "path": "city"
                      },
                      {
                        "label": "State",
                        "arrayPath": "person.addresses.address",
                        "path": "state"
                      }
                    ]
                  }
                },
                "relations": {
                  "arrayPath": "person.relations.relation",
                  "id": {
                    "path": "id"
                  },
                  "predicate": {
                    "path": "predicate"
                  },
                  "label": {
                    "path": "fullname"
                  },
                  "imgSrc": {
                    "path": "imageSrc"
                  },
                  "popover": {
                    "items": [
                      {
                        "label": "Name",
                        "path": "fullname"
                      },
                      {
                        "label": "City",
                        "path": "city"
                      },
                      {
                        "label": "State",
                        "path": "state"
                      }
                    ]
                  }
                },
                "options": {} // override vis.js network options
              }
            },
            "imageGallery": {
              "component": "ImageGalleryMulti",
              "config": {
                "style": {
                  "height": "150px",
                  "width": "150px"
                },
                "images": {
                  "arrayPath": "person.images.image",
                  "url": "url"
                },
                "modal": {
                  "title": {
                    "component": "Value",
                    "path": "url",
                    "config": {
                      "style": {
                        "fontStyle": "bold"
                      }
                    }
                  },
                  "items": [
                    {
                      "component": "Value",
                      "label": "Source",
                      "path": "source.name",
                      "config": {}
                    },
                    {
                      "component": "DateTime",
                      "label": "Uploaded on",
                      "path": "source.ts",
                      "config": {
                        "format": "MMMM dd, yyyy"
                      }
                    },
                    {
                      "component": "Value",
                      "label": "Uploaded by",
                      "path": "source.uploadedBy",
                      "config": {
                        "className": "foo"
                      }
                    }
                  ]
                },
                "download": true
              }
            },
            "timeline": {
              "component": "Timeline",
              "config": {
                "title": "Activities",
                "arrayPath": "person.activities.activity",
                "marker": {
                  "label": {
                    "path": "predplace"
                  },
                  "ts": {
                    "path": "ts"
                  }
                },
                "popover": {
                  "placement": "right",
                  "items": [
                    {
                      "component": "DateTime",
                      "label": "Activity date",
                      "config": {
                        "path": "ts",
                        "format": "MMMM dd, yyyy"
                      }
                    },
                    {
                      "label": "Source",
                      "path": "source.name"
                    },
                    {
                      "component": "DateTime",
                      "label": "Source date",
                      "config": {
                        "path": "source.ts",
                        "format": "MMMM dd, yyyy"
                      }
                    },
                    {
                      "label": "Created by",
                      "path": "source.createdBy"
                    },
                    {
                      "label": "Approved by",
                      "path": "source.approvedBy"
                    }
                  ]
                },
                options: {} // override vis.js timeline options
              }
            },
            "linkList": {
              "component": "LinkList",
              "config": {
                "id": "linkList",
                "title": "Record Actions",
                "arrayPath": "person.links.link",
                "link": {
                  "icon": "icon",
                  "label": "label",
                  "url": "url"
                }
              }
            }
          },
          "organization": {
            "heading": {
              "id": "uri",
              "thumbnail": {
                "component": "Image",
                "config": {
                  "arrayPath": "organization.images.image",
                  "path": "url",
                  "alt": "detail thumbnail",
                  "style": {
                    "width": "60px",
                    "height": "60px"
                  }
                }
              },
              "title": {
                "path": "organization.names.name.value"
              }
            },
            "info": {
              "title":"Organization Info",
              "items": [
                {
                  "component": "DataTableValue",
                  "config": {
                    "id": "name",
                    "title": "Name",
                    "path": "organization.names.name",
                    "value": "value",
                    "width": "400px",
                    "metadata": [
                      {
                        "type": "block",
                        "color": "#96bde4",
                        "path": "classification",
                        "placement": "after"
                      },
                      {
                        "type": "block",
                        "color": "#5d6aaa",
                        "popover": {
                          "title": "Sources",
                          "dataPath": "source",
                          "placement": "right",
                          "cols": [
                            {
                              "path": "name",
                              "type": "chiclet",
                              "colors": {
                                "New York Times": "#d5e1de",
                                "USA Today": "#ebe1fa",
                                "Los Angeles Times": "#cae4ea",
                                "Wall Street Journal": "#fae9d3",
                                "Washington Post": "#fae3df",
                                "Chicago Tribune": "#f0f6d9"
                              }
                            },
                            {
                              "path": "ts",
                              "type": "datetime",
                              "format": "yyyy-MM-dd"
                            }
                          ]
                        }
                      }
                    ]
                  }
                },
                {
                  "component": "DataTableValue",
                  "config": {
                    "id": "type",
                    "title": "Type",
                    "path": "organization.types",
                    "value": "type",
                    "width": "400px"
                  }
                },
                {
                  "component": "DataTableValue",
                  "config": {
                    "id": "country",
                    "title": "Country",
                    "arrayPath": "organization",
                    "value": "country",
                    "width": "400px"
                  }
                },
                {
                  "component": "DataTableValue",
                  "config": {
                    "id": "area",
                    "title": "Area of Operations",
                    "arrayPath": "organization.areas",
                    "value": "area",
                    "width": "400px"
                  }
                }
              ]
            },
            "imageGallery": {
              "component": "ImageGalleryMulti",
              "config": {
                "style": {
                  "height": "150px",
                  "width": "150px"
                },
                "images": {
                  "arrayPath": "organization.images.image",
                  "url": "url"
                },
                "modal": {
                  "title": {
                    "component": "Value",
                    "path": "url",
                    "config": {
                      "style": {
                        "fontStyle": "bold"
                      }
                    }
                  },
                  "items": [
                    {
                      "component": "Value",
                      "label": "Source",
                      "path": "source.name",
                      "config": {}
                    },
                    {
                      "component": "DateTime",
                      "label": "Uploaded on",
                      "path": "source.ts",
                      "config": {
                        "format": "MMMM dd, yyyy"
                      }
                    },
                    {
                      "component": "Value",
                      "label": "Uploaded by",
                      "path": "source.uploadedBy",
                      "config": {
                        "className": "foo"
                      }
                    }
                  ]
                },
                "download": true
              }
            }
          }
        }
    }
  
}
  
module.exports = detailConfig;
