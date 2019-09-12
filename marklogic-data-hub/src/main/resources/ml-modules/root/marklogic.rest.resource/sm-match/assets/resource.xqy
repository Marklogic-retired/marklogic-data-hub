xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/ml:sm-match";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";

declare option xdmp:mapping "false";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  post($context, $params, ())
};

declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()?
{
  post($context, $params, $input)
};

declare
%rapi:transaction-mode("query")
function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  let $uri := map:get($params, "uri")
  let $input-root := $input/(element()|object-node())
  let $document :=
    if ($input/(*:document|object-node("document"))) then
      $input/(*:document|object-node("document"))
    else
      fn:doc($uri)
  let $_document-check :=
    if (fn:empty($document)) then
      fn:error((),"RESTAPI-SRVEXERR",
        (400, "Bad Request",
         "A valid uri parameter or document in the POST body is required."))
    else ()
  let $options :=
    if (map:contains($params, "options")) then
      matcher:get-options(map:get($params, "options"), $const:FORMAT-XML)
    else
      $input-root/(element(matcher:options)|self::object-node()[object-node("options")])
  let $_options-check :=
    if (fn:empty($options)) then
      fn:error((),"RESTAPI-SRVEXERR",
        (400, "Bad Request",
         "A valid option parameter or option config in the POST body is required."))
    else ()
  let $start :=
    fn:head((
      map:get($params,"start") ! xs:integer(.),
      1
    ))
  let $page-length :=
    fn:head((
      map:get($params,"pageLength") ! xs:integer(.),
      $options//*:max-scan ! xs:integer(.),
      20
    ))
  let $include-matches as xs:boolean :=
    let $include := fn:head((map:get($params, "includeMatches"), fn:false()))
    return
      if ($include castable as xs:boolean) then
        $include cast as xs:boolean
      else
        fn:error((),"RESTAPI-SRVEXERR",
          (400, "Bad Request",
           "Your request included an invalid value for the includeMatches parameter.  A boolean value (true or false) is required."))
  let $results :=
    matcher:find-document-matches-by-options(
      $document,
      $options,
      $start,
      $page-length,
      $include-matches,
      cts:true-query()
    )
  return
    document { matcher:results-to-json($results) }
};

declare function delete(
  $context as map:map,
  $params  as map:map
  ) as document-node()?
{
  fn:error((), "RESTAPI-SRVEXERR", (405, "Method Not Allowed", "DELETE is not implemented"))
};
