/**
 * This module is an example of a valid module for use in a mapping step as the value of the "mappingParametersModulePath" property.
 * It is referenced by the mapCustomersJSON.step.json mapping step.
 *
 * A mapping parameters module must define the two functions shown below.
 */

/**
 * This function must return an array of JSON objects, one for each parameter to be made available to the mapping expressions via the
 * "$" symbol. Each JSON object must define a "name" property, which is the name of the parameter that will be used in mapping expressions.
 * Each object may also define an optional "description" property to provide a description of what this parameter represents.
 *
 * This function is called when a mapping step is loaded or saved in MarkLogic, and thus the mapping step is passed as an argument in case
 * a developer needs any information from it.
 *
 * @param mappingStep
 * @returns
 */
function getParameterDefinitions(mappingStep) {
  return [
    {
      "name": "ZIP_POINTS",
      "description": "Maps zip codes to points"
    }
  ];
}

/**
 * This function must return a JSON object that defines the parameter names and values based on the given sequence of content. The content sequence
 * represents the batch of documents being processed by the given mapping step. When using the "Test" feature in the Hub Central mapping editor, the content
 * sequence will consist of the source document against which the mapping is being tested.
 *
 * The reason the content sequence is included is so that a developer can optimize any queries that involve looking up data from MarkLogic indexes or
 * other documents. For example, in this project, the code below builds a JSON object for the "ZIP_POINTS" parameter that is based on values in two
 * MarkLogic indexes. Given that there are over 33,000 zip code documents in the staging database, it would be inefficient to retrieve all of the values.
 * But it would also be inefficient to call this code in a custom mapping function, once per document. For a batch of 100 documents, a custom mapping function
 * would result in 100 queries. With the approach below, a single query is performed to find only the needed zipCode and geoPoint values based on the content
 * sequence.
 *
 * While this code shows range indexes being used, a developer is free to implement any code desired. However, the only keys in the returned JSON object that will
 * be available for use in mapping expressions are those that are also defined by the getParameterDefinitions function above.
 *
 * @param contentSequence
 * @param mappingStep
 * @returns
 */
function getParameterValues(contentSequence, mappingStep) {
  const zipCodes = [];
  for (var contentObject of contentSequence) {
    contentObject.value.xpath("//Postal").toArray().forEach(code => {
      zipCodes.push(code.toString().split("-")[0]);
    });
  }

  const query = cts.andQuery([
    cts.collectionQuery("zipCode"),
    cts.jsonPropertyRangeQuery("zipCode", "=", zipCodes)
  ]);

  const tuples = cts.elementValueCoOccurrences(xs.QName("zipCode"), xs.QName("geoPoint"), null, query);

  const zipCodeMap = {};
  for (var tuple of tuples) {
    zipCodeMap[tuple[0].toString()] = tuple[1].toString();
  }

  return {
    "ZIP_POINTS": zipCodeMap
  };
}

module.exports = {
  getParameterDefinitions,
  getParameterValues
}
