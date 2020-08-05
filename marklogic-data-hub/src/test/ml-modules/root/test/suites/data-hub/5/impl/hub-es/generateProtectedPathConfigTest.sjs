const test = require("/test/test-helper.xqy");
const hubEs = require('/data-hub/5/impl/hub-es.sjs');

function multipleProtectedPropertiesNoNamespace() {
  const result = hubEs.generateProtectedPathConfig([
    {
      "info": {
        "title": "SecureThing"
      },
      "definitions": {
        "SecureThing": {
          "pii": ["hidden", "private"],
          "properties": {
            "hidden": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
            "public": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
            "private": {"datatype": "string", "collation": "http://marklogic.com/collation/"}
          }
        }
      }
    }]
  );

  const paths = result.config["protected-path"];
  return [
    test.assertEqual(2, paths.length),

    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/SecureThing/hidden", paths[0]["path-expression"],
      "The expression uses /*: to support both JSON documents and XML documents whose instances do not have a namespace. " +
      "The es.piiGenerate function does not support the latter."),
    test.assertEqual("pii-reader", paths[0].permission["role-name"]),
    test.assertEqual("read", paths[0].permission["capability"]),

    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/SecureThing/private", paths[1]["path-expression"]),
    test.assertEqual("pii-reader", paths[1].permission["role-name"]),
    test.assertEqual("read", paths[1].permission["capability"]),

    test.assertEqual("pii-reader", result.config["query-roleset"]["role-name"][0])
  ];
}

function multipleProtectedPropertiesWithNamespace() {
  const result = hubEs.generateProtectedPathConfig([
    {
      "info": {
        "title": "SecureThing"
      },
      "definitions": {
        "SecureThing": {
          "pii": ["hidden", "private"],
          "namespace": "org:example",
          "namespacePrefix": "test",
          "properties": {
            "hidden": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
            "public": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
            "private": {"datatype": "string", "collation": "http://marklogic.com/collation/"}
          }
        }
      }
    }]
  );

  const paths = result.config["protected-path"];
  return [
    test.assertEqual(2, paths.length),

    test.assertEqual("/es:envelope/es:instance/test:SecureThing/test:hidden", paths[0]["path-expression"],
      "When namespace and namespacePrefix are configured, then the path assumes the use of XML documents, which " +
      "es.piiGenerate does as well. The assumption appears to be based on the notion that if the entity definition " +
      "configures namespace and namespacePrefix, then all entity instances are expected to be XML documents."),
    test.assertEqual("pii-reader", paths[0].permission["role-name"]),
    test.assertEqual("read", paths[0].permission["capability"]),

    test.assertEqual("/es:envelope/es:instance/test:SecureThing/test:private", paths[1]["path-expression"]),
    test.assertEqual("pii-reader", paths[1].permission["role-name"]),
    test.assertEqual("read", paths[1].permission["capability"]),

    test.assertEqual("pii-reader", result.config["query-roleset"]["role-name"][0])
  ];
};

function multipleEntityDefinitionsWithProtectedProperties() {
  const result = hubEs.generateProtectedPathConfig([
    {
      "info": {
        "title": "SecureThing"
      },
      "definitions": {
        "SecureThing": {
          "pii": ["hidden"],
          "properties": {
            "hidden": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
            "public": {"datatype": "string", "collation": "http://marklogic.com/collation/"}
          }
        },
        "OtherSecureThing": {
          "pii": ["hidden"],
          "namespace": "something",
          "namespacePrefix": "some",
          "properties": {
            "hidden": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
            "public": {"datatype": "string", "collation": "http://marklogic.com/collation/"}
          }
        }
      }
    }
  ]);

  const paths = result.config["protected-path"];
  return [
    test.assertEqual(2, paths.length),

    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/SecureThing/hidden", paths[0]["path-expression"]),
    test.assertEqual("pii-reader", paths[0].permission["role-name"]),
    test.assertEqual("read", paths[0].permission["capability"]),

    test.assertEqual("/es:envelope/es:instance/some:OtherSecureThing/some:hidden", paths[1]["path-expression"]),
    test.assertEqual("pii-reader", paths[1].permission["role-name"]),
    test.assertEqual("read", paths[1].permission["capability"]),

    test.assertEqual("pii-reader", result.config["query-roleset"]["role-name"][0]),
  ];
}

[]
  .concat(multipleProtectedPropertiesNoNamespace())
  .concat(multipleProtectedPropertiesWithNamespace())
  .concat(multipleEntityDefinitionsWithProtectedProperties());
