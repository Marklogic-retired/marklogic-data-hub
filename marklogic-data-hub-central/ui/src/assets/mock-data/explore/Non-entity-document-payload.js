//Test data for non-entity instance document

const sourcesTableData = [
  {
    key: 1,
    sourceName: "testSourceForCustomer",
    sourceType: "testSourceType"
  }
];

const historyData = [
  {key: 1, updatedTime: "2020-08-10 12:00", flow: "loadCustomerFlow", step: "mapCustomerStep", user: "Ernie"},
  {key: 2, updatedTime: "2020-07-10 08:45", flow: "loadCustomerFlow", step: "mergeCustomer", user: "Ernie"},
  {key: 3, updatedTime: "2020-07-01 13:12", flow: "loadCustomerFlow", step: "loadCustomer", user: "Wai Lin"}
];

const data = {
  "customerId": "1001",
  "firstName": "Gabriel",
  "lastName": "Stane",
  "Gender": "Male",
  "years_active": "3",
  "Street": "324 Wilkinson blvd",
  "Apt": "108",
  "City": "Long Beach",
  "State": "CA",
  "zipCode": "95034"
};

const textData = "customerId 1001\
  firstName Gabriel\
  lastName Stane\
  Gender Male\
  years_active 3\
  Street 324 Wilkinson blvd\
  Apt 108\
  City Long Beach\
  State CA\
  zipCode 95034";

let xmlInput = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<dictionary xmlns=\"http://marklogic.com/xdmp/spell\">\n  <word>Alexandra</word>\n  <word>Alexandria</word>\n  <word>Alice</word>\n  <word>Barbara</word>\n  <word>Bob</word>\n  <word>Gary</word>\n  <word>Gerry</word>\n  <word>Jane</word>\n  <word>Jason</word>\n  <word>Jennifer</word>\n  <word>Jonathan</word>\n  <word>Rachel</word>\n  <word>Rebecca</word>\n  <word>Robert</word>\n</dictionary>";
let xmlData = {dictionary: {word: ["Alexandra", "Alexandria", "Alice", "Barbara", "Bob", "Gary", "Gerry", "Jane", "Jason", "Jennifer", "Jonathan", "Rachel", "Rebecca", "Robert"]}};

const detailRecordDownloadResponse =
  {
    "data": {

    },
    "status": 200,
    "statusText": "OK",
    "headers": {
      "cache-control": "no-cache, no-store, max-age=0, must-revalidate",
      "connection": "close",
      "content-disposition": "attachment; filename=loadCustomers.json",
      "content-type": "application/octet-stream",
      "date": "Thu, 10 Dec 2020 19:27:05 GMT",
      "expires": "0",
      "pragma": "no-cache",
      "transfer-encoding": "chunked",
      "x-content-type-options": "nosniff",
      "x-powered-by": "Express",
      "x-xss-protection": "1; mode=block"
    },
    "config": {
      "url": "/api/record/download?docUri=/loadCustomers.json&database=staging",
      "method": "get",
      "headers": {
        "Accept": "application/json, text/plain, */*"
      },
      "transformRequest": [
        null
      ],
      "transformResponse": [
        null
      ],
      "timeout": 0,
      "responseType": "blob",
      "xsrfCookieName": "XSRF-TOKEN",
      "xsrfHeaderName": "X-XSRF-TOKEN",
      "maxContentLength": -1
    },
    "request": {

    }
  };

  const allDataRecordDownloadResponse =
  {
    "data": {

    },
    "status": 200,
    "statusText": "OK",
    "headers": {
      "cache-control": "no-cache, no-store, max-age=0, must-revalidate",
      "connection": "close",
      "content-disposition": "attachment; filename=Cust1.json",
      "content-type": "application/octet-stream",
      "date": "Thu, 10 Dec 2020 18:12:40 GMT",
      "expires": "0",
      "pragma": "no-cache",
      "transfer-encoding": "chunked",
      "x-content-type-options": "nosniff",
      "x-powered-by": "Express",
      "x-xss-protection": "1; mode=block"
    },
    "config": {
      "url": "/api/record/download?docUri=/Customer/Cust1.json&database=final",
      "method": "get",
      "headers": {
        "Accept": "application/json, text/plain, */*"
      },
      "transformRequest": [
        null
      ],
      "transformResponse": [
        null
      ],
      "timeout": 0,
      "responseType": "blob",
      "xsrfCookieName": "XSRF-TOKEN",
      "xsrfHeaderName": "X-XSRF-TOKEN",
      "maxContentLength": -1
    },
    "request": {

    }
  };

const testData = {
  NonEntityDocumentData: {
    uri: "/loadCustomers.json",
    sourcesTableData: sourcesTableData,
    historyData: historyData,
    selectedSearchOptions: {},
    entityInstance: {},
    isEntityInstance: false,
    contentType: "json",
    data: data,
    xml: "",
    detailPagePreferences: {},
    database: "staging"
  },
  xmlInput: xmlInput,
  xmlData: xmlData,
  textData: textData,
  detailRecordDownloadResponse: detailRecordDownloadResponse,
  allDataRecordDownloadResponse: allDataRecordDownloadResponse,
};

export default testData;
