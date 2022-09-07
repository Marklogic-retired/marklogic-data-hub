const emptyNotificationData = {
  notifications: [],
  totalCount: 0,
  currentPage: 1
};

export const notificationsMock = {
  notificationOptions: Object.assign(emptyNotificationData, {
    notifications: [
      {"meta":
        {
          "dateTime": "2022-09-06T09:35:47.29384-07:00",
          "entityName": "Person",
          "status": "unread",
          "uri": "/com.marklogic.smart-mastering/matcher/notifications/d3c895e83ac036edc1ff9a67450ccd4c.xml",
          "user": "hc-developer"
        },
      "thresholdLabel": "Likely Match",
      "uris": [{"uri": "/com.marklogic.smart-mastering/merged/ecbd43241f2e14a06ccd24deb79ab0c5.json"}, {"uri": "/json/persons/ssn-match1.json"}]
      },
      {"meta":
        {
          "dateTime": "2022-09-06T09:35:47.29384-07:00",
          "entityName": "Person",
          "status": "unread",
          "uri": "/com.marklogic.smart-mastering/matcher/notifications/8f20518246be265f31afff39cd4e2900.xml",
          "user": "hc-developer"
        },
      "thresholdLabel": "Likely Match",
      "uris": [{"uri": "/json/persons/last-name-address-reduce1.json"}, {"uri": "/json/persons/last-name-address-reduce2.json"}]
      }
    ]
    ,
    totalCount: 4,
    currentPage: 1
  }),
  setNotificationsObj: jest.fn()
};

