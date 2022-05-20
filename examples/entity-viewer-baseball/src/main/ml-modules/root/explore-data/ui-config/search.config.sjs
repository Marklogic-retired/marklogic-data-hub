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
            type: "category",
            name: "country",
            tooltip: "Filter by country.",
          },
          {
            type: "category",
            name: "state",
            tooltip: "Filter by country.",
          },
          {
            type: "category",
            name: "bats",
            tooltip: "Filter by school.",
          },
          {
            type: "category",
            name: "throws",
            tooltip: "Filter by throws.",
          },
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
                    width: "350px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Capacity: ",
                  path: "extracted.team.season-details.venue.season-details.capacity",
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
                    width: "350px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Dorsal: ",
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
                  prefix: "Bats: ",
                  path: "extracted.player.bats",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Throws: ",
                  path: "extracted.player.throws",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Height: ",
                  path: "extracted.player.height.#text",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "Weight: ",
                  path: "extracted.player.weight.#text",
                },
              },
            ],
            timestamp: {
              arrayPath: "extracted.player",
              path: "birthdate",
              type: "datetime",
              format: "yyyy-MM-dd",
              prefix: "Birth date: ",
              style: {
                fontStyle: "normal",
              },
            },
          },
          event: {
            icon: {
              type: "faBomb",
              color: "#8C85DE",
            },
            title: {
              id: "uri",
              path: "extracted.event.attacktype1_txt",
            },
            items: [
              {
                component: "Address",
                config: {
                  arrayPath: "extracted.event",
                  city: "city",
                  country: "country_txt",
                  state: "region_txt",
                  style: {
                    width: "350px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                },
              },
              {
                component: "Value",
                config: {
                  path: "extracted.event.weaptype1_txt",
                },
              },
              {
                component: "Value",
                config: {
                  path: "extracted.event.weapsubtype1_txt",
                },
              },
              {
                component: "Value",
                config: {
                  path: "extracted.event.propextent_txt",
                },
              },
            ],
            timestamp: {
              arrayPath: "extracted.event",
              path: "iyear",
              type: "datetime",
              format: "yyyy",
              prefix: "Occurred on: ",
              style: {
                fontStyle: "normal",
              },
            },
          },
        },
      },
    },
  },
};

module.exports = searchConfig;
