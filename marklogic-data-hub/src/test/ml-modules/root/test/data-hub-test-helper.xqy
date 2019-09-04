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
  map:entry("step-definitions", "http://marklogic.com/data-hub/step-definition")
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

declare function load-artifacts(
  $artifact-type as xs:string,
  $caller-path as xs:string
) as xs:string*
{
  let $test-data-path := get-test-data-path($caller-path)

  for $uri in get-artifact-uris($artifact-type, $test-data-path)
  let $path := fn:replace($uri, $test-data-path, "")
  let $artifact-uri := "/" || $path
  return (
    $artifact-uri,
    xdmp:document-insert(
      $artifact-uri,
      test:get-test-file($path),
      xdmp:default-permissions(),
      map:get($TYPE-TO-COLLECTION-MAP, $artifact-type)
    )
  )
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

declare function delete-artifacts($caller-path as xs:string) as xs:string*
{
  let $test-data-path := get-test-data-path($caller-path)
  return map:keys($TYPE-TO-COLLECTION-MAP) ! delete-artifacts(., $test-data-path)
};

declare function delete-artifacts(
  $artifact-type as xs:string,
  $test-data-path as xs:string
) as xs:string*
{
  for $uri in get-artifact-uris($artifact-type, $test-data-path)
  let $path := fn:replace($uri, $test-data-path, "")
  let $artifact-uri := "/" || $path
  where fn:doc-available($artifact-uri)
  return (
    $artifact-uri,
    xdmp:document-delete($artifact-uri)
  )
};
