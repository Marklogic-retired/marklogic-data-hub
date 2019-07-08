xquery version "1.0-ml";

(:
 : Verify that the /v1/resources/sm-merge extension accepts the right
 : parameters and does a merge.
 :)

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare namespace http = "xdmp:http";
declare namespace es = "http://marklogic.com/entity-services";
declare namespace sm = "http://marklogic.com/smart-mastering";

declare option xdmp:mapping "false";

let $uris := map:keys($lib:TEST-DATA)
let $uri-param := fn:string-join($uris ! ("rs:uri=" || .), "&amp;")
let $opt-param := "rs:options=" || $lib:OPTIONS-NAME
let $preview-param := "rs:preview=true"

(: Try a preview and verify that we get back a merged document :)
let $actual :=
  xdmp:http-post(
    test:easy-url("/v1/resources/sm-merge?" ||
      fn:string-join(($uri-param, $opt-param, $preview-param), "&amp;")),
    <options xmlns="xdmp:http">
      <authentication method="digest">
        <username>admin</username>
        <password>admin</password>
      </authentication>
    </options>
  )
let $merged-id := $actual[2]/es:envelope/es:headers/sm:id
let $assertions := (
  test:assert-equal(<http:code>200</http:code>, $actual[1]/http:code),
  test:assert-same-values($uris, $actual[2]/es:envelope/es:headers/sm:merges/sm:document-uri/fn:string()),
  test:assert-exists($merged-id)
)

(: Verify that the merged document did not get inserted :)
let $qbe :=
  <q:qbe xmlns:q="http://marklogic.com/appservices/querybyexample">
    <q:query>
      <sm:id>{$merged-id}</sm:id>
    </q:query>
  </q:qbe>
let $exists :=
  xdmp:http-post(
    test:easy-url("/v1/qbe?format=xml"),
    <options xmlns="xdmp:http">
      <authentication method="digest">
        <username>admin</username>
        <password>admin</password>
      </authentication>
    </options>,
    $qbe
  )
let $assertions := (
  $assertions,
  test:assert-equal(<http:code>200</http:code>, $exists[1]/http:code),
  test:assert-equal("0", $exists[2]//@total/fn:string())
)

(: This time actually merge the documents (default behavior) :)
let $actual :=
  xdmp:http-post(
    test:easy-url("/v1/resources/sm-merge?" || $uri-param || "&amp;" || $opt-param),
    <options xmlns="xdmp:http">
      <authentication method="digest">
        <username>admin</username>
        <password>admin</password>
      </authentication>
    </options>
  )
let $merged-id := $actual[2]/es:envelope/es:headers/sm:id
let $assertions := (
  $assertions,
  test:assert-equal(<http:code>200</http:code>, $actual[1]/http:code),
  test:assert-same-values($uris, $actual[2]/es:envelope/es:headers/sm:merges/sm:document-uri/fn:string())
)

(: Verify that the merged document did get inserted :)
let $qbe :=
  <q:qbe xmlns:q="http://marklogic.com/appservices/querybyexample">
    <q:query>
      <sm:id>{$merged-id}</sm:id>
    </q:query>
  </q:qbe>
let $exists :=
  xdmp:http-post(
    test:easy-url("/v1/qbe?format=xml"),
    <options xmlns="xdmp:http">
      <authentication method="digest">
        <username>admin</username>
        <password>admin</password>
      </authentication>
    </options>,
    $qbe
  )
let $assertions := (
  $assertions,
  test:assert-equal(<http:code>200</http:code>, $exists[1]/http:code),
  test:assert-equal("1", $exists[2]//@total/fn:string())
)

return
  $assertions
