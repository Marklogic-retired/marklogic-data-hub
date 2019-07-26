xquery version "1.0-ml";

module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";
import module namespace thsr = "http://marklogic.com/xdmp/thesaurus"
at "/MarkLogic/thesaurus.xqy";

declare namespace match = "http://marklogic.com/smart-mastering/matcher";

declare option xdmp:mapping "false";

(:
 : Build a query that expands on the provided name(s) in $expand-values.
 : Note that the weight for this query will be the same for the original target value and for any values that are
 : found in the thesaurus. If we use zero for the original value's weight, the resulting query doesn't end up
 : awarding points for synonym matches.
 :
 : For more information about the thesaurus algorithm, see
 : https://marklogic-community.github.io/smart-mastering-core/docs/match-algorithms/#thesaurus.
 :)
declare function algorithms:thesaurus(
  $expand-values as xs:string*,
  $expand-xml as element(match:expand),
  $options-xml as element(match:options)
)
{
  let $property-name := $expand-xml/@property-name
  let $thesaurus := $expand-xml/*:thesaurus
  where fn:exists($thesaurus)
  return
    for $value in $expand-values
    let $entries := thsr:lookup($thesaurus, fn:lower-case($value))
    where fn:exists($entries)
    return
      let $query := helper-impl:property-name-to-query($options-xml, $property-name)(fn:lower-case($value), $expand-xml/@weight)
      return expand-query($query, $entries, $expand-xml)
};

declare function expand-query(
  $query as cts:query,
  $entries as element(thsr:entry)*,
  $expand-xml as element(match:expand)
) as cts:query
{
  let $weight := $expand-xml/@weight
  let $filters := $expand-xml/*:filter/*
  return
  (: thsr:expand does not yet work properly on cts:json-property-scope-query, so must run thsr:expand on the child query instead :)
    if ($query instance of cts:json-property-scope-query) then
      let $property-name := cts:json-property-scope-query-property-name($query)
      let $child-query := cts:json-property-scope-query-query($query)
      let $expanded-query := thsr:expand($child-query, $entries, $weight, (), $filters)
      return cts:json-property-scope-query($property-name, $expanded-query)
    else
      thsr:expand($query, $entries, $weight, (), $filters)
};
