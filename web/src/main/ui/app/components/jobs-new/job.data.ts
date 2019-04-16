export const jobData = {

    "jobId": "7e59df5c-3e9f-4109-bb8e-f52cb926aa8e",
    "flow": "Order Flow 01",
    "targetEntity": "Order",
    "user": "admin",
    "lastAttemptedStep": 2,
    "lastCompletedStep": 1,
    "jobStatus": "finished",
    "timeStarted": "2019-03-20T09:54:31.330356-07:00",
    "timeEnded": "2019-03-20T10:54:35.385579-07:00",
    "committed": 100,
    "errors": 3,
    "steps": [
      {
        "stepNumber": 1,
        "type": "ingest",
        "name": "default-ingest",
        "stepName": "Flow 01 Ingest Step",
        "identifier": null,
        "retryLimit": 0,
        "options": {
          "outputFormat": "json",
          "collections": "defaultIngest"
        },
        "stepStatus": "finished",
        "timeStarted": "2019-03-20T09:54:31.330356-07:00",
        "timeEnded": "2019-03-20T10:10:05.123456-07:00",
        "committed": 13429,
        "errors": 0
      },
      {
        "stepNumber": 2,
        "type": "mapping",
        "name": "default-mapping",
        "stepName": "Flow 01 Mapping Step",
        "identifier": null,
        "retryLimit": 0,
        "options": {
          "outputFormat": "json",
          "collections": "Flow 01 Ingest Step",
          "targetEntity": "Order"
        },
        "stepStatus": "failed",
        "timeStarted": "2019-03-20T10:10:05.123456-07:00",
        "timeEnded": "2019-03-20T10:54:35.385579-07:00",
        "committed": 286,
        "errors": 3
      },
      {
        "stepNumber": 3,
        "type": "mastering",
        "name": "default-mastering",
        "stepName": "Flow 01 Mastering Step",
        "identifier": null,
        "retryLimit": 0,
        "options": {
          "outputFormat": "json",
          "collections": "Flow 01 Mapping Step",
          "targetEntity": "Order"
        },
        "stepStatus": null,
        "timeStarted": null,
        "timeEnded": null,
        "committed": null,
        "errors": null
      }
    ]
};
