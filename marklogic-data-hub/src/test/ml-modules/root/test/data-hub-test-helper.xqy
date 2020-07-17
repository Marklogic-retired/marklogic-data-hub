xquery version "1.0-ml";

(:
Contains functions for simplifying the act of writing tests for Data Hub, particularly tests that need to
load one or more kinds of DHF artifacts.
:)

module namespace hub-test = "http://marklogic.com/data-hub/test";

import module namespace cvt = "http://marklogic.com/cpf/convert" at "/MarkLogic/conversion/convert.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare variable $TYPE-TO-COLLECTION-MAP := map:new((
  map:entry("flows", "http://marklogic.com/data-hub/flow"),
  map:entry("entities", "http://marklogic.com/entity-services/models"),
  map:entry("mappings", "http://marklogic.com/data-hub/mappings"),
  map:entry("step-definitions", "http://marklogic.com/data-hub/step-definition"),
  map:entry("loadData", "http://marklogic.com/data-hub/load-data-artifact"),
  map:entry("content", "raw-content")
));

declare function load-artifacts($caller-path as xs:string) as xs:string*
{
  map:keys($TYPE-TO-COLLECTION-MAP) ! load-artifacts(., $caller-path)
};


declare function load-jobs($caller-path as xs:string) as xs:string*
{
  load-jobs("jobs", $caller-path, "/", ("Job", "Jobs")),
  load-jobs("batches", $caller-path, "/jobs/", ("Batch", "Jobs"))
};

declare private function load-jobs(
  $doc-type as xs:string,
  $caller-path as xs:string,
  $uri-prefix as xs:string,
  $collections as item()*
) as xs:string*
{
  let $test-data-path := get-test-data-path($caller-path)
  for $uri in get-artifact-uris($doc-type, $test-data-path)
  let $path := fn:replace($uri, $test-data-path, "")
  let $content := test:get-test-file($path)
  let $_ := invoke-in-db(function() {
    xdmp:document-insert($uri-prefix || $path, $content, xdmp:default-permissions(), $collections)
  },"data-hub-JOBS" )
  return ()
};

(:
A suite setup module may need to load entities in one transaction, then all other artifacts in a separate
transaction so that e.g. mappings validate properly. Thus, this function and load-non-entities can be used for the
two separate tasks.
:)
declare function load-entities($caller-path as xs:string) as xs:string*
{
  load-artifacts("entities", $caller-path)
};

declare function load-non-entities($caller-path as xs:string) as xs:string*
{
  for $key in map:keys($TYPE-TO-COLLECTION-MAP)
  where fn:not($key = "entities")
  return load-artifacts($key, $caller-path)
};

declare private function load-artifacts(
  $artifact-type as xs:string,
  $caller-path as xs:string
) as xs:string*
{
  let $test-data-path := get-test-data-path($caller-path)

  for $uri in get-artifact-uris($artifact-type, $test-data-path)
  let $path := fn:replace($uri, $test-data-path, "")
  let $artifact-uri := "/" || $path
  let $content := test:get-test-file($path)
  let $permissions := xdmp:default-permissions()
  let $collections := map:get($TYPE-TO-COLLECTION-MAP, $artifact-type)
  (: TODO Should really use artifact library for this :)
  let $_ := invoke-in-staging-and-final(function() {
    xdmp:document-insert($artifact-uri, $content, $permissions, $collections)
  })
  return $artifact-uri
};

declare function get-artifact-uris(
  $artifact-type as xs:string,
  $test-data-path as xs:string
) as xs:string*
{
  invoke-in-db(
    function() {
      cts:uris((), (), cts:directory-query($test-data-path || $artifact-type || "/", "infinity"))
    }, xdmp:database-name(xdmp:modules-database())
  )
};

declare function get-test-data-path($caller-path as xs:string) as xs:string
{
  fn:replace(
    fn:concat(cvt:basepath($caller-path), "/test-data/"),
    "//", "/"
  )
};

(:
suite-setup files should call this to ensure that no documents created by previous tests are left.
:)
declare function reset-hub() as empty-sequence()
{
  reset-staging-and-final-databases(),
  clear-jobs-database()
};

declare function clear-jobs-database()
{
  invoke-in-db(function() {xdmp:collection-delete("Jobs")}, "data-hub-JOBS")
};

declare function reset-staging-and-final-databases()
{
  invoke-in-staging-and-final(function() {
    cts:uris((), (), cts:not-query(cts:collection-query("hub-core-artifact"))) ! xdmp:document-delete(.)
  })
};

declare function invoke-in-staging-and-final($function)
{
  ("data-hub-STAGING", "data-hub-FINAL") ! invoke-in-db($function, .)
};

declare function get-first-batch-document()
{
  invoke-in-db(function() {collection("Batch")[1]}, "data-hub-JOBS")
};

declare function get-modules-document($uri as xs:string)
{
  invoke-in-db(function() {fn:doc($uri)}, "data-hub-MODULES")
};

declare function invoke-in-db($function, $database as xs:string)
{
  xdmp:invoke-function($function,
    <options xmlns="xdmp:eval">
      <database>{xdmp:database($database)}</database>
    </options>
  )
};

declare function assert-called-from-test()
{
  let $stack-uris := (try {
    fn:error()
  } catch ($e) {
    $e/error:stack/error:frame/error:uri ! fn:string()
  })
  let $called-from-test :=
    every $uri in $stack-uris
    satisfies (fn:starts-with($uri, "/test/") or fn:starts-with($uri, "/MarkLogic/") or fn:starts-with($uri, "/marklogic.rest.resource/marklogic-unit-test/"))
  where fn:not($called-from-test)
  return (
    fn:error(xs:QName('EXTERNAL-AMPED-TEST-ATTEMPT'), "This function shouldn't be called outside of the test framework", $stack-uris)
  )
};

declare function assert-in-collections($uri as xs:string, $collections as xs:string+)
{
  let $actual-collections := invoke-in-db(function(){xdmp:document-get-collections($uri)}, "data-hub-FINAL")
  for $c in $collections
  return test:assert-true($actual-collections = $c, "Expected URI " || $uri || " to be in collection " || $c)
};

(:
permissions-string is expected to be role,capability,role,capability,etc
:)
declare function assert-has-permissions($uri as xs:string, $permissions-string as xs:string)
{
  let $actual-perms := invoke-in-db(function(){xdmp:document-get-permissions($uri)}, "data-hub-FINAL")
  let $tokens := fn:tokenize($permissions-string, ",")
  for $token at $index in $tokens
  where math:fmod($index, 2) = 1
  return
    let $role := xdmp:role($token)
    let $capability := $tokens[$index + 1]
    let $exists := fn:exists($actual-perms[sec:role-id = $role and sec:capability = $capability])
    return test:assert-true($exists, "Expected URI " || $uri || " to have permission with role " || $role || " and capability " || $capability)
};


(: Copied from https://github.com/marklogic-community/marklogic-unit-test/issues/14 :)
declare variable $ARRAY-QNAME := fn:QName("http://marklogic.com/xdmp/json", "array");
declare function assert-arrays-equal($expected as item()*, $actual as item()*)
{
  if (xdmp:type(fn:head($expected)) eq $ARRAY-QNAME) then
    test:assert-same-values(json:array-values($expected), json:array-values($actual))
  else
    let $expected-ordered :=
      for $e in $expected
      order by $e
      return $e
    let $actual-ordered :=
      for $a in $actual
      order by $a
      return $a
    return test:assert-equal($expected-ordered, $actual-ordered)
};
