const loads = {"data" :
    [{
      "name": "testLoad",
      "description": "",
      "sourceFormat": "json",
      "targetFormat": "json",
      "outputURIReplacement": "",
      "inputFilePath": "/json-test/data-sets/testLoad",
      "lastUpdated": "2020-04-02T23:08:28.287065-07:00",
    }],
  "status" :200
};

const flows = {
  "data": [{
    "name": "testFlow",
    "description": "",
      "steps": [
          {
              "stepName": "testLoad",
              "stepDefinitionType": "INGESTION",
              "stepNumber": "1",
              "sourceFormat": "json"
          }
      ]
  }]
  ,
  "status" :200
}

const loadsXML = {"data" :
    [{
      "name": "testLoadXML",
      "description": "",
      "sourceFormat": "xml",
      "targetFormat": "xml",
      "outputURIReplacement": "",
      "inputFilePath": "/xml-test/data-sets/testLoadXML",
      "lastUpdated": "2020-04-02T23:08:28.287065-07:00",
    }],
  "status" :200
};

const data = {
    flows: flows,
    loads: loads,
    loadsXML: loadsXML
};

export default data;
