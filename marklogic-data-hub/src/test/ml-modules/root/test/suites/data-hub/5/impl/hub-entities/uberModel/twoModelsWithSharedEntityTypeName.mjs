const test = require("/test/test-helper.xqy");
const hent = require("/data-hub/5/impl/hub-entities.xqy");

const customerModel = {
  "definitions": {
    "Customer": {
    },
    "Address": {
      "properties": {
        "customerCity": {
          "datatype": "string"
        }
      }
    }
  }
};

const organizationModel = {
  "definitions": {
    "Organization": {
    },
    "Address": {
      "properties": {
        "organizationCity": {
          "datatype": "string"
        }
      }
    }
  }
};

const assertions = [];

let uberModel = hent.uberModel([customerModel, organizationModel]);

assertions.push(
  test.assertEqual(3, Object.keys(uberModel.definitions).length),
  test.assertEqual("organizationCity", Object.keys(uberModel.definitions.Address.properties)[0],
    "Because organizationModel is second in the list, its definition of Address will win over the customerModel's " +
    "definition; this is expected behavior for DHF, though it could certainly be considered a bug by a user that " +
    "wants to have multiple entity definitions with the same name and different config in separate models. This test " +
    "has been added to document this behavior as expected, as it's been that way since at least DHF 4.")
)

assertions;
