xquery version "1.0-ml";

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : Functions in this library store, retrieve, and transform match options.
 : Options are stored and used as XML, but clients may submit them as JSON or
 : XML.
 :)

module namespace opt-impl = "http://marklogic.com/smart-mastering/options-impl";

import module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms"
  at "/com.marklogic.smart-mastering/algorithms/base.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";

declare option xdmp:mapping "false";

(:
 : Directory where matching options are stored.
 :)
declare variable $ALGORITHM-OPTIONS-DIR := "/com.marklogic.smart-mastering/options/algorithms/";

declare variable $options-json-config := opt-impl:_options-json-config();

declare function opt-impl:_options-json-config()
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

declare function opt-impl:get-option-names-as-xml()
  as element(matcher:options)
{
  let $options := cts:uris('', (), cts:collection-query($const:MATCH-OPTIONS-COLL))
  let $option-names := $options !
    fn:replace(
      fn:replace(., $ALGORITHM-OPTIONS-DIR, ""),
      "\.xml$", ""
    )
  return
    element matcher:options {
      $option-names ! element matcher:option { . }
    }
};

declare function opt-impl:get-option-names-as-json()
  as array-node()?
{
  opt-impl:option-names-to-json(
    opt-impl:get-option-names-as-xml()
  )
};

declare variable $option-names-json-config := opt-impl:option-names-json-config();

declare function opt-impl:option-names-json-config()
{
  let $config := json:config("custom")
  return (
    map:put($config, "array-element-names", ("option","content")),
    map:put($config, "element-namespace", "http://marklogic.com/smart-mastering/matcher"),
    map:put($config, "element-namespace-prefix", "matcher"),
    $config
  )
};

declare function opt-impl:option-names-to-json($options-xml)
  as array-node()?
{
  if (fn:exists($options-xml)) then
    array-node {
      xdmp:to-json(
        json:transform-to-json-object($options-xml, $option-names-json-config)
      )/node()/options/option
    }
  else ()
};

declare function opt-impl:get-options-as-xml($options-name as xs:string)
{
  fn:doc($ALGORITHM-OPTIONS-DIR||$options-name||".xml")/matcher:options
};

declare function opt-impl:get-options-as-json($options-name as xs:string)
  as object-node()?
{
  opt-impl:options-to-json(
    fn:doc($ALGORITHM-OPTIONS-DIR||$options-name||".xml")/matcher:options
  )
};

declare function opt-impl:save-options(
  $name as xs:string,
  $options as node()
)
{
  let $options :=
    if ($options instance of document-node()) then
      $options/node()
    else
      $options
  let $options :=
    if ($options instance of object-node()) then
      opt-impl:options-from-json($options)
    else
      $options
  return (
    algorithms:setup-algorithms($options/(self::*:options|*:options)),
    xdmp:document-insert(
      $ALGORITHM-OPTIONS-DIR||$name||".xml",
      $options,
      xdmp:default-permissions(),
      ($const:OPTIONS-COLL, $const:MATCH-OPTIONS-COLL, $const:ALGORITHM-COLL)
    )
  )
};

(: Convert JSON match options to XML :)
declare function opt-impl:options-from-json($options-json)
{
  let $options-root := $options-json/options
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
            attribute namespace {fn:string($property/namespace)},
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
              attribute namespace { fn:string($algorithm/namespace) }
            else (),
            if (fn:exists($algorithm/at)) then
              attribute at { fn:string($algorithm/at) }
            else ()
          }
      },
      element matcher:scoring {
        json:transform-from-json(object-node { "scoring": $options-root/scoring }, $opt-impl:options-json-config)/*
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
              json:transform-from-json(object-node { fn:node-name($node): $node }, $opt-impl:options-json-config)
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
              json:transform-from-json(object-node { fn:node-name($node): $node }, $opt-impl:options-json-config)
          }
      },
      if (fn:exists($options-root/tuning/maxScan)) then
        element matcher:tuning {
          element matcher:max-scan {fn:string($options-root/tuning/maxScan)}
        }
      else ()
    }
};

declare function opt-impl:options-to-json($options-xml as element(matcher:options)?)
  as object-node()?
{
  if (fn:exists($options-xml)) then
    xdmp:to-json(
      map:entry(
      "options", map:new((
        if (fn:exists($options-xml/matcher:target-entity)) then
          map:entry("targetEntity", fn:string($options-xml/matcher:target-entity))
        else (),
        if (fn:exists($options-xml/matcher:data-format)) then
          map:entry("dataFormat", fn:string($options-xml/matcher:data-format))
        else (),
        map:entry(
          "propertyDefs",
          map:entry("properties",
            array-node {
              for $property in $options-xml/matcher:property-defs/matcher:property
              return
                xdmp:to-json(map:new((
                  map:entry("namespace", fn:string($property/@namespace)),
                  map:entry("localname", fn:string($property/@localname)),
                  map:entry("name", fn:string($property/@name)),
                  if (fn:exists($property/(cts:json-property-reference|cts:element-reference|cts:path-reference|cts:field-reference))) then
                    map:entry("indexReferences",
                      array-node {
                        $property/(cts:json-property-reference|cts:element-reference|cts:path-reference|cts:field-reference) ! cts:reference-parse(.)
                      }
                    )
                  else ()
                )))/object-node()
            }
          )
        ),
        map:entry("algorithms",
          array-node {
            for $algorithm in $options-xml/matcher:algorithms/matcher:algorithm
            return
              xdmp:to-json(map:new((
                map:entry("name", fn:string($algorithm/@name)),
                if (fn:exists($algorithm/@function)) then
                  map:entry("function", fn:string($algorithm/@function))
                else (),
                if (fn:exists($algorithm/@namespace)) then
                  map:entry("namespace", fn:string($algorithm/@namespace))
                else (),
                if (fn:exists($algorithm/@at)) then
                  map:entry("at", fn:string($algorithm/@at))
                else ()
              )))/object-node()
          }
        ),
        if (fn:exists($options-xml/matcher:collections/matcher:content)) then
          map:entry("collections",
            map:entry("content",
              if ($options-xml/matcher:collections/matcher:content/@none = "true") then
                null-node {}
              else
                array-node {
                  $options-xml/matcher:collections/matcher:content ! fn:string(.)
                }
            )
          )
        else (),
        map:entry("scoring",
          xdmp:to-json(
              json:transform-to-json-object($options-xml/matcher:scoring, $opt-impl:options-json-config)
          )/scoring
        ),
        map:entry("actions",
          array-node {
            if (fn:exists($options-xml/matcher:actions)) then
              xdmp:to-json(
                json:transform-to-json-object($options-xml/matcher:actions, $opt-impl:options-json-config)
              )/actions/action
            else ()
          }
        ),
        map:entry("thresholds",
          array-node {
            if (fn:exists($options-xml/matcher:thresholds)) then
              xdmp:to-json(
                json:transform-to-json-object($options-xml/matcher:thresholds, $opt-impl:options-json-config)
              )/thresholds/threshold
            else ()
          }
        ),
        if (fn:exists($options-xml/matcher:tuning)) then
          map:entry("tuning",
            xdmp:to-json(
                json:transform-to-json-object($options-xml/matcher:tuning, $opt-impl:options-json-config)
            )/tuning
          )
        else ()
      ))
      )
    )/object-node()
  else ()
};

