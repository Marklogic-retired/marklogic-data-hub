xquery version "1.0-ml";

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : This module contains helper functions for generating queries for properties.
 :)

module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace es-helper = "http://marklogic.com/smart-mastering/entity-services"
  at "/com.marklogic.smart-mastering/sm-entity-services.xqy";
import module namespace match-opt-impl = "http://marklogic.com/smart-mastering/options-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/options-impl.xqy";
import module namespace httputils="http://marklogic.com/data-hub/http-utils"
  at "/data-hub/5/impl/http-utils.xqy";

declare variable $_cached-property-name-to-queries as map:map := map:map();

declare function helper-impl:property-name-to-query($match-options as item(), $full-property-name as xs:string)
{
  let $compiled-match-options := match-opt-impl:compile-match-options($match-options, ())
  let $match-options := $compiled-match-options => map:get("normalizedOptions")
  let $options-id := $compiled-match-options => map:get("optionsId")
  let $key := $options-id || "|" || $full-property-name
  return
    if (map:contains($_cached-property-name-to-queries, $key)) then
      map:get($_cached-property-name-to-queries, $key)
    else
      let $target-entity-type := $compiled-match-options => map:get("targetEntityType")
      let $match-options := $compiled-match-options => map:get("normalizedOptions")
      let $is-json-fun := function () {$compiled-match-options => map:get("dataFormat") = $const:FORMAT-JSON}
      let $property-info :=
        if (fn:exists($target-entity-type)) then
          es-helper:get-entity-property-info($target-entity-type, $full-property-name)
        else
          ()
      let $property-def := fn:head(
        ($match-options/(*:property-defs|propertyDefs)/*:property[(name|@name) = $full-property-name],
        $match-options/matchRulesets/matchRules[documentXPath = $full-property-name])
      )
      let $index-reference-info := $property-def/(cts:json-property-reference|cts:element-reference|cts:path-reference|cts:field-reference|indexReferences)
      let $index-references := ($property-info ! map:get(., "indexReference"), $index-reference-info ! cts:reference-parse(.))
      let $helper-query :=
        (: Prioritize optimizations that reference range indexes :)
        if (fn:exists($index-references)) then
            let $scalar-type := fn:distinct-values($index-references ! cts:reference-scalar-type(.))
            return
              if (fn:count($scalar-type) eq 1) then
                function($val, $weight) {
                  let $cast-values := $val ! fn:data(element val { attribute xsi:type {"xs:"||$scalar-type}, fn:string(.)})
                  let $expanded-values := if ($scalar-type eq "string") then cts:value-match($index-references, $cast-values, "case-insensitive") else $cast-values
                  return
                    cts:range-query($index-references, "=", if (fn:exists($expanded-values)) then $expanded-values else $cast-values, ("score-function=linear"), $weight)
                }
              else
                httputils:throw-bad-request((), ("Attempted to used mixed scalar types for range indexed match query", $full-property-name, $index-references))
        else if (fn:exists($property-info)) then
          let $namespace := fn:string($property-info => map:get("namespace"))
          let $parent-property-qnames := fn:reverse(fn:map-pairs(
              function($namespace, $property-title) {
                fn:QName($namespace, helper-impl:NCName-compatible($property-title))
              },
              $property-info => map:get("namespaceLineage"),
              $property-info => map:get("propertyLineage")
          ))
          let $scope-query :=
            function($queries, $is-json) {
              for $query in $queries
              return
                if ($is-json) then
                  fn:fold-left(function($query, $parent-property-qname) {cts:json-property-scope-query(fn:string($parent-property-qname), $query) }, $query, $parent-property-qnames)
                else
                  fn:fold-left(function($query, $parent-property-qname) {cts:element-query($parent-property-qname, $query) }, $query, $parent-property-qnames)
            }
          let $qname := fn:QName($namespace, helper-impl:NCName-compatible($property-info => map:get("propertyTitle")))
          return
            function($nodes, $weight) {
              let $expanded-values := $nodes ! fn:string(.)[. ne '']
              where fn:exists($expanded-values)
              return
                $scope-query(
                  if ($is-json-fun()) then
                    cts:json-property-value-query(
                      fn:local-name-from-QName($qname),
                      $nodes[fn:not(. instance of null-node())],
                      (),
                      $weight
                    )
                  else
                    cts:element-value-query(
                        $qname,
                        $expanded-values,
                        (),
                        $weight
                    ),
                  $is-json-fun()
                )
            }
        else if (fn:exists($property-def)) then
          if (fn:exists($property-def/(@xpath|documentXPath))) then
            helper-impl:build-xpath-based-query($property-def, $compiled-match-options)
          else
            let $qname := fn:QName(fn:string($property-def/(@namespace|namespace)), fn:string($property-def/(@localname|localname)))
            return
              function($nodes, $weight) {
                let $expanded-values := $nodes ! fn:string(.)[. ne '']
                where fn:exists($expanded-values)
                return
                  if ($is-json-fun()) then
                    cts:json-property-value-query(
                      fn:string($qname),
                      $nodes[fn:not(. instance of null-node())],
                      ("case-insensitive"),
                      $weight
                    )
                  else
                    cts:element-value-query(
                        $qname,
                        $expanded-values,
                        ("case-insensitive"),
                        $weight
                    )
              }
        else ()
      return (
        map:put($_cached-property-name-to-queries, $key, $helper-query),
        $helper-query,
        xdmp:trace($const:TRACE-MATCH-RESULTS, "Caching '" || xdmp:describe($helper-query, (),()) || "' under key '" || $key ||"'" )
      )
};

declare function helper-impl:build-xpath-based-query($property-def, $compiled-match-options) {
  let $xpath-parts := fn:reverse(fn:tokenize(fn:string($property-def/(@xpath|documentXPath)), "/")[. ne ""])
  let $first-xpath-part := fn:head($xpath-parts)
  let $remaining-xpath-parts := fn:tail($xpath-parts)
  let $namespaces := $compiled-match-options => map:get("namespaces")
  let $parse-names-function := function ($xpath-step) {
      fn:tokenize(fn:replace($xpath-step, "^\(.+\)$", "$1"), "\|") ! fn:normalize-space()
    }
  return
    function ($nodes, $weight) {
      let $is-xml := fn:exists($nodes[parent::element()])
      let $local-namespaces := map:new(($namespaces, $property-def/namespaces ! xdmp:from-json(.)))
      let $is-xml := fn:exists($nodes[parent::element()])
      let $values := if ($is-xml) then $nodes ! fn:string(.)[. ne ''] else $nodes[fn:not(. instance of null-node())]
      let $parse-names-function := if ($is-xml) then
              function($xpath-step) {
                for $part in $parse-names-function($xpath-step)
                return
                  if (fn:contains($part, ":")) then
                    let $qname-parts := fn:tokenize($part, ":")
                    return
                      fn:QName(map:get($local-namespaces, $qname-parts[1]), $qname-parts[2])
                  else
                    xs:QName($part)
              }
            else
              $parse-names-function
      let $query := if ($is-xml) then
            cts:element-value-query($parse-names-function($first-xpath-part), $values, (), $weight)
          else
            cts:json-property-value-query($parse-names-function($first-xpath-part), $values, (), $weight)
      return
        fn:fold-left(
          if ($is-xml) then
            function($query, $parent-xpath-part) {cts:element-query($parse-names-function($parent-xpath-part) ! xs:QName(.), $query) }
          else
            function($query, $parent-xpath-part) {cts:json-property-scope-query($parse-names-function($parent-xpath-part), $query) },
          $query,
          $remaining-xpath-parts
        )
    }
};

declare variable $_cached-property-name-to-qnames as map:map := map:map();

declare function helper-impl:property-name-to-qname($match-options as item(), $full-property-name as xs:string)
{
  let $compiled-match-options := match-opt-impl:compile-match-options($match-options, ())
  let $match-options := $compiled-match-options => map:get("normalizedOptions")
  let $key := xdmp:md5(xdmp:describe($match-options, (), ())) || "|" || $full-property-name
  return
    if (map:contains($_cached-property-name-to-qnames, $key)) then
      map:get($_cached-property-name-to-qnames, $key)
    else
      let $target-entity-type := $compiled-match-options => map:get("targetEntityType")
      let $property-info := es-helper:get-entity-property-info($target-entity-type, $full-property-name)
      let $qname :=
        if (fn:exists($property-info)) then
          let $namespace := fn:string($property-info => map:get("namespace"))
          return fn:QName($namespace, helper-impl:NCName-compatible($property-info => map:get("propertyTitle")))
        else
          let $property-def := $match-options/(*:property-defs|propertyDefs)/*:property[(name|@name) = $full-property-name]
          return
            fn:QName(fn:string($property-def/(@namespace|namespace)), fn:string($property-def/(@localname|localname)))
      return (
        map:put($_cached-property-name-to-qnames, $key, $qname),
        $qname
      )
};

declare variable $string-token as xs:string := "####";

(:
 : Group queries by into the same property/elelment scope. This improves the performance of our queries.
 : @param $queries cts:query* to be grouped by scope
 : @param $grouping-query-fun function for grouping queries in a scope. (e.g., cts:and-query#1, cts:or-query#1)
 :)
declare function helper-impl:group-queries-by-scope($queries as cts:query*, $grouping-query-fun as function(cts:query*) as cts:query??) {
  if (fn:count($queries) le 1) then
    $queries
  else
    let $queries-by-scope := map:map()
    let $_group-by :=
      for $query in $queries
      let $is-json-prop-scope := $query instance of cts:json-property-scope-query
      let $is-element-scope := $query instance of cts:element-query
      let $key :=
        if ($is-json-prop-scope) then
          "json-prop:" || fn:string-join(
            for $prop in cts:json-property-scope-query-property-name($query) order by $prop return $prop,
            $string-token
          )
        else if ($is-element-scope) then
          "element:"|| fn:string-join(
            for $qn in cts:element-query-element-name($query) order by $qn return xdmp:key-from-QName($qn),
            $string-token
          )
        else
          "_other"
      let $values :=
        if ($is-json-prop-scope) then
          cts:json-property-scope-query-query($query)
        else if ($is-element-scope) then
          cts:element-query-query($query)
        else if ($query instance of cts:or-query) then
          helper-impl:group-queries-by-scope(cts:or-query-queries($query), cts:or-query#1)
        else if ($query instance of cts:and-query) then
          helper-impl:group-queries-by-scope(cts:and-query-queries($query), cts:and-query#1)
        else
          $query
      return
        map:put($queries-by-scope, $key, (map:get($queries-by-scope, $key),$values))
    let $grouped-queries :=
      for $key in map:keys($queries-by-scope)
      let $grouped-queries := map:get($queries-by-scope, $key)
      let $grouped-queries := if (fn:exists($grouping-query-fun) and fn:count($grouped-queries) gt 1) then $grouping-query-fun($grouped-queries) else $grouped-queries
      return
        if (fn:starts-with($key, "json-prop:")) then
          cts:json-property-scope-query(fn:tokenize(fn:substring-after($key, "json-prop:"), $string-token), $grouped-queries)
        else if (fn:starts-with($key, "element:")) then
          cts:element-query(fn:tokenize(fn:substring-after($key, "element:"), $string-token) ! xdmp:QName-from-key(.), $grouped-queries)
        else
          $grouped-queries
    return
      if (fn:count($grouped-queries) gt 1 and fn:exists($grouping-query-fun)) then
        $grouping-query-fun($grouped-queries)
      else
        $grouped-queries
};

declare function helper-impl:get-property-name($match-rule as node()) as xs:string? {
  $match-rule/(@property-name|propertyName|entityPropertyPath|documentXPath)
};

declare function helper-impl:NCName-compatible($title as xs:string) {
  if ($title castable as xs:NCName) then
    $title
  else
    xdmp:encode-for-NCName($title)
};


declare function helper-impl:get-value-query-fn($property-info, $full-property-name as xs:string, $is-json as xs:boolean)
{
  let $namespace := fn:string($property-info => map:get("namespace"))
  let $qname := fn:QName($namespace, helper-impl:NCName-compatible($property-info => map:get("propertyTitle")))
  return
    function($val, $weight) {
      if (fn:empty($val)) then
        ()
      else if ($is-json) then
        cts:json-property-value-query(fn:local-name-from-QName($qname), $val, (), $weight)
      else
        cts:element-value-query($qname, $val ! fn:string(.)[. ne ''], (), $weight)
    }
};

declare function helper-impl:get-struct-prop-parent-scope-query-fn($property-info, $property-name)
{
  let $namespace := fn:string($property-info => map:get("namespace"))
  let $property-qname := fn:QName($namespace, helper-impl:NCName-compatible($property-name))
  return
    function($queries, $is-json) {
      if ($is-json) then
        cts:json-property-scope-query(fn:string($property-qname), cts:and-query($queries))
      else
        cts:element-query($property-qname, cts:and-query($queries))
    }
};
