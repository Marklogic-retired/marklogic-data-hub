xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/ml:sm-match-option-names";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  document {
    matcher:get-option-names($const:FORMAT-JSON)
  }
};
