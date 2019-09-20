xquery version "1.0-ml";

module namespace ext = "http://marklogic.com/rest-api/resource/ml:sm-block-match";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";

declare option xdmp:mapping "false";

declare function get(
  $context as map:map,
  $params  as map:map
) as document-node()*
{
  let $uri := map:get($params, "uri")
  return
    if (fn:exists($uri)) then
      document {
        matcher:get-blocks($uri)
      }
    else
      fn:error((),"RESTAPI-SRVEXERR",
        (400, "Bad Request",
        "uri parameter is required"))
};

declare
%rapi:transaction-mode("update")
function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
) as document-node()*
{
  let $uri1 := map:get($params, "uri1")
  let $uri2 := map:get($params, "uri2")
  return
    if (fn:exists($uri1) and fn:exists($uri2)) then (
      matcher:block-matches(($uri1, $uri2)),
      xdmp:to-json(json:object() => map:with("success", fn:true()))
    )
    else
      fn:error((),"RESTAPI-SRVEXERR",
        (400, "Bad Request",
        "uri1 and uri2 parameters are required"))
};

declare function delete(
  $context as map:map,
  $params  as map:map
) as document-node()?
{
  let $uri1 := map:get($params, "uri1")
  let $uri2 := map:get($params, "uri2")
  return
    if (fn:exists($uri1) and fn:exists($uri2)) then
      document { xdmp:to-json(json:object() => map:with("success", matcher:allow-match($uri1, $uri2))) }
    else
      fn:error((),"RESTAPI-SRVEXERR",
        (400, "Bad Request",
        "uri1 and uri2 parameters are required"))
};
