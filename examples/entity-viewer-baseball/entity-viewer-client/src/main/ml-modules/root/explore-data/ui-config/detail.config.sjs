const detailConfig  = {  

    // Detail view
    detail: {
    "entities": {
      "team": {
        "heading": {
          "title": {
            "path": "uri"
          }
        },
        "info": {
          "title": "Team Info",
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
                "path": "person",
                "value": "phone",
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
            }
          ]
        },
        "relationships": {},
        "imageGallery": {},
        "timeline": {}
      },
      "player": {
        "heading": {
          "id": "uri",
          "title": {
            "path": "uri"
          }
        },
        "info": {
          "title":"Player Info",
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
            }
          ]
        },
        "relationships": {},
        "imageGallery": {},
        "timeline": {}
      }
    }
  }
  
}
  
module.exports = detailConfig;
