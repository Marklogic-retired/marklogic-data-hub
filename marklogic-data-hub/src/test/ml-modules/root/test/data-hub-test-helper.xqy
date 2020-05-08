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
  xdmp:invoke-function(
    function() {
      cts:uris((), (), cts:directory-query($test-data-path || $artifact-type || "/", "infinity"))
    },
    <options xmlns="xdmp:eval">
      <database>{xdmp:modules-database()}</database>
    </options>
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
  xdmp:invoke-function(function() {
    xdmp:collection-delete("Jobs")
  },
    <options xmlns="xdmp:eval">
      <database>{xdmp:database("data-hub-JOBS")}</database>
    </options>
  )
};

declare function reset-staging-and-final-databases()
{
  invoke-in-staging-and-final(function() {
    cts:uris((), (), cts:not-query(cts:collection-query("hub-core-artifact"))) ! xdmp:document-delete(.)
  })
};

declare function invoke-in-staging-and-final($function)
{
  ("data-hub-STAGING", "data-hub-FINAL") ! xdmp:invoke-function($function,
    <options xmlns="xdmp:eval">
      <database>{xdmp:database(.)}</database>
    </options>
  )
};

declare function get-first-batch-document()
{
  xdmp:invoke-function(function() {
    collection("Batch")[1]
  },
    <options xmlns="xdmp:eval">
      <database>{xdmp:database("data-hub-JOBS")}</database>
    </options>
  )
};

declare function get-modules-document($uri as xs:string)
{
  xdmp:invoke-function(function() {fn:doc($uri)},
    <options xmlns="xdmp:eval">
      <database>{xdmp:database("data-hub-MODULES")}</database>
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