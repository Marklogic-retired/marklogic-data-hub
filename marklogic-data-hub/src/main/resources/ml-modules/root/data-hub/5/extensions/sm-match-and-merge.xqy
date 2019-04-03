xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/sm-match-and-merge";

import module namespace process = "http://marklogic.com/smart-mastering/process-records"
  at "/com.marklogic.smart-mastering/process-records.xqy";
import module namespace collector = "http://marklogic.com/smart-mastering/collector"
  at "/com.marklogic.smart-mastering/collector.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";

declare variable $default-collector-name as xs:QName := xs:QName("collector:collect");
declare variable $default-collector-location as xs:string := "/com.marklogic.smart-mastering/collector.xqy";
declare option xdmp:mapping "false";

declare function resource:get-collector($params as map:map)
{
  let $collector-at := map:get($params, "collector-at")
  let $collector-ns := map:get($params, "collector-ns")
  let $collector-name := map:get($params, "collector-name")
  return
    if (fn:empty($collector-name)) then
      (: Caller wasn't trying to load a collector :)
      ()
    else
      let $qname := fn:QName($collector-ns, $collector-name)
      return
        if ($qname eq $default-collector-name and fn:empty($collector-at[. ne $default-collector-location])) then
          xdmp:function($default-collector-name)
        else
          (: Will thrown XDMP-MODNOTFOUND if the parameters don't point to a function. Try/catch does not catch that exception. :)
          xdmp:function(fn:QName($collector-ns, $collector-name), $collector-at)
};

declare
%rapi:transaction-mode("update")
function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  let $options-name :=
    let $name := map:get($params, "options")
    return
      if (fn:exists($name)) then
        $name
      else
        fn:error((),"RESTAPI-SRVEXERR",
          (400, "Bad Request",
          "options parameter is required "))
  let $query :=
    let $q := map:get($params, "query")
    return
      if (fn:exists($q)) then
        try {
          cts:query(xdmp:unquote($q)/node())
        }
        catch ($e) {
          if ($e/error:code = "XDMP-NOTQUERY") then
            fn:error((),"RESTAPI-SRVEXERR",
              (400, "Bad Request",
              "'query' must be a serialized query; got " || $q))
          else
            xdmp:rethrow()
        }
      else ()
  let $collector := resource:get-collector($params)
  let $uris :=
    if (fn:exists($collector)) then
      xdmp:apply($collector, map:new((map:entry('query', $query),map:entry('options', $options-name))))
    else
      map:get($params, "uri")
  return (
    if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Calling process-match-and-merge with URIs [" ||
        fn:string-join($uris, "; ") ||
        "], options name=" || $options-name ||
        ", and query=" || xdmp:quote($query))
    else (),
    for $result in (if (fn:exists($query)) then
                      process:process-match-and-merge($uris, $options-name, $query)
                    else
                      process:process-match-and-merge($uris, $options-name))
    return (
      $context => map:put("output-type", ($context => map:get("output-type"), if ($result instance of object-node()) then "application/json" else "application/xml")),
      document{$result}
    )
  )
};
