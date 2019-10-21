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

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";
declare namespace sm = "http://marklogic.com/smart-mastering";
declare namespace es = "http://marklogic.com/entity-services";

declare variable $_cached-property-name-to-queries as map:map := map:map();

declare function helper-impl:property-name-to-query($options as element(), $full-property-name as xs:string)
{
  let $key := fn:generate-id($options)|| "|" || $full-property-name
  return
    if (map:contains($_cached-property-name-to-queries, $key)) then
      map:get($_cached-property-name-to-queries, $key)
    else
      let $is-json := $options/matcher:data-format = $const:FORMAT-JSON
      let $target-entity-def := es-helper:get-entity-def($options/matcher:target-entity)
      let $qname := helper-impl:property-name-to-qname($options, $full-property-name)
      let $property-name :=
        if (fn:contains($full-property-name, ".")) then
          fn:substring-after($full-property-name, ".")
        else
          $full-property-name
      let $property-details :=
        if (fn:exists($target-entity-def)) then
          let $prop-entity-def :=
            if (fn:contains($full-property-name, ".")) then
              es-helper:get-entity-def(fn:substring-before($full-property-name, "."))
            else
              $target-entity-def
          return
            es-helper:get-entity-def-property(
              $prop-entity-def,
              $property-name
            )
        else ()
      let $prop-entity-def := $property-details/../..
      let $property-entity-qname := $prop-entity-def ! fn:QName(./namespaceUri, xdmp:encode-for-NCName(./entityTitle))
      let $scope-query :=
        if (fn:exists($property-entity-qname)) then
          if ($is-json) then
            cts:json-property-scope-query(fn:string($property-entity-qname), ?)
          else
            cts:element-query($property-entity-qname, ?)
        else
          function($val) {
            $val
          }
      let $property-def := $options/matcher:property-defs/matcher:property[@name = $full-property-name]
      let $index-reference-xml := $property-def/(cts:json-property-reference|cts:element-reference|cts:path-reference|cts:field-reference)
      let $helper-query :=
        if (fn:exists($property-def) or fn:exists($property-details)) then
          if (fn:exists($index-reference-xml)) then
            let $references := $index-reference-xml ! cts:reference-parse(.)
            let $scalar-type := cts:reference-scalar-type(fn:head($references))
            return function($val, $weight) {
              let $cast-values := $val ! fn:data(element val { attribute xsi:type {"xs:"||$scalar-type}, fn:string(.)})
              return
                $scope-query(cts:range-query($references, "=", $cast-values, ("score-function=linear"), $weight))
            }
          else if ($is-json) then
              function($val, $weight) {
                $scope-query(cts:json-property-value-query(
                  fn:string($qname),
                  $val,
                  ("case-insensitive"),
                  $weight
                ))
              }
            else
              function($val, $weight) {
                $scope-query(cts:element-value-query(
                  $qname,
                  $val,
                  ("case-insensitive"),
                  $weight
                ))
              }
        else ()
      return (
        map:put($_cached-property-name-to-queries, $key, $helper-query),
        $helper-query
      )
};

declare variable $_cached-property-name-to-qnames as map:map := map:map();

declare function helper-impl:property-name-to-qname($options as element(), $full-property-name as xs:string)
{
  let $key := fn:generate-id($options)|| "|" || $full-property-name
  return
    if (map:contains($_cached-property-name-to-qnames, $key)) then
      map:get($_cached-property-name-to-qnames, $key)
    else
      let $target-entity-def := es-helper:get-entity-def($options/matcher:target-entity)
      let $property-name :=
        if (fn:contains($full-property-name, ".")) then
          fn:substring-after($full-property-name, ".")
        else
          $full-property-name
      let $property-details :=
        if (fn:exists($target-entity-def)) then
          let $prop-entity-def :=
            if (fn:contains($full-property-name, ".")) then
              es-helper:get-entity-def(fn:substring-before($full-property-name, "."))
            else
              $target-entity-def
          return
            es-helper:get-entity-def-property(
              $prop-entity-def,
              $property-name
            )
        else ()
      let $prop-entity-def := $property-details/../..
      let $property-entity-qname := $prop-entity-def ! fn:QName(./namespaceUri, xdmp:encode-for-NCName(./entityTitle))
      let $property-def := $options/matcher:property-defs/matcher:property[@name = $full-property-name]
      let $qname :=
          if (fn:exists($property-def)) then
            fn:QName($property-def/@namespace, $property-def/@localname)
          else
            fn:QName($prop-entity-def/namespaceUri, xdmp:encode-for-NCName($property-name))
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
        else
          $query
      return
        map:put($queries-by-scope, $key, (map:get($queries-by-scope, $key),$values))
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
};
