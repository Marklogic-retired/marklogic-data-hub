xquery version "1.0-ml";

(:~
 : Defines a match algorithm for matching between 9- and 5-digit US zip codes.
 :)
module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms";

import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";

declare option xdmp:mapping "false";

(:~
 : Allow matches between 5- and 9-digit US ZIP codes.
 : For more information, see https://marklogic-community.github.io/smart-mastering-core/docs/match-algorithms/#zip
 :
 : @param $expand-values  the value(s) that the original document has for this property
 : @param $expand-xml  the scoring/expand element in the match options that applies this algorithm to a property
 : @param $options-xml  the complete match options
 :
 : @return a sequence of cts:querys based on the property values in the original document
 :)
declare function algorithms:zip-match(
  $expand-values as xs:string*,
  $expand as node(),
  $options as node()
)
  as cts:query*
{
  let $property-name := helper-impl:get-property-name($expand)
  let $weight := $expand/weight
  let $sep := "-"
  let $origin-5-weight := fn:head(($expand/*:zip[(@origin|origin) = "5"]/(weight|@weight)/fn:data(),$weight))
  let $origin-9-weight := fn:head(($expand/*:zip[(@origin|origin) = "9"]/(weight|@weight)/fn:data(),$weight))
  for $value in $expand-values
  return
    if (fn:string-length($value) = 5) then
      helper-impl:property-name-to-query($options, $property-name)($value || $sep || "*", $origin-5-weight)
    else
      helper-impl:property-name-to-query($options, $property-name)(fn:substring($value, 1, 5), $origin-9-weight)
};

(: Allows zip to be used instead of zip-match in the options :)
declare function algorithms:zip(
    $expand-values,
    $expand as node(),
    $options as node()
)
{
  algorithms:zip-match($expand-values, $expand, $options)
};