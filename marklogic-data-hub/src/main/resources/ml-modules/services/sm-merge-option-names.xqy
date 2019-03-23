xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/sm-merge-option-names";

import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  document {
    merging:get-option-names($const:FORMAT-JSON)
  }
};
