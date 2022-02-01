export const detail = {
    "docUri": "",  // Filled in dynamically
    "entityInstanceProperties": {}, // Filled in dynamically
    "recordType": "xml",
    "recordMetadata": {
        "datahubCreatedBy": "admin",
        "datahubCreatedByStep": "mapCustomersXML",
        "datahubCreatedInFlow": "CurateCustomerXML",
        "datahubCreatedOn": "2021-11-19T01:35:35.296391-08:00",
        "datahubCreatedByJob": "2af005bd-7ab7-471a-b36e-5313cdd8ecc5"
    },
    "collections": [
        "Customer",
        "mapCustomersXML"
    ],
    "permissions": [
        {
        "capability": "update",
        "roleId": "7004461930022123088",
        "roleName": "data-hub-operator"
        },
        {
        "capability": "read",
        "roleId": "9817166411556333901",
        "roleName": "data-hub-common"
        }
    ],
    "quality": 0,
    "documentProperties": null,
    "sources": [
        {
        "datahubSourceName": "CustomerXML",
        "datahubSourceType": "XML"
        }
    ],
    "history": [
        {
        "updatedTime": "2021-11-19T01:35:35.39244-08:00",
        "flow": "CurateCustomerXML",
        "step": "mapCustomersXML",
        "user": "admin"
        },
        {
        "updatedTime": "2021-11-19T01:35:35.117102-08:00",
        "flow": "CurateCustomerXML",
        "step": "loadCustomersXML",
        "user": "admin"
        }
    ],
    "documentSize": {
        "value": 3,
        "units": "KB"
    }
};