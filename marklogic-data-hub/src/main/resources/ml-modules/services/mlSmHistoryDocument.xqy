xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/mlSmHistoryDocument";

import module namespace history = "http://marklogic.com/smart-mastering/auditing/history"
  at "/com.marklogic.smart-mastering/auditing/history.xqy";

import module namespace httputils="http://marklogic.com/data-hub/http-utils"
at "/data-hub/5/impl/http-utils.xqy";

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
      httputils:throw-bad-request((),  "uri parameter is required")
};
