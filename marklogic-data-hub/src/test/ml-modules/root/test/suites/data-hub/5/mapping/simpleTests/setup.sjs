declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");

hubTestX.resetHub();

const customerModel = {
  "info": {
    "title": "Customer",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "Customer": {
      "required": [],
      "pii": [],
      "elementRangeIndex": [],
      "rangeIndex": [],
      "wordLexicon": [],
      "properties": {
        "id": {
          "datatype": "string",
          "collation": "http://marklogic.com/collation/codepoint"
        },
        "firstname": {
          "datatype": "string",
          "collation": "http://marklogic.com/collation/codepoint"
        },
        "updated": {
          "datatype": "string",
          "collation": "http://marklogic.com/collation/codepoint"
        },
        "interests": {
          "datatype": "array",
          "items": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          }
        },
        "firstNumber": {
          "datatype": "int"
        },
        "secondNumber": {
          "datatype": "int"
        },
        "thirdNumber": {
          "datatype": "int"
        },
        "fourthNumber": {
          "datatype": "int"
        },
        "fifthNumber": {
          "datatype": "int"
        },
        "sixthNumber": {
          "datatype": "int"
        },
        "sum": {
          "datatype": "int"
        },
        "difference": {
          "datatype": "int"
        },
        "product": {
          "datatype": "int"
        },
        "quotient": {
          "datatype": "float"
        },
        "stringJoin": {
          "datatype": "string",
          "collation": "http://marklogic.com/collation/codepoint"
        },
        "stringRemove": {
          "datatype": "string",
          "collation": "http://marklogic.com/collation/codepoint"
        },
        "currentDateTime": {
          "datatype": "dateTime"
        },
        "currentDate": {
          "datatype": "date"
        }
      }
    }
  }
};

const firstMappingStep = {
  "properties": {
    "id": {
      "sourcedFrom": "CustomerID"
    },
    "firstname": {
      "sourcedFrom": "FirstName"
    },
    "interests": {
      "sourcedFrom": "Interests"
    },
    "updated": {
      "sourcedFrom": "Metadata/CreatedOn"
    },
    "firstNumber": {
      "sourcedFrom": "Number[. >= 10]"
    },
    "secondNumber": {
      "sourcedFrom": "Number[. > 10]"
    },
    "thirdNumber": {
      "sourcedFrom": "Number[. = 10]"
    },
    "fourthNumber": {
      "sourcedFrom": "Number[. <= 10]"
    },
    "fifthNumber": {
      "sourcedFrom": "Number[. < 10]"
    },
    "sixthNumber": {
      "sourcedFrom": "Number[. != 10]"
    },
    "sum": {
      "sourcedFrom": "Number + AnotherNumber"
    },
    "difference": {
      "sourcedFrom": "Number - 10"
    },
    "product": {
      "sourcedFrom": "Number * 10"
    },
    "quotient": {
      "sourcedFrom": "Number div 4"
    },
    "stringJoin": {
      "sourcedFrom": "concat(FirstName, ' Cratchit')"
    },
    "stringRemove": {
      "sourcedFrom": "translate(CustomerID, '4', '')"
    },
    "currentDateTime": {
      "sourcedFrom": "parseDateTime(CurrentDateTime, 'DD/MM/YYYY-hh:mm:ss')"
    },
    "currentDate": {
      "sourcedFrom": "parseDate(CurrentDate, 'Mon DD, YYYY')"
    }
  }
};

const secondMappingStep = {
  "namespaces": {
    "ns2": "http://ns2",
    "ns1": "http://ns1"
  },
  "properties": {
    "id": {
      "sourcedFrom": "ns1:Customer/@CustomerID"
    },
    "firstname": {
      "sourcedFrom": "ns1:Customer/ns2:property[@name = 'name']/@value"
    },
    "interests": {
      "sourcedFrom": "ns1:Customer/ns2:property[@name = 'interest']/@value"
    }
  }
};

hubTest.createSimpleProject("simpleMappingFlow",
  [
    hubTest.makeSimpleMappingStep("step1", firstMappingStep),
    hubTest.makeSimpleMappingStep("step2", secondMappingStep)
  ],
  customerModel);
