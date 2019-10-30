xquery version "1.0-ml";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare function local:verify-stylesheet-has-map-namespace-declared($path as xs:string)
{
  let $stylesheet := xdmp:eval("fn:doc('" || $path || "')", (),
    <options xmlns="xdmp:eval">
      <database>{xdmp:database("data-hub-MODULES")}</database>
    </options>
  )/node()

  return test:assert-true(
    $stylesheet/namespace::* = "http://marklogic.com/xdmp/map",
    "Each compiled stylesheet is expected to have the 'map' namespace prefix declared so that map functions " ||
    "are guaranteed to resolve no matter what context the stylesheet is used in."
  )
};

local:verify-stylesheet-has-map-namespace-declared("/data-hub/5/mapping-functions/core.xml.xslt"),
local:verify-stylesheet-has-map-namespace-declared("/custom-modules/mapping-functions/custom-mapping-functions.xml.xslt")
