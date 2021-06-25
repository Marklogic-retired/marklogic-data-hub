declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");
hubTestX.resetHub();
hubTestX.loadNonEntities(test.__CALLER_FILE__);

hubTest.createSimpleMappingProject( [
  {
    "name":"undefinedFunctionMapping",
    "properties":
    {
      "customerId": {"sourcedFrom": "parseDate('xyz')"},
      "name": {"sourcedFrom": "unavailableFunction()"}
    }
  },
  {
    "name":"invalidArgumentMapping",
    "properties":
      {
        "name": {"sourcedFrom": "generate-id(1234)"}
      }
  },
  {
    "name":"cannotComputeMapping",
    "properties":
      {
        "customerId": {"sourcedFrom": "sum((1234,'a'))"}
      }
  },
  {
    "name":"invalidLexicalValueMapping",
    "properties":
      {
        "customerId": {"sourcedFrom": "'abc'"}
      }
  },
  {
    "name":"unexpectedRparMapping",
    "properties":
      {
        "name": {"sourcedFrom": "string-join(firstName, lastName))"}
      }
  },
  {
    "name":"expectingRparMapping",
    "properties":
      {
        "name": {"sourcedFrom": "string-join((firstName, lastName)"}
      }
  },
  {
    "name":"unexpectedCommaMapping",
    "properties":
      {
        "name": {"sourcedFrom": "string-join((firstName,,lastName))" }
      }
  },
  {
    "name":"unexpectedCharacterMapping",
    "properties":
      {
        "name": {"sourcedFrom": "upper-case('a)" }
      }
  },
  {
    "name":"tooFewArgsMapping",
    "properties":
      {
        "name": {"sourcedFrom": "upper-case()" }
      }
  },
  {
    "name":"tooManyArgsMapping",
    "properties":
      {
        "name": {"sourcedFrom": "lower-case('a','b')" }
      }
  }
]
);
