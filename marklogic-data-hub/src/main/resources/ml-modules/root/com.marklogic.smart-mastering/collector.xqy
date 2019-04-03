xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/smart-mastering/collector";

import module namespace coll = "http://marklogic.com/smart-mastering/collections"
  at "/com.marklogic.smart-mastering/impl/collections.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";

declare option xdmp:mapping "false";

(:~
 : Collect IDs plugin
 :
 : @param $options - a map containing options.
 :
 : @return - a sequence of ids or uris
 :)
declare function plugin:collect(
  $options as map:map) as xs:string*
{
  let $merge-options := merging:get-options($options => map:get("options"), $const:FORMAT-XML)
  let $matching-options := matcher:get-options(fn:string($merge-options/merging:match-options), $const:FORMAT-XML)
  return
    cts:uris((), (), cts:and-query((
      coll:content-collections($matching-options) ! cts:collection-query(.),
      $options => map:get("query")
    )))
};
