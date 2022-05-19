const dashboardConfig  = {  

    // Dashboard view
    dashboard: {
        metrics: {
            component: "Metrics",
            config: {
                items: [
                    {
                        title: "New entities this week",
                        type: "entities",
                        path: "entities",
                        period: 10080,
                        color: "#70d8c1"
                    },
                    {
                        title: "Sources added this week",
                        type: "sources",
                        path: "sources",
                        period: 10080,
                        color: "#f5d881"
                    },
                    {
                        title: "Tasks created today",
                        type: "tasks",
                        path: "tasks",
                        period: 1440,
                        color: "#ffbd8e"
                    },
                    {
                        title: "Activities unassigned",
                        type: "activities",
                        path: "activities",
                        period: 0,
                        color: "#ff984e"
                    }
                ]
            }
        },

        recentSearches: {
            component: "RecentSearches",
            maxEntries: 100,
            maxTime: 1440,
            config: {
                cols: [
                {
                    title: "Search Criteria",
                    type: "query"
                },
                {
                    title: "Copy & Share",
                    type: "icon"
                }
                ]
            }
        },

        whatsNew: {
            component: "WhatsNew",
            config: {
                items: [
                    {
                        label: "New",
                        type: "new",
                        path: "new",
                        color: "#3CDBC0"
                    },
                    {
                        label: "Changed",
                        type: "changed",
                        path: "changed",
                        color: "#09ABDE"
                    }
                ],
                menu: [
                    {
                        label: "Today",
                        period: 1440
                    },
                    {
                        label: "This Week",
                        period: 10080,
                        default: true
                    }
                ]
            }
        },

        recentRecords: {
            component: "RecentRecords",
            maxEntries: 100,
            maxTime: 1440,
            config: {
                entities: {
                    ENTITY1: {
                        title: {
                            id: "uri",
                            path: "uri"
                        },
                        items: [],
                    },
                    ENTITY2: {
                        title: {
                            id: "uri",
                            path: "uri"
                        },
                        items: [],
                    },
                }
            }
        }
    }
};

module.exports = dashboardConfig;
