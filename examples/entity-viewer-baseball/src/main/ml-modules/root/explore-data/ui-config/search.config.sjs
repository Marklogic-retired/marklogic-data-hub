const searchConfig = {
  // Search view
  search: {
    defaultEntity: "team",

    meter: {
      component: "SummaryMeter",
      config: {
        colors: {
          all: "#cccccc",
          filters: "#1ACCA8",
        },
        totalPath: "searchResults.recordCount.total",
      },
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
            type: "string",
            name: "country",
            tooltip: "Filter by country.",
          },
          {
            type: "string",
            name: "state",
            tooltip: "Filter by state.",
          },
          {
            type: "string",
            name: "position",
            tooltip: "Filter by position.",
          },
          {
            type: "string",
            name: "throws",
            tooltip: "Filter by throws.",
          },
          {
            type: "string",
            name: "bats",
            tooltip: "Filter by bats.",
          },
          {
            type: "string",
            name: "field",
            tooltip: "Filter by field.",
          }
        ],
      },
    },

    selectedFacets: {
      component: "SelectedFacets",
      config: {},
    },

    results: {
      component: "ResultsList",
      config: {
        pageLengths: [10, 20, 40, 80],
        defaultIcon: {
          type: "faCircle",
          color: "lightgrey",
        },
        "sort":{
            "entities": ["player"],
            "label": "Birthdate",
            "sortBy": "birthdate",
            "order": "descending"
        },
        entities: {
          team: {
            icon: {
              type: "faUsers",
              color: "#fdbcc6",
            },
            thumbnail: {
              component: "Image",
              config: {
                arrayPath: "extracted.team.images.image",
                path: "url",
                alt: "result thumbnail",
                style: {
                  width: "70px",
                  height: "70px",
                },
              },
            },
            title: {
              id: "fullname",
              path: "extracted.team.fullname",
            },
            items: [
              {
                component: "Address",
                config: {
                  arrayPath: "extracted.team.location",
                  city: "city",
                  state: "state",
                  country: "country",
                  style: {
                    width: "240px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Stadium: ",
                  path: "extracted.team.season-details.venue.name[0]",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Capacity: ",
                  path: "extracted.team.season-details.venue.season-details.capacity",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Field Type: ",
                  path: "extracted.team.season-details.venue.season-details.field-type.name",
                },
              },
            ],
          },
          player: {
            icon: {
              type: "faUser",
              color: "#8C85DE",
            },
            thumbnail: {
              component: "Image",
              config: {
                arrayPath: "extracted.player.images.image",
                path: "url",
                alt: "result thumbnail",
                style: {
                  width: "70px",
                  height: "70px",
                },
              },
            },
            title: {
              id: "fullname",
              path: "extracted.player.fullname",
            },
            items: [
              {
                component: "Address",
                config: {
                  arrayPath: "extracted.player.location",
                  city: "city",
                  state: "state",
                  country: "country",
                  style: {
                    width: "240px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Number: ",
                  path: "extracted.player.season-details.number",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Position: ",
                  path: "extracted.player.season-details.position.name",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Throws: ",
                  path: "extracted.player.throws",
                  style: {
                      textTransform: "capitalize"
                  }
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Bats: ",
                  path: "extracted.player.bats",
                  style: {
                      textTransform: "capitalize"
                  }
                },
              }
            ],
            timestamp: {
              arrayPath: "extracted.player",
              path: "birthdate",
              type: "datetime",
              format: "yyyy-MM-dd",
              prefix: "Birthdate: ",
              style: {
                fontStyle: "normal",
              },
            },
          }
        },
      },
    },
  },
};

module.exports = searchConfig;
