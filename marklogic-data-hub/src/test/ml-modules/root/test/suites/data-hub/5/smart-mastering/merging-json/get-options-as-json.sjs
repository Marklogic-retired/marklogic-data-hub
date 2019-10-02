const test = require('/test/test-helper.xqy');
const lib = require('/test/suites/data-hub/5/smart-mastering/merging-json/lib/lib.xqy');
const merging = require('/com.marklogic.smart-mastering/merging.xqy');
const con = require('/com.marklogic.smart-mastering/constants.xqy')

const actual = fn.head(merging.getOptions(lib['OPTIONS-NAME'], con['FORMAT-JSON'])).toObject();

let assertions = [];

assertions.push(
  test.assertEqual('basic', actual.options.matchOptions.toString()),
  test.assertEqual(4, actual.options.propertyDefs.properties.length),
  test.assertExists(actual.options.propertyDefs.namespaces),
  test.assertEqual(3, actual.options.merging.length),
  test.assertExists(actual.options.algorithms.custom),
  test.assertExists(actual.options.algorithms.stdAlgorithm),
  test.assertEqual('http://marklogic.com/entity-services', actual.options.algorithms.stdAlgorithm.namespaces.es),
  test.assertEqual('http://marklogic.com/smart-mastering', actual.options.algorithms.stdAlgorithm.namespaces.sm),
  test.assertEqual('/es:envelope/es:headers/sm:sources/sm:source/sm:dateTime', actual.options.algorithms.stdAlgorithm.timestamp.path)
);

for (let prop of actual.options.propertyDefs.properties) {
  if (prop.name === 'ssn') {
    assertions.push(
      test.assertEqual('IdentificationID', prop.localname),
      test.assertEqual('', prop.namespace)
    )
  } else if (prop.name === 'name') {
    assertions.push(
      test.assertEqual('PersonName', prop.localname),
      test.assertEqual('', prop.namespace)
    )
  } else if (prop.name === 'address') {
    assertions.push(
      test.assertEqual('Address', prop.localname),
      test.assertEqual('', prop.namespace)
    )
  } else if (prop.name === 'deep') {
    assertions.push(
      test.assertEqual('/es:envelope/es:headers/custom/this/has:a/deep/path', prop.path),
      test.assertNotExists(prop.namespace),
      test.assertNotExists(prop.localname)
    )
  } else {
    test.fail('Unexpected property: ' + prop.name)
  }
};

for (let alg of actual.options.algorithms.custom) {
  if (alg.name === 'name') {
    assertions.push(
      test.assertEqual('name', alg.function),
      test.assertEqual('', alg.at)
    );
  } else if (alg.name === 'customThing') {
    assertions.push(
      test.assertEqual('customThing', alg.function),
      test.assertEqual('/custom-merge-xqy.xqy', alg.at)
    );
  } else {
    test.fail('Unexpected algorithm: ' + alg.name)
  }
}

for (let merge of actual.options.merging) {
  if (merge.propertyName === 'ssn') {
    assertions.push(
      test.assertEqual('docA', merge.sourceRef.documentUri)
    )
  } else if (merge.propertyName === 'name') {
    assertions.push(
      test.assertEqual('1', merge.maxValues),
      test.assertEqual('50', merge.doubleMetaphone.distanceThreshold),
      test.assertEqual('true', merge.synonymsSupport),
      test.assertEqual('/mdm/config/thesauri/first-name-synonyms.xml', merge.thesaurus),
      test.assertEqual('8', merge.length.weight)
    )
  } else if (merge.propertyName === 'address') {
    assertions.push(
      test.assertEqual('1', merge.maxValues),
      test.assertEqual('standard', merge.algorithmRef),
      test.assertEqual('SOURCE2', merge.sourceWeights[0].source.name),
      test.assertEqual('10', merge.sourceWeights[0].source.weight)
    )
  } else {
    test.fail('Unexpected property: ' + merge.propertyName)
  }
}



assertions
