//test data for job results table
export const jobResults = {
  "total": 1000,
  "start": 1,
  "pageLength": 10,
  "results": [
    {
      "stepName": "CustomerLoad",
      "stepType": "ingestion",
      "status": "finished",
      "entityName": "Customer",
      "startTime": "2021-03-29T10:41:12.125738-05:00",
      "duration": "PT1H20M5S",
      "successfulEvents": 1000000,
      "failedEvents": 0,
      "userId": "pari",
      "jobId": "",
      "flowName": "CustomerFlow"
    },
    {
      "stepName": "CustomerMap",
      "stepType": "mapping",
      "status": "finished_with_errors",
      "entityName": "Customer",
      "startTime": "2021-01-10T00:00",
      "duration": "PT45M5S",
      "successfulEvents": 500000,
      "failedEvents": 500000,
      "userId": "ernie",
      "jobId": "",
      "flowName": "CustomerFlow"
    },
    {
      "stepName": "CustomerMap",
      "stepType": "mapping",
      "status": "running",
      "entityName": "Customer",
      "startTime": "2021-03-29T10:41:12.125738-05:00",
      "duration": "P1DT1H20M5S",
      "successfulEvents": 250000,
      "failedEvents": 0,
      "userId": "betrand",
      "jobId": "",
      "flowName": "CustomerFlow"
    }
  ]
};
