xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/sm-merge";

import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";

declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
) as document-node()?
{
  post($context, $params, $input)
};

declare
%rapi:transaction-mode("update")
function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
) as document-node()*
{
  if (map:contains($params, "uri")) then
    let $uris := map:get($params, "uri")
    let $options :=
      if (fn:exists($input/(*:options|object-node()))) then
        $input/(*:options|object-node())
      else
        merging:get-options(map:get($params, "options"), $const:FORMAT-XML)
    let $_options-check :=
      if (fn:empty($options)) then
        fn:error((),"RESTAPI-SRVEXERR",
          (400, "Bad Request",
           "A valid option parameter or option config in the POST body is required."))
      else ()
    let $merge-fun :=
      if (map:get($params, "preview") = "true") then
        merging:build-merge-models-by-uri#2
      else
        merging:save-merge-models-by-uri#2
    return
      document {
        $merge-fun($uris, $options)
      }
  else
    fn:error((),"RESTAPI-SRVEXERR",
      (400, "Bad Request",
      "uri parameter is required"))
};

declare %rapi:transaction-mode("update") function delete(
  $context as map:map,
  $params  as map:map
) as document-node()?
{
  if (map:contains($params, "mergedUri")) then (
    merging:rollback-merge(
      map:get($params, "mergedUri"),
      fn:not(map:get($params, "retainAuditTrail") = "false")
    ),
    document {
      object-node {
        "success": fn:true()
      }
    }
  ) else
    fn:error((),"RESTAPI-SRVEXERR",
      (400, "Bad Request",
      "mergedUri parameter is required"))
};
