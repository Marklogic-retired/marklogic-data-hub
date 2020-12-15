xquery version "1.0-ml";

module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms";

import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";

declare option xdmp:mapping "false";

(:
Example of a simple DOB matching algorithm that expands the query by bumping each date up by one year.
:)
declare function algorithms:dob-match(
  $expand-values as xs:string*,
  $match-rule as node(),
  $options-node as node()
) as cts:query*
{
  let $property-name := $match-rule/entityPropertyPath
  let $weight := $match-rule/weight
  for $value in $expand-values
  where $value castable as xs:date
  return
    let $query := helper-impl:property-name-to-query($options-node, $property-name)($value, $weight)
    let $next-year := xs:date($value) + xs:yearMonthDuration("P1Y")
    let $next-query := helper-impl:property-name-to-query($options-node, $property-name)(xs:string($next-year), $weight)
    return cts:or-query(($query, $next-query))
};
