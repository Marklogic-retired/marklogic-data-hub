xquery version "1.0-ml";

module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms";

import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";
import module namespace thsr = "http://marklogic.com/xdmp/thesaurus"
at "/MarkLogic/thesaurus.xqy";

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
  $expand-values as node()*,
  $expand as node(),
  $options as node()
)
{
  let $expand-options := fn:head(($expand/options, $expand))
  let $thesaurus := $expand-options/(*:thesaurus|thesaurusURI)
  let $original-values := $expand-values ! fn:string(.)[. ne '']
  where fn:exists($thesaurus) and fn:exists($original-values)
  return
    let $expand-options := fn:head(($expand/options, $expand))
    let $filters := if (fn:exists($expand-options/*:filter/*)) then
      $expand-options/*:filter/*
    else if (fn:exists($expand-options/*:filter[fn:normalize-space(.)])) then
        xdmp:unquote($expand-options/*:filter)
      else ()
    (: using query-lookup to support case-insensitive :)
    let $entries := filter-entries(thsr:query-lookup($thesaurus, cts:element-value-query(xs:QName("thsr:term"), $original-values, "case-insensitive")), $filters)
    where fn:exists($entries)
    return
      expand-query($entries, $expand, $options)
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
  $entries as element(thsr:entry)+,
  $expand as node()?,
  $options as node()
) as cts:query
{
  let $property-name := helper-impl:get-property-name($expand)
  let $expand-options := fn:head(($expand/options, $expand))
  let $weight := $expand-options/(weight|@weight)
  let $values := ($entries/thsr:term | $entries/thsr:synonym/thsr:term) ! fn:string(.)
  return helper-impl:property-name-to-query($options, $property-name)($values, $weight)
};

(: filter entries based on filter XML.
This is taken from the thesaurus library since we need to filter outside of thrs:expand-query to support case-insensitive range index queries.  :)
declare private function
filter-entries($entries as element(thsr:entry)*,
    $filter as node()*)
as element(thsr:entry)*
{
  if (fn:empty($filter))
  then $entries
  else $entries[
  some $desc in .//*
  satisfies (
    some $f in $filter satisfies fn:deep-equal($desc,$f)
  )
  ]
};
