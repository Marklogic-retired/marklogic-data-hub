xquery version "1.0-ml";

module namespace ext = "http://marklogic.com/rest-api/resource/ml:sm-notifications";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

declare option xdmp:mapping "false";

(:
 : Get a page of notifications
 :)
declare function get(
  $context as map:map,
  $params  as map:map
) as document-node()*
{
  let $start := (map:get($params, "start"), 1)[1] ! xs:int(.)
  let $page-size := (map:get($params, "pageLength"), 10)[1] ! xs:int(.)
  let $end := $start + $page-size - 1
  let $extractions := map:map()
  return
    document {
      object-node {
        "total": matcher:count-notifications(),
        "start": $start,
        "pageLength": $page-size,
        "notifications": matcher:get-notifications-as-json($start, $end, $extractions)
      }
    }
};

(:
 : Get a page of notifications
 : @body  JSON object with a JSON object of "extractions"
 :        extractions look like:
 :        "name": "QName"
 :
 :        when run, the value inside the document at QName will be returned
 :        in a key/value extractions section under the key "name".
 :
 :        example:
 :        body => { "firstName", "PersonFirstName" }
 :
 :        this would extract the value in the PersonFirstName field
 :        <Person>
 :          <PersonFirstName>Bob</PersonFirstName>
 :          <PersonLastName>Smith</PersonLastName>
 :        </Person>
 :
 :        returns:
 :        {
 :           ...
 :           extractions: {
 :             "/uri1.xml": {
 :               "firstName": "Bob"
 :             }
 :           }
 :        }
 :)
declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
) as document-node()?
{
  let $start := (map:get($params, "start"), 1)[1] ! xs:int(.)
  let $page-size := (map:get($params, "pageLength"), 10)[1] ! xs:int(.)
  let $end := $start + $page-size - 1
  let $extractions := $input/node()
  return
    document {
      object-node {
        "total": matcher:count-notifications(),
        "start": $start,
        "pageLength": $page-size,
        "notifications": matcher:get-notifications-as-json($start, $end, $extractions)
      }
    }
};

(:
 : Update the status of a notification.
 : @body  JSON object with two properties: uris and status. uris is an array containing URI strings. status must
 :        use the values of $matcher:STATUS-READ or $matcher:STATUS-UNREAD.
 :)
declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
) as document-node()?
{
  let $uris as xs:string* := $input/node()/uris
  let $status as xs:string? := $input/node()/status
  return
    if (fn:empty($status)) then
      fn:error((),"RESTAPI-SRVEXERR",
        (400, "Bad Request",
        "status parameter is required"))
    else if (fn:empty($uris)) then
      fn:error((),"RESTAPI-SRVEXERR",
        (400, "Bad Request",
        "uris parameter is required"))
    else (
      for $uri in $uris
      return
        if (fn:doc-available($uri)) then
          matcher:update-notification-status($uri, $status)
        else
          fn:error((),"RESTAPI-SRVEXERR",
            (404, "Not Found",
            "No notification available at URI " || $uri)),
      xdmp:to-json(json:object() => map:with("success", fn:true()))
    )
};

declare function delete(
  $context as map:map,
  $params  as map:map
) as document-node()?
{
  if (map:contains($params, "uri")) then (
    for $uri in map:get($params, "uri")
    return
      if (fn:doc-available($uri)) then
        matcher:delete-notification($uri)
      else
        fn:error((),"RESTAPI-SRVEXERR",
          (404, "Not Found",
          "No notification available at URI " || $uri)),
    xdmp:to-json(json:object() => map:with("success", fn:true()))
  ) else
    fn:error((),"RESTAPI-SRVEXERR",
      (400, "Bad Request",
      "uri parameter is required"))
};
