xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/mlSm-history-document";

import module namespace history = "http://marklogic.com/smart-mastering/auditing/history"
  at "/com.marklogic.smart-mastering/auditing/history.xqy";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $uri := map:get($params, "uri")
  return
    if (fn:exists($uri)) then
      document {
        history:document-history($uri)
      }
    else
      fn:error((),"RESTAPI-SRVEXERR",
        (400, "Bad Request",
        "uri parameter is required"))
};
