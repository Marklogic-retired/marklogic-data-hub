xquery version "1.0-ml";

module namespace extensionNSPrefix =
  "http://marklogic.com/rest-api/resource/placeholder";

declare function extensionNSPrefix:get(
    $context as map:map,
    $params  as map:map
) as document-node()* {
  document { "GET called on the placeholder extension" }
};

declare function extensionNSPrefix:put(
    $context as map:map,
    $params  as map:map,
    $input   as document-node()*
) as document-node()? {
  document { "PUT called on the placeholder extension" }
};

declare function extensionNSPrefix:post(
    $context as map:map,
    $params  as map:map,
    $input   as document-node()*
) as document-node()* {
  document { "POST called on the placeholder extension" }
};

declare function extensionNSPrefix:delete(
    $context as map:map,
    $params  as map:map
) as document-node()? {
  document { "DELETE called on the placeholder extension" }
};