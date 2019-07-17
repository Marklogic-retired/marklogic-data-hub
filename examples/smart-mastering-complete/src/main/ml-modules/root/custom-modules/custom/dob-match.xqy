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
  $expand-xml as element(matcher:expand),
  $options-xml as element(matcher:options)
) as cts:query*
{
  let $property-name := $expand-xml/@property-name
  let $weight := $expand-xml/@weight

  for $value in $expand-values
  where $value castable as xs:date
  return
    let $query := helper-impl:property-name-to-query($options-xml, $property-name)($value, $weight)
    let $next-year := xs:date($value) + xs:yearMonthDuration("P1Y")
    let $next-query := helper-impl:property-name-to-query($options-xml, $property-name)(xs:string($next-year), $weight)
    return cts:or-query(($query, $next-query))
};
