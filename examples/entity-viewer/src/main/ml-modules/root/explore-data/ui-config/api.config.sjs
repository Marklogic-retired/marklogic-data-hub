const apiConfig  = {  

    // API Endpoints
    api: { 
        searchResultsEndpoint: "/api/explore",
        detailEndpoint: "/api/explore/getRecord",
        recordsEndpoint: "/api/explore/getRecords",
        recentEndpoint: "/api/explore/recentlyVisited",
        recentStorage: "local",
        metricsEndpoint: "/api/explore/metrics",
        whatsNewEndpoint: "/api/explore/metrics"
    }
  
}
  
module.exports = apiConfig;
