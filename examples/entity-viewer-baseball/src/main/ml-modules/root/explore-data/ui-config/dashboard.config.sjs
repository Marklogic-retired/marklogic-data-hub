const dashboardConfig  = {  

    // Dashboard view
    dashboard: {
    "metrics": {},

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

    "recentRecords": {
      "component": "RecentRecords",
      "maxEntries": 100,
      "maxTime": 1440,
      "config": {
        "entities": {
          "team": {
            "title": {
              "id": "uri",
              "path": "uri"
            },
            "items": []
          },
          "player": {
            "title": {
              "id": "uri",
              "path": "uri"
            },
            "items": []
          }
        }
      }
    }
  }
};

module.exports = dashboardConfig;
