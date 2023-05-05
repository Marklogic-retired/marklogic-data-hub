'use strict';

const test = require("/test/test-helper.xqy");
import { DocumentForTestingUtils as utils } from "/test/suites/data-hub/data-services/lib/mappingService.mjs";;

const assertions = [];
const uri = '/uri/to/non-existent/doc.json';

// Using try/catch as an alternative to test.assertThrowsError*().
try {
  utils.invokeService(utils.STEP_NAME1, uri);
  assertions.push(test.fail('Exception not thrown when attempting to process a non-existent document.'));
} catch (e) {
  assertions.push(test.assertTrue(e.data && Array.isArray(e.data) && e.data.length === 2,
    "Expected exception object's 'data' property to be an array of two items"));
  assertions.push(test.assertEqual('404', e.data[0], 'Expected an exception code of 404'));
  assertions.push(test.assertEqual(`Could not find a document with URI: ${uri}`, e.data[1]));
}

assertions;
