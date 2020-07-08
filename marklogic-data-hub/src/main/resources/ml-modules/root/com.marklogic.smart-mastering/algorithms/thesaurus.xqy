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
  $expand-values as item()*,
  $expand as node(),
  $options as node()
)
{
  let $property-name := helper-impl:get-property-name($expand)
  let $expand-options := fn:head(($expand/options, $expand))
  let $thesaurus := $expand-options/(*:thesaurus|thesaurusURI)
  where fn:exists($thesaurus)
  return
    for $value in $expand-values
    let $entries := thsr:lookup($thesaurus, fn:lower-case($value))
    where fn:exists($entries)
    return
      let $weight := $expand/(@weight|weight)
      let $query := helper-impl:property-name-to-query($options, $property-name)(fn:lower-case($value), $weight)
      return expand-query($query, $entries, $expand)
};

(: Allows synonym to be used instead of thesaurus in the options :)
declare function algorithms:synonym(
    $expand-values,
    $expand as node(),
    $options as node()
)
{
  algorithms:thesaurus($expand-values, $expand, $options)
};

declare function expand-query(
  $query as cts:query,
  $entries as element(thsr:entry)*,
  $expand as node()
) as cts:query
{
  let $weight := $expand/(weight|@weight)
  let $expand-options := fn:head(($expand/options, $expand))
  let $filters := if (fn:exists($expand-options/*:filter/*)) then
      $expand-options/*:filter/*
    else if (fn:exists($expand-options/*:filter[fn:normalize-space(.)])) then
      xdmp:unquote($expand-options/*:filter)
    else ()
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
