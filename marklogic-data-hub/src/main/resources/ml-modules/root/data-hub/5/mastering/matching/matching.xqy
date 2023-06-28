xquery version "1.0-ml";

module namespace qh = "http://marklogic.com/smart-mastering/matching";

import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";

declare variable $options-json-config := _options-json-config();

declare function _options-json-config()
{
  let $config := json:config("custom")
  return (
    map:put($config, "camel-case", fn:true()),
    map:put($config, "array-element-names",
      ("algorithm","threshold","property", "reduce", "add", "expand","results", "zip")),
    map:put($config, "element-namespace", "http://marklogic.com/smart-mastering/matcher"),
    map:put($config, "element-namespace-prefix", "matcher"),
    map:put($config, "attribute-names",
      ("name","localname", "namespace", "function", "origin",
      "at", "property-name", "propertyName", "weight", "above", "label","algorithm-ref","algorithmRef")
    ),
    $config
  )
};


declare function number-friendly-double-metaphone($value) {
  spell:double-metaphone(fn:translate($value, "0123456789", "abcdfghlmn"))
};

declare function query-to-hashes($query as cts:query, $is-fuzzy as xs:boolean) as xs:unsignedLong* {
  build-hashes(document {$query}, if ($is-fuzzy) then number-friendly-double-metaphone#1 else function($val) {fn:lower-case(fn:string($val))})
};

declare function build-hashes($node as node(), $value-convert-function as function(item()?) as item()*) {
  typeswitch ($node)
    case document-node() return
      fn:distinct-values($node/node() ! build-hashes(., $value-convert-function) ! xdmp:hash64(fn:normalize-space(.)))
    case element(cts:not-query) return
      ()
    case element(cts:and-not-query) return
      $node/cts:positive/node() ! build-hashes(., $value-convert-function)
    case element(cts:and-query) return
       fn:fold-left(function($accumulative, $query) {
         for $item in $query/node() ! build-hashes(., $value-convert-function),
             $combination in $accumulative
         return $combination || " " || $item
       }, "", $node/schema-element(cts:query))
    case element(cts:or-query) return
      $node/node() ! build-hashes(.,$value-convert-function)
    case schema-element(cts:query) return
      if (fn:exists($node/(cts:value|cts:text))) then
        for $value in $node/(cts:value|cts:text)
        return $value-convert-function($value)[. ne ""]
      else
        $node/node() ! build-hashes(., $value-convert-function)
    default return ()
};

declare function compare-hashes($hashesA as xs:unsignedLong*, $hashesB as xs:unsignedLong*) as xs:boolean {
  $hashesA = $hashesB
};

declare function query-match-score($document as node(), $query as cts:query?, $hashesA as xs:unsignedLong*, $hashesB as xs:unsignedLong*) {
  fn:exists($query) and (cts:contains($document, $query) or compare-hashes($hashesA, $hashesB))
};

declare function convert-quick-start-match-rule-for-xquery-module($match-rule)
{
  json:transform-from-json(object-node { "expand": $match-rule }, $options-json-config)
};

declare function convert-quick-start-options-for-xquery-module($match-options)
{
  xml-options-from-json($match-options)
};

(: Convert JSON match options to XML :)
declare function xml-options-from-json($options-json)
{
  let $options-root :=
    if (fn:exists($options-json/options)) then
      $options-json/options
    else
      $options-json
  return
    element matcher:options {
      if (fn:exists($options-root/targetEntity)) then
        element matcher:target-entity {fn:string($options-root/targetEntity)}
      else (),
      if (fn:exists($options-root/dataFormat)) then
        element matcher:data-format {fn:string($options-root/dataFormat)}
      else (),
      element matcher:property-defs {
        for $property in $options-root/propertyDefs/(properties|property)
        return
          element matcher:property {
            attribute {"namespace"} {fn:string($property/namespace)},
            attribute localname {fn:string($property/localname)},
            attribute name {fn:string($property/name)},
            $property/indexReferences ! cts:reference-parse(.)
          }
      },
      element matcher:collections {
        if (fn:exists($options-root/collections/content[. instance of null-node()])) then
          element matcher:content {attribute none {"true"}}
        else
          for $content in $options-root/collections/content
          return
            element matcher:content {fn:string($content)}
      },
      element matcher:algorithms {
        for $algorithm in $options-root/(array-node("algorithms")/object-node()|algorithms/algorithm)
        return
          element matcher:algorithm {
            attribute name { fn:string($algorithm/name) },
            if (fn:exists($algorithm/function)) then
              attribute function {fn:string($algorithm/function) }
            else (),
            if (fn:exists($algorithm/namespace)) then
              attribute {"namespace"} { fn:string($algorithm/namespace) }
            else (),
            if (fn:exists($algorithm/at)) then
              attribute at { fn:string($algorithm/at) }
            else ()
          }
      },
      element matcher:scoring {
        json:transform-from-json(object-node { "scoring": $options-root/scoring }, $options-json-config)/*
      },
      element matcher:actions {
        for $action in $options-root/(array-node("actions")/object-node()|actions/action)
        return
          element matcher:action {
            attribute name { fn:string($action/name) },
            if (fn:exists($action/function)) then
              attribute function {fn:string($action/function) }
            else (),
            if (fn:exists($action/namespace)) then
              attribute namespace { fn:string($action/namespace) }
            else (),
            if (fn:exists($action/at)) then
              attribute at { fn:string($action/at) }
            else (),
            for $node in ($action/* except $action/(name|function|namespace|at))
            return
              json:transform-from-json(object-node { fn:node-name($node): $node }, $options-json-config)
          }
      },
      element matcher:thresholds {
        for $threshold in $options-root/(array-node("thresholds")/object-node()|thresholds/threshold)
        return
          element matcher:threshold {
            attribute label { fn:string($threshold/label) },
            attribute above {fn:string($threshold/above) },
            if (fn:exists($threshold/action)) then
              attribute action { fn:string($threshold/action) }
            else (),
            for $node in ($threshold/* except $threshold/(label|above|action))
            return
              json:transform-from-json(object-node { fn:node-name($node): $node }, $options-json-config)
          }
      },
      if (fn:exists($options-root/tuning/maxScan)) then
        element matcher:tuning {
          element matcher:max-scan {fn:string($options-root/tuning/maxScan)}
        }
      else ()
    }
};