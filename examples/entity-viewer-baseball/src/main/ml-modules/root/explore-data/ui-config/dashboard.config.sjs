const dashboardConfig = {
  // Dashboard view
  dashboard: {
    metrics: {},

    recentSearches: {
      component: "RecentSearches",
      maxEntries: 100,
      maxTime: 1440,
      config: {
        cols: [
          {
            title: "Search Criteria",
            type: "query",
          },
          {
            title: "Copy & Share",
            type: "icon",
          },
        ],
      },
    },

    recentRecords: {
      component: "RecentRecords",
      maxEntries: 100,
      maxTime: 1440,
      config: {
        entities: {
          team: {
            thumbnail: {
              component: "Image",
              config: {
                arrayPath: "team.images.image",
                path: "url",
                alt: "recent thumbnail",
                style: {
                  width: "70px",
                  height: "70px",
                },
              },
            },
            title: {
              id: "name",
              path: "team.fullname",
            },
            items: [
              {
                component: "Value",
                config: {
                  path: "team.location.city",
                },
              },
              {
                component: "Value",
                config: {
                  path: "team.location.state",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "capacity: ",
                  path: "team.season-details.venue.season-details.capacity",
                },
              },
            ],
          },
          player: {
            thumbnail: {
              component: "Image",
              config: {
                arrayPath: "player.images.image",
                path: "url",
                alt: "recent thumbnail",
                style: {
                  width: "70px",
                  height: "70px",
                },
              },
            },
            title: {
              id: "name",
              path: "player.fullname",
            },
            items: [
              {
                component: "Value",
                config: {
                  prefix: "dorsal:",
                  path: "player.season-details.number",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "height:",
                  path: "player.height.#text",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "weight:",
                  path: "player.weight.#text",
                },
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = dashboardConfig;
