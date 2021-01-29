const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

function assertThrowsEntityNameError(model, badEntityName) {
  try {
    entityLib.validateModelDefinitions(model);
    throw new Error("Expected model to fail validation: " + xdmp.toJsonString(model));
  } catch (e) {
    assertions.push(test.assertEqual("Invalid entity name: " + badEntityName + "; must start with a letter and can only contain letters, numbers, hyphens, and underscores.", e.message));
  }
}

function assertThrowsPropertyNameError(model, badPropertyName) {
  try {
    entityLib.validateModelDefinitions(model);
    throw new Error("Expected model to fail validation: " + xdmp.toJsonString(model));
  } catch (e) {
    assertions.push(test.assertEqual("Invalid property name: " + badPropertyName + " in entity model ThisIsFine; it must be a valid NCName as defined at http://www.datypic.com/sc/xsd/t-xsd_Name.html.", e.message));
  }
}

entityLib.validateModelDefinitions({
  "CanHaveNumbersNotAtBeginning123": {
    "properties": {
      "ThisIsFine111": {
        "type": "string"
      }
    }
  }
});

assertions.push(
  assertThrowsEntityNameError({
    "2CannotHaveNumberAtBeginning": {}
  }, "2CannotHaveNumberAtBeginning"),

  assertThrowsEntityNameError({
    "Cannot have spaces": {}
  }, "Cannot have spaces"),

  assertThrowsPropertyNameError({
    "ThisIsFine": {
      "properties": {
        "1CannotStartWithNumber": {}
      }
    }
  }, "1CannotStartWithNumber"),

  assertThrowsPropertyNameError({
    "ThisIsFine": {
      "properties": {
        "Cannot have spaces": {}
      }
    }
  }, "Cannot have spaces")
);

entityLib.validateModelDefinitions({
  "PropsWithGermanCharacters": {
    "properties": {
      "prop1ä": {},
      "prop2ö":{},
      "prop3ü":{},
      "prop4ß":{},
      "prop5Ä":{},
      "prop6Ö":{},
      "prop7Ü":{}
    }
  }
});
assertions;
