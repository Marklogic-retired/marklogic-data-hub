//test data for job results table
export const jobResults = {
  "total": 1000,
  "start": 1,
  "pageLength": 10,
  "results": [
    {
      "stepName": "mapClientJSON",
      "stepDefinitionType": "mapping",
      "jobStatus": "finished",
      "entityName": "Client",
      "startTime": "2021-04-21T20:37:42.962833-05:00",
      "duration": "PT0.066399S",
      "successfulItemCount": 5,
      "failedItemCount": 0,
      "user": "pari",
      "jobId": "2fe6a65e-0996-43c5-83c7-6bbf4e0db6b3",
      "flowName": "CurateClientJSON"
    },
    {
      "stepName": "loadClientJSON",
      "stepDefinitionType": "ingestion",
      "jobStatus": "running",
      "entityName": null,
      "startTime": "2021-04-21T21:37:42.89343-05:00",
      "duration": "PT0.059876S",
      "successfulItemCount": 5,
      "failedItemCount": 0,
      "user": "hc-developer",
      "jobId": "2fe6a65e-0996-43c5-83c7-6bbf4e0db6b3",
      "flowName": "CurateClientJSON"
    },
    {
      "stepName": "map-orders",
      "stepDefinitionType": "mappingOrder",
      "jobStatus": "finished_with_errors",
      "entityName": "Order",
      "startTime": "2021-04-21T22:37:41.4655-05:00",
      "duration": "PT0.099557S",
      "successfulItemCount": 10,
      "failedItemCount": 0,
      "user": "hc-developer",
      "jobId": "61040854-2894-44b9-8fbd-fc6e71357692",
      "flowName": "convertedFlow"
    }
  ]
};
