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
    "are guaranteed to resolve no matter what context the stylesheet is used in; failed for path: " || $path
  )
};

(:
core-functions.xml.xslt is not tested here because the problem with the 'map' namespace prefix not being
referenceable isn't a problem for an XQuery mapping functions module. The 'map' namespace prefix is used
in the xdmp:javascript-call elements added to the XSLT module for an SJS mapping functions module, and
thus we verify that it exists for the XSLT associated with the custom-mapping-functions.sjs module.
:)
local:verify-stylesheet-has-map-namespace-declared("/custom-modules/mapping-functions/custom-mapping-functions.xml.xslt")

