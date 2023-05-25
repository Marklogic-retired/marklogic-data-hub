const mlcpTransform = require("/data-hub/transforms/mlcp-flow-transform.xqy");
const test = require("/test/test-helper.xqy");

function unwrapValue(mlcpOutput) {
  return fn.head(mlcpOutput).value.toObject();
}

function testAddSourceNameAndSourceType() {
  const assertions = [];

  const content = {
    "uri": "/mlcp-test/Cust1.json",
    "value": {
      "CustomerID": 101
    }
  };
  const context = {
    "transform_param": "flow-name=default-ingestion,step=1,sourceName=test-sourceName,sourceType=test-sourceType",
    "collections": ["input"]
  };

  let result = unwrapValue(mlcpTransform.transform(content, context));
  assertions.push(
    test.assertEqual("test-sourceName", result.envelope.headers.sources[0].datahubSourceName),
    test.assertEqual("test-sourceType", result.envelope.headers.sources[0].datahubSourceType)
  );

  context.transform_param = "flow-name=default-ingestion,step=1,sourceName=test-sourceName";
  result  =unwrapValue(mlcpTransform.transform(content, context));
  assertions.push(
    test.assertEqual("test-sourceName", result.envelope.headers.sources[0].datahubSourceName),
    test.assertEqual(null, result.envelope.headers.sources[0].datahubSourceType)
  );

  context.transform_param = "flow-name=default-ingestion,step=1,sourceType=test-sourceType";
  result = unwrapValue(mlcpTransform.transform(content, context));
  assertions.push(
    test.assertEqual(null, result.envelope.headers.sources[0].datahubSourceName),
    test.assertEqual("test-sourceType", result.envelope.headers.sources[0].datahubSourceType)
  );

  return assertions;
}

function testEmptySourceNameAndSourceType() {
  const assertions = [];

  const content = {
    "uri": "/mlcp-test/Cust1.json",
    "value": {
      "CustomerID": 101
    }
  };
  const context = {
    "transform_param": "flow-name=default-ingestion,step=1",
    "collections": ["input"]
  };

  let result = unwrapValue(mlcpTransform.transform(content, context));
  assertions.push(test.assertEqual(null, result.envelope.headers.sources));
  return assertions;
}

[]
  .concat(testAddSourceNameAndSourceType())
  .concat(testEmptySourceNameAndSourceType());
