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
                "component": "DataTableMultiValue",
                "config": {
                    "id": "address",
                    "title": "Location",
                    "width": "500px",
                    "arrayPath": "team.location",
                    "cols": [
                        {
                        "title": "City",
                        "value": "city",
                        "width": "220px"
                        },
                        {
                        "title": "State",
                        "value": "state",
                        "width": "130px"
                        },
                        {
                        "title": "Country",
                        "value": "country",
                        "width": "100px"
                        }
                    ]
                }
            },
            {
              component: "DataTableValue",
              config: {
                id: "stadium",
                title: "Stadium",
                path: "team.season-details.venue.name[0]",
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
            {
              component: "DataTableValue",
              config: {
                id: "field",
                title: "Field",
                path: "team.season-details.venue.season-details.field-type.name",
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
                  label: "Game date",
                  path: "startdate",
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
                "component": "DataTableMultiValue",
                "config": {
                "id": "address",
                "title": "Hometown",
                "width": "500px",
                "arrayPath": "player.location",
                "cols": [
                    {
                    "title": "City",
                    "value": "city",
                    "width": "220px"
                    },
                    {
                    "title": "State",
                    "value": "state",
                    "width": "130px"
                    },
                    {
                    "title": "Country",
                    "value": "country",
                    "width": "100px"
                    }
                ]
                }
            },
            {
              component: "DataTableValue",
              config: {
                id: "birthdate",
                title: "Birthdate",
                path: "player",
                value: "birthdate",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "number",
                title: "Number",
                path: "player.season-details",
                value: "number",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "number",
                title: "Position",
                path: "player.season-details.position.name[0]",
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
                style: {
                      textTransform: "capitalize"
                }
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
                style: {
                      textTransform: "capitalize"
                }
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "height",
                title: "Height (in)",
                path: "player.height",
                value: "#text",
                width: "400px",
              },
            },
            {
              component: "DataTableValue",
              config: {
                id: "weight",
                title: "Weight (lbs)",
                path: "player.weight",
                value: "#text",
                width: "400px"
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
