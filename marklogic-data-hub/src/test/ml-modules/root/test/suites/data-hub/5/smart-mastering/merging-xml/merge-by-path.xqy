xquery version "1.0-ml";

(:
 : Test merging by path.
 :)

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace sm = "http://marklogic.com/smart-mastering";
declare namespace has = "has";

(: Force update mode :)
declare option xdmp:update "true";

declare option xdmp:mapping "false";

(: Merge a couple documents :)
let $merged-doc :=
  xdmp:invoke-function(
    function() {
      merging:save-merge-models-by-uri(
        map:keys($lib:TEST-DATA),
        merging:get-options($lib:OPTIONS-NAME-PATH, $const:FORMAT-XML))
    },
    $lib:INVOKE_OPTIONS
  )
(:
 : Expecting this for <headers>:

<headers>
  <!-- regular SM, ES headers, plus: -->
  <unconfigured xmlns="http://marklogic.com/entity-services">unconfigured value 2a</unconfigured>
  <unconfigured xmlns="http://marklogic.com/entity-services">unconfigured value 1a</unconfigured>
  <shallow>shallow value 1</shallow>
  <custom>
    <unconfigured>unconfigured value 1b</unconfigured>
    <unconfigured>unconfigured value 2b</unconfigured>
    <this><has><a><deep><path>deep value 12</path></deep></a></has></this>
  </custom>
</headers>
 :)

return (
  test:assert-equal("shallow value 1", $merged-doc/es:headers/shallow/fn:string()),
  test:assert-equal("deep value 12", $merged-doc/es:headers/custom/this/has:a/deep/path/fn:string()),
  test:assert-same-values(("unconfigured value 1a", "unconfigured value 2a"), $merged-doc/es:headers/es:unconfigured/fn:string()),
  test:assert-same-values(("unconfigured value 1b", "unconfigured value 2b"), $merged-doc/es:headers/custom/unconfigured/fn:string())
)
