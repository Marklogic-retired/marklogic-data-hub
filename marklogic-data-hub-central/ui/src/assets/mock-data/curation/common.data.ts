// Test data

import moment from "moment";

const flows = [
  {
    name: "FlowA",
    steps: [
      {
        name: "stepA1",
        type: "Load Data",
        format: "JSON"
      },
      {
        name: "stepA2",
        type: "Mapping",
        format: "JSON"
      }
    ]
  },
  {
    name: "FlowB",
    steps: [
      {
        name: "stepB1",
        type: "Load Data",
        format: "XML"
      },
      {
        name: "stepB2",
        type: "Mapping",
        format: "XML"
      },
      {
        name: "stepB3",
        type: "Mastering",
        format: "XML"
      },
    ]
  }
];

const flowsAdd = [
  {
    name: "FlowStepNoExist",
    steps: [
      {
        stepNum: "1",
        stepName: "testLoad456", // has step NOT IN loadData
        stepDefinitionType: "Load Data",
        stepId: "testLoad456-ingestion",
        format: "xml"
      },
    ]
  },
  {
    name: "FlowStepExist",
    steps: [
      {
        stepNum: "1",
        stepName: "testLoadXML", // has step IN loadData
        stepDefinitionType: "Load Data",
        stepId: "testLoadXML-ingestion",
        format: "xml"
      },
      {
        stepNum: "2",
        stepName: "testLoad", // step exists in more than one flow
        stepDefinitionType: "Load Data",
        stepId: "testLoad-ingestion",
        format: "json"
      }
    ]
  },
  {
    name: "FlowStepMultExist",
    steps: [
      {
        stepNum: "1",
        stepName: "testLoad", // step exists in more than one flow
        stepDefinitionType: "Load Data",
        stepId: "testLoad-ingestion",
        format: "json",
      }
    ]
  }
];

const loadData = {
  data: [
    {
      name: "testLoad",
      description: "description for JSON load",
      sourceFormat: "json",
      targetFormat: "json",
      outputURIReplacement: "",
      inputFilePath: "/json-test/data-sets/testLoad",
      provenanceGranularityLevel: "coarse",
      batchSize: 35,
      permissions: "data-hub-operator,read,data-hub-operator,update",
      targetDatabase: "data-hub-STAGING",
      collections: ["testLoad"],
      additionalCollections: ["addedCollection"],
      headers: {
        "header": true
      },
      interceptors: {
        "interceptor": true
      },
      customHook: {
        "hook": true
      },
      lastUpdated: "2000-01-01T12:00:00.000000-00:00"
    },
    {
      name: "testLoadXML",
      description: "description for XML load",
      sourceFormat: "json",
      targetFormat: "xml",
      outputURIReplacement: "",
      inputFilePath: "/xml-test/data-sets/testLoad",
      lastUpdated: "2020-04-15T14:22:54.057519-07:00"
    },
    {
      name: "testLoad123",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    }
  ],
  deleteLoadArtifact: jest.fn(),
  createLoadArtifact: jest.fn(),
  canReadWrite: true,
  canReadOnly: false,

};

const jsonSourceDataMultipleSiblings = {
  "data": {
    "proteinId": "123EAC",
    "proteinType": "home",
    "nutFreeName": [
      {
        "FirstNamePreferred": "John",
        "LastName": {
          "#text": "Smith",
          "suffix": "Sr."
        }
      },
      {
        "FirstNamePreferred": "Eric",
        "LastName": {
          "#text": "Johnson",
          "suffix": "Jr."
        }
      }
    ],
    "proteinCat": "commercial",
    "withNutsOrganism": {
      "OrganismName": "Frog virus 3",
      "OrganismType": "scientific"
    },
    "proteinDog": "retriever, golden, labrador",
    "emptyString": "",
    "nullValue": null,
    "numberValue": 321,
    "booleanValue": true,
    "whitespaceValue": " ",
    "emptyArrayValue": [],
    "numberArray": [1, 2, 3],
    "booleanArray": [true, false, true]
  },
  "namespaces": {},
  "format": "JSON"
};

const jsonSourceDataMultipleSiblingsEntireRecord = {
  "data": {
    "entity-services:envelope": {
      "entity-service:headers": {
        "createdOn": "2021-02-26T14:09:13.783548-08:00",
        "createdBy": "hc-developer"
      },
      "entity-service:instance": {
        "proteinId": "123EAC",
        "proteinType": "home",
        "nutFreeName": [
          {
            "FirstNamePreferred": "John",
            "LastName": {
              "#text": "Smith",
              "suffix": "Sr."
            }
          },
          {
            "FirstNamePreferred": "Eric",
            "LastName": {
              "#text": "Johnson",
              "suffix": "Jr."
            }
          }
        ],
        "proteinCat": "commercial",
        "withNutsOrganism": {
          "OrganismName": "Frog virus 3",
          "OrganismType": "scientific"
        },
        "proteinDog": "retriever, golden, labrador",
        "emptyString": "",
        "nullValue": null,
        "numberValue": 321,
        "booleanValue": true,
        "whitespaceValue": " ",
        "emptyArrayValue": [],
        "numberArray": [1, 2, 3],
        "booleanArray": [true, false, true]
      }
    },
    "entity-service:triples": "",
  },
  "namespaces": {},
  "format": "JSON"
};

const jsonSourceDataDefault = {
  "data": {
    "proteinId": "123EAC",
    "proteinType": "home",
    "nutFreeName": [
      {
        "FirstNamePreferred": "John",
        "LastName": {
          "#text": "Smith",
          "suffix": "Sr."
        }
      }
    ],
    "proteinCat": "commercial",
    "proteinDog": ["retriever, golden, labrador"],
    "emptyString": "",
    "nullValue": null,
    "numberValue": 321,
    "booleanValue": true,
    "whitespaceValue": " ",
    "emptyArrayValue": [],
    "numberArray": [1, 2, 3],
    "booleanArray": [true, false, true]
  },
  "namespaces": {},
  "format": "JSON"
};

const jsonSourceDataRelated = {
  "data": {
    "proteinId": "123EAC",
    "proteinType": "home",
    "nutFreeName": [
      {
        "FirstNamePreferred": "John",
        "LastName": {
          "#text": "Smith",
          "suffix": "Sr."
        }
      }
    ],
    "proteinCat": "commercial",
    "proteinDog": ["retriever, golden, labrador"],
    "emptyString": "",
    "nullValue": null,
    "numberValue": 321,
    "booleanValue": true,
    "whitespaceValue": " ",
    "emptyArrayValue": [],
    "numberArray": [1, 2, 3],
    "booleanArray": [true, false, true],
    "BabyRegistry": [
      {
        "BabyRegistryId": "3039",
        "Arrival_Date": "2021-06-07"
      }
    ]
  },
  "namespaces": {},
  "format": "JSON"
};

const jsonSourceDataLargeDataset = {
  "data": {
    "CustomerID": 105,
    "Name": {
      "FirstName": "Holland",
      "LastName": "Wells"
    },
    "nicknames": [
      "holly",
      "well"
    ],
    "Email": "hollandwells@nutralab.com",
    "Address": [
      {
        "Shipping": {
          "Street": "Hanover Place",
          "City": "Marshall",
          "State": "Oklahoma",
          "Postal": "19111-1001"
        }
      },
      {
        "Shipping": {
          "Street": "1800 Tysons Blvd",
          "City": "McLean",
          "State": "Virginia",
          "Postal": "22102-2021"
        }
      },
      {
        "Billing": {
          "Street": "Sunnyside Avenue",
          "City": "Brutus",
          "State": "Wisconsin",
          "Postal": "30706-8854"
        }
      }
    ],
    "Phone": "(887) 571-2692",
    "PIN": 1772,
    "Created": "05/06/2016",
    "prop0": "value1",
    "prop1": "value2",
    "prop2": "value3",
    "prop3": "value4",
    "prop4": "value5",
    "prop5": "value6",
    "prop6": "value7",
    "prop7": "value8",
    "prop8": "value9",
    "prop9": "value10",
    "prop10": "value1",
    "prop11": "value1",
    "prop12": "value1",
    "prop13": "value1",
    "prop14": "value1",
    "prop15": "value1",
    "prop16": "value1",
    "prop17": "value1",
    "prop18": "value1",
    "prop19": "value1",
    "prop20": "value1",
    "prop21": "value1",
    "prop22": "value1",
    "prop23": "value1",
    "prop24": "value1",
    "prop25": "value1",
    "prop26": "value1",
    "prop27": "value1",
    "prop28": "value1",
    "prop29": "value1",
    "prop30": "value1",
    "prop31": "value1",
    "prop32": "value1",
    "prop33": "value1",
    "prop34": "value1",
    "prop35": "value1",
    "prop36": "value1",
    "prop37": "value1",
    "prop38": "value1",
    "prop39": "value1",
    "prop40": "value1",
    "prop41": "value1",
    "prop42": "value1",
    "prop43": "value1",
    "prop44": "value1",
    "prop45": "value1",
    "prop46": "value1",
    "prop47": "value1",
    "prop48": "value1",
    "prop49": "value1",
    "prop50": "value1",
    "prop51": "value1",
    "prop52": "value1",
    "prop53": "value1",
    "prop54": "value1",
    "prop55": "value1",
    "prop56": "value1",
    "prop57": "value1",
    "prop58": "value1",
    "prop59": "value1",
    "prop60": "value1",
    "prop61": "value1",
    "prop62": "value1",
    "prop63": "value1",
    "prop64": "value1",
    "prop65": "value1",
    "prop66": "value1",
    "prop67": "value1",
    "prop68": "value1",
    "prop69": "value1",
    "prop70": "value1",
    "prop71": "value1",
    "prop72": "value1",
    "prop73": "value1",
    "prop74": "value1",
    "prop75": "value1",
    "prop76": "value1",
    "prop77": "value1",
    "prop78": "value1",
    "prop79": "value1",
    "prop80": "value1",
    "prop81": "value1",
    "prop82": "value1",
    "prop83": "value1",
    "prop84": "value1",
    "prop85": "value1",
    "prop86": "value1",
    "prop87": "value1",
    "prop88": "value1",
    "prop89": "value1",
    "prop90": "value1",
    "prop91": "value1",
    "prop92": "value1",
    "prop93": "value1",
    "prop94": "value1",
    "prop95": "value1",
    "prop96": "value1",
    "prop97": "value1",
    "prop98": "value1",
    "prop99": "value1",
    "prop100": "value1",
    "prop101": "value1",
    "prop102": "value1",
    "prop103": "value1",
    "prop104": "value1",
    "prop105": "value1",
    "prop106": "value1",
    "prop107": "value1",
    "prop108": "value1",
    "prop109": "value1",
    "prop110": "value1",
    "prop111": "value1",
    "prop112": "value1",
    "prop113": "value1",
    "prop114": "value1",
    "prop115": "value1",
    "prop116": "value1",
    "prop117": "value1",
    "prop118": "value1",
    "prop119": "value1",
    "prop120": "value1",
    "prop121": "value1",
    "prop122": "value1",
    "prop123": "value1",
    "prop124": "value1",
    "prop125": "value1",
    "prop126": "value1",
    "prop127": "value1",
    "prop128": "value1",
    "prop129": "value1",
    "prop130": "value1",
    "prop131": "value1",
    "prop132": "value1",
    "prop133": "value1",
    "prop134": "value1",
    "prop135": "value1",
    "prop136": "value1",
    "prop137": "value1",
    "prop138": "value1",
    "prop139": "value1",
    "prop140": "value1",
    "prop141": "value1",
    "prop142": "value1",
    "prop143": "value1",
    "prop144": "value1",
    "prop145": "value1",
    "prop146": "value1",
    "prop147": "value1",
    "prop148": "value1",
    "prop149": "value1",
    "prop150": "value1",
    "prop151": "value1",
    "prop152": "value1",
    "prop153": "value1",
    "prop154": "value1",
    "prop155": "value1",
    "prop156": "value1",
    "prop157": "value1",
    "prop158": "value1",
    "prop159": "value1",
    "prop160": "value1",
    "prop161": "value1",
    "prop162": "value1",
    "prop163": "value1",
    "prop164": "value1",
    "prop165": "value1",
    "prop166": "value1",
    "prop167": "value1",
    "prop168": "value1",
    "prop169": {
      "prop126Billing": {
        "Street": "Kingston Avenue",
        "City": "Menlo Park",
        "State": "California",
        "Postal": {
          "fiveDigit": "94025",
          "plusFour": "8854"
        }
      }
    },
    "prop170": "value1",
    "prop171": "value1",
    "prop172": "value1",
    "prop173": "value1",
    "prop174": "value1",
    "prop175": "value1",
    "prop176": "value1",
    "prop177": "value1",
    "prop178": "value1",
    "prop179": "value1",
    "prop180": "value1",
    "prop181": "value1",
    "prop182": "value1",
    "prop183": "value1",
    "prop184": "value1",
    "prop185": "value1",
    "prop186": "value1",
    "prop187": "value1",
    "prop188": "value1",
    "prop189": "value1",
    "prop190": "value1",
    "prop191": "value1",
    "prop192": "value1",
    "prop193": "value1",
    "prop194": "value1",
    "prop195": "value1",
    "prop196": "value1",
    "prop197": "value1",
    "prop198": "value1",
    "prop199": "value1",
    "prop200": "value1",
    "prop201": "value1",
    "prop202": "value1",
    "prop203": "value1",
    "prop204": "value1",
    "prop205": "value1",
    "prop206": "value1",
    "prop207": "value1",
    "prop208": "value1",
    "prop209": "value1",
    "prop210": "value1",
    "prop211": "value1",
    "prop212": "value1",
    "prop213": "value1",
    "prop214": "value1",
    "prop215": "value1",
    "prop216": "value1",
    "prop217": "value1",
    "prop218": "value1",
    "prop219": "value1",
    "prop220": "value1",
    "prop221": "value1",
    "prop222": "value1",
    "prop223": "value1",
    "prop224": "value1",
    "prop225": "value1",
    "prop226": "value1",
    "prop227": "value1",
    "prop228": "value1",
    "prop229": "value1",
    "prop230": "value1",
    "prop231": "value1",
    "prop232": "value1",
    "prop233": "value1",
    "prop234": "value1",
    "prop235": "value1",
    "prop236": "value1",
    "prop237": "value1",
    "prop238": "value1",
    "prop239": "value1",
    "prop240": "value1",
    "prop241": "value1",
    "prop242": "value1",
    "prop243": "value1",
    "prop244": "value1",
    "prop245": "value1",
    "prop246": "value1",
    "prop247": "value1",
    "prop248": "value1",
    "prop249": "value1",
    "prop250": "value1",
    "prop251": "value1",
    "prop252": "value1",
    "prop253": "value1",
    "prop254": "value1",
    "prop255": "value1",
    "prop256": "value1",
    "prop257": "value1",
    "prop258": "value1",
    "prop259": "value1",
    "prop260": "value1",
    "prop261": "value1",
    "prop262": "value1",
    "prop263": "value1",
    "prop264": "value1",
    "prop265": "value1",
    "prop266": "value1",
    "prop267": "value1",
    "prop268": "value1",
    "prop269": "value1",
    "prop270": "value1",
    "prop271": "value1",
    "prop272": "value1",
    "prop273": "value1",
    "prop274": "value1",
    "prop275": "value1",
    "prop276": "value1",
    "prop277": "value1",
    "prop278": "value1",
    "prop279": "value1",
    "prop280": "value1",
    "prop281": "value1",
    "prop282": "value1",
    "prop283": "value1",
    "prop284": "value1",
    "prop285": "value1",
    "prop286": "value1",
    "prop287": "value1",
    "prop288": "value1",
    "prop289": "value1",
    "prop290": "value1",
    "prop291": "value1",
    "prop292": "value1",
    "prop293": "value1",
    "prop294": "value1",
    "prop295": "value1",
    "prop296": "value1",
    "prop297": "value1",
    "prop298": "value1",
    "prop299": "value1"
  },
  "namespaces": {},
  "format": "JSON"
};

const entityDefLargePropSet = {
  "propId": {
    "datatype": "string"
  },
  "propId2": {
    "datatype": "string"
  },
  "propId3": {
    "datatype": "string"
  },
  "propId4": {
    "datatype": "string"
  },
  "propId5": {
    "datatype": "string"
  },
  "propId6": {
    "datatype": "string"
  },
  "propId7": {
    "datatype": "string"
  },
  "propId8": {
    "datatype": "string"
  },
  "propId9": {
    "datatype": "string"
  },
  "propId10": {
    "datatype": "string"
  },
  "propId11": {
    "datatype": "string"
  },
  "propId12": {
    "datatype": "string"
  },
  "propId13": {
    "datatype": "string"
  },
  "propId14": {
    "datatype": "string"
  },
  "propId15": {
    "datatype": "string"
  },
  "propId16": {
    "datatype": "string"
  },
  "propId17": {
    "datatype": "string"
  },
  "propId18": {
    "datatype": "string"
  },
  "propId19": {
    "datatype": "string"
  },
  "propId20": {
    "datatype": "string"
  },
  "propId21": {
    "datatype": "string"
  },
  "propId22": {
    "datatype": "string"
  },
  "propId23": {
    "datatype": "string"
  },
  "propId24": {
    "datatype": "string"
  },
  "propId25": {
    "datatype": "string"
  },
  "propId26": {
    "datatype": "string"
  },
  "propId27": {
    "datatype": "string"
  },
  "propId28": {
    "datatype": "string"
  },
  "propId29": {
    "datatype": "string"
  },
  "propId30": {
    "datatype": "string"
  },
  "propId31": {
    "datatype": "string"
  },
  "propId32": {
    "datatype": "string"
  },
  "propId33": {
    "datatype": "string"
  },
  "propId34": {
    "datatype": "string"
  },
  "propId35": {
    "datatype": "string"
  },
  "propId36": {
    "datatype": "string"
  },
  "propId37": {
    "datatype": "string"
  },
  "propId38": {
    "datatype": "string"
  },
  "propId39": {
    "datatype": "string"
  },
  "propId40": {
    "datatype": "string"
  },
  "propId41": {
    "datatype": "string"
  },
  "propId42": {
    "datatype": "string"
  },
  "propId43": {
    "datatype": "string"
  },
  "propId44": {
    "datatype": "string"
  },
  "propId45": {
    "datatype": "string"
  },
  "propId46": {
    "datatype": "string"
  },
  "propId47": {
    "datatype": "string"
  },
  "propId48": {
    "datatype": "string"
  },
  "propId49": {
    "datatype": "string"
  },
  "propId50": {
    "datatype": "string"
  },
  "propId51": {
    "datatype": "string"
  },
  "propId52": {
    "datatype": "string"
  },
  "propId53": {
    "datatype": "string"
  },
  "propId54": {
    "datatype": "string"
  },
  "propId55": {
    "datatype": "string"
  },
  "propId56": {
    "datatype": "string"
  },
  "propId57": {
    "datatype": "string"
  },
  "propId58": {
    "datatype": "string"
  },
  "propId59": {
    "datatype": "string"
  },
  "propId60": {
    "datatype": "string"
  },
  "propId61": {
    "datatype": "string"
  },
  "propId62": {
    "datatype": "string"
  },
  "propId63": {
    "datatype": "string"
  },
  "propId64": {
    "datatype": "string"
  },
  "propId65": {
    "datatype": "string"
  },
  "propId66": {
    "datatype": "string"
  },
  "propId67": {
    "datatype": "string"
  },
  "propId68": {
    "datatype": "string"
  },
  "propId69": {
    "datatype": "string"
  },
  "propId70": {
    "datatype": "string"
  },
  "propId71": {
    "datatype": "string"
  },
  "propId72": {
    "datatype": "string"
  },
  "propId73": {
    "datatype": "string"
  },
  "propId74": {
    "datatype": "string"
  },
  "propId75": {
    "datatype": "string"
  },
  "propId76": {
    "datatype": "string"
  },
  "propId77": {
    "datatype": "string"
  },
  "propId78": {
    "datatype": "string"
  },
  "propId79": {
    "datatype": "string"
  },
  "propId80": {
    "datatype": "string"
  },
  "propId81": {
    "datatype": "string"
  },
  "propId82": {
    "datatype": "string"
  },
  "propId83": {
    "datatype": "string"
  },
  "propId84": {
    "datatype": "string"
  },
  "propId85": {
    "datatype": "string"
  },
  "propId86": {
    "datatype": "string"
  },
  "propId87": {
    "datatype": "string"
  },
  "propId88": {
    "datatype": "string"
  },
  "propId89": {
    "datatype": "string"
  },
  "propId90": {
    "datatype": "string"
  },
  "propId91": {
    "datatype": "string"
  },
  "propId92": {
    "datatype": "string"
  },
  "propId93": {
    "datatype": "string"
  },
  "propId94": {
    "datatype": "string"
  },
  "propId95": {
    "datatype": "string"
  },
  "propId96": {
    "datatype": "string"
  },
  "propId97": {
    "datatype": "string"
  },
  "propId98": {
    "datatype": "string"
  },
  "propId99": {
    "datatype": "string"
  },
  "propId100": {
    "datatype": "string"
  },
  "propId101": {
    "datatype": "string"
  },
  "propId102": {
    "datatype": "string"
  },
  "propId103": {
    "datatype": "string"
  },
  "propId104": {
    "datatype": "string"
  },
  "propId105": {
    "datatype": "string"
  },
  "propId106": {
    "datatype": "string"
  },
  "propId107": {
    "datatype": "string"
  },
  "propId108": {
    "datatype": "string"
  },
  "propId109": {
    "datatype": "string"
  },
  "propId110": {
    "datatype": "string"
  },
  "propId111": {
    "datatype": "string"
  },
  "propId112": {
    "datatype": "string"
  },
  "propId113": {
    "datatype": "string"
  },
  "propId114": {
    "datatype": "string"
  },
  "propId115": {
    "datatype": "string"
  },
  "propId116": {
    "datatype": "string"
  },
  "propId117": {
    "datatype": "string"
  },
  "propId118": {
    "datatype": "string"
  },
  "propId119": {
    "datatype": "string"
  },
  "propId120": {
    "datatype": "string"
  },
  "propId121": {
    "datatype": "string"
  },
  "propId122": {
    "datatype": "string"
  },
  "propId123": {
    "datatype": "string"
  },
  "propId124": {
    "datatype": "string"
  },
  "propId125": {
    "datatype": "string"
  },
  "propId126": {
    "datatype": "string"
  },
  "propId127": {
    "datatype": "string"
  },
  "propId128": {
    "datatype": "string"
  },
  "propId129": {
    "datatype": "string"
  },
  "propId130": {
    "datatype": "string"
  },
  "propId131": {
    "datatype": "string"
  },
  "propId132": {
    "datatype": "string"
  },
  "propId133": {
    "datatype": "string"
  },
  "propId134": {
    "datatype": "string"
  },
  "propId135": {
    "datatype": "string"
  },
  "propId136": {
    "datatype": "string"
  },
  "propId137": {
    "datatype": "string"
  },
  "propId138": {
    "datatype": "string"
  },
  "propId139": {
    "datatype": "string"
  },
  "propId140": {
    "datatype": "string"
  },
  "propId141": {
    "datatype": "string"
  },
  "propId142": {
    "datatype": "string"
  },
  "propId143": {
    "datatype": "string"
  },
  "propId144": {
    "datatype": "string"
  },
  "propId145": {
    "datatype": "string"
  },
  "propId146": {
    "datatype": "string"
  },
  "propId147": {
    "datatype": "string"
  },
  "propId148": {
    "datatype": "string"
  },
  "propId149": {
    "datatype": "string"
  },
  "propId150": {
    "datatype": "string"
  },
  "propId151": {
    "datatype": "string"
  },
  "propId152": {
    "datatype": "string"
  },
  "propId153": {
    "datatype": "string"
  },
  "propId154": {
    "datatype": "string"
  },
  "propId155": {
    "datatype": "string"
  },
  "propId156": {
    "datatype": "string"
  },
  "propId157": {
    "datatype": "string"
  },
  "propId158": {
    "datatype": "string"
  },
  "propId159": {
    "datatype": "string"
  },
  "propId160": {
    "datatype": "string"
  },
  "propId161": {
    "datatype": "string"
  },
  "propId162": {
    "datatype": "string"
  },
  "propId163": {
    "datatype": "string"
  },
  "propId164": {
    "datatype": "string"
  },
  "propId165": {
    "datatype": "string"
  },
  "propId166": {
    "datatype": "string"
  },
  "propId167": {
    "datatype": "string"
  },
  "propId168": {
    "datatype": "string"
  },
  "propId169": {
    "datatype": "string"
  },
  "propId170": {
    "datatype": "string"
  },
  "propId171": {
    "datatype": "string"
  },
  "propId172": {
    "datatype": "string"
  },
  "propId173": {
    "datatype": "string"
  },
  "propId174": {
    "datatype": "string"
  },
  "propId175": {
    "datatype": "string"
  },
  "propId176": {
    "datatype": "string"
  },
  "propId177": {
    "datatype": "string"
  },
  "propId178": {
    "datatype": "string"
  },
  "propId179": {
    "datatype": "string"
  },
  "propId180": {
    "datatype": "string"
  },
  "propId181": {
    "datatype": "string"
  },
  "propId182": {
    "datatype": "string"
  },
  "propId183": {
    "datatype": "string"
  },
  "propId184": {
    "datatype": "string"
  },
  "propId185": {
    "datatype": "string"
  },
  "propId186": {
    "datatype": "string"
  },
  "propId187": {
    "datatype": "string"
  },
  "propId188": {
    "datatype": "string"
  },
  "propId189": {
    "datatype": "string"
  },
  "propId190": {
    "datatype": "string"
  },
  "propId191": {
    "datatype": "string"
  },
  "propId192": {
    "datatype": "string"
  },
  "propId193": {
    "datatype": "string"
  },
  "propId194": {
    "datatype": "string"
  },
  "propId195": {
    "datatype": "string"
  },
  "propId196": {
    "datatype": "string"
  },
  "propId197": {
    "datatype": "string"
  },
  "propId198": {
    "datatype": "string"
  },
  "propId199": {
    "datatype": "string"
  },
  "propId200": {
    "datatype": "string"
  },
  "propId201": {
    "datatype": "string"
  },
  "propId202": {
    "datatype": "string"
  },
  "propId203": {
    "datatype": "string"
  },
  "propId204": {
    "datatype": "string"
  },
  "propId205": {
    "datatype": "string"
  },
  "propId206": {
    "datatype": "string"
  },
  "propId207": {
    "datatype": "string"
  },
  "propId208": {
    "datatype": "string"
  },
  "propId209": {
    "datatype": "string"
  },
  "propId210": {
    "datatype": "string"
  },
  "propId211": {
    "datatype": "string"
  },
  "propId212": {
    "datatype": "string"
  },
  "propId213": {
    "datatype": "string"
  },
  "propId214": {
    "datatype": "string"
  },
  "propId215": {
    "datatype": "string"
  },
  "propId216": {
    "datatype": "string"
  },
  "propId217": {
    "datatype": "string"
  },
  "propId218": {
    "datatype": "string"
  },
  "propId219": {
    "datatype": "string"
  },
  "propId220": {
    "datatype": "string"
  },
  "propId221": {
    "datatype": "string"
  },
  "propId222": {
    "datatype": "string"
  },
  "propId223": {
    "datatype": "string"
  },
  "propId224": {
    "datatype": "string"
  },
  "propId225": {
    "datatype": "string"
  },
  "propId226": {
    "datatype": "string"
  },
  "propId227": {
    "datatype": "string"
  },
  "propId228": {
    "datatype": "string"
  },
  "propId229": {
    "datatype": "string"
  },
  "propId230": {
    "datatype": "string"
  },
  "propId231": {
    "datatype": "string"
  },
  "propId232": {
    "datatype": "string"
  },
  "propId233": {
    "datatype": "string"
  },
  "propId234": {
    "datatype": "string"
  },
  "propId235": {
    "datatype": "string"
  },
  "propId236": {
    "datatype": "string"
  },
  "propId237": {
    "datatype": "string"
  },
  "propId238": {
    "datatype": "string"
  },
  "propId239": {
    "datatype": "string"
  },
  "propId240": {
    "datatype": "string"
  },
  "propId241": {
    "datatype": "string"
  },
  "propId242": {
    "datatype": "string"
  },
  "propId243": {
    "datatype": "string"
  },
  "propId244": {
    "datatype": "string"
  },
  "propId245": {
    "datatype": "string"
  },
  "propId246": {
    "datatype": "string"
  },
  "propId247": {
    "datatype": "string"
  },
  "propId248": {
    "datatype": "string"
  },
  "propId249": {
    "datatype": "string"
  },
  "propId250": {
    "datatype": "string"
  },
  "propId251": {
    "datatype": "string"
  },
  "propId252": {
    "datatype": "string"
  },
  "propId253": {
    "datatype": "string"
  },
  "propId254": {
    "datatype": "string"
  },
  "propId255": {
    "datatype": "string"
  },
  "propId256": {
    "datatype": "string"
  },
  "propId257": {
    "datatype": "string"
  },
  "propId258": {
    "datatype": "string"
  },
  "propId259": {
    "datatype": "string"
  },
  "propId260": {
    "datatype": "string"
  },
  "propId261": {
    "datatype": "string"
  },
  "propId262": {
    "datatype": "string"
  },
  "propId263": {
    "datatype": "string"
  },
  "propId264": {
    "datatype": "string"
  },
  "propId265": {
    "datatype": "string"
  },
  "propId266": {
    "datatype": "string"
  },
  "propId267": {
    "datatype": "string"
  },
  "propId268": {
    "datatype": "string"
  },
  "propId269": {
    "datatype": "string"
  },
  "propId270": {
    "datatype": "string"
  },
  "propId271": {
    "datatype": "string"
  },
  "propId272": {
    "datatype": "string"
  },
  "propId273": {
    "datatype": "string"
  },
  "propId274": {
    "datatype": "string"
  },
  "propId275": {
    "datatype": "string"
  },
  "propId276": {
    "datatype": "string"
  },
  "propId277": {
    "datatype": "string"
  },
  "propId278": {
    "datatype": "string"
  },
  "propId279": {
    "datatype": "string"
  },
  "propId280": {
    "datatype": "string"
  },
  "propId281": {
    "datatype": "string"
  },
  "propId282": {
    "datatype": "string"
  },
  "propId283": {
    "datatype": "string"
  },
  "propId284": {
    "datatype": "string"
  },
  "propId285": {
    "datatype": "string"
  },
  "propId286": {
    "datatype": "string"
  },
  "propId287": {
    "datatype": "string"
  },
  "propId288": {
    "datatype": "string"
  },
  "propId289": {
    "datatype": "string"
  },
  "propId290": {
    "datatype": "string"
  },
  "propId291": {
    "datatype": "string"
  },
  "propId292": {
    "datatype": "string"
  },
  "propId293": {
    "datatype": "string"
  },
  "propId294": {
    "datatype": "string"
  },
  "propId295": {
    "datatype": "string"
  },
  "propId296": {
    "datatype": "string"
  },
  "propId297": {
    "datatype": "string"
  },
  "propId298": {
    "datatype": "string"
  },
  "propId299": {
    "datatype": "string"
  },
};

const xmlSourceDataMultipleSiblings = {
  "data": {
    "sampleProtein": {
      "@proteinType": "home",
      "proteinId": "123EAC",
      "nutFree:name": [
        {
          "FirstNamePreferred": "John",
          "LastName": "Smith"
        },
        {
          "FirstNamePreferred": "Eric",
          "LastName": "Johnson"
        }
      ],
      "proteinCat": "commercial",
      "withNuts:Organism": {
        "OrganismName": "Frog virus 3",
        "OrganismType": "scientific"
      }
    }
  },
  "namespaces": {
    "entity-services": "http://marklogic.com/entity-services",
    "nutFree": "http://uniprot.org/nutFree",
    "withNuts": "http://uniprot.org/withNuts"
  },
  "format": "XML"
};

const xmlSourceDataDefault = {
  "data": {
    "sampleProtein": {
      "@proteinType": "home",
      "proteinId": "123EAC",
      "nutFree:name": [
        {
          "FirstNamePreferred": "John",
          "LastName": "Smith"
        }
      ],
      "proteinCat": "commercial",
      "nutFree:proteinDog": [
        "retriever",
        "",
        "golden",
        "labrador"
      ]
    }
  },
  "namespaces": {
    "entity-services": "http://marklogic.com/entity-services",
    "nutFree": "http://uniprot.org/nutFree",
    "withNuts": "http://uniprot.org/withNuts"
  },
  "format": "XML"
};

const xmlSourceData = [
  {
    rowKey: 1, key: "sampleProtein", children: [
      {rowKey: 2, key: "proteinId", val: "123EAC"},
      {rowKey: 3, key: "@proteinType", val: "home"},
      {
        rowKey: 4, key: "nutFree:name", children: [
          {rowKey: 5, key: "FirstNamePreferred", val: "John"},
          {rowKey: 6, key: "LastName", val: "Smith"}
        ]
      },
      {rowKey: 7, key: "proteinCat", val: "commercial"},
      {rowKey: 8, key: "nutFree:proteinDog", val: "retriever, , golden, labrador", array: true}
    ]
  }
];

const jsonSourceData = [
  {rowKey: 1, key: "proteinId", val: "123EAC", datatype: "string"},
  {rowKey: 2, key: "proteinType", val: "home", datatype: "string"},
  {
    rowKey: 3, key: "nutFreeName", children: [
      {rowKey: 4, key: "FirstNamePreferred", val: "John", datatype: "string"},
      {rowKey: 5, key: "LastName", val: "Smith", datatype: "string", children: [
        {rowKey: 6, key: "suffix", val: "Sr.", datatype: "string"}
      ]}
    ]
  },
  {rowKey: 7, key: "proteinCat", val: "commercial", datatype: "string"},
  {rowKey: 8, key: "proteinDog", val: "retriever, golden, labrador", array: true, datatype: "string"},
  {rowKey: 9, key: "emptyString", val: "", datatype: "string"},
  {rowKey: 10, key: "nullValue", val: "null", datatype: "null"},
  {rowKey: 11, key: "numberValue", val: "321", datatype: "number"},
  {rowKey: 12, key: "booleanValue", val: "true", datatype: "boolean"},
  {rowKey: 13, key: "whitespaceValue", val: " ", datatype: "string"},
  {rowKey: 14, key: "emptyArrayValue", val: "[ ]", datatype: "object"},
  {rowKey: 15, key: "numberArray", val: "1, 2, 3", array: true, datatype: "number"},
  {rowKey: 16, key: "booleanArray", val: "true, false, true", array: true, datatype: "boolean"},
];

const entityTypeProperties = [
  {key: 1, name: "propId", type: "int"},
  {key: 2, name: "propName", type: "string"},
  {key: 3, name: "propAttribute", type: "string"},
  {
    key: 4, name: "items", type: "parent-ItemType [ ]", children: [
      {key: 5, name: "items/itemTypes", type: "string"},
      {
        key: 6, name: "items/itemCategory", type: "parent-catItem", children: [
          {key: 7, name: "items/itemCategory/artCraft", type: "string"},
          {key: 8, name: "items/itemCategory/automobile", type: "string"}
        ]
      }]
  },
  {key: 9, name: "gender", type: "string"}
];

const JSONSourceDataToTruncate = {
  "data": {
    "proteinId": "extremelylongusername@marklogic.com",
    "proteinType": "s@ml.com, , t@ml.com, u@ml.com, v@ml.com, w@ml.com, x@ml.com, y@ml.com, z@ml.com"
  }
};

const truncatedEntityProps = [
  {key: 1, name: "propId", type: "int"},
  {key: 2, name: "propName", type: "string [ ]"},
  {key: 3, name: "propAttribute", type: "string [ ]"}
];

const mapFunctions = [
  {"functionName": "echo", "category": "custom", "signature": "echo(input)"},
  {"functionName": "memoryLookup", "category": "builtin", "signature": "memoryLookup(input,inputDictionary)"},
  {"functionName": "documentLookup", "category": "builtin", "signature": "documentLookup(input,inputDictionaryPath)"},
  {"functionName": "parseDate", "category": "builtin", "signature": "parseDate(value,pattern)"},
  {"functionName": "parseDateTime", "category": "builtin", "signature": "parseDateTime(value,pattern)"},
  {"functionName": "add-function", "category": "custom", "signature": "add-function(num1,num2)"},
  {"functionName": "unparsed-text", "category": "xpath", "signature": "unparsed-text(xs:string)"},
  {"functionName": "month-from-dateTime", "category": "xpath", "signature": "month-from-dateTime(xs:dateTime?)"},
  {"functionName": "seconds-from-dateTime", "category": "xpath", "signature": "seconds-from-dateTime(xs:dateTime?)"},
  {"functionName": "concat", "category": "xpath", "signature": "concat(xs:anyAtomicType?)"}
];

const mapReferences = [{
  name: "$URI",
  description: "The URI of the source document"
}, {
  name: "$ZIP_POINTS",
  description: "Maps zip codes to points"
}];

const mapProps = {
  sourceData: jsonSourceData,
  entityTypeProperties: entityTypeProperties,
  sourceURI: "/dummy/mapping/source/uri1.json",
  mapData: {
    name: "testMap",
    description: "Description of testMap",
    targetEntityType: "Person",
    selectedSource: "collection",
    sourceQuery: "cts.collectionQuery([''])",
    properties: {
      propId: {sourcedFrom: "id"},
      propName: {sourcedFrom: "testNameInExp"},
      propAttribute: {sourcedFrom: "placeholderAttribute"},
      items: {sourcedFrom: "",
        properties:
        {itemTypes: {sourcedFrom: ""}},
        targetEntityType: "#/definitions/ItemType"
      }
    }
  },
  tgtEntityReferences: {"items": "#/definitions/ItemType"},
  namespaces: {
    nutFree: "http://namespaces/nutfree",
    withNuts: "http://namespaces/withNuts"
  },
  mapName: "testMap",
  getMappingArtifactByMapName: jest.fn(),
  updateMappingArtifact: jest.fn(() => Promise.resolve({status: 200, data: {}})),
  mappingVisible: false,
  setMappingVisible: jest.fn(),
  fetchSrcDocFromUri: jest.fn(),
  docUris: ["/dummy/mapping/source/uri1.json", "/dummy/mapping/source/uri2.json", "/dummy/mapping/source/uri3.json"],
  disableURINavLeft: true,
  disableURINavRight: false,
  setDisableURINavLeft: jest.fn(),
  setDisableURINavRight: jest.fn(),
  sourceDatabaseName: "data-hub-STAGING",
  canReadWrite: true,
  canReadOnly: false,
  docNotFound: false,
  entityTypeTitle: "Person",
  extractCollectionFromSrcQuery: jest.fn(),
  mapFunctions: mapFunctions,
  openStepSettings: jest.fn()
};

const newMap = {
  tabKey: "1",
  isEditing: false,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  openStepDetails: jest.fn(),
  createMappingArtifact: jest.fn(),
  stepData: {},
  targetEntityType: "",
  sourceDatabase: "",
  canReadWrite: true,
  canReadOnly: false,
  currentTab: "1",
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  createStep: jest.fn(),
  onCancel: jest.fn(),
};

const editMap = {
  tabKey: "1",
  isEditing: true,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  openStepDetails: jest.fn(),
  createMappingArtifact: jest.fn(),
  stepData: {
    name: "testMap",
    description: "Description of testMap",
    targetEntityType: "Person",
    selectedSource: "collection",
    sourceQuery: "cts.collectionQuery(['map-collection'])",
    properties: {
      id: {sourcedFrom: "id"},
      name: {sourcedFrom: "name"}
    }
  },
  targetEntityType: "",
  sourceDatabase: "",
  canReadWrite: true,
  canReadOnly: false,
  currentTab: "1",
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  createStep: jest.fn(),
  onCancel: jest.fn(),
};

const dropDownWithSearch = {
  setDisplaySelectList: jest.fn(),
  setDisplayMenu: jest.fn(),
  displaySelectList: true,
  displayMenu: true,
  srcData: [{key: "id", value: "id"}, {key: "name", value: "name"}]
};

const customData = [{
  "name": "customJSON",
  "stepDefinitionName": "custom-step",
  "additionalSettings": {
    "dummy": "value"
  },
  "dummy": "value",
  "stepDefinitionType": "custom",
  "sourceDatabase": "data-hub-STAGING",
  "targetDatabase": "data-hub-FINAL",
  "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
  "stepId": "customJSON-custom",
  "selectedSource": "query",
  "sourceQuery": "cts.collectionQuery(['loadCustomerJSON'])",
  "permissions": "role1,read,role2,update",
  "batchSize": 50,
  "collections": ["Customer", "mapCustomerJSON"],
  "lastUpdated": "2020-06-19T16:31:04.360975-07:00"
},
{
  "name": "customXML",
  "stepDefinitionName": "custom-mapping",
  "stepDefinitionType": "custom",
  "stepId": "customXML-custom",
  "selectedSource": "collection",
  "sourceQuery": "cts.collectionQuery(['loadCustomersXML'])",
  "lastUpdated": "2020-06-19T16:31:05.372697-07:00",
  "targetFormat": "XML"
}
];

const namespacedXmlInstance = "<Document><content><es:envelope xmlns:es=\"http://marklogic.com/entity-services\"><es:instance><Person><fname xsi:type=\"xs:string\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\">Alexandra</fname></Person></es:instance></es:envelope></content></Document>";
const noNamespaceXmlInstance = "<Document><content><envelope xmlns:es=\"http://marklogic.com/entity-services\"><instance><Person><fname xsi:type=\"xs:string\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\">Alexandra</fname></Person></instance></envelope></content></Document>";

const viewCustom = {
  tabKey: "1",
  openStepSettings: true,
  setOpenStepSettings: () => {},
  createLoadArtifact: () => {},
  stepData: customData[0],
  canReadWrite: false,
  canReadOnly: false,
  currentTab: "1",
  setIsValid: () => {},
  resetTabs: () => {},
  setHasChanged: () => {}
};


const loadDataPagination = {
  data: [
    {
      name: "testLoad1",
      description: "description for JSON load",
      sourceFormat: "json",
      targetFormat: "json",
      outputURIReplacement: "",
      inputFilePath: "/json-test/data-sets/testLoad",
      lastUpdated: "2000-01-01T12:00:00.000000-00:00"
    },
    {
      name: "testLoad2",
      description: "description for XML load",
      sourceFormat: "json",
      targetFormat: "xml",
      outputURIReplacement: "",
      inputFilePath: "/xml-test/data-sets/testLoad",
      lastUpdated: "2020-04-15T14:22:54.057519-07:00"
    },
    {
      name: "testLoad3",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad4",
      description: "description for JSON load",
      sourceFormat: "json",
      targetFormat: "json",
      outputURIReplacement: "",
      inputFilePath: "/json-test/data-sets/testLoad",
      lastUpdated: "2000-01-01T12:00:00.000000-00:00"
    },
    {
      name: "testLoad5",
      description: "description for XML load",
      sourceFormat: "json",
      targetFormat: "xml",
      outputURIReplacement: "",
      inputFilePath: "/xml-test/data-sets/testLoad",
      lastUpdated: "2020-04-15T14:22:54.057519-07:00"
    },
    {
      name: "testLoad6",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad7",
      description: "description for JSON load",
      sourceFormat: "json",
      targetFormat: "json",
      outputURIReplacement: "",
      inputFilePath: "/json-test/data-sets/testLoad",
      lastUpdated: "2000-01-01T12:00:00.000000-00:00"
    },
    {
      name: "testLoad8",
      description: "description for XML load",
      sourceFormat: "json",
      targetFormat: "xml",
      outputURIReplacement: "",
      inputFilePath: "/xml-test/data-sets/testLoad",
      lastUpdated: "2020-04-15T14:22:54.057519-07:00"
    },
    {
      name: "testLoad9",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad10",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad11",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad12",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    }
  ],
  deleteLoadArtifact: jest.fn(),
  createLoadArtifact: jest.fn(),
  canReadWrite: true,
  canReadOnly: false,

};

const columnSorter = (a: any, b: any, order: string) => order === "asc" ? a.localeCompare(b) : b.localeCompare(a);

const loadTableColumns: any = [
  {
    text: "Name",
    dataField: "name",
    key: "name",
    sort: true,
    sortFunc: columnSorter,
  },
  {
    text: "Description",
    dataField: "description",
    key: "description",
    sort: true,
    sortFunc: columnSorter,
  },
  {
    text: "Source Format",
    dataField: "sourceFormat",
    key: "sourceFormat",
    sort: true,
    sortFunc: columnSorter,
  },
  {
    text: "Target Format",
    dataField: "targetFormat",
    key: "targetFormat",
    sort: true,
    sortFunc: columnSorter,
  },
  {
    text: "Last Updated",
    dataField: "lastUpdated",
    key: "lastUpdated",
    sort: true,
    defaultSortOrder: "desc",
    sortFunc: (a: any, b: any, order: string) => order === "asc" ? moment(a).unix() - moment(b).unix() : moment(b).unix() - moment(a).unix(),
  },
  {
    text: "Action",
    dataField: "actions",
    key: "actions",
  }
];

const data = {
  data: {
    canRead: false,
    canWrite: true
  },
  flows: flows,
  flowsAdd: flowsAdd,
  loadData: loadData,
  loadTableColumns,
  mapReferences: mapReferences,
  mapProps: mapProps,
  newMap: newMap,
  editMap: editMap,
  dropDownWithSearch: dropDownWithSearch,
  xmlSourceData: xmlSourceData,
  xmlSourceDataMultipleSiblings: xmlSourceDataMultipleSiblings,
  jsonSourceDataMultipleSiblings: jsonSourceDataMultipleSiblings,
  jsonSourceDataMultipleSiblingsEntireRecord: jsonSourceDataMultipleSiblingsEntireRecord,
  JSONSourceDataToTruncate: JSONSourceDataToTruncate,
  truncatedEntityProps: truncatedEntityProps,
  customData: customData,
  viewCustom: viewCustom,
  namespacedXmlInstance: namespacedXmlInstance,
  noNamespaceXmlInstance: noNamespaceXmlInstance,
  loadDataPagination: loadDataPagination,
  jsonSourceDataDefault: jsonSourceDataDefault,
  jsonSourceDataRelated: jsonSourceDataRelated,
  xmlSourceDataDefault: xmlSourceDataDefault,
  jsonSourceDataLargeDataset: jsonSourceDataLargeDataset,
  entityDefLargePropSet: entityDefLargePropSet
};

export default data;
