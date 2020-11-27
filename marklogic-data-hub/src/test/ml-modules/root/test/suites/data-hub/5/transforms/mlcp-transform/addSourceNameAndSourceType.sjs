const test = require("/test/test-helper.xqy");
const mlcpTransform = require("/data-hub/5/transforms/mlcp-flow-transform.sjs");

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

  let result = fn.head(mlcpTransform.transform(content, context));
  assertions.push(
    test.assertEqual("test-sourceName", result.value.envelope.headers.sources[0].datahubSourceName),
    test.assertEqual("test-sourceType", result.value.envelope.headers.sources[0].datahubSourceType)
  );

  context.transform_param = "flow-name=default-ingestion,step=1,sourceName=test-sourceName";
  result = fn.head(mlcpTransform.transform(content, context));
  assertions.push(
    test.assertEqual("test-sourceName", result.value.envelope.headers.sources[0].datahubSourceName),
    test.assertEqual(null, result.value.envelope.headers.sources[0].datahubSourceType)
  );

  context.transform_param = "flow-name=default-ingestion,step=1,sourceType=test-sourceType";
  result = fn.head(mlcpTransform.transform(content, context));
  assertions.push(
    test.assertEqual(null, result.value.envelope.headers.sources[0].datahubSourceName),
    test.assertEqual("test-sourceType", result.value.envelope.headers.sources[0].datahubSourceType)
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

  let result = fn.head(mlcpTransform.transform(content, context));
  assertions.push(test.assertEqual(null, result.value.envelope.headers.sources));
  return assertions
}

[]
    .concat(testAddSourceNameAndSourceType())
    .concat(testEmptySourceNameAndSourceType());