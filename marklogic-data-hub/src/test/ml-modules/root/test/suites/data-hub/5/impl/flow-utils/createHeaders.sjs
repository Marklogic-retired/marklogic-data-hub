const test = require("/test/test-helper.xqy");

const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");

function verifySourceNameAndTypeWithEmptyHeaders() {
  const assertions = [];

  // sourceName and sourceType is empty
  let options = {"headers":{}, "sourceName":"", "sourceType":""};
  let headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(null, headers["sources"])
  );

  // sourceName and sourceType exists
  options = {"headers":{}, "sourceName":"someDB", "sourceType":"customer"};
  headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(1, headers["sources"].length),
    test.assertEqual("someDB", headers["sources"][0]["datahubSourceName"]),
    test.assertEqual("customer", headers["sources"][0]["datahubSourceType"])
  );
  return assertions;
}

function verifySourceNameAndTypeWithEmptySources() {
  const assertions = [];

  // sourceName and sourceType is empty
  let options = {"headers":{"sources":[]}, "sourceName":"", "sourceType":""};
  let headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(0, headers["sources"].length)
  );

  // sourceName and sourceType exists
  options = {"headers":{"sources":[]}, "sourceName":"someDB", "sourceType":"customer"};
  headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(1, headers["sources"].length),
    test.assertEqual("someDB", headers["sources"][0]["datahubSourceName"]),
    test.assertEqual("customer", headers["sources"][0]["datahubSourceType"])
  );
  return assertions;
}

function verifySourceNameAndTypeWithSourcesObject() {
  const assertions = [];

  // sourceName and sourceType is empty
  let options = {"headers":{"sources":{}}, "sourceName":"", "sourceType":""};
  let headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(1, headers["sources"].length),
    test.assertEqual(null, headers["sources"][0]["name"]),
    test.assertEqual(null, headers["sources"][0]["datahubSourceType"])
  );

  // sourceName and sourceType exists
  options = {"headers":{"sources":{"name": "someName"}}, "sourceName":"someDB", "sourceType":"customer"};
  headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(2, headers["sources"].length),
    test.assertEqual("someDB", headers["sources"][1]["datahubSourceName"]),
    test.assertEqual("customer", headers["sources"][1]["datahubSourceType"])
  );
  return assertions;
}

function verifySourceNameAndTypeWithSourcesArray() {
  const assertions = [];

  // sourceName and sourceType is empty
  let options = {"headers":{"sources":[{"name":"someDB", "datahubSourceType":"customer"}, {"name":"someDB", "datahubSourceType":"order"}]},
    "sourceName":"", "sourceType":""};
  let headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(2, headers["sources"].length),
    test.assertEqual("someDB", headers["sources"][0]["name"]),
    test.assertEqual("customer", headers["sources"][0]["datahubSourceType"]),
    test.assertEqual("someDB", headers["sources"][1]["name"]),
    test.assertEqual("order", headers["sources"][1]["datahubSourceType"])
  );

  // sourceName and sourceType exists
  options = {"headers":{"sources":[{"datahubSourceName":"someDB"}, {"datahubSourceName":"someDB", "datahubSourceType":"order"}]},
    "sourceName":"someNewDB", "sourceType":"employee"};
  headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(3, headers["sources"].length),
    test.assertEqual("someDB", headers["sources"][0]["datahubSourceName"]),
    test.assertEqual(null, headers["sources"][0]["datahubSourceType"]),
    test.assertEqual("someDB", headers["sources"][1]["datahubSourceName"]),
    test.assertEqual("order", headers["sources"][1]["datahubSourceType"]),
    test.assertEqual("someNewDB", headers["sources"][2]["datahubSourceName"]),
    test.assertEqual("employee", headers["sources"][2]["datahubSourceType"])
  );

  // SourceName exists and SourceType doesn't exist
  options = {"headers":{"sources":[{"datahubSourceName":"someDB"}, {"datahubSourceName":"someDB", "datahubSourceType":"order"}]},
    "sourceName":"someNewDB"};
  headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(3, headers["sources"].length),
    test.assertEqual("someNewDB", headers["sources"][2]["datahubSourceName"]),
    test.assertEqual(null, headers["sources"][2]["datahubSourceType"])
  );

  // SourceName doesn't exist and sourceType exists
  options = {"headers":{"sources":[{"datahubSourceName":"someDB"}, {"datahubSourceName":"someDB", "datahubSourceType":"order"}]},
    "sourceType":"employee"};
  headers = flowUtils.createHeaders(options);
  assertions.push(
    test.assertEqual(3, headers["sources"].length),
    test.assertEqual(null, headers["sources"][2]["datahubSourceName"]),
    test.assertEqual("employee", headers["sources"][2]["datahubSourceType"])
  );
  return assertions;
}


[]
    .concat(verifySourceNameAndTypeWithEmptyHeaders())
    .concat(verifySourceNameAndTypeWithEmptySources())
    .concat(verifySourceNameAndTypeWithSourcesObject())
    .concat(verifySourceNameAndTypeWithSourcesArray());