const detailConfig = {
  // Detail view
  detail: {
    entities: {
      team: {
        heading: {
          thumbnail: {
            component: "Image",
            config: {
              arrayPath: "team.images.image",
              path: "url",
              alt: "detail thumbnail",
              style: {
                width: "60px",
                height: "60px",
              },
            },
          },
          title: {
            path: "team.fullname",
          },
        },
        info: {
          title: "Team Info",
          items: [
            {
              component: "DataTableValue",
              config: {
                id: "name",
                title: "Name",
                path: "team",
                value: "fullname",
                width: "400px",
                metadata: [
                  {
                    type: "block",
                    color: "#96bde4",
                    path: "classification",
                    placement: "after",
                  },
                  {
                    type: "block",
                    color: "#5d6aaa",
                    popover: {
                      title: "Sources",
                      dataPath: "source",
                      placement: "right",
                      cols: [
                        {
                          path: "name",
                          type: "chiclet",
                          colors: {
                            "New York Times": "#d5e1de",
                            "USA Today": "#ebe1fa",
                            "Los Angeles Times": "#cae4ea",
                            "Wall Street Journal": "#fae9d3",
                            "Washington Post": "#fae3df",
                            "Chicago Tribune": "#f0f6d9",
                          },
                        },
                        {
                          path: "ts",
                          type: "datetime",
                          format: "yyyy-MM-dd",
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "city",
                title: "City",
                path: "team.location",
                value: "city",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "state",
                title: "State",
                path: "team.location",
                value: "state",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "country",
                title: "country",
                path: "team.location",
                value: "country",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "capacity",
                title: "Capacity",
                path: "team.season-details.venue.season-details",
                value: "capacity",
                width: "400px",
              },
            },
          ],
        },
        relationships: {
          component: "Relationships",
          config: {
            type: "text",
            size: 30,
            root: {
              id: {
                path: "uri",
                append: ".xml",
              },
              label: {
                path: "team.fullname",
              },
              popover: {
                items: [
                  {
                    label: "Name",
                    path: "team.fullname",
                  },
                  {
                    label: "City",
                    path: "team.location.city",
                  },
                  {
                    label: "State",
                    path: "team.location.state",
                  },
                ],
              },
            },
            relations: {
              arrayPath: "team.nearby.nearbyTeam",
              id: {
                path: "id",
                append: ".xml",
              },
              predicate: {
                path: "distance",
              },
              label: {
                path: "name",
              },
              popover: {
                items: [
                  {
                    label: "Name",
                    path: "name",
                  },
                ],
              },
            },
            options: {},
          },
        },
        imageGallery: {
          component: "ImageGalleryMulti",
          config: {
            style: {
              height: "150px",
              width: "150px",
            },
            images: {
              arrayPath: "team.images.image",
              url: "url",
            },
            modal: {
              title: {
                component: "Value",
                path: "desc",
                config: {
                  style: {
                    fontStyle: "bold",
                  },
                },
              },
              items: [],
            },
            download: true,
          },
        },
        timeline: {
          component: "Timeline",
          config: {
            title: "Games",
            arrayPath: "team.games.game",
            marker: {
              label: {
                path: "subject",
              },
              ts: {
                path: "startdate",
              },
            },
            popover: {
              placement: "right",
              items: [
                {
                  component: "DateTime",
                  label: "Game date",
                  config: {
                    path: "startdate",
                    format: "MMMM dd, yyyy",
                  },
                },
                {
                  label: "Game time",
                  path: "starttime",
                },
                {
                  label: "Location",
                  path: "location",
                },
              ],
            },
          },
        },
      },
      player: {
        heading: {
          id: "uri",
          thumbnail: {
            component: "Image",
            config: {
              arrayPath: "player.images.image",
              path: "url",
              alt: "detail thumbnail",
              style: {
                width: "60px",
                height: "60px",
              },
            },
          },
          title: {
            path: "player.fullname",
          },
        },
        info: {
          title: "Player Info",
          items: [
            {
              component: "DataTableValue",
              config: {
                id: "name",
                title: "Name",
                path: "player",
                value: "fullname",
                width: "400px",
                metadata: [
                  {
                    type: "block",
                    color: "#96bde4",
                    path: "classification",
                    placement: "after",
                  },
                  {
                    type: "block",
                    color: "#5d6aaa",
                    popover: {
                      title: "Sources",
                      dataPath: "source",
                      placement: "right",
                      cols: [
                        {
                          path: "name",
                          type: "chiclet",
                          colors: {
                            "New York Times": "#d5e1de",
                            "USA Today": "#ebe1fa",
                            "Los Angeles Times": "#cae4ea",
                            "Wall Street Journal": "#fae9d3",
                            "Washington Post": "#fae3df",
                            "Chicago Tribune": "#f0f6d9",
                          },
                        },
                        {
                          path: "ts",
                          type: "datetime",
                          format: "yyyy-MM-dd",
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "birthdate",
                title: "Birth date",
                path: "player",
                value: "birthdate",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "height",
                title: "Height",
                path: "player.height",
                value: "#text",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "weight",
                title: "Weight",
                path: "player.weight",
                value: "#text",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "throws",
                title: "Throws",
                path: "player",
                value: "throws",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "bats",
                title: "Bats",
                path: "player",
                value: "bats",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "school",
                title: "School",
                path: "player",
                value: "school",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "number",
                title: "Season number",
                path: "player.season-details",
                value: "number",
                width: "400px",
              },
            },
          ],
        },
        imageGallery: {
          component: "ImageGalleryMulti",
          config: {
            style: {
              height: "150px",
              width: "150px",
            },
            images: {
              arrayPath: "player.images.image",
              url: "url",
            },
            modal: {
              title: {
                component: "Value",
                path: "desc",
                config: {
                  style: {
                    fontStyle: "bold",
                  },
                },
              },
              items: [],
            },
            download: true,
          },
        },
      },
    },
  },
};

module.exports = detailConfig;
